import type { UnifiedAIReadingResponse } from '../types/ai';
import { buildTarotContextBundle, buildKinhDichContextBundle } from '../lib/ai/contextBundle';

// Re-exporting for UI use
export type AIReadingResponse = UnifiedAIReadingResponse;

export async function mockAIHexagramReading(
  metadata: any,
  hexagramState: any,
  _tone?: string
): Promise<UnifiedAIReadingResponse> {
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
        questionContext: ctx.questionContext as any,
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
  drawnCards: any[],
  _tone?: string,
  spreadType?: string,
  zodiacLens?: any
): Promise<UnifiedAIReadingResponse> {
  const input = {
    question,
    drawnCards,
    spreadType,
    zodiacLens
  };
  
  const ctx = buildTarotContextBundle(input);
  const isLove = ctx.questionContext.questionType === 'love_relationship';
  const firstCard = ctx.readingData.cards?.[0]?.card?.nameVi || 'Tarot';

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        directAnswer: isLove
          ? `Dựa trên lá bài ${firstCard} cho câu hỏi "${question}", năng lượng tình cảm đang cần sự quan sát.`
          : `Dựa trên lá bài ${firstCard}, thông điệp chính là cần cân nhắc kỹ lưỡng.`,
        decisionSignal: isLove ? 'wait' : 'conditional',
        confidenceLevel: 'medium',
        questionContext: ctx.questionContext as any,
        personalizationUsed: {
          memoryUsed: false,
          zodiacUsed: !!zodiacLens,
          referenceUsed: false,
          synthesisUsed: false
        },
        quickSummary: isLove
          ? `Hãy quan sát tín hiệu thực tế, đừng suy diễn quá mức.`
          : `Cần kiểm tra thực tế kỹ lưỡng trước khi quyết định.`,
        synthesisSummary: "Tổng quan các lá bài chỉ ra rằng cần xem xét sâu hơn.",
        positionAnalyses: drawnCards.map(dc => ({
          positionLabel: dc.positionName,
          positionFunction: dc.positionName,
          cardName: dc.card.nameVi,
          orientation: dc.isReversed ? 'reversed' : 'upright',
          meaningInThisPosition: dc.card.meaningUpright,
          meaningForUserQuestion: isLove ? "Phản ánh năng lượng tình cảm." : "Nhấn mạnh việc phát huy điểm mạnh.",
          psychologicalInsight: "Tâm lý hiện tại cần sự cân bằng.",
          practicalSignal: dc.isReversed ? 'wait' : 'proceed',
        })),
        symbolicReading: {
          mainPattern: `Lá ${firstCard} phản ánh bối cảnh chung.`,
          changingFactor: 'Sự thay đổi sẽ đến từ hành động của bạn.',
        },
        psychologicalInterpretation: "Đừng để nỗi sợ dẫn dắt quyết định.",
        contextualInterpretation: `Lá bài ${firstCard} khuyên bạn nên xem xét kỹ các yếu tố thực tế.`,
        decisionChecklist: ctx.questionContext.requiredLens.length > 0
          ? ctx.questionContext.requiredLens.map((l: string) => `Kiểm tra: ${l}`)
          : ['Liệt kê các ưu và nhược điểm.'],
        practicalAdvice: [
          'Kiểm tra lại các thông tin và dữ liệu liên quan.',
        ],
        thingsToAvoid: [
          'Tránh ra quyết định khi đang dưới áp lực.',
        ],
        riskNotes: [
          'Rủi ro từ việc hành động thiếu thông tin.',
        ],
        finalMessage: 'Sự thật luôn mang lại tự do — hãy nhìn thẳng vào dữ kiện thực tế.',
      });
    }, 2500);
  });
}
