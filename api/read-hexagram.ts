import { buildKinhDichReadingPrompt, buildAIFinalizerPrompt } from '../src/lib/ai/prompts';
import { buildKinhDichContextBundle, validateContextBundle, generateDeterministicFallback } from '../src/lib/ai/contextBundle';
import type { UnifiedAIReadingResponse } from '../src/types/ai';

const ENABLE_AI_SECOND_PASS = true;

interface ApiResponse {
  status(code: number): {
    json(payload: unknown): void;
  };
}

interface HexagramApiRequest {
  method?: string;
  body?: {
    question?: string;
    topic?: string;
    primaryHexagram?: string;
    changedHexagram?: string;
    movingLines?: string | number[];
    sixLines?: string | number[];
    synthesisContext?: unknown;
    userMemorySummary?: string;
  };
}

// Global memory cache for AI responses
const aiCache = new Map<string, UnifiedAIReadingResponse>();

function generateCacheKey(bundle: ReturnType<typeof buildKinhDichContextBundle>): string {
  return JSON.stringify({
    q: bundle.currentQuestion.trim().toLowerCase(),
    qt: bundle.questionContext.questionType,
    dt: bundle.questionContext.decisionType,
    ph: bundle.readingData.hexagram?.primary || '',
    ch: bundle.readingData.hexagram?.changed || '',
    ml: bundle.readingData.hexagram?.movingLines || []
  });
}

export default async function handler(req: HexagramApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    if (!data || !data.question || !data.topic || !data.primaryHexagram) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (question, topic, primaryHexagram).' });
    }

    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server is missing AI_API_KEY environment variable' });
    }

    // Build Context Bundle
    const contextBundle = buildKinhDichContextBundle(data);

    // Cache Check
    const cacheKey = generateCacheKey(contextBundle);
    if (aiCache.has(cacheKey)) {
      console.log('Serving Kinh Dich AI from cache');
      return res.status(200).json(aiCache.get(cacheKey));
    }

    const prompt = buildKinhDichReadingPrompt(contextBundle);

    async function callGemini(textPrompt: string): Promise<UnifiedAIReadingResponse> {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: textPrompt }] }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.7,
            topP: 0.8,
            topK: 40
          }
        })
      });
      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`AI API error: ${resp.statusText} - ${errorText}`);
      }
      const aiData = await resp.json();
      if (!aiData.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('AI response is empty or malformed');
      }
      return JSON.parse(aiData.candidates[0].content.parts[0].text);
    }

    const validation = validateContextBundle(contextBundle);
    let structuredResult: UnifiedAIReadingResponse;
    let secondPassUsed = false;
    let qualityFailedReason = "N/A";

    try {
      structuredResult = await callGemini(prompt);
      
      const qc = structuredResult.qualitySelfCheck;
      const needsSecondPass = qc && (
        qc.isTooGeneric === true ||
        qc.isContextual === false ||
        (qc.offTopicWarnings && qc.offTopicWarnings.length > 0) ||
        qc.needsSecondPass === true ||
        !structuredResult.directAnswer ||
        !structuredResult.contextualInterpretation
      );

      if (ENABLE_AI_SECOND_PASS && needsSecondPass) {
        secondPassUsed = true;
        qualityFailedReason = JSON.stringify(qc);
        const finalizerPrompt = buildAIFinalizerPrompt(contextBundle, structuredResult, qc);
        structuredResult = await callGemini(finalizerPrompt);
      }
    } catch (apiError) {
      console.error('AI Call failed, using fallback:', apiError);
      structuredResult = generateDeterministicFallback(contextBundle);
    }

    console.log('DEV ONLY - AI Pipeline Log:', {
      questionType: contextBundle.questionContext.questionType,
      contextStrength: validation.contextStrength,
      firstPassUsed: true,
      secondPassUsed,
      qualityFailedReason
    });

    try {
      // Save to cache
      aiCache.set(cacheKey, structuredResult);
      if (aiCache.size > 100) {
        const firstKey = aiCache.keys().next().value;
        if (firstKey) aiCache.delete(firstKey);
      }

      return res.status(200).json(structuredResult);
    } catch (parseError) {
      console.error('Failed to process AI result:', parseError);
      return res.status(500).json({ error: 'Dữ liệu từ AI không đúng định dạng. Vui lòng thử lại.' });
    }
  } catch (error: unknown) {
    console.error('Error generating AI reading:', error);
    return res.status(500).json({ error: 'Không thể kết nối với AI lúc này. Vui lòng thử lại sau.' });
  }
}
