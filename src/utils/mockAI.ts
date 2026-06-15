import type { UnifiedAIReadingResponse } from '../types/ai';
import { buildTarotContextBundle, buildKinhDichContextBundle } from '../lib/ai/contextBundle';
import type { CastingMetadata, ManualHexagramState } from '../types';
import type { DrawnCard } from '../types/tarot';
import type { ZodiacLens } from '../lib/astrology/zodiac';
import { synthesizeTarotReading } from '../lib/readings/synthesis';
import type { SignalType } from '../lib/readings/synthesis';

// Re-exporting for UI use
export type AIReadingResponse = UnifiedAIReadingResponse;

function inferSpreadForMock(drawnCards: DrawnCard[], spreadType?: string): {
  spreadId: 'one-card' | 'three-cards' | 'love' | 'yes-no' | 'daily' | 'five-cards';
  spreadName: string;
} {
  if (spreadType?.toLowerCase().includes('love') || drawnCards.some((card) => card.positionName.toLowerCase().includes('người ấy'))) {
    return { spreadId: 'love', spreadName: spreadType || 'Tình Yêu' };
  }
  if (drawnCards.length === 5) return { spreadId: 'five-cards', spreadName: spreadType || 'Trải Bài 5 Lá' };
  if (drawnCards.length === 3) return { spreadId: 'three-cards', spreadName: spreadType || 'Ba Lá' };
  return { spreadId: 'one-card', spreadName: spreadType || 'Một Lá Bài' };
}

function signalLabel(signal: SignalType): string {
  const labels: Record<SignalType, string> = {
    proceed: 'Có thể mở ra',
    wait: 'Nên chậm lại',
    avoid: 'Không nên ép tiến',
    conditional: 'Có tiềm năng nếu đủ điều kiện',
    unclear: 'Chưa đủ rõ',
    reflection: 'Cần nhìn lại bên trong',
  };
  return labels[signal];
}

export async function mockAIHexagramReading(
  metadata: CastingMetadata,
  hexagramState: ManualHexagramState,
  tone?: string
): Promise<UnifiedAIReadingResponse> {
  void tone;
  const input = {
    question: metadata.question,
    topic: metadata.topic,
    primaryHexagram: hexagramState.primaryInfo.name,
    changedHexagram: hexagramState.changedInfo.name,
    movingLines: hexagramState.movingLines,
    sixLines: hexagramState.primaryLines,
    synthesisContext: 'Mock synthesis'
  };
  
  const ctx = buildKinhDichContextBundle(input);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        directAnswer: `Dựa trên quẻ ${ctx.readingData.hexagram?.primary} và câu hỏi của bạn, hãy tiếp cận vấn đề một cách cẩn trọng và quan sát thêm trước khi ra quyết định.`,
        decisionSignal: 'conditional',
        confidenceLevel: 'medium',
        questionContext: ctx.questionContext as UnifiedAIReadingResponse['questionContext'],
        personalizationUsed: {
          memoryUsed: false,
          zodiacUsed: false,
          referenceUsed: false,
          synthesisUsed: false
        },
        quickSummary: `Hãy kiên nhẫn và quan sát kỹ trước khi hành động.`,
        synthesisSummary: "Sự kết hợp này cho thấy cần thêm thời gian để rõ ràng.",
        positionAnalyses: [],
        psychologicalInterpretation: "Tâm lý hiện tại cần sự tĩnh lặng để đưa ra quyết định đúng đắn.",
        symbolicReading: {
          mainPattern: `Quẻ chính ${ctx.readingData.hexagram?.primary} cho thấy tình huống đang trong giai đoạn hình thành.`,
          changingFactor: 'Hào động cho thấy điểm cần chú ý.',
          futureTrend: `Xu hướng sẽ dẫn tới quẻ ${ctx.readingData.hexagram?.changed}.`,
        },
        contextualInterpretation: `Với câu hỏi về ${ctx.questionContext.mainObject}, mọi thứ đang trong giai đoạn chuẩn bị.`,
        decisionChecklist: ctx.questionContext.requiredLens.length > 0
          ? ctx.questionContext.requiredLens.map((l: string) => `Xem xét: ${l}`)
          : ['Quan sát tình huống thêm 3-5 ngày.', 'Tham khảo ý kiến từ người tin tưởng.'],
        practicalAdvice: [
          'Quan sát thêm trước khi hành động.',
          'Ghi lại các dấu hiệu và tín hiệu xung quanh.',
        ],
        thingsToAvoid: [
          'Tránh ra quyết định khi đang cảm xúc không ổn định.',
        ],
        riskNotes: ['Rủi ro từ việc hành động thiếu thông tin đầy đủ.'],
        finalMessage: 'Hãy tin vào quá trình và kiên nhẫn với nhịp độ tự nhiên của mọi việc.',
      });
    }, 2500);
  });
}

export async function mockAITarotReading(
  question: string,
  drawnCards: DrawnCard[],
  tone?: string,
  spreadType?: string,
  zodiacLens?: ZodiacLens
): Promise<UnifiedAIReadingResponse> {
  void tone;
  const inferredSpread = inferSpreadForMock(drawnCards, spreadType);
  const synthesis = synthesizeTarotReading({
    question,
    spreadId: inferredSpread.spreadId,
    spreadName: inferredSpread.spreadName,
    drawnCards,
  });
  const input = {
    question,
    drawnCards,
    spreadType,
    zodiacLens,
    synthesisContext: synthesis,
  };
  
  const ctx = buildTarotContextBundle(input);
  const isLove = ctx.questionContext.questionType === 'love_relationship';
  const firstCard = drawnCards[0];
  const finalCard = drawnCards[drawnCards.length - 1];
  const reversedCount = drawnCards.filter((card) => card.isReversed).length;
  const timeline = ctx.questionContext.timeframe || (question.toLowerCase().includes('3 tháng') ? '3 tháng tới' : '');
  const positionAnalyses = synthesis.positionAnalyses.map((pa) => ({
    positionLabel: pa.positionLabel,
    positionFunction: pa.positionFunction,
    cardName: pa.cardNameVi,
    orientation: pa.orientation,
    meaningInThisPosition: pa.meaningInThisPosition,
    meaningForUserQuestion: pa.meaningForUserQuestion,
    psychologicalInsight: pa.psychologicalInsight,
    practicalSignal: pa.orientation === 'reversed' ? 'wait' : 'proceed',
  }));

  const directAnswer = isLove
    ? `${signalLabel(synthesis.mainSignal)}. ${timeline ? `Trong ${timeline}, ` : ''}${finalCard ? `${finalCard.card.nameVi} ở vị trí "${finalCard.positionName}" cho thấy cửa phát triển vẫn có, nhưng ` : ''}${reversedCount > 0 ? `${reversedCount} lá ngược yêu cầu làm rõ cảm xúc, ranh giới và nhịp giao tiếp trước khi kỳ vọng tiến xa.` : 'năng lượng đang khá thuận nếu hai bên chủ động rõ ràng.'}`
    : `${signalLabel(synthesis.mainSignal)}. ${synthesis.oneLineSummary}`;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        directAnswer,
        decisionSignal: synthesis.mainSignal,
        confidenceLevel: 'medium',
        questionContext: ctx.questionContext as UnifiedAIReadingResponse['questionContext'],
        personalizationUsed: {
          memoryUsed: false,
          zodiacUsed: !!zodiacLens,
          referenceUsed: false,
          synthesisUsed: true
        },
        quickSummary: synthesis.oneLineSummary,
        synthesisSummary: synthesis.combinedConclusion,
        reasonedInterpretation: `${synthesis.keyTension} Vì vậy tín hiệu chính là "${synthesis.mainSignal}", không phải kết luận tuyệt đối.`,
        positionAnalyses,
        symbolicReading: {
          mainPattern: synthesis.patternSummary,
          changingFactor: synthesis.keyTension,
          futureTrend: finalCard
            ? `${finalCard.card.nameVi} ở vị trí "${finalCard.positionName}" là xu hướng cuối: ${finalCard.isReversed ? finalCard.card.meaningReversed : finalCard.card.meaningUpright}`
            : synthesis.oneLineSummary,
        },
        psychologicalInterpretation: isLove
          ? 'Các lá ngược trong trải bài tình cảm thường chỉ ra cảm xúc chưa cùng nhịp: một bên cần rõ lòng mình, bên kia có thể còn giữ thế phòng vệ hoặc sợ mất an toàn.'
          : 'Tâm lý hiện tại cần tách trực giác khỏi áp lực nhất thời, rồi kiểm chứng bằng hành động nhỏ.',
        contextualInterpretation: isLove
          ? `${firstCard ? `${firstCard.card.nameVi} ở vị trí của bạn` : 'Lá đầu'} nói về phần bạn đang mang vào mối quan hệ; ${finalCard ? `${finalCard.card.nameVi} ở vị trí kết nối/tương lai` : 'lá cuối'} mới là hướng mở. Vì vậy trọng tâm không phải "có hay không", mà là điều kiện để kết nối sáng rõ hơn.`
          : synthesis.combinedConclusion,
        decisionChecklist: ctx.questionContext.requiredLens.length > 0
          ? ctx.questionContext.requiredLens.map((l: string) => `Kiểm tra: ${l}`)
          : ['Viết ra dữ kiện đã thấy, không chỉ cảm giác.', 'Chọn một bước thử nhỏ trước khi quyết định lớn.'],
        practicalAdvice: [
          synthesis.keyAdvice,
          isLove ? 'Trong 2-4 tuần đầu, ưu tiên quan sát hành động lặp lại và chất lượng giao tiếp thay vì ép cam kết.' : 'Ra quyết định theo từng bước nhỏ có thể đo được.',
          finalCard && !finalCard.isReversed ? `Giữ hướng tích cực của ${finalCard.card.nameVi} bằng sự rõ ràng, vui vẻ và chủ động mở lời đúng lúc.` : 'Chưa nên đẩy nhanh nhịp khi tín hiệu còn đảo chiều.',
        ],
        thingsToAvoid: [
          'Tránh suy diễn im lặng thành câu trả lời chắc chắn.',
          'Tránh kiểm soát hoặc thử lòng người kia để tìm cảm giác an toàn.',
        ],
        riskNotes: [
          reversedCount > 0
            ? `${reversedCount} lá ngược cho thấy rủi ro chính nằm ở nhịp chưa đồng bộ, không nhất thiết là kết quả xấu.`
            : 'Rủi ro thấp hơn, nhưng vẫn cần đối chiếu với hành động thực tế.',
        ],
        finalMessage: finalCard?.card.name === 'The Sun'
          ? 'Mặt Trời không hứa rằng mọi thứ tự sáng lên; nó nhắc bạn chọn sự rõ ràng để tình cảm có chỗ lớn lên.'
          : 'Một trải bài tốt không thay bạn quyết định; nó chỉ chỉ ra nơi cần nhìn thẳng hơn.',
        qualitySelfCheck: {
          isContextual: true,
          isTooGeneric: false,
          isTooLong: false,
          missingImportantInfo: [],
          offTopicWarnings: [],
          needsSecondPass: false,
        },
      });
    }, 800);
  });
}
