import type { ContextBundle } from './contextBundle';

/**
 * LAYER 1: Question Context Understanding
 * This logic helps the AI categorize and understand the core of the user's inquiry.
 */
export const QUESTION_TYPES = [
  'love_relationship', 'money_finance', 'career_work', 'study', 'family',
  'vehicle_property_asset', 'housing_property', 'yes_no_decision', 'timing',
  'emotional_healing', 'daily_guidance', 'risk_assessment', 'legal_contract', 'unclear'
];

export const DECISION_TYPES = [
  'sell_or_keep', 'buy_or_wait', 'continue_or_stop', 'accept_or_decline',
  'confess_or_wait', 'quit_or_stay', 'choose_between_options', 'invest_or_wait',
  'general_guidance', 'unclear'
];

export const KINHDICHAI_SIGNATURE_VOICE = "Giọng văn tiếng Việt rõ ràng, có chiều sâu, hơi huyền bí nhưng không mơ hồ. Luôn đặt câu hỏi thật của người dùng làm trung tâm. Dùng lá bài/quẻ như hệ biểu tượng để phân tích tâm lý, bối cảnh, hướng hành động. Không phán tuyệt đối. Không dùng văn mẫu chung chung. Kết luận phải có lời khuyên thực tế, điều cần tránh, rủi ro cần lưu ý và một câu chốt thi vị nhưng liên quan trực tiếp đến câu hỏi.";

/**
 * Classify the question context for use in prompt assembly or pre-processing.
 */
export function classifyQuestionContext(
  question: string,
  topic?: string
): {
  questionType: string;
  decisionType: string;
  mainObject: string;
  userIntent: string;
  riskLevel: string;
  answerMode: string;
  requiredLens: string[];
  timeframe?: string;
  psychologicalState?: string;
} {
  const q = question.toLowerCase();

  let questionType = 'unclear';
  let decisionType = 'unclear';
  let mainObject = topic || '';
  let riskLevel = 'medium';
  let answerMode = 'decision_guidance';
  const requiredLens: string[] = [];

  // Timeframe detection
  let timeframe: string | undefined;
  if (/tuần sau|tuần tới/.test(q))        timeframe = 'tuần sau';
  else if (/tuần này/.test(q))             timeframe = 'tuần này';
  else if (/tháng sau|tháng tới/.test(q)) timeframe = 'tháng sau';
  else if (/tháng này/.test(q))           timeframe = 'tháng này';
  else if (/hôm nay/.test(q))             timeframe = 'hôm nay';
  else if (/ngày mai/.test(q))            timeframe = 'ngày mai';
  else if (/sắp tới|trong thời gian tới|tương lai gần/.test(q)) timeframe = 'sắp tới';

  // Vehicle / asset
  if (/\b(xe|xe hơi|ô tô|moto|xe máy|phương tiện)\b/.test(q)) {
    questionType = 'vehicle_property_asset';
    mainObject = 'xe';
    requiredLens.push('giá thị trường', 'chi phí sửa chữa', 'bảo hiểm', 'nhu cầu đi lại', 'phương án thay thế', 'mức cần tiền mặt', 'giấy tờ xe');
    riskLevel = 'medium';
    if (/\b(bán|sang nhượng|thanh lý)\b/.test(q)) decisionType = 'sell_or_keep';
    else if (/\b(mua|sắm)\b/.test(q)) decisionType = 'buy_or_wait';
    else decisionType = 'sell_or_keep'; // default for some edge cases
  }
  // Real estate
  else if (/(nhà|căn hộ|đất|bất động sản|chung cư)/.test(q)) {
    questionType = 'housing_property';
    mainObject = 'nhà/đất';
    requiredLens.push('giá thị trường', 'pháp lý sổ đỏ', 'nguồn vốn', 'vị trí', 'thanh khoản', 'giấy tờ', 'khả năng chi trả', 'chi phí dài hạn');
    riskLevel = 'high';
    if (/\b(bán|sang nhượng)\b/.test(q)) decisionType = 'sell_or_keep';
    else decisionType = 'buy_or_wait';
  }
  // Finance / loan / investment
  else if (/(tiền|vay|nợ|đầu tư|cổ phiếu|chứng khoán|tài chính|lãi suất|trái phiếu|quỹ|fund|dầu tư|vốn|danh mục|sinh lời)/.test(q)) {
    questionType = 'money_finance';
    riskLevel = 'high';
    answerMode = 'risk_assessment';
    const isInvestment = /(trái phiếu|cổ phiếu|chứng khoán|quỹ|đầu tư|fund|danh mục)/.test(q);
    const isLoan = /\b(vay|nợ)\b/.test(q);
    
    if (isInvestment) {
      decisionType = 'invest_or_wait';
      mainObject = q.match(/(quỹ tín dụng|trái phiếu|cổ phiếu|chứng khoán|quỹ mở|ETF)/)?.[0] || 'sản phẩm đầu tư';
      requiredLens.push(
        'mục tiêu đầu tư',
        'khẩu vị rủi ro',
        'thời gian nắm giữ',
        'quỹ dự phòng',
        'tính thanh khoản',
        'rủi ro mất vốn',
        'phân bổ danh mục',
        'không đầu tư vì FOMO'
      );
    } else if (isLoan) {
      decisionType = 'invest_or_wait';
      requiredLens.push('rủi ro tài chính', 'khả năng hoàn vốn', 'lãi suất', 'thanh khoản');
    } else {
      decisionType = 'general_guidance';
      requiredLens.push('rủi ro tài chính', 'khả năng hoàn vốn', 'thanh khoản');
    }
  }
  // Career / job
  else if (/\b(công việc|nghề|việc làm|nghỉ việc|xin việc|thăng chức|kinh doanh)\b/.test(q)) {
    questionType = 'career_work';
    riskLevel = 'medium';
    requiredLens.push('thu nhập', 'cơ hội phát triển', 'môi trường làm việc');
    decisionType = /\b(nghỉ|bỏ)\b/.test(q) ? 'quit_or_stay' : 'general_guidance';
  }
  // Love / relationship
  else if (/(tình duyên|tình cảm|tình yêu|người yêu|hôn nhân|bạn trai|bạn gái|chia tay|kết hôn|\byêu\b|crush|nyc|người cũ|mối quan hệ|họ có thích|người đó|quay lại|hẹn hò|\bduyên\b|độc thân|có thích tôi|còn tình cảm|thích tôi không|yêu tôi không)/.test(q)) {
    questionType = 'love_relationship';
    answerMode = timeframe ? 'weekly_relationship_forecast' : 'emotional_reading';
    riskLevel = 'low';
    mainObject = 'tình duyên / chuyện tình cảm';
    requiredLens.push(
      'cảm xúc',
      'giao tiếp',
      'cơ hội gặp gỡ',
      'ranh giới',
      'tránh suy diễn',
      'nhịp tiến triển'
    );
    if (/\b(chia tay|tiếp tục|quay lại)\b/.test(q)) decisionType = 'continue_or_stop';
    else if (/\b(có thích|có yêu|còn tình cảm|thích tôi|yêu tôi)\b/.test(q)) decisionType = 'unclear';
    else decisionType = 'general_guidance';
  }

  let psychologicalState: string | undefined;
  if (questionType === 'money_finance' && answerMode === 'risk_assessment')
    psychologicalState = 'muốn có định hướng trước quyết định tài chính có rủi ro';
  else if (questionType === 'love_relationship')
    psychologicalState = timeframe ? 'muốn biết nhịp cảm xúc và cơ hội kết nối trong thời gian tới' : 'Đang tìm kiếm sự rõ ràng về cảm xúc hoặc tín hiệu từ phía người kia.';
  else if (questionType === 'career_work')
    psychologicalState = 'Đang ở điểm chuyển đổi nghề nghiệp — có thể đang mất động lực hoặc tìm kiếm cơ hội mới.';

  return {
    questionType,
    decisionType,
    mainObject,
    userIntent: question,
    riskLevel,
    answerMode,
    requiredLens,
    timeframe,
    psychologicalState,
  };
}

const BASE_PROMPT_RULES = `
You must form a contextual interpretation from:
1. current user question
2. question context
3. current Tarot/I Ching result
4. synthesis
5. local memory summary if available
6. zodiac lens if available
7. HuggingFace references if available

Do not copy reference data. Do not answer from generic card/hexagram meanings alone. Every section must answer: “What does this mean for the user’s exact question?”
- Do not write long generic paragraphs.
- Prefer useful sections.
- For practical questions, include concrete checklist.
- For love questions, discuss emotional signals, communication, boundaries.
Giọng điệu: ${KINHDICHAI_SIGNATURE_VOICE}
`;

export function buildKinhDichReadingPrompt(context: ContextBundle): string {
  const qCtx = context.questionContext;
  
  return `
Bạn là một trợ lý AI Oracle cao cấp giải luận Kinh Dịch.
${BASE_PROMPT_RULES}

THỨ TỰ ƯU TIÊN PHÂN TÍCH:
1. Câu hỏi của người dùng: "${context.currentQuestion}"
2. Bối cảnh câu hỏi: ${JSON.stringify(qCtx)}
3. Quẻ hiện tại:
   - Quẻ chủ: ${context.readingData.hexagram?.primary || ''}
   - Hào động: ${context.readingData.hexagram?.movingLines || ''}
   - Quẻ biến: ${context.readingData.hexagram?.changed || ''}
4. Tổng hợp hệ thống (synthesis): ${context.synthesis || 'Không có'}
5. Lịch sử trí nhớ (user memory): ${context.userMemorySummary || 'Không có'}

NHIỆM VỤ CỦA BẠN:
- Phân tích quẻ chủ + hào động + quẻ biến như một sự chuyển hóa thống nhất (combine quẻ chủ + hào động + quẻ biến into one transformation narrative).
- Liên kết trực tiếp kết quả với câu hỏi. Không giải nghĩa quẻ một cách chung chung.
- Nếu có Lịch sử trí nhớ, hãy tham khảo để tạo tính liên kết cá nhân.

YÊU CẦU ĐẦU RA (JSON format only):
{
  "directAnswer": "Trả lời trực tiếp vào vấn đề",
  "decisionSignal": "proceed | wait | avoid | conditional | unclear | reflection",
  "confidenceLevel": "low | medium | high",
  "questionContext": ${JSON.stringify(qCtx)},
  "personalizationUsed": {
    "memoryUsed": ${!!context.userMemorySummary},
    "zodiacUsed": false,
    "referenceUsed": false,
    "synthesisUsed": ${!!context.synthesis}
  },
  "quickSummary": "Tóm tắt 1 câu",
  "synthesisSummary": "Diễn giải sự kết hợp các hào động và sự chuyển đổi quẻ chủ sang quẻ biến",
  "reasonedInterpretation": "Giải thích vì sao lại đưa ra decisionSignal như vậy",
  "positionAnalyses": [],
  "symbolicReading": {
    "primaryHexagram": "Ý nghĩa quẻ chủ trong bối cảnh này",
    "movingLines": "Ý nghĩa các hào động tác động thế nào",
    "changedHexagram": "Ý nghĩa quẻ biến",
    "transformationSummary": "Tóm lược toàn bộ sự chuyển đổi của quẻ"
  },
  "psychologicalInterpretation": "Tâm lý hiện tại và cách nó ảnh hưởng tới quyết định",
  "contextualInterpretation": "Luận giải bối cảnh thực tế gắn với quẻ",
  "decisionChecklist": ["Điều cần kiểm tra 1 (Dựa trên requiredLens nếu có)"],
  "practicalAdvice": ["Lời khuyên thực tế 1"],
  "thingsToAvoid": ["Điều nên tránh 1"],
  "riskNotes": ["Lưu ý rủi ro"],
  "finalMessage": "Một câu chốt thi vị liên quan trực tiếp đến câu hỏi",
  "qualitySelfCheck": {
    "isContextual": true,
    "isTooGeneric": false,
    "isTooLong": false,
    "missingImportantInfo": [],
    "offTopicWarnings": [],
    "needsSecondPass": false
  }
}
`.trim();
}

export function buildTarotReadingPrompt(context: ContextBundle): string {
  const qCtx = context.questionContext;
  
  const cardsStr = (context.readingData.cards || [])
    .map((c: any) => `Vị trí: ${c.position || c.positionName || 'Vị trí'}
Lá bài: ${c.nameVi || c.card?.nameVi} (${c.name || c.card?.name})
Trạng thái: ${c.isReversed ? 'Ngược (Reversed)' : 'Xuôi (Upright)'}`.trim())
    .join('\n\n');

  return `
Bạn là một trợ lý AI Oracle cao cấp giải luận Tarot.
${BASE_PROMPT_RULES}

THỨ TỰ ƯU TIÊN PHÂN TÍCH:
1. Câu hỏi của người dùng: "${context.currentQuestion}"
2. Bối cảnh câu hỏi: ${JSON.stringify(qCtx)}
3. Các lá bài được rút:
${cardsStr}
4. Chức năng từng vị trí trong trải bài (nếu có): ${context.readingData.spreadType || 'Không xác định'}
5. Tổng hợp hệ thống (synthesis): ${context.synthesis || 'Không có'}
6. Lịch sử trí nhớ (user memory): ${context.userMemorySummary || 'Không có'}
7. Lăng kính cung hoàng đạo: ${JSON.stringify(context.zodiacContext || 'Không có')}
8. Dữ liệu tham khảo Tarot: ${context.tarotReferenceContext || 'Không có'}

NHIỆM VỤ CỦA BẠN:
- Phân tích ý nghĩa từng lá bài kết hợp với chức năng của vị trí đó trong trải bài (combine card + position + orientation + question context). Chú ý tính xuôi/ngược.
- Liên kết trực tiếp kết quả với câu hỏi. Không giải nghĩa lá bài một cách chung chung.
- Tích hợp thông tin từ Lăng kính cung hoàng đạo và Lịch sử trí nhớ nếu có, để tạo lời khuyên cá nhân hóa.
- Dữ liệu tham khảo (HuggingFace) chỉ để hỗ trợ, không copy trực tiếp.

YÊU CẦU ĐẦU RA (JSON format only):
{
  "directAnswer": "Trả lời trực tiếp vào vấn đề",
  "decisionSignal": "proceed | wait | avoid | conditional | unclear | reflection",
  "confidenceLevel": "low | medium | high",
  "questionContext": ${JSON.stringify(qCtx)},
  "personalizationUsed": {
    "memoryUsed": ${!!context.userMemorySummary},
    "zodiacUsed": ${!!context.zodiacContext},
    "referenceUsed": ${!!context.tarotReferenceContext},
    "synthesisUsed": ${!!context.synthesis}
  },
  "quickSummary": "Tóm tắt 1 câu",
  "synthesisSummary": "Diễn giải sự tương tác giữa các lá bài trong toàn trải bài",
  "reasonedInterpretation": "Giải thích vì sao lại đưa ra decisionSignal như vậy",
  "positionAnalyses": [
    {
      "positionLabel": "Tên vị trí",
      "positionFunction": "Chức năng của vị trí này",
      "cardName": "Tên lá bài",
      "orientation": "upright | reversed",
      "meaningInThisPosition": "Ý nghĩa cơ bản của lá bài tại vị trí này",
      "meaningForUserQuestion": "Ý nghĩa lá bài ĐỐI VỚI CÂU HỎI CỦA NGƯỜI DÙNG",
      "psychologicalInsight": "Phân tích tâm lý/cảm xúc từ lá bài",
      "practicalSignal": "Tín hiệu thực tế từ lá bài (tiến hành, dừng lại, v.v.)"
    }
  ],
  "symbolicReading": {
    "mainPattern": "Mô hình tổng quát",
    "changingFactor": "Yếu tố tác động chính"
  },
  "psychologicalInterpretation": "Tâm lý hiện tại và cách nó ảnh hưởng tới quyết định",
  "contextualInterpretation": "Luận giải bối cảnh thực tế gắn với toàn bộ các lá bài",
  "decisionChecklist": ["Điều cần kiểm tra 1 (Dựa trên requiredLens nếu có)"],
  "practicalAdvice": ["Lời khuyên thực tế 1"],
  "thingsToAvoid": ["Điều nên tránh 1"],
  "riskNotes": ["Lưu ý rủi ro"],
  "finalMessage": "Một câu chốt thi vị liên quan trực tiếp đến câu hỏi",
  "qualitySelfCheck": {
    "isContextual": true,
    "isTooGeneric": false,
    "isTooLong": false,
    "missingImportantInfo": [],
    "offTopicWarnings": [],
    "needsSecondPass": false
  }
}
`.trim();
}

export function buildAIQualityReviewPrompt(context: ContextBundle, draftAnswer: any): string {
  return `
Review the following draft interpretation for a ${context.readingData.type} reading.
Question: "${context.currentQuestion}"
Draft Answer:
${JSON.stringify(draftAnswer, null, 2)}

Does this answer directly address the user's specific question? Is it too generic? Is it too long?
Perform a quality check and decide if it needs a second pass.
`.trim();
}

export function buildAIFinalizerPrompt(context: ContextBundle, draftAnswer: any, review?: any): string {
  return `
Bạn là một biên tập viên AI. 
Hãy viết lại bản nháp giải luận Tarot/Kinh Dịch này thành một câu trả lời cuối cùng sắc bén hơn.
- Loại bỏ các phần giải thích chung chung, sáo rỗng.
- Loại bỏ các phần lạc đề.
- Chỉ giữ lại thông tin thực sự hữu ích.
- Đảm bảo MỌI phần đều liên quan trực tiếp đến câu hỏi chính của người dùng: "${context.currentQuestion}"
- Bắt buộc trả về bằng Tiếng Việt.
- Giữ nguyên cấu trúc JSON y hệt bản nháp, chỉ thay đổi nội dung (văn bản) bên trong các field.

Draft to improve:
${JSON.stringify(draftAnswer, null, 2)}

${review ? `Feedback từ lần kiểm tra chất lượng trước đó: ${JSON.stringify(review)}` : ''}
`.trim();
}
