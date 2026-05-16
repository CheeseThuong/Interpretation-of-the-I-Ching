import type { CastingMetadata, ManualHexagramState } from '../types';
import type { UnifiedAIReadingResponse, ReadingTone } from '../types/ai';
import { classifyQuestionContext } from '../lib/ai/prompts';

// Re-exporting for UI use
export type AIReadingResponse = UnifiedAIReadingResponse;

export async function mockAIHexagramReading(
  metadata: CastingMetadata,
  hexagramState: ManualHexagramState,
  tone: ReadingTone
): Promise<UnifiedAIReadingResponse> {
  const ctx = classifyQuestionContext(metadata.question, metadata.topic);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        directAnswer: `Dựa trên quẻ ${hexagramState.primaryInfo.name} và câu hỏi của bạn, hãy tiếp cận vấn đề một cách cẩn trọng và quan sát thêm trước khi ra quyết định.`,
        decisionSignal: 'conditional',
        confidenceLevel: 'medium',
        questionContext: {
          questionType: ctx.questionType as any,
          decisionType: ctx.decisionType as any,
          mainObject: ctx.mainObject || 'vấn đề được hỏi',
          userIntent: metadata.question,
          riskLevel: ctx.riskLevel as any,
          answerMode: ctx.answerMode as any,
          requiredLens: ctx.requiredLens,
        },
        quickSummary: `[${tone}] Hãy kiên nhẫn và quan sát kỹ trước khi hành động.`,
        symbolicReading: {
          mainSymbol: hexagramState.primaryInfo.name,
          mainPattern: `Quẻ chính ${hexagramState.primaryInfo.name} cho thấy tình huống đang trong giai đoạn hình thành.`,
          changingFactor: hexagramState.movingLines.length > 0
            ? `Hào động tại vị trí ${hexagramState.movingLines.join(', ')} báo hiệu điểm cần chú ý.`
            : 'Sự việc đang ở trạng thái ổn định.',
          futureTrend: `Xu hướng sẽ dẫn tới quẻ ${hexagramState.changedInfo.name}.`,
        },
        contextualInterpretation: `Với câu hỏi về ${ctx.mainObject || metadata.topic}, mọi thứ đang trong giai đoạn chuẩn bị. Đừng ép buộc kết quả ngay lúc này.`,
        decisionChecklist: ctx.requiredLens.length > 0
          ? ctx.requiredLens.map(l => `Xem xét: ${l}`)
          : ['Quan sát tình huống thêm 3-5 ngày.', 'Tham khảo ý kiến từ người tin tưởng.'],
        practicalAdvice: [
          'Quan sát thêm trước khi hành động.',
          'Ghi lại các dấu hiệu và tín hiệu xung quanh.',
        ],
        thingsToAvoid: [
          'Tránh ra quyết định khi đang cảm xúc không ổn định.',
          'Không nên bỏ qua những chi tiết nhỏ nhưng quan trọng.',
        ],
        riskNotes: ['Rủi ro từ việc hành động thiếu thông tin đầy đủ.'],
        symbolDetails: {
          hexagramExplanation: {
            primaryHexagram: `Quẻ ${hexagramState.primaryInfo.name} đại diện cho nền tảng hiện tại.`,
            movingLines: 'Hào động cho thấy điểm cần chú ý và khắc phục.',
            changedHexagram: `Quẻ biến chỉ ra hướng đi sắp tới.`,
          },
        },
        finalMessage: 'Hãy tin vào quá trình và kiên nhẫn với nhịp độ tự nhiên của mọi việc.',
      });
    }, 2500);
  });
}

export async function mockAITarotReading(
  question: string,
  drawnCards: any[],
  tone: ReadingTone
): Promise<UnifiedAIReadingResponse> {
  const ctx = classifyQuestionContext(question);
  const isLove = ctx.questionType === 'love_relationship';
  const isAsset = ['vehicle_property_asset', 'housing_property', 'money_finance'].includes(ctx.questionType);
  const firstCard = drawnCards[0]?.card?.nameVi || 'Tarot';

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        directAnswer: isLove
          ? `Dựa trên lá bài ${firstCard} cho câu hỏi "${question}", năng lượng tình cảm${ctx.timeframe ? ` trong ${ctx.timeframe}` : ' sắp tới'} đang cần sự quan sát và lắng nghe tín hiệu thực tế hơn là kết luận vội vàng.`
          : isAsset
          ? `Dựa trên lá bài ${firstCard}, thông điệp chính là cần cân nhắc kỹ lưỡng và kiểm tra các yếu tố thực tế trước khi quyết định.`
          : `Dựa trên lá bài ${firstCard} cho câu hỏi "${question}", hãy quan sát tình huống thêm và lắng nghe cả lý trí lẫn cảm xúc trước khi hành động.`,
        decisionSignal: isLove ? 'wait' : 'conditional',
        confidenceLevel: 'medium',
        questionContext: {
          questionType: ctx.questionType as any,
          decisionType: ctx.decisionType as any,
          mainObject: ctx.mainObject || 'vấn đề được hỏi',
          userIntent: question,
          riskLevel: ctx.riskLevel as any,
          answerMode: ctx.answerMode as any,
          requiredLens: ctx.requiredLens,
        },
        quickSummary: isLove
          ? `[${tone}] Hãy quan sát tín hiệu thực tế, đừng suy diễn quá mức.`
          : `[${tone}] Cần kiểm tra thực tế kỹ lưỡng trước khi quyết định.`,
        symbolicReading: {
          mainSymbol: firstCard,
          mainPattern: isLove
            ? `Lá ${firstCard} phản ánh bầu không khí cảm xúc trong mối quan hệ — hãy chú ý đến các tín hiệu giao tiếp tinh tế.`
            : `Lá ${firstCard} chỉ ra rằng tình huống đang cần thêm thời gian để rõ ràng hơn.`,
          changingFactor: isLove
            ? 'Sự thay đổi sẽ đến từ hành động giao tiếp cởi mở và chân thành.'
            : 'Yếu tố thay đổi nằm ở việc thu thập đủ thông tin trước khi hành động.',
          futureTrend: isLove
            ? `${ctx.timeframe ? `Trong ${ctx.timeframe}, ` : ''}xu hướng cho thấy sự kết nối sẽ rõ ràng hơn nếu bạn kiên nhẫn.`
            : 'Kết quả tích cực sẽ đến nếu bạn không bỏ qua các chi tiết quan trọng.',
        },
        contextualInterpretation: isLove
          ? `Lá bài ${firstCard} trong câu hỏi về tình duyên${ctx.timeframe ? ` ${ctx.timeframe}` : ''} cho thấy bầu không khí cảm xúc đang cần sự quan sát hơn là hành động vội vàng. Hãy chú ý đến tín hiệu giao tiếp, cách người kia phản ứng trong thực tế, và tránh suy diễn dựa trên lo lắng. Ranh giới cảm xúc lành mạnh sẽ giúp bạn nhìn rõ hơn.`
          : `Lá bài ${firstCard} trong câu hỏi về ${ctx.mainObject || 'vấn đề này'} khuyên bạn nên xem xét kỹ các yếu tố thực tế trước khi đưa ra quyết định.`,
        decisionChecklist: isLove
          ? [
              'Quan sát tín hiệu giao tiếp thực tế (không suy diễn)',
              'Ghi nhận cảm xúc của bản thân — bạn thực sự muốn gì?',
              'Có cơ hội gặp gỡ hoặc kết nối nào sắp tới không?',
              'Hành động của mình đang xuất phát từ tình cảm hay nỗi sợ?',
              'Ranh giới cảm xúc của bạn có đang được tôn trọng không?',
              ctx.timeframe ? `Kế hoạch cụ thể cho ${ctx.timeframe}?` : 'Nhịp tiến triển phù hợp với cả hai phía?',
            ]
          : ctx.requiredLens.length > 0
          ? ctx.requiredLens.map(l => `Kiểm tra: ${l}`)
          : ['Liệt kê các ưu và nhược điểm.', 'Tham vấn từ người có kinh nghiệm.'],
        practicalAdvice: isLove
          ? [
              'Dành thời gian quan sát hành động thực tế, không chỉ lời nói.',
              'Nếu muốn kết nối, hãy chủ động tạo cơ hội gặp gỡ tự nhiên.',
              'Giữ sự cởi mở nhưng không đặt kỳ vọng quá cao.',
            ]
          : [
              'Kiểm tra lại các thông tin và dữ liệu liên quan.',
              'Tham khảo ý kiến chuyên gia nếu cần thiết.',
              'Không nên vội vàng trước khi có đủ thông tin.',
            ],
        thingsToAvoid: isLove
          ? [
              'Tránh suy diễn quá mức từ các dấu hiệu nhỏ.',
              'Không nên hành động chỉ vì nỗi sợ mất cơ hội.',
              'Đừng để lo lắng khiến bạn đưa ra kết luận sai.',
            ]
          : [
              'Tránh ra quyết định khi đang dưới áp lực.',
              'Không bỏ qua các chi tiết quan trọng trong thỏa thuận.',
            ],
        riskNotes: isLove
          ? [
              'Rủi ro từ kỳ vọng không phù hợp với thực tế.',
              'Nguy cơ hiểu nhầm tín hiệu — xác nhận bằng giao tiếp thực tế.',
            ]
          : [
              'Rủi ro từ việc hành động thiếu thông tin.',
              'Chú ý đến các điều khoản ẩn hoặc chi phí không lường trước.',
            ],
        symbolDetails: {
          cardInterpretations: drawnCards.map(dc => ({
            position: dc.positionName,
            cardName: dc.card.nameVi,
            orientation: dc.isReversed ? 'reversed' : 'upright',
            meaningInThisQuestion: isLove
              ? `Lá ${dc.card.nameVi} ở vị trí ${dc.positionName} phản ánh ${dc.isReversed ? 'năng lượng cần điều chỉnh' : 'năng lượng tích cực'} trong chuyện tình cảm của bạn.`
              : `Lá ${dc.card.nameVi} ở vị trí ${dc.positionName} nhấn mạnh việc ${dc.isReversed ? 'khắc phục trở ngại' : 'phát huy điểm mạnh'} liên quan đến "${question}".`,
            decisionImpact: dc.isReversed ? 'wait' : 'proceed',
            advice: isLove
              ? `Hãy chú ý đến khía cạnh ${dc.card.keywordsUpright[0]} của lá bài này trong bối cảnh tình cảm.`
              : `Hãy chú ý đến khía cạnh ${dc.card.keywordsUpright[0]} của lá bài này.`,
          })),
        },
        finalMessage: isLove
          ? 'Tình cảm thực sự không cần được ép buộc — hãy để nó phát triển theo nhịp tự nhiên.'
          : 'Sự thật luôn mang lại tự do — hãy nhìn thẳng vào dữ kiện thực tế.',
      });
    }, 2500);
  });
}
