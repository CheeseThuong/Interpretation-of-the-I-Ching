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
  psychologicalState?: string;
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
  else if (/tuần này/.test(q))             timeframe = 'tuần này';
  else if (/tháng sau|tháng tới/.test(q)) timeframe = 'tháng sau';
  else if (/tháng này/.test(q))           timeframe = 'tháng này';
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
  // ── Real estate — no \b (breaks on Vietnamese diacritics) ──────────────────
  else if (/(nhà|căn hộ|đất|bất động sản|chung cư)/.test(q)) {
    questionType = 'housing_property';
    mainObject = 'nhà/đất';
    requiredLens.push('giá thị trường', 'pháp lý sổ đỏ', 'nguồn vốn', 'vị trí', 'thanh khoản');
    riskLevel = 'high';
    if (/\b(bán|sang nhượng)\b/.test(q)) decisionType = 'sell_or_keep';
    else decisionType = 'buy_or_wait';
  }
  // ── Finance / loan / investment ─────────────────────────────────────────────────────
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
        'khẩu vị rủi ro',
        'mục tiêu đầu tư (tăng trưởng / bảo toàn vốn)',
        'thời gian nắm giữ',
        'dòng tiền dự phòng trước khi đầu tư',
        'mức hiểu biết từng sản phẩm',
        'rủi ro mất vốn',
        'tính thanh khoản',
        'phân bổ danh mục (không all-in)',
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

  let psychologicalState: string | undefined;
  if (questionType === 'money_finance' && answerMode === 'risk_assessment')
    psychologicalState = 'Đang cân nhắc đầu tư — có thể vừa muốn tăng trưởng tài chính vừa sợ rủi ro mất vốn. Cần khung quyết định rõ ràng hơn là lời khẳng định có/không.';
  else if (questionType === 'love_relationship')
    psychologicalState = 'Đang tìm kiếm sự rõ ràng về cảm xúc hoặc tín hiệu từ phía người kia.';
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
    synthesisContext?: string;
    zodiacLens?: {
      sign: string;
      viName: string;
      element: string;
      modality: string;
      personalizationSummary: string;
      psychologicalTendency: string;
      decisionStyle: string;
      adviceStyle: string;
      riskNote: string;
    };
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

  // ── Spread-type-specific layers ───────────────────────────────────────────
  const spreadId = data.spreadType; // spreadType carries the spread name or id
  const isDailySpread = spreadId.includes('Hôm Nay') || spreadId === 'daily';
  const isFiveCardSpread = spreadId.includes('5 Lá') || spreadId === 'five-cards';

  const dailySpreadLayer = isDailySpread ? `
DAILY GUIDANCE RULES — Lá Bài Hôm Nay (strict field mapping):
answerMode MUST be: daily_guidance
This is NOT a decision oracle. Do not frame it as one. Do not produce financial, legal, or asset advice.

FIELD MAPPING FOR DAILY SPREAD:
- directAnswer     → "Thông điệp chính hôm nay": Một câu thông điệp rõ ràng về năng lượng của ngày dựa trên lá bài.
- quickSummary     → "Năng lượng / mood trong ngày": Mô tả bầu không khí năng lượng tổng quát. 1 câu ngắn.
- contextualInterpretation → Diễn giải lá bài liên quan đến ngày hôm nay hoặc ý niệm người dùng. Kông có quyết định lớn.
- decisionChecklist → ["Điều nên chú ý hôm nay"]: 3-5 điểm quan sát về cảm xúc, năng lượng, tương tác trong ngày.
- practicalAdvice  → ["Việc nên làm"]: 2-3 hành động tích cực, cụ thể cho ngày hôm nay. Thực tế, không trầm bổng.
- thingsToAvoid    → ["Điều nên tránh"]: 1-2 tâm thế, phản ứng hoặc năng lượng nên tránh trong ngày.
- riskNotes        → ["Lưu ý năng lượng"]: 1-2 điều cần chú ý về cảm xúc hoặc giao tiếp trong ngày. Không phải rủi ro tài chính.
- finalMessage     → "Câu chốt trong ngày": Một câu truyền cảm hứng, tóm gọn tinh thần của lá bài cho hôm nay.

FORBIDDEN for daily spread:
- Đừng nói về: pháp lý, giao dịch, tiền bạc, tài sản, hợp đồng, rủi ro tài chính.
- Đừng dùng giọng quyết định. Dùng giọng nhẹ nhàng, đồng hành.
- Đừng hỏa hẹn kết quả hay khẳng định tương lai.
`.trim() : '';

  const fiveCardLayer = isFiveCardSpread ? `
FIVE-CARD DEEP ANALYSIS RULES — Trải Bài 5 Lá (strict field mapping):
answerMode CAN be: decision_guidance | emotional_reading | reflection (match user's question)

POSITION ROLES (must follow exactly):
1. Tình huống hiện tại  → Diễn giải trạng thái / điều đang xảy ra liên quan câu hỏi.
2. Điều đang cản trở      → Yếu tố nào đang gây khó khăn, trì hoãn, hoặc mâu thuẫn liên quan câu hỏi.
3. Điều bị che khuất       → Thông tin ẩn, cảm xúc chưa rõ, hoặc góc nhìn bỏ sót liên quan câu hỏi.
4. Lời khuyên             → Hướng hành động rõ ràng dựa trên 3 lá trước.
5. Xu hướng kết quả       → Chiều hướng khả thi nếu tiếp tục theo hiện tại (không đảm bảo).

FIELD MAPPING FOR FIVE-CARD SPREAD:
- symbolDetails.cardInterpretations: MUST include ALL 5 cards. "meaningInThisQuestion" MUST reflect the position role + user's actual question. NEVER copy paste the generic card meaning.
- directAnswer: Tóm tắt thông điệp chính từ cả 5 lá dựa trên câu hỏi.
- contextualInterpretation: Mạch kể liên kết cả 5 lá — bắt đầu từ "Tình huống" → "Điều cản trở" → "Điều ẩn" → "Hướng giải" → "Kết quả". Liên quan chặt với câu hỏi.
- decisionChecklist: 4-6 điểm cụ thể người dùng cần kiểm tra hoặc thực hiện (dựa trên câu hỏi, không chung chung).
- practicalAdvice: 3-4 bước hành động cụ thể phù hợp với câu hỏi và nội dung đọc bài.
- thingsToAvoid: Dựa trên lá 2 ("Điều cản trở") và lá 3 ("Điều ẩn") — rủi ro cụ thể liên quan câu hỏi.
- riskNotes: Dựa trên lá 5 ("Xu hướng") — nếu tiếp tục hướng hiện tại, điều gì có thể xảy ra.
- finalMessage: Tổng kết 1 câu từ toàn bộ 5 lá — thực tế, có chiều sâu.

FORBIDDEN for five-card spread:
- Đừng sao chép nghĩa lá bài cơ bản ("The Moon đại diện cho..." chung chung).
- "meaningInThisQuestion" phải có từ đặc trưng của vị trí đó và câu hỏi của người dùng.
- Đừng cho advice giống nhầu giữa các lá.
`.trim() : '';

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
${data.zodiacLens ? `
CUNG HOÀNG ĐẠO — LĂNG KÍNH CÁ NHÂN HÓA (không phải định mệnh):
- Cung: ${data.zodiacLens.sign} (${data.zodiacLens.viName}) | Nguyên tố: ${data.zodiacLens.element} | Phương thức: ${data.zodiacLens.modality}
- Xu hướng tâm lý liên quan đến câu hỏi: ${data.zodiacLens.psychologicalTendency}
- Phong cách quyết định: ${data.zodiacLens.decisionStyle}
- Lưu ý rủi ro theo cung: ${data.zodiacLens.riskNote}
- Phong cách lời khuyên phù hợp: ${data.zodiacLens.adviceStyle}

QUY TẮC CUNG HOÀNG ĐẠO:
- Cung chỉ là LĂNG KÍNH cá nhân hóa, không phải định mệnh.
- KHÔNG nói "Đây là vì bạn là [cung]..." hay "[cung] luôn luôn..."
- NÊN nói "Với xu hướng của cung ${data.zodiacLens.viName}, bạn có thể dễ..."
- Mọi nhận xét cung PHẢI kết nối trực tiếp vào lá bài và câu hỏi.
- Zodiac cá nhân hóa lời khuyên, không thay thế luận giải Tarot.
` : ''}
${loveSpecificLayer ? '\n' + loveSpecificLayer + '\n' : ''}${decisionSpecificLayer ? '\n' + decisionSpecificLayer + '\n' : ''}${dailySpreadLayer ? '\n' + dailySpreadLayer + '\n' : ''}${fiveCardLayer ? '\n' + fiveCardLayer + '\n' : ''}${data.synthesisContext ? `
TỔNG HỢP CỤC BỘ (từ hệ thống — dùng làm cầu nối biểu tượng → diễn giải):
${data.synthesisContext}
QUY TẮC: Hãy dùng tổng hợp trên như nền tảng. Không được bỏ qua nó. Không lặp lại nghĩa lá bài mà không kết nối vào tổng hợp và câu hỏi của người dùng.
` : ''}${referenceSection ? '\n' + referenceSection + '\n' : ''}
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
  "contextualInterpretation": "${isDailySpread
    ? 'Diễn giải lá bài trong bối cảnh ngày hôm nay và ý niệm người dùng.'
    : isFiveCardSpread
    ? 'Mạch kể 5 lá: Tình huống → Cản trở → Ẩn → Giải pháp → Xu hướng. Liên quan chặt với câu hỏi.'
    : 'Luận giải chi tiết (3-5 đoạn) kết nối Tarot với bối cảnh thực tế của người dùng.'}",
  "decisionChecklist": [
    "${isDailySpread
      ? 'Điều nên chú ý hôm nay 1'
      : isFiveCardSpread
      ? 'Điểm cần kiểm tra/hành động cụ thể 1 (liên quan câu hỏi)'
      : 'Điểm thực tế 1 cần kiểm tra trước khi quyết định'}"
  ],
  "practicalAdvice": [
    "${isDailySpread ? 'Việc nên làm hôm nay 1' : 'Hành động cụ thể 1 (liên quan đến câu hỏi)'}"
  ],
  "thingsToAvoid": [
    "${isDailySpread ? 'Điều nên tránh trong ngày' : 'Điều cụ thể cần tránh 1 (liên quan đến quyết định)'}"
  ],
  "riskNotes": [
    "${isDailySpread ? 'Lưu ý về năng lượng/cảm xúc trong ngày' : 'Rủi ro tài chính/pháp lý/thực tế 1'}"
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
  ${data.zodiacLens ? `"zodiacContext": {
    "birthDate": "",
    "zodiacSign": "${data.zodiacLens.sign}",
    "viName": "${data.zodiacLens.viName}",
    "element": "${data.zodiacLens.element}",
    "modality": "${data.zodiacLens.modality}",
    "personalizationLens": "${data.zodiacLens.personalizationSummary}",
    "psychologicalTendency": "Mô tả xu hướng tâm lý của người dùng liên quan đến câu hỏi này dựa trên cung và lá bài.",
    "decisionStyle": "${data.zodiacLens.decisionStyle}",
    "adviceStyle": "${data.zodiacLens.adviceStyle}"
  },` : ''}
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
