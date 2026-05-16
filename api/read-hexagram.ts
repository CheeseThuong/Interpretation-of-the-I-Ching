import { buildKinhDichReadingPrompt } from '../src/lib/ai/prompts';

export default async function handler(req: any, res: any) {
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

    const prompt = buildKinhDichReadingPrompt({
      ...data,
      method: data.method || 'self-cast'
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      })
    });

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
    
    // Robust parsing
    try {
      const structuredResult = JSON.parse(resultText);
      return res.status(200).json(structuredResult);
    } catch (parseError) {
      console.error('Failed to parse AI JSON:', resultText);
      // Fallback: If AI returned Markdown or raw text, we might need a backup parser
      // but with response_mime_type: "application/json", Gemini is usually reliable.
      return res.status(500).json({ error: 'Dữ liệu từ AI không đúng định dạng. Vui lòng thử lại.' });
    }
  } catch (error: any) {
    console.error('Error generating AI reading:', error);
    return res.status(500).json({ error: 'Không thể kết nối với AI lúc này. Vui lòng thử lại sau.' });
  }
}

