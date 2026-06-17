import type { ContextBundle, ContextTarotCard } from './contextBundle';

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

export const KINHDICHAI_SIGNATURE_VOICE = 'Giọng văn tiếng Việt rõ ràng, có chiều sâu, hơi huyền bí nhưng không mơ hồ. Luôn đặt câu hỏi thật của người dùng làm trung tâm. Dùng lá bài/quẻ như hệ biểu tượng để phân tích tâm lý, bối cảnh, hướng hành động. Không phán tuyệt đối. Không dùng văn mẫu chung chung. Kết luận phải có lời khuyên thực tế, điều cần tránh, rủi ro cần lưu ý và một câu chốt thi vị nhưng liên quan trực tiếp đến câu hỏi.';

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

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
  const q = normalizeText(question);

  let questionType = 'unclear';
  let decisionType = 'unclear';
  let mainObject = topic || '';
  let riskLevel = 'medium';
  let answerMode = 'decision_guidance';
  const requiredLens: string[] = [];

  let timeframe: string | undefined;
  const monthMatch = q.match(/(?:trong|tu|khoang|khoang thoi gian tu)?\s*(\d+|mot|hai|ba|bon|nam|sau)\s*thang/);
  if (monthMatch) timeframe = `${monthMatch[1]} tháng tới`;
  else if (/tuan sau|tuan toi/.test(q)) timeframe = 'tuần sau';
  else if (/tuan nay/.test(q)) timeframe = 'tuần này';
  else if (/thang sau|thang toi/.test(q)) timeframe = 'tháng sau';
  else if (/thang nay/.test(q)) timeframe = 'tháng này';
  else if (/hom nay/.test(q)) timeframe = 'hôm nay';
  else if (/ngay mai/.test(q)) timeframe = 'ngày mai';
  else if (/sap toi|trong thoi gian toi|tuong lai gan/.test(q)) timeframe = 'sắp tới';

  if (/\b(xe|xe hoi|o to|moto|xe may|phuong tien)\b/.test(q)) {
    questionType = 'vehicle_property_asset';
    mainObject = 'xe';
    requiredLens.push('giá thị trường', 'chi phí sửa chữa', 'bảo hiểm', 'nhu cầu đi lại', 'phương án thay thế', 'mức cần tiền mặt', 'giấy tờ xe');
    riskLevel = 'medium';
    if (/\b(ban|sang nhuong|thanh ly)\b/.test(q)) decisionType = 'sell_or_keep';
    else if (/\b(mua|sam)\b/.test(q)) decisionType = 'buy_or_wait';
    else decisionType = 'general_guidance';
  } else if (/(nha|can ho|dat|bat dong san|chung cu)/.test(q)) {
    questionType = 'housing_property';
    mainObject = 'nhà/đất';
    requiredLens.push('giá thị trường', 'pháp lý sổ đỏ', 'nguồn vốn', 'vị trí', 'thanh khoản', 'giấy tờ', 'khả năng chi trả', 'chi phí dài hạn');
    riskLevel = 'high';
    if (/\b(ban|sang nhuong)\b/.test(q)) decisionType = 'sell_or_keep';
    else decisionType = 'buy_or_wait';
  } else if (/(tien|vay|no|dau tu|co phieu|chung khoan|tai chinh|lai suat|trai phieu|quy|fund|von|danh muc|sinh loi)/.test(q)) {
    questionType = 'money_finance';
    mainObject = 'tài chính / dòng tiền';
    riskLevel = 'high';
    answerMode = 'risk_assessment';
    const isInvestment = /(trai phieu|co phieu|chung khoan|quy|dau tu|fund|danh muc)/.test(q);
    const isLoan = /\b(vay|no)\b/.test(q);
    if (isInvestment) {
      decisionType = 'invest_or_wait';
      requiredLens.push('mục tiêu đầu tư', 'khẩu vị rủi ro', 'thời gian nắm giữ', 'quỹ dự phòng', 'tính thanh khoản', 'rủi ro mất vốn', 'phân bổ danh mục', 'không đầu tư vì FOMO');
    } else if (isLoan) {
      decisionType = 'invest_or_wait';
      requiredLens.push('rủi ro tài chính', 'khả năng hoàn vốn', 'lãi suất', 'thanh khoản');
    } else {
      decisionType = 'general_guidance';
      requiredLens.push('rủi ro tài chính', 'khả năng hoàn vốn', 'thanh khoản');
    }
  } else if (/\b(cong viec|nghe|viec lam|nghi viec|xin viec|thang chuc|kinh doanh)\b/.test(q)) {
    questionType = 'career_work';
    mainObject = q.includes('kinh doanh') ? 'kinh doanh / dự án' : 'công việc / sự nghiệp';
    riskLevel = 'medium';
    requiredLens.push('thu nhập', 'cơ hội phát triển', 'môi trường làm việc');
    decisionType = /\b(nghi|bo)\b/.test(q) ? 'quit_or_stay' : 'general_guidance';
  } else if (/(tinh duyen|tinh cam|tinh yeu|nguoi yeu|hon nhan|ban trai|ban gai|chia tay|ket hon|\bye u\b|crush|nyc|nguoi cu|moi quan he|ho co thich|nguoi do|nguoi ay|quay lai|hen ho|\bduyen\b|doc than|co thich toi|con tinh cam|thich toi khong|yeu toi khong|nho toi|nhan tin|goi lai|chu dong|mo loi|lien lac)/.test(q)) {
    questionType = 'love_relationship';
    answerMode = timeframe ? 'weekly_relationship_forecast' : 'emotional_reading';
    riskLevel = 'low';
    mainObject = 'tình duyên / chuyện tình cảm';
    requiredLens.push('cảm xúc thật', 'chất lượng giao tiếp', 'cơ hội gặp gỡ/liên lạc', 'ranh giới', 'tránh suy diễn', 'nhịp tiến triển');
    if (/\b(chia tay|tiep tuc|quay lai)\b/.test(q)) decisionType = 'continue_or_stop';
    else if (/(nhan tin|goi lai|chu dong|mo loi|lien lac)/.test(q)) decisionType = 'confess_or_wait';
    else if (/\b(co thich|co yeu|con tinh cam|thich toi|yeu toi|nho toi)\b/.test(q)) decisionType = 'unclear';
    else decisionType = 'general_guidance';
  } else if (/\b(co nen|nen khong|hay khong|duoc khong)\b/.test(q)) {
    questionType = 'yes_no_decision';
    decisionType = 'general_guidance';
    requiredLens.push('lợi ích nếu làm', 'rủi ro nếu làm', 'thời điểm', 'dữ kiện còn thiếu');
  }

  let psychologicalState: string | undefined;
  if (questionType === 'money_finance' && answerMode === 'risk_assessment') {
    psychologicalState = 'Muốn có định hướng trước quyết định tài chính có rủi ro.';
  } else if (questionType === 'love_relationship') {
    psychologicalState = timeframe
      ? 'Muốn biết nhịp cảm xúc và cơ hội kết nối trong thời gian tới.'
      : 'Đang tìm kiếm sự rõ ràng về cảm xúc, tín hiệu hoặc khả năng chủ động liên lạc.';
  } else if (questionType === 'career_work') {
    psychologicalState = 'Đang ở điểm chuyển đổi nghề nghiệp, cần phân biệt động lực thật với phản ứng nhất thời.';
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
    psychologicalState,
  };
}

const BASE_PROMPT_RULES = `
Bạn phải tạo luận giải theo đúng thứ tự ưu tiên:
1. Câu hỏi gốc và ý định thật của người dùng.
2. Question context đã phân loại.
3. Kết quả Tarot/Kinh Dịch hiện tại.
4. Synthesis nội bộ của hệ thống.
5. Trí nhớ người dùng nếu có.
6. Zodiac lens nếu có.
7. Dữ liệu tham khảo nếu có.

Luật bắt buộc:
- Không chép nghĩa lá/quẻ một cách giáo khoa. Mỗi đoạn phải trả lời: "Điều này nói gì về đúng câu hỏi của người dùng?"
- Không dùng các câu chung như "cần quan sát thêm", "có tiềm năng", "hãy cân bằng nội tâm" nếu không kèm hành động cụ thể.
- Với câu hỏi yes/no hoặc hành động, directAnswer phải có khuyến nghị rõ: nên, chưa nên, không nên, hoặc chỉ nên nếu điều kiện nào đúng.
- Với câu hỏi tình cảm/liên lạc, phải nói rõ mức nên chủ động, cách nhắn/gọi, thời điểm, dấu hiệu nên dừng, dấu hiệu có thể tiếp tục.
- Không khẳng định tuyệt đối cảm xúc của người khác; phải phân biệt "lá bài gợi ý" với dữ kiện đời thực.
- JSON trả về phải hợp lệ, không markdown, không văn bản ngoài JSON.
Giọng điệu: ${KINHDICHAI_SIGNATURE_VOICE}
`;

function formatPromptValue(value: unknown, fallback = 'Không có'): string {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getCardName(card: ContextTarotCard): string {
  return card.nameVi || card.card?.nameVi || card.name || card.card?.name || 'Không rõ';
}

function getCardEnglishName(card: ContextTarotCard): string {
  return card.name || card.card?.name || card.nameVi || card.card?.nameVi || 'Unknown';
}

function getCardPosition(card: ContextTarotCard, index: number): string {
  return card.position || card.positionName || `Vị trí ${index + 1}`;
}

function getCardKeywords(card: ContextTarotCard): string[] {
  return card.isReversed
    ? (card.keywordsReversed || card.card?.keywordsReversed || [])
    : (card.keywordsUpright || card.card?.keywordsUpright || []);
}

function getCardMeaning(card: ContextTarotCard): string {
  return card.isReversed
    ? (card.meaningReversed || card.card?.meaningReversed || '')
    : (card.meaningUpright || card.card?.meaningUpright || '');
}

function buildUnifiedResponseContract(context: ContextBundle, options: {
  zodiacUsed?: boolean;
  referenceUsed?: boolean;
  positionAnalyses: string;
  symbolicReading: string;
}): string {
  return `
Trả về đúng JSON object theo schema sau. Giữ đủ field, không bỏ field legacy vì UI đang đọc các field này:
{
  "questionEcho": ${JSON.stringify(context.currentQuestion)},
  "directAnswer": "2-5 câu trả lời trực tiếp vào câu hỏi, có khuyến nghị hành động rõ và lý do chính",
  "decisionSignal": "proceed | wait | avoid | conditional | unclear | reflection",
  "confidenceLevel": "low | medium | high",
  "questionContext": ${JSON.stringify(context.questionContext, null, 2)},
  "personalizationUsed": {
    "memoryUsed": ${!!context.userMemorySummary},
    "zodiacUsed": ${!!options.zodiacUsed},
    "referenceUsed": ${!!options.referenceUsed},
    "synthesisUsed": ${!!context.synthesis}
  },
  "quickSummary": "Một câu cụ thể, có nhắc đúng trọng tâm câu hỏi và dấu hiệu chính",
  "synthesis": "Tổng hợp toàn cảnh: các biểu tượng đang tương tác thế nào và dẫn đến kết luận nào cho câu hỏi",
  "synthesisSummary": "Bản legacy của synthesis, vẫn phải cụ thể và không lặp văn mẫu",
  "reasonedInterpretation": "Lý do decisionSignal được chọn: dữ liệu nào ủng hộ, dữ liệu nào làm giảm chắc chắn",
  "positionAnalyses": ${options.positionAnalyses},
  "symbolicReading": ${options.symbolicReading},
  "psychologicalInterpretation": "Tâm lý/ngưỡng phản ứng thực tế của người hỏi trong bối cảnh câu hỏi",
  "contextualInterpretation": "Luận giải bối cảnh đời thực, nêu rõ điều kiện khiến kết quả đổi hướng",
  "actionableAdvice": ["Hành động cụ thể 1", "Hành động cụ thể 2", "Hành động cụ thể 3"],
  "decisionChecklist": ["Dữ kiện cần kiểm tra 1", "Dữ kiện cần kiểm tra 2", "Dữ kiện cần kiểm tra 3"],
  "practicalAdvice": ["Legacy: lời khuyên thực tế 1", "Legacy: lời khuyên thực tế 2"],
  "thingsToAvoid": ["Điều cần tránh 1", "Điều cần tránh 2"],
  "riskNotes": ["Rủi ro hoặc giới hạn diễn giải 1"],
  "finalMessage": "Một câu chốt ngắn, có hình ảnh nhưng vẫn bám câu hỏi",
  "qualitySelfCheck": {
    "directlyAnswersQuestion": true,
    "isContextual": true,
    "isTooGeneric": false,
    "isTooLong": false,
    "missingImportantInfo": [],
    "offTopicWarnings": [],
    "needsSecondPass": false
  }
}`;
}

export function buildKinhDichReadingPrompt(context: ContextBundle): string {
  const qCtx = context.questionContext;
  const hexagram = context.readingData.hexagram;
  const contract = buildUnifiedResponseContract(context, {
    positionAnalyses: '[]',
    symbolicReading: `{
    "primaryHexagram": "Quẻ chủ nói gì về trạng thái hiện tại của đúng câu hỏi",
    "movingLines": "Hào động tạo chuyển biến cụ thể nào",
    "changedHexagram": "Quẻ biến cho thấy hướng phát triển nào",
    "transformationSummary": "Quẻ chủ -> hào động -> quẻ biến: kết luận thực tế cho câu hỏi"
  }`,
  });

  return `
Bạn là chuyên gia Kinh Dịch ứng dụng và biên tập viên phân tích quyết định.
${BASE_PROMPT_RULES}

DỮ LIỆU ĐẦU VÀO:
- Câu hỏi gốc: "${context.currentQuestion}"
- Bối cảnh câu hỏi: ${JSON.stringify(qCtx, null, 2)}
- Quẻ chủ: ${hexagram?.primary || 'Không có'}
- Hào động: ${formatPromptValue(hexagram?.movingLines)}
- Quẻ biến: ${hexagram?.changed || 'Không có'}
- Sáu hào/dữ liệu gieo: ${formatPromptValue(hexagram?.sixLines)}
- Synthesis nội bộ: ${formatPromptValue(context.synthesis)}
- Trí nhớ người dùng: ${context.userMemorySummary || 'Không có'}

CÁCH LUẬN:
- Đọc quẻ chủ như nền hiện tại, hào động như điểm đang biến, quẻ biến như xu hướng nếu người dùng giữ cùng cách hành xử.
- Không viết kiểu "Quẻ X có nghĩa là...". Hãy viết: "Trong câu hỏi này, quẻ X cho thấy..."
- Nếu câu hỏi là lựa chọn/hành động, phải có đáp án có điều kiện và mốc kiểm tra thực tế.
- Nếu dữ liệu thiếu, vẫn trả lời nhưng nêu thiếu gì và ảnh hưởng thế nào đến độ tin cậy.
- Checklist không được bắt đầu bằng "Kiểm tra:" lặp lại máy móc; mỗi item phải là một dữ kiện/hành động rõ.

${contract}
`.trim();
}

export function buildTarotReadingPrompt(context: ContextBundle): string {
  const qCtx = context.questionContext;
  const cards = context.readingData.cards || [];
  const cardsStr = cards
    .map((card, index) => {
      const keywords = getCardKeywords(card);
      const meaning = getCardMeaning(card);
      return `#${index + 1}
Vị trí: ${getCardPosition(card, index)}
Lá bài: ${getCardName(card)} (${getCardEnglishName(card)})
Trạng thái: ${card.isReversed ? 'Ngược / Reversed' : 'Xuôi / Upright'}
Từ khóa theo trạng thái: ${keywords.join(', ') || 'Không có'}
Nghĩa dữ liệu nội bộ theo trạng thái: ${meaning || 'Không có'}`;
    })
    .join('\n\n');
  const contract = buildUnifiedResponseContract(context, {
    zodiacUsed: !!context.zodiacContext,
    referenceUsed: !!context.tarotReferenceContext || !!context.zodiacReferenceContext,
    positionAnalyses: `[
    {
      "positionLabel": "Tên vị trí đúng theo spread",
      "positionFunction": "Vai trò vị trí trong câu hỏi",
      "cardName": "Tên lá bài",
      "orientation": "upright | reversed",
      "meaningInThisPosition": "Ý nghĩa lá + vị trí + xuôi/ngược",
      "meaningForUserQuestion": "Điều lá này nói trực tiếp về câu hỏi của người dùng, không giải nghĩa chung",
      "psychologicalInsight": "Tâm lý/hành vi thực tế được lá bài phản ánh",
      "practicalSignal": "Tín hiệu hành động: proceed/wait/avoid/conditional và vì sao"
    }
  ]`,
    symbolicReading: `{
    "mainPattern": "Mẫu năng lượng chính của cả trải bài",
    "changingFactor": "Lá/vị trí làm thay đổi kết luận",
    "futureTrend": "Xu hướng nếu người dùng hành động theo lời khuyên"
  }`,
  });

  return `
Bạn là Tarot reader phân tích quyết định, không phải trình tạo nghĩa lá bài chung chung.
${BASE_PROMPT_RULES}

DỮ LIỆU ĐẦU VÀO:
- Câu hỏi gốc: "${context.currentQuestion}"
- Bối cảnh câu hỏi: ${JSON.stringify(qCtx, null, 2)}
- Loại trải bài: ${context.readingData.spreadType || 'Không xác định'}
- Các lá bài:
${cardsStr || 'Không có lá bài'}
- Synthesis nội bộ: ${formatPromptValue(context.synthesis)}
- Trí nhớ người dùng: ${context.userMemorySummary || 'Không có'}
- Zodiac lens: ${formatPromptValue(context.zodiacContext)}
- Tarot reference context: ${context.tarotReferenceContext || 'Không có'}
- Zodiac reference context: ${context.zodiacReferenceContext || 'Không có'}

CÁCH LUẬN BẮT BUỘC:
- Đọc từng lá theo công thức: vị trí trong spread + tên lá + xuôi/ngược + từ khóa nội bộ + câu hỏi gốc.
- Phần synthesis phải nối các lá thành một dòng lập luận, không lấy lá đầu làm toàn bộ kết luận.
- Nếu các lá mâu thuẫn, hãy nói rõ mâu thuẫn đó tạo ra điều kiện hành động nào.
- Nếu câu hỏi là "nên nhắn tin/liên lạc/chủ động không", directAnswer phải nhắc rõ "nhắn tin", "liên lạc" hoặc "chủ động"; phải đưa khuyến nghị yes/no/conditional và lý do.
- Với câu hỏi "người đó có nhớ/còn tình cảm không", không khẳng định đọc được tâm trí. Hãy nói dấu hiệu lá bài gợi ý khả năng nhớ, mức chủ động, và dữ kiện đời thực cần xác nhận.
- actionableAdvice phải có hành động cụ thể. Ví dụ với nhắn tin: khi nào nhắn, nhắn nội dung ngắn theo hướng nào, sau bao lâu thì dừng chờ phản hồi.
- Không dùng các cụm: "phản ánh năng lượng tình cảm", "tâm lý hiện tại cần sự cân bằng", "nên xem xét kỹ các yếu tố thực tế", "dẫn trải bài".
- Checklist phải là việc cụ thể, không dùng mẫu "Kiểm tra: ...".

TEST CHẤT LƯỢNG NỘI BỘ:
Nếu câu hỏi là "nên nhắn tin lại cho người đó không? người đó đang có nhớ tôi không?" và các lá là Nine of Cups / Page of Pentacles / Wheel of Fortune, câu trả lời đạt chuẩn phải nói rõ:
- Nên/chưa nên nhắn tin hoặc chỉ nên nhắn có điều kiện.
- Vì sao Nine of Cups, Page of Pentacles, Wheel of Fortune tạo ra kết luận đó.
- Có thể hiểu khả năng họ nhớ bạn ở mức nào, kèm giới hạn không khẳng định tuyệt đối.

${contract}
`.trim();
}

export function buildAIQualityReviewPrompt(context: ContextBundle, draftAnswer: unknown): string {
  return `
Review the following draft interpretation for a ${context.readingData.type} reading.
Question: "${context.currentQuestion}"
Draft Answer:
${JSON.stringify(draftAnswer, null, 2)}

Does this answer directly address the user's specific question? Is it too generic? Is it too long?
Perform a quality check and decide if it needs a second pass.
`.trim();
}

export function buildAIFinalizerPrompt(context: ContextBundle, draftAnswer: unknown, review?: unknown): string {
  const isTarot = context.readingData.type === 'tarot';
  const sourceSummary = isTarot
    ? (context.readingData.cards || []).map((card, index) => `${getCardPosition(card, index)}: ${getCardName(card)} ${card.isReversed ? 'ngược' : 'xuôi'}`).join('; ')
    : `Quẻ chủ: ${context.readingData.hexagram?.primary || 'Không có'}; Hào động: ${formatPromptValue(context.readingData.hexagram?.movingLines)}; Quẻ biến: ${context.readingData.hexagram?.changed || 'Không có'}`;

  return `
Bạn là biên tập viên cuối của hệ thống AI Oracle. Hãy sửa bản nháp thành JSON cuối cùng sắc hơn, thực tế hơn, bám câu hỏi hơn.

Câu hỏi gốc: "${context.currentQuestion}"
Bối cảnh đã phân loại: ${JSON.stringify(context.questionContext, null, 2)}
Dữ liệu gieo/rút: ${sourceSummary}
Synthesis nội bộ: ${formatPromptValue(context.synthesis)}
Review trước đó: ${review ? JSON.stringify(review, null, 2) : 'Không có'}

Luật biên tập:
- Giữ nguyên cấu trúc JSON và tên field; chỉ sửa nội dung field.
- Bổ sung questionEcho nếu thiếu.
- directAnswer phải trả lời thẳng câu hỏi trong 2-5 câu. Nếu là hành động, mở đầu bằng "Nên...", "Chưa nên...", "Không nên..." hoặc "Chỉ nên nếu...".
- synthesis và synthesisSummary phải nối toàn bộ lá/quẻ thành một lập luận cụ thể, không được là câu tổng quan rỗng.
- actionableAdvice/practicalAdvice phải có hành động làm được ngay, không dùng câu "hãy quan sát thêm" nếu không nói quan sát cái gì và trong bao lâu.
- positionAnalyses phải nhắc đủ từng lá/vị trí nếu là Tarot; symbolicReading phải nhắc đủ quẻ chủ, hào động, quẻ biến nếu là Kinh Dịch.
- Xóa các cụm chung chung: "năng lượng đang cần sự quan sát", "tâm lý cần cân bằng", "xem xét kỹ yếu tố thực tế", "có tiềm năng phát triển tích cực", "dẫn trải bài".
- qualitySelfCheck.directlyAnswersQuestion phải là true chỉ khi directAnswer thật sự trả lời câu hỏi; nếu không, hãy tự sửa nội dung trước khi trả về.
- Trả về JSON hợp lệ, tiếng Việt, không markdown, không giải thích ngoài JSON.

Draft cần cải thiện:
${JSON.stringify(draftAnswer, null, 2)}
`.trim();
}
