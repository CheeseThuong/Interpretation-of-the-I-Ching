import { classifyQuestionContext } from './prompts';

export interface ContextBundle {
  currentQuestion: string;
  questionContext: {
    questionType: string;
    decisionType: string;
    mainObject: string;
    userIntent: string;
    timeframe: string;
    riskLevel: string;
    answerMode: string;
    psychologicalNeed?: string;
    requiredLens: string[];
  };
  userMemorySummary?: string;
  zodiacContext?: {
    zodiacSign: string;
    viName: string;
    element: string;
    modality: string;
    personalizationLens: string;
    decisionStyle: string;
    emotionalStyle?: string;
    adviceStyle: string;
  };
  readingData: {
    type: 'tarot' | 'iching';
    spreadType?: string;
    cards?: any[];
    positions?: string[];
    hexagram?: any;
    movingLines?: number[];
  };
  synthesis?: any;
  tarotReferenceContext?: string;
  zodiacReferenceContext?: string;
  readingDepth: 'standard' | 'deep';
}

export function buildTarotContextBundle(input: any): ContextBundle {
  const qContext = classifyQuestionContext(input.question, input.topic);
  
  return {
    currentQuestion: input.question,
    questionContext: {
      questionType: qContext.questionType,
      decisionType: qContext.decisionType,
      mainObject: qContext.mainObject,
      userIntent: qContext.userIntent,
      timeframe: qContext.timeframe || '',
      riskLevel: qContext.riskLevel,
      answerMode: qContext.answerMode,
      psychologicalNeed: qContext.psychologicalState,
      requiredLens: qContext.requiredLens
    },
    userMemorySummary: input.userMemorySummary || '',
    zodiacContext: input.zodiacLens ? {
      zodiacSign: input.zodiacLens.sign,
      viName: input.zodiacLens.viName,
      element: input.zodiacLens.element,
      modality: input.zodiacLens.modality,
      personalizationLens: input.zodiacLens.personalizationSummary,
      decisionStyle: input.zodiacLens.decisionStyle,
      adviceStyle: input.zodiacLens.adviceStyle,
      emotionalStyle: input.zodiacLens.psychologicalTendency
    } : undefined,
    readingData: {
      type: 'tarot',
      spreadType: input.spreadType,
      cards: input.drawnCards,
      positions: input.drawnCards?.map((c: any) => c.position) || []
    },
    synthesis: input.synthesisContext,
    tarotReferenceContext: input.tarotReferenceContext,
    zodiacReferenceContext: input.zodiacReferenceContext,
    readingDepth: 'deep'
  };
}

export function buildKinhDichContextBundle(input: any): ContextBundle {
  const qContext = classifyQuestionContext(input.question, input.topic);

  return {
    currentQuestion: input.question,
    questionContext: {
      questionType: qContext.questionType,
      decisionType: qContext.decisionType,
      mainObject: qContext.mainObject,
      userIntent: qContext.userIntent,
      timeframe: qContext.timeframe || '',
      riskLevel: qContext.riskLevel,
      answerMode: qContext.answerMode,
      psychologicalNeed: qContext.psychologicalState,
      requiredLens: qContext.requiredLens
    },
    userMemorySummary: input.userMemorySummary || '',
    readingData: {
      type: 'iching',
      hexagram: {
        primary: input.primaryHexagram,
        changed: input.changedHexagram,
        movingLines: input.movingLines,
        sixLines: input.sixLines
      },
    },
    synthesis: input.synthesisContext,
    readingDepth: 'deep'
  };
}

export function validateContextBundle(bundle: ContextBundle) {
  const hasQuestion = !!bundle.currentQuestion;
  const hasQuestionContext = !!bundle.questionContext && bundle.questionContext.questionType !== 'unclear';
  const hasReadingData = !!bundle.readingData && 
    (bundle.readingData.type === 'tarot' ? !!bundle.readingData.cards?.length : !!bundle.readingData.hexagram);
  const hasSynthesis = !!bundle.synthesis;
  const hasMemorySummary = !!bundle.userMemorySummary;
  const hasZodiac = !!bundle.zodiacContext;
  const hasReferenceData = !!bundle.tarotReferenceContext || !!bundle.zodiacReferenceContext;

  const missingFields: string[] = [];
  if (!hasQuestion) missingFields.push('currentQuestion');
  if (!hasQuestionContext) missingFields.push('questionContext');
  if (!hasReadingData) missingFields.push('readingData');

  let contextStrength: "weak" | "medium" | "strong" = "weak";
  let score = 0;
  if (hasQuestionContext) score++;
  if (hasSynthesis) score++;
  if (hasMemorySummary) score++;
  if (hasZodiac) score++;
  if (hasReferenceData) score++;

  if (score >= 4) contextStrength = "strong";
  else if (score >= 2) contextStrength = "medium";

  return {
    hasQuestion,
    hasQuestionContext,
    hasReadingData,
    hasSynthesis,
    hasMemorySummary,
    hasZodiac,
    hasReferenceData,
    missingFields,
    contextStrength
  };
}

export function generateDeterministicFallback(bundle: ContextBundle) {
  return {
    directAnswer: "Hệ thống AI hiện đang bận. Dựa trên thông tin bạn cung cấp, đây là kết quả luận giải cơ bản.",
    decisionSignal: "unclear",
    confidenceLevel: "low",
    questionContext: bundle.questionContext,
    personalizationUsed: {
      memoryUsed: false,
      zodiacUsed: false,
      referenceUsed: false,
      synthesisUsed: false
    },
    quickSummary: "Trải bài liên quan trực tiếp đến: " + bundle.currentQuestion,
    synthesisSummary: "Kết quả được tạo tự động từ hệ thống cơ bản.",
    reasonedInterpretation: "Do giới hạn kết nối, chúng tôi không thể phân tích sâu hơn ngay lúc này.",
    positionAnalyses: bundle.readingData.cards ? bundle.readingData.cards.map((c: any) => ({
      positionLabel: c.position || "Vị trí",
      positionFunction: "Chức năng cơ bản",
      cardName: c.nameVi || c.name || "Lá bài",
      orientation: c.isReversed ? "reversed" : "upright",
      meaningInThisPosition: "Ý nghĩa nguyên bản",
      meaningForUserQuestion: "Cần tự liên hệ với câu hỏi của bạn.",
      psychologicalInsight: "Không thể phân tích",
      practicalSignal: "unclear"
    })) : [],
    symbolicReading: {
      primaryHexagram: bundle.readingData.hexagram?.primary || "Quẻ chủ",
      movingLines: bundle.readingData.hexagram?.movingLines || "Hào động",
      changedHexagram: bundle.readingData.hexagram?.changed || "Quẻ biến",
      transformationSummary: "Sự chuyển hóa cơ bản"
    },
    psychologicalInterpretation: "Hãy giữ bình tĩnh và tự suy xét.",
    contextualInterpretation: "Kết quả phụ thuộc vào hoàn cảnh hiện tại của bạn.",
    decisionChecklist: ["Kiểm tra lại thực tế", "Lắng nghe trực giác"],
    practicalAdvice: ["Hãy cẩn trọng trước khi quyết định"],
    thingsToAvoid: ["Hành động vội vàng"],
    riskNotes: ["Chưa được AI phân tích sâu"],
    finalMessage: "Vạn sự tùy duyên, hãy tin vào bản thân.",
    qualitySelfCheck: {
      isContextual: false,
      isTooGeneric: true,
      isTooLong: false,
      missingImportantInfo: ["AI analysis failed"],
      offTopicWarnings: [],
      needsSecondPass: false
    }
  };
}
