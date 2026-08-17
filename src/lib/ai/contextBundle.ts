import { classifyQuestionContext } from './prompts.js';
import type { UnifiedAIReadingResponse } from '../../types/ai.js';

export interface ContextTarotCard {
  name?: string;
  nameVi?: string;
  position?: string;
  positionName?: string;
  isReversed?: boolean;
  keywordsUpright?: string[];
  keywordsReversed?: string[];
  meaningUpright?: string;
  meaningReversed?: string;
  card?: {
    name?: string;
    nameVi?: string;
    keywordsUpright?: string[];
    keywordsReversed?: string[];
    meaningUpright?: string;
    meaningReversed?: string;
  };
}

interface ZodiacLensInput {
  sign: string;
  viName: string;
  element: string;
  modality: string;
  personalizationSummary: string;
  decisionStyle: string;
  adviceStyle: string;
  psychologicalTendency?: string;
}

interface TarotContextInput {
  question: string;
  topic?: string;
  spreadType?: string;
  drawnCards?: ContextTarotCard[];
  synthesisContext?: unknown;
  userMemorySummary?: string;
  zodiacLens?: ZodiacLensInput;
  tarotReferenceContext?: string;
  zodiacReferenceContext?: string;
}

interface KinhDichContextInput {
  question: string;
  topic?: string;
  primaryHexagram?: string;
  changedHexagram?: string;
  movingLines?: string | number[];
  sixLines?: string | number[] | string[];
  synthesisContext?: unknown;
  userMemorySummary?: string;
}

export interface ContextBundle {
  currentQuestion: string;
  subQuestions: string[];
  hasMultipleQuestions: boolean;
  primaryQuestion: string;
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
    cards?: ContextTarotCard[];
    positions?: string[];
    hexagram?: {
      primary?: string;
      changed?: string;
      movingLines?: string | number[];
      sixLines?: string | number[] | string[];
    };
    movingLines?: number[];
  };
  synthesis?: unknown;
  tarotReferenceContext?: string;
  zodiacReferenceContext?: string;
  readingDepth: 'standard' | 'deep';
}

export function extractSubQuestions(rawQuestion: string): string[] {
  const trimmedQuestion = rawQuestion.trim();
  if (!trimmedQuestion) return [];

  const parts = trimmedQuestion
    .split(/[?!;।\n]+/g)
    .map((part) => part.trim())
    .filter((part) => part.length > 5);

  if (parts.length <= 1) return [trimmedQuestion];

  return parts;
}

export function buildTarotContextBundle(input: TarotContextInput): ContextBundle {
  const qContext = classifyQuestionContext(input.question, input.topic);
  const subQuestions = extractSubQuestions(input.question);
  
  return {
    currentQuestion: input.question,
    subQuestions,
    hasMultipleQuestions: subQuestions.length > 1,
    primaryQuestion: subQuestions[0] || input.question,
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
      positions: input.drawnCards?.map((c) => c.position || c.positionName || '') || []
    },
    synthesis: input.synthesisContext,
    tarotReferenceContext: input.tarotReferenceContext,
    zodiacReferenceContext: input.zodiacReferenceContext,
    readingDepth: 'deep'
  };
}

export function buildKinhDichContextBundle(input: KinhDichContextInput): ContextBundle {
  const qContext = classifyQuestionContext(input.question, input.topic);
  const subQuestions = extractSubQuestions(input.question);

  return {
    currentQuestion: input.question,
    subQuestions,
    hasMultipleQuestions: subQuestions.length > 1,
    primaryQuestion: subQuestions[0] || input.question,
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

function getReadingLabel(bundle: ContextBundle): string {
  if (bundle.readingData.type === 'iching') {
    const primary = bundle.readingData.hexagram?.primary || 'quẻ chủ';
    const changed = bundle.readingData.hexagram?.changed || 'quẻ biến';
    return `${primary} -> ${changed}`;
  }

  return (bundle.readingData.cards || [])
    .map((card) => {
      const label = card.nameVi || card.card?.nameVi || card.name || card.card?.name || 'Lá bài';
      const position = card.position || card.positionName || 'Vị trí';
      return `${position}: ${label} ${card.isReversed ? 'ngược' : 'xuôi'}`;
    })
    .join('; ');
}

export function generateDeterministicFallback(bundle: ContextBundle): UnifiedAIReadingResponse {
  const isHighRisk = bundle.questionContext.riskLevel === 'high';
  const label = getReadingLabel(bundle);
  const requiredLens = bundle.questionContext.requiredLens.length > 0
    ? bundle.questionContext.requiredLens
    : ['bối cảnh thực tế', 'mức độ chắc chắn', 'thời điểm hành động'];

  return {
    directAnswer: `AI trực tuyến hiện chưa phản hồi ổn định. Dựa trên ${label || 'kết quả hiện có'}, câu hỏi "${bundle.currentQuestion}" nên được xử lý theo hướng ${isHighRisk ? 'chậm lại và kiểm chứng dữ kiện trước' : 'quan sát thêm rồi hành động có điều kiện'}.`,
    decisionSignal: isHighRisk ? "wait" : "conditional",
    confidenceLevel: "medium",
    questionContext: bundle.questionContext as UnifiedAIReadingResponse['questionContext'],
    personalizationUsed: {
      memoryUsed: !!bundle.userMemorySummary,
      zodiacUsed: !!bundle.zodiacContext,
      referenceUsed: !!bundle.tarotReferenceContext || !!bundle.zodiacReferenceContext,
      synthesisUsed: !!bundle.synthesis
    },
    quickSummary: `Trọng tâm là ${bundle.questionContext.mainObject || bundle.questionContext.questionType}: chưa nên kết luận tuyệt đối, cần kiểm tra các điều kiện then chốt.`,
    synthesisSummary: bundle.synthesis
      ? String(bundle.synthesis)
      : `Hệ thống ghi nhận mẫu chính: ${label || 'chưa đủ dữ liệu biểu tượng'}.`,
    reasonedInterpretation: `Tín hiệu được hạ xuống mức ${isHighRisk ? 'chờ' : 'có điều kiện'} vì fallback không thể xác minh thêm bằng AI trực tuyến, nhưng vẫn giữ được context câu hỏi và kết quả gieo/rút.`,
    positionAnalyses: bundle.readingData.cards ? bundle.readingData.cards.map((c) => ({
      positionLabel: c.position || c.positionName || "Vị trí",
      positionFunction: "Vai trò của vị trí này trong trải bài",
      cardName: c.nameVi || c.card?.nameVi || c.name || c.card?.name || "Lá bài",
      orientation: c.isReversed ? "reversed" : "upright",
      meaningInThisPosition: c.isReversed
        ? "Năng lượng của lá bài đang bị chặn hoặc cần điều chỉnh."
        : "Năng lượng của lá bài đang hỗ trợ hướng đọc chính.",
      meaningForUserQuestion: `Trong câu hỏi "${bundle.currentQuestion}", vị trí này cần được đọc như một tín hiệu thực tế, không phải kết luận định mệnh.`,
      psychologicalInsight: "Hãy phân biệt trực giác với mong muốn nhất thời trước khi quyết định.",
      practicalSignal: c.isReversed ? "wait" : "conditional"
    })) : [],
    symbolicReading: {
      primaryHexagram: bundle.readingData.hexagram?.primary || "Quẻ chủ",
      movingLines: String(bundle.readingData.hexagram?.movingLines || "Không có"),
      changedHexagram: bundle.readingData.hexagram?.changed || "Quẻ biến",
      transformationSummary: label || "Chưa có đủ dữ liệu chuyển hóa"
    },
    psychologicalInterpretation: bundle.questionContext.psychologicalNeed || "Tâm lý hiện tại cần sự rõ ràng và khoảng lùi trước khi ra quyết định.",
    contextualInterpretation: `Với loại câu hỏi ${bundle.questionContext.questionType}, phần quan trọng nhất là nối biểu tượng với dữ kiện thực tế của bạn.`,
    decisionChecklist: requiredLens.map((lens) => `Kiểm tra: ${lens}`),
    practicalAdvice: [
      isHighRisk ? "Tạm hoãn quyết định lớn cho đến khi có đủ dữ kiện." : "Chỉ hành động khi điều kiện then chốt đã rõ.",
      "Ghi lại 2-3 dấu hiệu thực tế xác nhận hoặc phủ định trực giác hiện tại."
    ],
    thingsToAvoid: ["Không xem kết quả này như cam kết tuyệt đối.", "Tránh quyết định khi đang chịu áp lực cảm xúc mạnh."],
    riskNotes: [isHighRisk ? "Đây là nhóm câu hỏi rủi ro cao, cần ưu tiên bằng chứng và phương án dự phòng." : "Fallback chưa thay thế được phân tích AI đầy đủ."],
    finalMessage: "Khi dấu hiệu biểu tượng và dữ kiện đời thực cùng chỉ về một hướng, quyết định sẽ bớt mơ hồ.",
    qualitySelfCheck: {
      isContextual: true,
      isTooGeneric: false,
      isTooLong: false,
      missingImportantInfo: ["AI online response unavailable"],
      offTopicWarnings: [],
      needsSecondPass: false
    }
  };
}
