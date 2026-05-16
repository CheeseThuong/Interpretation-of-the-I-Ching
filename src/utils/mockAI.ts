import type { CastingMetadata, ManualHexagramState } from '../types';
import type { UnifiedAIReadingResponse, ReadingTone } from '../types/ai';

// Re-exporting for UI use
export type AIReadingResponse = UnifiedAIReadingResponse;

export async function mockAIHexagramReading(
  metadata: CastingMetadata,
  hexagramState: ManualHexagramState,
  tone: ReadingTone
): Promise<UnifiedAIReadingResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        directAnswer: `Dựa trên quẻ ${hexagramState.primaryInfo.name}, bạn nên tiếp cận vấn đề này một cách cẩn trọng. Câu trả lời nghiêng về phía "Cần điều kiện" trước khi hành động.`,
        decisionSignal: 'conditional',
        confidenceLevel: 'high',
        questionContext: {
          questionType: 'vehicle_property_asset',
          decisionType: 'sell_or_keep',
          mainObject: 'tài sản',
          userIntent: `Tìm hiểu về khả năng thực hiện "${metadata.question}"`,
          riskLevel: 'medium',
          answerMode: 'decision_guidance',
          requiredLens: ['giá thị trường', 'nhu cầu thực tế', 'pháp lý']
        },
        quickSummary: `[${tone}] Sự chuyển hóa năng lượng đang diễn ra. Đừng vội vã.`,
        symbolicReading: {
          mainSymbol: hexagramState.primaryInfo.name,
          mainPattern: `Quẻ chính ${hexagramState.primaryInfo.name} cho thấy sự tích lũy đang diễn ra.`,
          changingFactor: hexagramState.movingLines.length > 0 
            ? `Hào động tại vị trí ${hexagramState.movingLines.join(', ')} báo hiệu sự thay đổi bất ngờ.`
            : "Sự việc đang ở trạng thái tĩnh.",
          futureTrend: `Xu hướng sẽ dẫn tới quẻ ${hexagramState.changedInfo.name}.`
        },
        contextualInterpretation: `Với câu hỏi về ${metadata.topic}, bạn cần lưu ý rằng mọi thứ đang trong giai đoạn chuẩn bị. Đừng ép buộc kết quả ngay lúc này.`,
        decisionChecklist: [
          "Xác định giá trị thực tế của vật sở hữu.",
          "Kiểm tra các phương án thay thế sau khi bán.",
          "Tính toán chi phí cơ hội."
        ],
        practicalAdvice: [
          "Kiểm tra lại các nguồn lực hiện có.",
          "Dành thêm 3-5 ngày để quan sát biến động thị trường.",
          "Thảo luận với người có kinh nghiệm trước khi ký kết."
        ],
        thingsToAvoid: [
          "Tránh ra quyết định khi đang nóng vội.",
          "Không nên bỏ qua những chi tiết nhỏ trong hợp đồng."
        ],
        riskNotes: [
          "Rủi ro về sự thiếu hụt thông tin chính xác."
        ],
        symbolDetails: {
          hexagramExplanation: {
            primaryHexagram: `Quẻ ${hexagramState.primaryInfo.name} đại diện cho nền tảng hiện tại.`,
            movingLines: `Hào động cho thấy điểm yếu cần khắc phục.`,
            changedHexagram: `Quẻ biến chỉ ra hướng đi sắp tới.`
          }
        },
        finalMessage: "Vũ trụ luôn vận hành theo nhịp điệu riêng, hãy kiên nhẫn."
      });
    }, 2500);
  });
}

export async function mockAITarotReading(
  question: string,
  drawnCards: any[],
  tone: ReadingTone
): Promise<UnifiedAIReadingResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock question classification
      let qType: any = 'unclear';
      if (question.toLowerCase().includes('xe') || question.toLowerCase().includes('nhà')) qType = 'vehicle_property_asset';
      else if (question.toLowerCase().includes('tình') || question.toLowerCase().includes('người yêu')) qType = 'love_relationship';
      else if (question.toLowerCase().includes('việc') || question.toLowerCase().includes('nghỉ')) qType = 'career_work';

      resolve({
        directAnswer: `Dựa trên các lá bài đã chọn cho câu hỏi "${question}", thông điệp chính là sự cân nhắc kỹ lưỡng về lợi ích dài hạn. Bạn nên xem xét các yếu tố thực tế trước khi chốt quyết định.`,
        decisionSignal: 'conditional',
        confidenceLevel: 'medium',
        questionContext: {
          questionType: qType,
          decisionType: 'general_guidance',
          mainObject: 'đối tượng trong câu hỏi',
          userIntent: `Giải đáp về "${question}"`,
          riskLevel: 'low',
          answerMode: 'reflection',
          requiredLens: ['tâm thái', 'hành động thực tế']
        },
        quickSummary: `[${tone}] Cần sự minh bạch và kiểm chứng thực tế trước khi hành động.`,
        symbolicReading: {
          mainSymbol: drawnCards[0]?.card.nameVi || "Tarot",
          mainPattern: "Sự hiện diện của các lá bài chỉ ra một chu kỳ đang dần khép lại để nhường chỗ cho cái mới.",
          changingFactor: "Yếu tố thay đổi lớn nhất nằm ở cách bạn đánh giá rủi ro hiện tại.",
          futureTrend: "Kết quả tích cực sẽ đến nếu bạn không bỏ qua các chi tiết nhỏ."
        },
        contextualInterpretation: "Toàn bộ trải bài khuyên bạn nên giữ sự tỉnh táo, tách biệt cảm xúc nhất thời ra khỏi các quyết định có tính chất vật chất hoặc dài hạn.",
        decisionChecklist: [
          "Liệt kê danh sách ưu và nhược điểm ra giấy.",
          "Tham vấn ý kiến từ ít nhất một người có chuyên môn.",
          "Kiểm tra lại tính pháp lý hoặc tính thanh khoản của vấn đề."
        ],
        practicalAdvice: [
          "Kiểm tra lại các nguồn lực hiện có.",
          "Tránh chốt giao dịch khi chưa hiểu rõ mọi điều khoản.",
          "Đừng để áp lực thời gian làm mờ đi lý trí."
        ],
        thingsToAvoid: [
          "Tránh chốt giao dịch khi chưa hiểu rõ mọi điều khoản.",
          "Đừng để áp lực thời gian làm mờ đi lý trí."
        ],
        riskNotes: [
          "Rủi ro về việc đánh giá sai giá trị thực tế.",
          "Lưu ý về các chi phí ẩn có thể phát sinh."
        ],
        symbolDetails: {
          cardInterpretations: drawnCards.map(dc => ({
            position: dc.positionName,
            cardName: dc.card.nameVi,
            orientation: dc.isReversed ? 'reversed' : 'upright',
            meaningInThisQuestion: `Lá bài ${dc.card.nameVi} ở vị trí ${dc.positionName} nhấn mạnh việc ${dc.isReversed ? 'khắc phục sự trì trệ' : 'phát huy thế mạnh'} liên quan trực tiếp đến vấn đề "${question}".`,
            decisionImpact: dc.isReversed ? 'wait' : 'proceed',
            advice: `Hãy chú ý đến khía cạnh ${dc.card.keywordsUpright[0]} của lá bài này.`
          }))
        },
        finalMessage: "Sự thật luôn mang lại tự do, hãy nhìn thẳng vào các con số và dữ kiện."
      });
    }, 2500);
  });
}
