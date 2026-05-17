import { buildTarotReadingPrompt } from '../src/lib/ai/prompts';
import { prepareTarotReferenceContext } from '../src/lib/ai/tarotReference';
import { prepareZodiacReferenceContext } from '../src/lib/astrology/zodiacReference';

export default async function handler(req: any, res: any) {
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

    // Tarot dataset reference (Dendory)
    const cardNames: string[] = (data.drawnCards as Array<{ name: string }>).map(c => c.name);
    const referenceContext = prepareTarotReferenceContext(cardNames, 3);

    // Zodiac dataset reference — optional, fails silently if missing
    let zodiacReferenceContext = '';
    if (data.zodiacLens?.sign) {
      zodiacReferenceContext = prepareZodiacReferenceContext(data.zodiacLens.sign, undefined, 2);
    }

    // Combine reference contexts
    const combinedReference = [referenceContext, zodiacReferenceContext].filter(Boolean).join('\n\n');

    const prompt = buildTarotReadingPrompt(data, combinedReference);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_mime_type: 'application/json',
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const aiData = await response.json();

    if (!aiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('AI response is empty or malformed');
    }

    const resultText = aiData.candidates[0].content.parts[0].text;

    try {
      const structuredResult = JSON.parse(resultText);
      // Attach birth date if provided (it was not in the AI output schema to avoid PII in AI)
      if (data.birthDate && structuredResult.zodiacContext) {
        structuredResult.zodiacContext.birthDate = data.birthDate;
      }
      return res.status(200).json(structuredResult);
    } catch (parseError) {
      console.error('Failed to parse AI JSON:', resultText);
      return res.status(500).json({ error: 'Dữ liệu từ AI không đúng định dạng. Vui lòng thử lại.' });
    }
  } catch (error: any) {
    console.error('Error generating AI reading:', error);
    return res.status(500).json({ error: 'Không thể kết nối với AI lúc này. Vui lòng thử lại sau.' });
  }
}
