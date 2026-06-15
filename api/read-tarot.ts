import { buildTarotReadingPrompt, buildAIFinalizerPrompt } from '../src/lib/ai/prompts';
import { prepareTarotReferenceContext } from '../src/lib/ai/tarotReference';
import { prepareZodiacReferenceContext } from '../src/lib/astrology/zodiacReference';
import { buildTarotContextBundle, validateContextBundle, generateDeterministicFallback } from '../src/lib/ai/contextBundle';
import type { ContextTarotCard } from '../src/lib/ai/contextBundle';
import type { UnifiedAIReadingResponse } from '../src/types/ai';

const ENABLE_AI_SECOND_PASS = true;

interface ApiResponse {
  status(code: number): {
    json(payload: unknown): void;
  };
}

interface TarotApiRequest {
  method?: string;
  body?: {
    question?: string;
    topic?: string;
    spreadType?: string;
    drawnCards?: ContextTarotCard[];
    birthDate?: string;
    synthesisContext?: unknown;
    userMemorySummary?: string;
    tarotReferenceContext?: string;
    zodiacReferenceContext?: string;
    zodiacLens?: {
      sign?: string;
      viName?: string;
      element?: string;
      modality?: string;
      personalizationSummary?: string;
      decisionStyle?: string;
      adviceStyle?: string;
      psychologicalTendency?: string;
    };
  };
}

// Global memory cache for AI responses
const aiCache = new Map<string, UnifiedAIReadingResponse>();

function generateCacheKey(bundle: ReturnType<typeof buildTarotContextBundle>): string {
  return JSON.stringify({
    q: bundle.currentQuestion.trim().toLowerCase(),
    qt: bundle.questionContext.questionType,
    dt: bundle.questionContext.decisionType,
    st: bundle.readingData.spreadType,
    cards: bundle.readingData.cards?.map((c) => `${c.name || c.card?.name || ''}_${c.isReversed}`) || [],
    z: bundle.zodiacContext?.zodiacSign || ''
  });
}

function isWeakTarotReading(
  result: UnifiedAIReadingResponse,
  bundle: ReturnType<typeof buildTarotContextBundle>
): boolean {
  const text = [
    result.directAnswer,
    result.quickSummary,
    result.synthesisSummary,
    result.contextualInterpretation,
    ...(result.positionAnalyses || []).map((position) => position.meaningForUserQuestion),
  ].join(' ').toLowerCase();
  const cards = bundle.readingData.cards || [];
  const cardNamesMentioned = cards.filter((card) => {
    const nameVi = (card.nameVi || card.card?.nameVi || '').toLowerCase();
    const name = (card.name || card.card?.name || '').toLowerCase();
    return (nameVi && text.includes(nameVi)) || (name && text.includes(name));
  }).length;
  const genericPhrases = [
    'phản ánh năng lượng tình cảm',
    'cần cân nhắc kỹ lưỡng',
    'kiểm tra lại các thông tin',
    'tâm lý hiện tại cần sự cân bằng',
  ];
  const genericHits = genericPhrases.filter((phrase) => text.includes(phrase)).length;
  const hasEnoughPositionWork = (result.positionAnalyses?.length || 0) >= cards.length;

  return (
    !hasEnoughPositionWork ||
    cardNamesMentioned < Math.min(cards.length, 2) ||
    genericHits >= 2 ||
    (result.contextualInterpretation || '').length < 80 ||
    (result.synthesisSummary || '').length < 80
  );
}

export default async function handler(req: TarotApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    if (!data || !data.question || !data.drawnCards) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (question, drawnCards).' });
    }

    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server is missing AI_API_KEY environment variable' });
    }

    // Reference Contexts
    const cardNames: string[] = (data.drawnCards || []).map(c => c.name || c.card?.name || '').filter(Boolean);
    const referenceContext = prepareTarotReferenceContext(cardNames, 3);
    let zodiacReferenceContext = '';
    if (data.zodiacLens?.sign) {
      zodiacReferenceContext = prepareZodiacReferenceContext(data.zodiacLens.sign, undefined, 2);
    }

    // Build Context Bundle
    data.tarotReferenceContext = referenceContext;
    data.zodiacReferenceContext = zodiacReferenceContext;
    const contextBundle = buildTarotContextBundle(data);

    // Cache Check
    const cacheKey = generateCacheKey(contextBundle);
    if (aiCache.has(cacheKey)) {
      console.log('Serving Tarot AI from cache');
      return res.status(200).json(aiCache.get(cacheKey));
    }

    // Dev Logging
    console.log('DEV ONLY - Calling Gemini with:', {
      currentQuestion: contextBundle.currentQuestion,
      questionType: contextBundle.questionContext.questionType,
      memorySummaryIncluded: !!contextBundle.userMemorySummary,
      zodiacIncluded: !!contextBundle.zodiacContext,
      synthesisIncluded: !!contextBundle.synthesis,
      tarotReferenceIncluded: !!contextBundle.tarotReferenceContext
    });

    const prompt = buildTarotReadingPrompt(contextBundle);

    async function callGemini(textPrompt: string): Promise<UnifiedAIReadingResponse> {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: textPrompt }] }],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.7,
              topP: 0.8,
              topK: 40,
            },
          }),
        }
      );
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
      ) || isWeakTarotReading(structuredResult, contextBundle);

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
      // Attach birth date if provided
      if (data.birthDate && structuredResult.zodiacContext) {
        structuredResult.zodiacContext.birthDate = data.birthDate;
      }
      
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
