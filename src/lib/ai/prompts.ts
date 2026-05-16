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

/**
 * Classify the question context for use in prompt assembly or pre-processing.
 * Returns a structured context object that can be serialised into a prompt.
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
} {
  const q = question.toLowerCase();

  let questionType = 'unclear';
  let decisionType = 'unclear';
  let mainObject = topic || '';
  let riskLevel = 'medium';
  let answerMode = 'decision_guidance';
  const requiredLens: string[] = [];

  // ── Timeframe detection (run first, applies to any category) ──────────────
  let timeframe: string | undefined;
  if (/tuần sau|tuần tới/.test(q))        timeframe = 'tuần sau';
  else if (/tháng sau|tháng tới/.test(q)) timeframe = 'tháng sau';
  else if (/hôm nay/.test(q))             timeframe = 'hôm nay';
  else if (/ngày mai/.test(q))            timeframe = 'ngày mai';
  else if (/sắp tới|trong thời gian tới|tương lai gần/.test(q)) timeframe = 'sắp tới';

  // ── Vehicle / asset (must not match love keywords first) ──────────────────
  if (/\b(xe|xe hơi|ô tô|moto|xe máy|phương tiện)\b/.test(q)) {
    questionType = 'vehicle_property_asset';
    mainObject = 'xe';
    requiredLens.push('giá thị trường', 'chi phí sửa chữa', 'bảo hiểm', 'nhu cầu đi lại', 'áp lực tiền mặt', 'giấy tờ pháp lý');
    riskLevel = 'medium';
    if (/\b(bán|sang nhượng|thanh lý)\b/.test(q)) decisionType = 'sell_or_keep';
    else if (/\b(mua|sắm)\b/.test(q)) decisionType = 'buy_or_wait';
  }
  // ── Real estate ───────────────────────────────────────────────────────────
  else if (/\b(nhà|căn hộ|đất|bất động sản|chung cư)\b/.test(q)) {
    questionType = 'housing_property';
    mainObject = 'nhà/đất';
    requiredLens.push('giá thị trường', 'pháp lý sổ đỏ', 'nguồn vốn', 'vị trí', 'thanh khoản');
    riskLevel = 'high';
    if (/\b(bán|sang nhượng)\b/.test(q)) decisionType = 'sell_or_keep';
    else decisionType = 'buy_or_wait';
  }
  // ── Finance / loan / investment ───────────────────────────────────────────
  else if (/\b(tiền|vay|đầu tư|cổ phiếu|chứng khoán|tài chính|lãi suất)\b/.test(q)) {
    questionType = 'money_finance';
    riskLevel = 'high';
    requiredLens.push('rủi ro tài chính', 'khả năng hoàn vốn', 'lãi suất', 'thanh khoản');
    decisionType = /\b(vay|nợ)\b/.test(q) ? 'invest_or_wait' : 'general_guidance';
  }
  // ── Career / job ──────────────────────────────────────────────────────────
  else if (/\b(công việc|nghề|việc làm|nghỉ việc|xin việc|thăng chức|kinh doanh)\b/.test(q)) {
    questionType = 'career_work';
    riskLevel = 'medium';
    requiredLens.push('thu nhập', 'cơ hội phát triển', 'môi trường làm việc');
    decisionType = /\b(nghỉ|bỏ)\b/.test(q) ? 'quit_or_stay' : 'general_guidance';
  }
  // ── Love / relationship — expanded Vietnamese keyword set ─────────────────
  else if (/(tình duyên|tình cảm|tình yêu|người yêu|hôn nhân|bạn trai|bạn gái|chia tay|kết hôn|\byêu\b|crush|nyc|người cũ|mối quan hệ|họ có thích|người đó|quay lại|hẹn hò|\bduyên\b|độc thân|có thích tôi|còn tình cảm|thích tôi không|yêu tôi không)/.test(q)) {
    questionType = 'love_relationship';
    answerMode = 'emotional_reading';
    riskLevel = 'low';
    mainObject = 'tình duyên / chuyện tình cảm';
    requiredLens.push(
      'tín hiệu giao tiếp',
      'cảm xúc của bản thân',
      'cơ hội gặp gỡ hoặc kết nối',
      'sự rõ ràng trong hành động',
      'ranh giới cảm xúc',
      'tránh suy diễn quá mức',
      timeframe ? `nhịp tiến triển trong ${timeframe}` : 'nhịp tiến triển sắp tới'
    );
    if (/\b(chia tay|tiếp tục|quay lại)\b/.test(q)) decisionType = 'continue_or_stop';
    else if (/\b(có thích|có yêu|còn tình cảm|thích tôi|yêu tôi)\b/.test(q)) decisionType = 'unclear';
    else decisionType = 'general_guidance';
  }

  return {
    questionType,
    decisionType,
    mainObject,
    userIntent: question,
    riskLevel,
    answerMode,
    requiredLens,
    timeframe,
  };
}

/**
 * Prompt component for Layer 1 classification and understanding.
 */
const LAYER_1_INSTRUCTIONS = `
LAYER 1: QUESTION CONTEXT UNDERSTANDING
Trước khi luận giải biểu tượng, bạn phải phân tích sâu câu hỏi của người dùng:
1. Xác định questionType từ danh sách: ${QUESTION_TYPES.join(', ')}.
2. Xác định decisionType từ danh sách: ${DECISION_TYPES.join(', ')}.
3. Xác định mainObject (xe, nhà, công việc, người yêu, v.v.).
4. Xác định userIntent (ý định thực sự của người dùng).
5. Đánh giá riskLevel (low, medium, high).
6. Xác định requiredLens: Danh sách các khía cạnh thực tế BẮT BUỘC phải cân nhắc (ví dụ: với bán xe phải xem xét giá thị trường, chi phí bảo trì, nhu cầu đi lại, v.v.).
`.trim();

/**
 * Prompt component for Layer 3 output rules.
 */
const LAYER_3_INSTRUCTIONS = `
LAYER 3: CONTEXTUAL DECISION OUTPUT
Chuyển đổi kết quả biểu tượng thành lời khuyên thực tế:
- TRẢ LỜI TRỰC TIẾP: Trả lời thẳng câu hỏi ngay đầu tiên.
- TÍN HIỆU QUYẾT ĐỊNH (decisionSignal): proceed (tiến hành), wait (chờ), avoid (tránh), conditional (điều kiện), unclear (chưa rõ).
- GIẢI THÍCH LÝ DO: Tại sao biểu tượng lại dẫn tới tín hiệu đó (phải kết nối trực tiếp với câu hỏi).
- CHECKLIST QUYẾT ĐỊNH (decisionChecklist): Các điểm thực tế người dùng cần kiểm tra trước khi quyết.
- VIỆC NÊN LÀM & ĐIỀU NÊN TRÁNH: Phải cực kỳ cụ thể và liên quan đến bối cảnh (không nói chung chung).
- RỦI RO CẦN LƯU Ý: Các cạm bẫy tiềm ẩn.
- CẢNH BÁO: Không khẳng định 100%, thận trọng với tiền bạc/pháp lý.
`.trim();

export function buildKinhDichReadingPrompt(data: {
  question: string;
  topic: string;
  readingTone: string;
  primaryHexagram: string;
  primaryHexagramMeaning?: string;
  changedHexagram: string;
  changedHexagramMeaning?: string;
  movingLines: string;
  sixLines: string;
  castingDateTime: string;
  timezone: string;
  userNotes?: string;
  method: 'self-cast' | 'manual-real-life';
}): string {
  return `
Bạn là một trợ lý AI Oracle cao cấp, sử dụng hệ thống Trí tuệ 3 Lớp (3-Layer Intelligence) để giải luận Kinh Dịch.
Nhiệm vụ của bạn là biến những biểu tượng cổ xưa thành những chỉ dẫn thực tế, hữu ích cho đời sống hiện đại.

${LAYER_1_INSTRUCTIONS}

LAYER 2: KINH DICH SYMBOLIC READING
- Quẻ chính: Tình trạng hiện tại / Mô hình cốt lõi.
- Hào động: Biến số quan trọng / Điểm áp lực / Bước ngoặt.
- Quẻ biến: Hướng đi tương lai / Kết quả tiềm năng.
- LĂNG KÍNH: Sử dụng bối cảnh từ Layer 1 để giải mã từng hào động (ví dụ: Hào 5 động trong câu hỏi về nhà đất có nghĩa là gì?).

${LAYER_3_INSTRUCTIONS}

DỮ LIỆU ĐẦU VÀO:
- Câu hỏi: "${data.question}"
- Chủ đề: ${data.topic}
- Quẻ: ${data.primaryHexagram} biến ${data.changedHexagram}
- Hào động: ${data.movingLines}
- Cấu trúc: ${data.sixLines}
- Thời điểm: ${data.castingDateTime}
- Ghi chú: ${data.userNotes || 'Không có'}
- Giọng điệu: ${data.readingTone}

YÊU CẦU ĐẦU RA (JSON format only):
{
  "directAnswer": "Trả lời thẳng vấn đề trong 1-3 câu.",
  "decisionSignal": "proceed | wait | avoid | conditional | unclear",
  "confidenceLevel": "low | medium | high",
  "questionContext": {
    "questionType": "",
    "decisionType": "",
    "mainObject": "",
    "userIntent": "",
    "riskLevel": "",
    "answerMode": "decision_guidance | emotional_reading | risk_assessment | daily_guidance | reflection",
    "requiredLens": []
  },
  "quickSummary": "Tóm tắt cốt lõi.",
  "symbolicReading": {
    "mainSymbol": "Tên quẻ chính",
    "mainPattern": "Mô hình tình huống hiện tại.",
    "changingFactor": "Yếu tố đang biến đổi (hào động).",
    "futureTrend": "Dự báo từ quẻ biến."
  },
  "contextualInterpretation": "Luận giải chi tiết kết nối biểu tượng với câu hỏi của người dùng.",
  "decisionChecklist": ["Điểm kiểm tra 1", "Điểm kiểm tra 2"],
  "practicalAdvice": ["Hành động 1", "Hành động 2"],
  "thingsToAvoid": ["Điều tránh 1"],
  "riskNotes": ["Rủi ro tài chính/pháp lý/con người"],
  "symbolDetails": {
    "hexagramExplanation": {
      "primaryHexagram": "Ý nghĩa quẻ chính trong bối cảnh này.",
      "movingLines": "Ý nghĩa hào động trong bối cảnh này.",
      "changedHexagram": "Ý nghĩa quẻ biến trong bối cảnh này."
    }
  },
  "finalMessage": "Thông điệp kết thúc (Giọng điệu: ${data.readingTone})."
}
`.trim();
}

export function buildTarotReadingPrompt(
  data: {
    question: string;
    topic?: string;
    readingTone: string;
    spreadType: string;
    drawnCards: Array<{
      name: string;
      nameVi: string;
      position: string;
      isReversed: boolean;
      meaningUpright: string;
      meaningReversed: string;
    }>;
    timestamp: string;
    userNotes?: string;
  },
  referenceContext = ''
): string {
  const cardsStr = data.drawnCards
    .map(
      (c) =>
        `- Vị trí: ${c.position}\n  Lá bài: ${c.nameVi} (${c.name})\n  Trạng thái: ${
          c.isReversed ? 'Ngược (Reversed)' : 'Xuôi (Upright)'
        }\n  Nghĩa xuôi: ${c.meaningUpright}\n  Nghĩa ngược: ${c.meaningReversed}`
    )
    .join('\n\n');

  // Pre-classify the question so the prompt can self-verify and correct
  const preCtx = classifyQuestionContext(data.question, data.topic);

  const isLoveQuestion = preCtx.questionType === 'love_relationship';

  const isHighStakesDecision =
    !isLoveQuestion &&
    preCtx.decisionType !== 'general_guidance' &&
    preCtx.decisionType !== 'unclear' &&
    preCtx.decisionType !== 'confess_or_wait';

  // Love-specific prompt block — fires for all love/relationship questions
  const loveSpecificLayer = isLoveQuestion ? `
LOVE/RELATIONSHIP-SPECIFIC RULES (active — questionType: love_relationship):
- answerMode: emotional_reading
- decisionSignal: use proceed (nên hành động), wait (nên kiên nhẫn), or unclear (chưa đủ dữ liệu)
- contextualInterpretation MUST discuss: bầu không khí cảm xúc, tín hiệu giao tiếp, cơ hội kết nối, ranh giới cảm xúc
- decisionChecklist MUST contain: ${preCtx.requiredLens.join(', ')}
- practicalAdvice MUST be about: cách quan sát, cách hành động, cách duy trì kết nối${preCtx.timeframe ? ` trong ${preCtx.timeframe}` : ''}
- thingsToAvoid MUST be about: suy diễn quá mức, ép buộc cảm xúc, hành động vì nỗi sợ
- riskNotes: rủi ro cảm xúc (hiểu lầm, kỳ vọng quá cao, bỏ lỡ tín hiệu thật)
- FORBIDDEN — DO NOT mention: pháp lý, thanh khoản, giao dịch, giá cả, hợp đồng, tài chính, tài sản
- finalMessage: nhẹ nhàng, khuyến khích, liên quan đến chuyện tình cảm${preCtx.timeframe ? ` ${preCtx.timeframe}` : ''}
- DO NOT claim certainty about another person's feelings — frame as "tín hiệu" or "xu hướng"
`.trim() : '';

  // High-stakes material/financial decision block
  const decisionSpecificLayer = isHighStakesDecision
    ? `
DECISION-SPECIFIC RULES (active because this is a "${preCtx.decisionType}" question):
- decisionSignal MUST be one of: proceed / wait / avoid / conditional / unclear
- decisionChecklist MUST include ALL items from requiredLens: ${preCtx.requiredLens.join(', ')}
- practicalAdvice MUST be actionable, concrete, and related to "${preCtx.mainObject || data.question}"
- thingsToAvoid MUST be specific to the actual risks of this decision — no generic spiritual filler
- riskNotes MUST flag financial/legal/practical risks relevant to "${preCtx.mainObject || data.question}"
- DO NOT give absolute financial or legal advice. Flag uncertainty where it exists.
- DO NOT write generic filler like "mạng xã hội", "kết nối vũ trụ", or unrelated spiritual advice.
`.trim()
    : '';

  // Reference section — only injected if the helper found matching rows
  const referenceSection = referenceContext
    ? `
${referenceContext}

REFERENCE USAGE RULES:
- The English references above are symbolic inspiration ONLY.
- Extract the CORE SYMBOLIC MEANING internally.
- Do NOT copy, translate word-for-word, or quote any English text to the user.
- Do NOT mention the dataset or where references came from.
- Your FINAL answer must be 100% in Vietnamese, grounded in the user's actual question.
`.trim()
    : '';

  return `
Bạn là một trợ lý AI Oracle cao cấp, sử dụng hệ thống Trí tuệ 5-Ưu-Tiên (5-Priority Intelligence) để giải luận Tarot.
Nhiệm vụ của bạn là sử dụng bộ bài Tarot như một khung tư duy biểu tượng để trả lời chính xác các vấn đề thực tế của người dùng.

THỨ TỰ ƯU TIÊN BẮT BUỘC:
1. Câu hỏi + bối cảnh của người dùng (quan trọng nhất)
2. Các lá bài được rút và vị trí trong trải bài
3. Trạng thái xuôi/ngược (upright/reversed) của từng lá
4. Tham chiếu biểu tượng tiếng Anh (Dendory/tarot dataset — chỉ nội bộ, không hiện ra)
5. Checklist thực tế, rủi ro, điều cần tránh

${LAYER_1_INSTRUCTIONS}

LAYER 2: TAROT SYMBOLIC READING
- Câu hỏi là TRUNG TÂM — mọi biểu tượng phải phục vụ câu hỏi.
- Vị trí xác định vai trò của lá bài trong trải bài.
- Nghĩa xuôi/ngược tạo nên sắc thái chính xác.
- LIÊN KẾT: Tạo ra một mạch truyện (narrative) kết nối các lá bài lại với nhau dựa trên câu hỏi.
- Với trải bài 1 lá: tập trung 100% vào lá đó và câu hỏi.
- Với trải bài 3 lá: xây dựng mạch Quá khứ → Hiện tại → Tương lai theo bối cảnh thực tế.

${LAYER_3_INSTRUCTIONS}

━━━ DỮ LIỆU ĐẦU VÀO ━━━
Câu hỏi: "${data.question}"
Chủ đề: ${data.topic || 'Không xác định'}
Trải bài: ${data.spreadType}
Thời điểm: ${data.timestamp}${preCtx.timeframe ? `\nKhung thời gian được đề cập: ${preCtx.timeframe}` : ''}
Ghi chú người dùng: ${data.userNotes || 'Không có'}
Giọng điệu: ${data.readingTone}

CÁC LÁ BÀI:
${cardsStr}

BỐI CẢNH CÂU HỎI (pre-classification — hãy tự kiểm tra và điều chỉnh nếu cần):
- questionType: ${preCtx.questionType}
- decisionType: ${preCtx.decisionType}
- mainObject: ${preCtx.mainObject || 'Chưa xác định'}
- riskLevel: ${preCtx.riskLevel}
- requiredLens: ${preCtx.requiredLens.length > 0 ? preCtx.requiredLens.join(', ') : 'Không có (general guidance)'}
━━━━━━━━━━━━━━━━━━━━━━━━
${loveSpecificLayer ? '\n' + loveSpecificLayer + '\n' : ''}${decisionSpecificLayer ? '\n' + decisionSpecificLayer + '\n' : ''}${referenceSection ? '\n' + referenceSection + '\n' : ''}
YÊU CẦU ĐẦU RA — Chỉ trả về JSON hợp lệ, không có markdown, không có text bên ngoài:
{
  "directAnswer": "Câu trả lời trực tiếp cho câu hỏi trong 1-3 câu, bằng tiếng Việt.",
  "decisionSignal": "proceed | wait | avoid | conditional | unclear",
  "confidenceLevel": "low | medium | high",
  "questionContext": {
    "questionType": "",
    "decisionType": "",
    "mainObject": "",
    "userIntent": "",
    "riskLevel": "",
    "answerMode": "decision_guidance | emotional_reading | risk_assessment | daily_guidance | reflection",
    "requiredLens": []
  },
  "quickSummary": "Tóm tắt cốt lõi trong 1 câu.",
  "symbolicReading": {
    "mainSymbol": "Lá bài chủ đạo",
    "mainPattern": "Thông điệp tổng quát của trải bài liên quan đến câu hỏi.",
    "changingFactor": "Yếu tố then chốt cần chú ý.",
    "futureTrend": "Xu hướng sắp tới theo biểu tượng."
  },
  "contextualInterpretation": "Luận giải chi tiết (3-5 đoạn) kết nối Tarot với bối cảnh thực tế của người dùng. Phải đề cập cụ thể đến đối tượng (xe, nhà, công việc, v.v.).",
  "decisionChecklist": [
    "Điểm thực tế 1 cần kiểm tra trước khi quyết định",
    "Điểm thực tế 2"
  ],
  "practicalAdvice": [
    "Hành động cụ thể 1 (liên quan đến câu hỏi)",
    "Hành động cụ thể 2"
  ],
  "thingsToAvoid": [
    "Điều cụ thể cần tránh 1 (liên quan đến quyết định)"
  ],
  "riskNotes": [
    "Rủi ro tài chính/pháp lý/thực tế 1"
  ],
  "symbolDetails": {
    "cardInterpretations": [
      {
        "position": "Vị trí",
        "cardName": "Tên lá bài",
        "orientation": "upright | reversed",
        "meaningInThisQuestion": "Ý nghĩa cụ thể của lá bài này trong bối cảnh câu hỏi.",
        "decisionImpact": "proceed | wait | avoid | conditional | unclear",
        "advice": "Lời khuyên riêng từ lá này cho người dùng."
      }
    ]
  },
  "referenceUsed": [],
  "finalMessage": "Thông điệp kết thúc theo giọng điệu ${data.readingTone} — ngắn gọn, ý nghĩa, bằng tiếng Việt."
}
`.trim();
}

export function buildDualReadingPrompt(_data: {
  question: string;
  readingTone: string;
  hexagram: any;
  tarotCards: any[];
  userNotes?: string;
}): string {
  return `
Bạn là một bậc thầy Oracle tích hợp, kết hợp Kinh Dịch và Tarot để đưa ra giải pháp toàn diện.
Hệ thống: KINH DỊCH cung cấp CẤU TRÚC (Sự việc) - TAROT cung cấp SẮC THÁI (Cảm xúc/Tâm linh).

${LAYER_1_INSTRUCTIONS}

LAYER 2: INTEGRATED SYMBOLIC READING
- Kinh Dịch: Xác định bối cảnh khách quan và xu hướng thực tế của sự việc.
- Tarot: Xác định trạng thái nội tâm, các yếu tố tinh thần và lời khuyên vi mô.
- HỢP NHẤT: Tạo ra một cái nhìn đa chiều về vấn đề của người dùng.

${LAYER_3_INSTRUCTIONS}

YÊU CẦU ĐẦU RA: Sử dụng định dạng JSON thống nhất tương tự các quẻ đơn, nhưng kết hợp cả hai hệ thống trong symbolicReading và contextualInterpretation.
`.trim();
}
