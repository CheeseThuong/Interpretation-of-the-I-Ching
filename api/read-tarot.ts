import { buildTarotReadingPrompt, buildAIFinalizerPrompt } from '../src/lib/ai/prompts.js';
import { prepareTarotReferenceContext } from '../src/lib/ai/tarotReference.js';
import { prepareZodiacReferenceContext } from '../src/lib/astrology/zodiacReference.js';
import { buildTarotContextBundle, validateContextBundle, generateDeterministicFallback } from '../src/lib/ai/contextBundle.js';
import type { ContextTarotCard } from '../src/lib/ai/contextBundle.js';
import type { UnifiedAIReadingResponse } from '../src/types/ai.js';
import { synthesizeTarotReading } from '../src/lib/readings/synthesis.js';

const ENABLE_AI_SECOND_PASS = true;
const TAROT_SYSTEM_INSTRUCTION = [
  'Bạn là Tarot reader tiếng Việt chuyên phân tích quyết định và quan hệ.',
  'Luôn trả lời trực tiếp câu hỏi gốc trước, sau đó mới giải thích bằng lá bài.',
  'Khi người dùng hỏi nhiều câu, phải nhận diện từng câu và trả lời từng câu riêng trong subQuestionAnswers.',
  'Không bao giờ gộp nhiều câu hỏi thành một kết luận chung chung.',
  'Mỗi câu trả lời con phải có Có/Không/Có điều kiện/Chưa đủ dữ kiện rõ ràng và chỉ ra lá bài cụ thể hỗ trợ.',
  'Không viết chung chung hoặc dùng mẫu "cần quan sát thêm" nếu không có hành động cụ thể.',
  'Khi câu hỏi là nhắn tin/liên lạc/chủ động, bắt buộc nêu nên hay chưa nên, vì sao, nhắn thế nào và dấu hiệu để dừng.',
  'Trả về JSON hợp lệ theo schema được yêu cầu, không markdown.'
].join(' ');

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

interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

// Global memory cache for AI responses
const aiCache = new Map<string, UnifiedAIReadingResponse>();

type TarotContextBundle = ReturnType<typeof buildTarotContextBundle>;

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
  bundle: TarotContextBundle
): boolean {
  const rawText = [
    result.questionEcho,
    result.directAnswer,
    result.quickSummary,
    result.synthesis,
    result.synthesisSummary,
    result.contextualInterpretation,
    result.reasonedInterpretation,
    ...(result.subQuestionAnswers || []).flatMap((answer) => [
      answer.question,
      answer.answer,
      ...(answer.supportingCards || []),
    ]),
    ...(result.actionableAdvice || []),
    ...(result.practicalAdvice || []),
    ...(result.positionAnalyses || []).map((position) => position.meaningForUserQuestion),
  ].join(' ');
  const text = normalizeVietnameseText(rawText);
  const cards = bundle.readingData.cards || [];
  const cardNamesMentioned = cards.filter((card) => {
    const nameVi = normalizeVietnameseText(card.nameVi || card.card?.nameVi || '');
    const name = normalizeVietnameseText(card.name || card.card?.name || '');
    return (nameVi && text.includes(nameVi)) || (name && text.includes(name));
  }).length;
  const genericPhrases = [
    'phản ánh năng lượng tình cảm',
    'cần cân nhắc kỹ lưỡng',
    'kiểm tra lại các thông tin',
    'tâm lý hiện tại cần sự cân bằng',
    'năng lượng tình cảm đang cần sự quan sát',
    'khuyên bạn nên xem xét kỹ các yếu tố thực tế',
    'tập trung vào hành động và ý chí',
    'dẫn trải bài',
  ];
  const normalizedGenericPhrases = [
    ...genericPhrases.map(normalizeVietnameseText),
    'phan anh nang luong tinh cam',
    'can can nhac ky luong',
    'kiem tra lai cac thong tin',
    'tam ly hien tai can su can bang',
    'nang luong tinh cam dang can su quan sat',
    'khuyen ban nen xem xet ky cac yeu to thuc te',
    'tap trung vao hanh dong va y chi',
    'dan trai bai',
    'tiem nang',
    'co tiem nang phat trien tich cuc',
    'co the xem xet',
    'kiem tra:',
    'can quan sat them',
  ];
  const genericHits = normalizedGenericPhrases.filter((phrase) => text.includes(phrase)).length;
  const hasSynthesisOnlyPhrase = text.includes('dan trai bai');
  const hasEnoughPositionWork = (result.positionAnalyses?.length || 0) >= cards.length;
  const directAnswer = normalizeVietnameseText(result.directAnswer || '');
  const missesMessagingAction = isMessagingQuestion(bundle.currentQuestion) &&
    !/(nhan|gui|goi|mo loi|chu dong|tin nhan|cho|doi)/i.test(directAnswer);
  const missingConcreteMessagingAdvice = isMessagingQuestion(bundle.currentQuestion) &&
    (result.actionableAdvice || result.practicalAdvice || []).length < 2;
  const explicitlyFailedSelfCheck = result.qualitySelfCheck?.directlyAnswersQuestion === false;
  const explicitlyMissedSubQuestions = result.qualitySelfCheck?.allSubQuestionsAnswered === false;
  const missingSubQuestionAnswers = bundle.hasMultipleQuestions &&
    (!result.subQuestionAnswers || result.subQuestionAnswers.length < bundle.subQuestions.length);
  const invalidSubQuestionAnswers = bundle.hasMultipleQuestions &&
    (result.subQuestionAnswers || []).some((answer) => {
      const normalizedAnswer = normalizeVietnameseText(answer.answer || '');
      return !/^(co|khong|co dieu kien|chua du du kien)/.test(normalizedAnswer);
    });

  return (
    explicitlyFailedSelfCheck ||
    explicitlyMissedSubQuestions ||
    missingSubQuestionAnswers ||
    invalidSubQuestionAnswers ||
    missesMessagingAction ||
    missingConcreteMessagingAdvice ||
    hasSynthesisOnlyPhrase ||
    !hasEnoughPositionWork ||
    cardNamesMentioned < Math.min(cards.length, 2) ||
    genericHits >= 2 ||
    (result.directAnswer || '').length < 100 ||
    (result.contextualInterpretation || '').length < 80 ||
    (result.synthesisSummary || '').length < 80
  );
}

function inferSpreadId(bundle: TarotContextBundle): 'one-card' | 'three-cards' | 'love' | 'yes-no' | 'daily' | 'five-cards' {
  const cards = bundle.readingData.cards || [];
  const spreadType = (bundle.readingData.spreadType || '').toLowerCase();
  if (spreadType.includes('love') || spreadType.includes('tình yêu')) return 'love';
  if (cards.length === 5) return 'five-cards';
  if (cards.length === 3) return 'three-cards';
  return 'one-card';
}

function normalizeVietnameseText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function isMessagingQuestion(question: string): boolean {
  const normalized = normalizeVietnameseText(question);
  return /(nhan tin|goi lai|chu dong|mo loi|reply|inbox|message)/i.test(normalized) ||
    (/\btin\b/i.test(normalized) && /(nhan|nguoi|ay|lai|nen)/i.test(normalized));
}

function buildApiMessagingFallback(bundle: TarotContextBundle): string | null {
  const cards = bundle.readingData.cards || [];
  const first = cards[0];
  if (!first || !isMessagingQuestion(bundle.currentQuestion)) return null;

  const isReversed = !!first.isReversed;
  const name = first.nameVi || first.card?.nameVi || first.name || first.card?.name || 'lá bài';
  const keywords = (isReversed
    ? (first.keywordsReversed || first.card?.keywordsReversed || [])
    : (first.keywordsUpright || first.card?.keywordsUpright || [])
  ).slice(0, 3).join(', ');
  const meaning = isReversed
    ? (first.meaningReversed || first.card?.meaningReversed || '')
    : (first.meaningUpright || first.card?.meaningUpright || '');

  if (isReversed) {
    return `Chưa nên nhắn vội. ${name} ngược cho thấy điểm nghẽn là ${keywords || 'cảm xúc chưa ổn định'}, nên tin nhắn lúc này dễ xuất phát từ nhu cầu được xác nhận hơn là sự rõ ràng. ${meaning} Nếu vẫn muốn mở lời, hãy chờ cảm xúc dịu xuống rồi gửi một câu ngắn, không chất vấn, không đòi phản hồi; sau đó dừng lại để xem họ có chủ động nối tiếp hay không.`;
  }

  return `Có thể nhắn, nhưng nên nhắn nhẹ và có đường lui. ${name} xuôi cho thấy ${keywords || 'có tín hiệu mở'}, vì vậy mục tiêu là mở kết nối chứ không ép câu trả lời. ${meaning} Hãy gửi một tin ngắn, thân thiện, rồi dùng chất lượng phản hồi của họ làm dữ kiện cho bước tiếp theo.`;
}

function generateTarotFallbackFromBundle(bundle: TarotContextBundle): UnifiedAIReadingResponse {
  const cards = bundle.readingData.cards || [];
  if (!cards.length) return generateDeterministicFallback(bundle);

  const synthesis = synthesizeTarotReading({
    question: bundle.currentQuestion,
    spreadId: inferSpreadId(bundle),
    spreadName: bundle.readingData.spreadType || 'Tarot',
    drawnCards: cards.map((card) => ({
      positionName: card.position || card.positionName || 'Vị trí',
      isReversed: !!card.isReversed,
      card: {
        name: card.name || card.card?.name || 'Unknown',
        nameVi: card.nameVi || card.card?.nameVi || card.name || card.card?.name || 'Lá bài',
        keywordsUpright: card.keywordsUpright || card.card?.keywordsUpright || [],
        keywordsReversed: card.keywordsReversed || card.card?.keywordsReversed || [],
        meaningUpright: card.meaningUpright || card.card?.meaningUpright || '',
        meaningReversed: card.meaningReversed || card.card?.meaningReversed || '',
      },
    })),
  });

  const first = cards[0];
  const last = cards[cards.length - 1] || first;
  const lastName = last.nameVi || last.card?.nameVi || last.name || last.card?.name || 'lá cuối';
  const directAnswer = buildApiMessagingFallback(bundle) || `${synthesis.keyAdvice} ${synthesis.oneLineSummary}`;

  return {
    questionEcho: bundle.currentQuestion,
    subQuestionAnswers: (bundle.subQuestions.length ? bundle.subQuestions : [bundle.currentQuestion]).map((question) => ({
      question,
      answer: `${synthesis.mainSignal === 'proceed' ? 'Có điều kiện' : synthesis.mainSignal === 'avoid' ? 'Không' : 'Chưa đủ dữ kiện'} - ${synthesis.keyAdvice}`,
      supportingCards: cards.map((card) => card.nameVi || card.card?.nameVi || card.name || card.card?.name || 'Lá bài'),
    })),
    directAnswer,
    decisionSignal: synthesis.mainSignal,
    confidenceLevel: 'medium',
    questionContext: bundle.questionContext as UnifiedAIReadingResponse['questionContext'],
    personalizationUsed: {
      memoryUsed: !!bundle.userMemorySummary,
      zodiacUsed: !!bundle.zodiacContext,
      referenceUsed: !!bundle.tarotReferenceContext || !!bundle.zodiacReferenceContext,
      synthesisUsed: true,
    },
    quickSummary: synthesis.oneLineSummary,
    synthesis: synthesis.combinedConclusion,
    synthesisSummary: synthesis.combinedConclusion,
    reasonedInterpretation: `${synthesis.keyTension} Quyết định "${synthesis.mainSignal}" đến từ tương quan giữa số lá ngược, chức năng từng vị trí và xu hướng ở ${lastName}.`,
    positionAnalyses: synthesis.positionAnalyses.map((position) => ({
      positionLabel: position.positionLabel,
      positionFunction: position.positionFunction,
      cardName: position.cardNameVi,
      orientation: position.orientation,
      meaningInThisPosition: `${position.cardMeaning} ${position.meaningInThisPosition}`,
      meaningForUserQuestion: `${position.meaningForUserQuestion} Tín hiệu thực tế: ${position.practicalSignal}`,
      psychologicalInsight: position.psychologicalInsight,
      practicalSignal: position.orientation === 'reversed' ? 'wait' : 'conditional',
    })),
    symbolicReading: {
      mainPattern: synthesis.patternSummary,
      changingFactor: synthesis.keyTension,
      futureTrend: `${lastName}: ${synthesis.positionAnalyses[synthesis.positionAnalyses.length - 1]?.cardMeaning || synthesis.oneLineSummary}`,
    },
    psychologicalInterpretation: `Trọng tâm tâm lý nằm ở cách bạn phản ứng với ${first.nameVi || first.card?.nameVi || first.name || 'lá đầu'} và cách xu hướng cuối mở ra qua ${lastName}. Không nên đọc từng lá rời rạc; cần xem lá cản trở và lá lời khuyên như điều kiện chuyển hướng kết quả.`,
    contextualInterpretation: synthesis.combinedConclusion,
    actionableAdvice: [synthesis.keyAdvice],
    decisionChecklist: bundle.questionContext.requiredLens.length
      ? bundle.questionContext.requiredLens.map((lens) => `Kiểm tra: ${lens}`)
      : ['Đối chiếu ý nghĩa lá bài với hành động thực tế.', 'Xác định điểm cản trở trước khi ra quyết định.', 'Theo dõi tín hiệu lặp lại thay vì một biểu hiện đơn lẻ.'],
    practicalAdvice: [synthesis.keyAdvice],
    thingsToAvoid: ['Tránh rút kết luận chỉ từ một lá bài.', 'Tránh bỏ qua vị trí cản trở hoặc điều bị che khuất.'],
    riskNotes: [synthesis.keyTension],
    finalMessage: 'Luận giải này ưu tiên dữ liệu trải bài, vị trí và câu hỏi cụ thể; nếu hành động thực tế đổi, xu hướng cũng có thể đổi.',
    qualitySelfCheck: {
      directlyAnswersQuestion: true,
      allSubQuestionsAnswered: true,
      isContextual: true,
      isTooGeneric: false,
      isTooLong: false,
      missingImportantInfo: [],
      offTopicWarnings: [],
      needsSecondPass: false,
    },
  };
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
    const contextInput = {
      ...data,
      question: data.question,
      drawnCards: data.drawnCards,
      zodiacLens: data.zodiacLens?.sign &&
        data.zodiacLens.viName &&
        data.zodiacLens.element &&
        data.zodiacLens.modality &&
        data.zodiacLens.personalizationSummary &&
        data.zodiacLens.decisionStyle &&
        data.zodiacLens.adviceStyle
        ? {
            sign: data.zodiacLens.sign,
            viName: data.zodiacLens.viName,
            element: data.zodiacLens.element,
            modality: data.zodiacLens.modality,
            personalizationSummary: data.zodiacLens.personalizationSummary,
            decisionStyle: data.zodiacLens.decisionStyle,
            adviceStyle: data.zodiacLens.adviceStyle,
            psychologicalTendency: data.zodiacLens.psychologicalTendency,
          }
        : undefined,
    };

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server is missing GROQ_API_KEY environment variable' });
    }

    // Reference Contexts
    const cardNames: string[] = (data.drawnCards || []).map(c => c.name || c.card?.name || '').filter(Boolean);
    const referenceContext = prepareTarotReferenceContext(cardNames, 3);
    let zodiacReferenceContext = '';
    if (data.zodiacLens?.sign) {
      zodiacReferenceContext = prepareZodiacReferenceContext(data.zodiacLens.sign, undefined, 2);
    }

    // Build Context Bundle
    contextInput.tarotReferenceContext = referenceContext;
    contextInput.zodiacReferenceContext = zodiacReferenceContext;
    const contextBundle = buildTarotContextBundle(contextInput);

    // Cache Check
    const cacheKey = generateCacheKey(contextBundle);
    if (aiCache.has(cacheKey)) {
      console.log('Serving Tarot AI from cache');
      return res.status(200).json(aiCache.get(cacheKey));
    }

    // Dev Logging
    console.log('DEV ONLY - Calling Groq with:', {
      currentQuestion: contextBundle.currentQuestion,
      questionType: contextBundle.questionContext.questionType,
      memorySummaryIncluded: !!contextBundle.userMemorySummary,
      zodiacIncluded: !!contextBundle.zodiacContext,
      synthesisIncluded: !!contextBundle.synthesis,
      tarotReferenceIncluded: !!contextBundle.tarotReferenceContext
    });

    const prompt = buildTarotReadingPrompt(contextBundle);

    async function callGroq(textPrompt: string): Promise<UnifiedAIReadingResponse> {
      const resp = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
              { role: 'system', content: TAROT_SYSTEM_INSTRUCTION },
              { role: 'user', content: textPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.85,
            top_p: 0.92,
            max_tokens: 2048,
          }),
        }
      );
      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`AI API error: ${resp.statusText} - ${errorText}`);
      }
      const aiData = await resp.json() as GroqResponse;
      const responseText = aiData.choices?.[0]?.message?.content;
      if (!responseText) {
        throw new Error('AI response is empty or malformed');
      }
      return JSON.parse(responseText);
    }

    const validation = validateContextBundle(contextBundle);
    let structuredResult: UnifiedAIReadingResponse;
    let secondPassUsed = false;
    let qualityFailedReason = "N/A";

    try {
      structuredResult = await callGroq(prompt);
      
      const qc = structuredResult.qualitySelfCheck;
      const needsSecondPass = qc && (
        qc.isTooGeneric === true ||
        qc.isContextual === false ||
        qc.directlyAnswersQuestion === false ||
        qc.allSubQuestionsAnswered === false ||
        (qc.offTopicWarnings && qc.offTopicWarnings.length > 0) ||
        qc.needsSecondPass === true ||
        !structuredResult.directAnswer ||
        !structuredResult.contextualInterpretation
      ) || isWeakTarotReading(structuredResult, contextBundle);

      if (ENABLE_AI_SECOND_PASS && needsSecondPass) {
        secondPassUsed = true;
        qualityFailedReason = JSON.stringify(qc);
        const finalizerPrompt = buildAIFinalizerPrompt(contextBundle, structuredResult, qc);
        structuredResult = await callGroq(finalizerPrompt);
      }
    } catch (apiError) {
      console.error('AI Call failed, using fallback:', apiError);
      structuredResult = generateTarotFallbackFromBundle(contextBundle);
    }

    if (isWeakTarotReading(structuredResult, contextBundle)) {
      qualityFailedReason = `${qualityFailedReason}; final guard fallback`;
      structuredResult = generateTarotFallbackFromBundle(contextBundle);
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
