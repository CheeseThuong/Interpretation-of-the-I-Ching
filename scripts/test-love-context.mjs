/**
 * scripts/test-love-context.mjs
 * Local quality test — no API call needed.
 * Tests classifyQuestionContext + mockAITarotReading fallback
 * for "tình duyên tuần sau như thế nào".
 *
 * Run: node scripts/test-love-context.mjs
 */

// ─── Mirror classifyQuestionContext exactly from src/lib/ai/prompts.ts ────────
function classifyQuestionContext(question, topic) {
  const q = question.toLowerCase();

  let questionType = 'unclear';
  let decisionType = 'unclear';
  let mainObject = topic || '';
  let riskLevel = 'medium';
  let answerMode = 'decision_guidance';
  const requiredLens = [];

  // Timeframe
  let timeframe;
  if (/tuần sau|tuần tới/.test(q))        timeframe = 'tuần sau';
  else if (/tuần này/.test(q))             timeframe = 'tuần này';
  else if (/tháng sau|tháng tới/.test(q)) timeframe = 'tháng sau';
  else if (/tháng này/.test(q))           timeframe = 'tháng này';
  else if (/hôm nay/.test(q))             timeframe = 'hôm nay';
  else if (/ngày mai/.test(q))            timeframe = 'ngày mai';
  else if (/sắp tới|trong thời gian tới|tương lai gần/.test(q)) timeframe = 'sắp tới';

  // Vehicle
  if (/\b(xe|xe hơi|ô tô|moto|xe máy|phương tiện)\b/.test(q)) {
    questionType = 'vehicle_property_asset';
    mainObject = 'xe';
    requiredLens.push('giá thị trường', 'chi phí sửa chữa', 'bảo hiểm', 'nhu cầu đi lại', 'áp lực tiền mặt', 'giấy tờ pháp lý');
    riskLevel = 'medium';
    if (/\b(bán|sang nhượng|thanh lý)\b/.test(q)) decisionType = 'sell_or_keep';
    else if (/\b(mua|sắm)\b/.test(q)) decisionType = 'buy_or_wait';
  }
  // Real estate — plain match (\b breaks on Vietnamese diacritics)
  else if (/(nhà|căn hộ|đất|bất động sản|chung cư)/.test(q)) {
    questionType = 'housing_property';
    mainObject = 'nhà/đất';
    requiredLens.push('giá thị trường', 'pháp lý sổ đỏ', 'nguồn vốn', 'vị trí', 'thanh khoản');
    riskLevel = 'high';
    if (/\b(bán|sang nhượng)\b/.test(q)) decisionType = 'sell_or_keep';
    else decisionType = 'buy_or_wait';
  }
  // Finance
  else if (/\b(tiền|vay|đầu tư|cổ phiếu|chứng khoán|tài chính|lãi suất)\b/.test(q)) {
    questionType = 'money_finance';
    riskLevel = 'high';
    requiredLens.push('rủi ro tài chính', 'khả năng hoàn vốn', 'lãi suất', 'thanh khoản');
    decisionType = /\b(vay|nợ)\b/.test(q) ? 'invest_or_wait' : 'general_guidance';
  }
  // Career
  else if (/\b(công việc|nghề|việc làm|nghỉ việc|xin việc|thăng chức|kinh doanh)\b/.test(q)) {
    questionType = 'career_work';
    riskLevel = 'medium';
    requiredLens.push('thu nhập', 'cơ hội phát triển', 'môi trường làm việc');
    decisionType = /\b(nghỉ|bỏ)\b/.test(q) ? 'quit_or_stay' : 'general_guidance';
  }
  // Love — expanded set
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

  return { questionType, decisionType, mainObject, userIntent: question, riskLevel, answerMode, requiredLens, timeframe };
}

// ─── Mirror mockAITarotReading fallback ──────────────────────────────────────
function buildMockTarotResponse(question, drawnCards, tone) {
  const ctx = classifyQuestionContext(question);
  const isLove = ctx.questionType === 'love_relationship';
  const isAsset = ['vehicle_property_asset', 'housing_property', 'money_finance'].includes(ctx.questionType);
  const firstCard = drawnCards[0]?.card?.nameVi || 'Tarot';

  return {
    directAnswer: isLove
      ? `Dựa trên lá bài ${firstCard} cho câu hỏi "${question}", năng lượng tình cảm${ctx.timeframe ? ` trong ${ctx.timeframe}` : ' sắp tới'} đang cần sự quan sát và lắng nghe tín hiệu thực tế hơn là kết luận vội vàng.`
      : isAsset
      ? `Dựa trên lá bài ${firstCard}, thông điệp chính là cần cân nhắc kỹ lưỡng và kiểm tra các yếu tố thực tế trước khi quyết định.`
      : `Dựa trên lá bài ${firstCard} cho câu hỏi "${question}", hãy quan sát tình huống thêm.`,
    decisionSignal: isLove ? 'wait' : 'conditional',
    confidenceLevel: 'medium',
    questionContext: {
      questionType: ctx.questionType,
      decisionType: ctx.decisionType,
      mainObject: ctx.mainObject || 'vấn đề được hỏi',
      userIntent: question,
      riskLevel: ctx.riskLevel,
      answerMode: ctx.answerMode,
      requiredLens: ctx.requiredLens,
    },
    quickSummary: isLove
      ? `[${tone}] Hãy quan sát tín hiệu thực tế, đừng suy diễn quá mức.`
      : `[${tone}] Cần kiểm tra thực tế kỹ lưỡng trước khi quyết định.`,
    symbolicReading: {
      mainSymbol: firstCard,
      mainPattern: isLove
        ? `Lá ${firstCard} phản ánh bầu không khí cảm xúc trong mối quan hệ — hãy chú ý đến các tín hiệu giao tiếp tinh tế.`
        : `Lá ${firstCard} chỉ ra tình huống cần thêm thời gian để rõ ràng hơn.`,
      changingFactor: isLove
        ? 'Sự thay đổi sẽ đến từ hành động giao tiếp cởi mở và chân thành.'
        : 'Yếu tố thay đổi nằm ở việc thu thập đủ thông tin.',
      futureTrend: isLove
        ? `${ctx.timeframe ? `Trong ${ctx.timeframe}, ` : ''}xu hướng cho thấy sự kết nối sẽ rõ ràng hơn nếu bạn kiên nhẫn.`
        : 'Kết quả tích cực sẽ đến nếu bạn không bỏ qua các chi tiết quan trọng.',
    },
    contextualInterpretation: isLove
      ? `Lá bài ${firstCard} trong câu hỏi về tình duyên${ctx.timeframe ? ` ${ctx.timeframe}` : ''} cho thấy bầu không khí cảm xúc đang cần sự quan sát hơn là hành động vội vàng. Hãy chú ý đến tín hiệu giao tiếp, cách người kia phản ứng trong thực tế, và tránh suy diễn dựa trên lo lắng. Ranh giới cảm xúc lành mạnh sẽ giúp bạn nhìn rõ hơn.`
      : `Lá bài ${firstCard} trong câu hỏi về ${ctx.mainObject || 'vấn đề này'} khuyên bạn nên xem xét kỹ các yếu tố thực tế.`,
    decisionChecklist: isLove
      ? [
          'Quan sát tín hiệu giao tiếp thực tế (không suy diễn)',
          'Ghi nhận cảm xúc của bản thân — bạn thực sự muốn gì?',
          'Có cơ hội gặp gỡ hoặc kết nối nào sắp tới không?',
          'Hành động của mình đang xuất phát từ tình cảm hay nỗi sợ?',
          'Ranh giới cảm xúc của bạn có đang được tôn trọng không?',
          ctx.timeframe ? `Kế hoạch cụ thể cho ${ctx.timeframe}?` : 'Nhịp tiến triển phù hợp với cả hai phía?',
        ]
      : ctx.requiredLens.map(l => `Kiểm tra: ${l}`),
    practicalAdvice: isLove
      ? ['Dành thời gian quan sát hành động thực tế, không chỉ lời nói.', 'Nếu muốn kết nối, hãy chủ động tạo cơ hội gặp gỡ tự nhiên.']
      : ['Kiểm tra lại thông tin liên quan.', 'Không nên vội vàng.'],
    thingsToAvoid: isLove
      ? ['Tránh suy diễn quá mức từ các dấu hiệu nhỏ.', 'Không nên hành động chỉ vì nỗi sợ mất cơ hội.']
      : ['Tránh ra quyết định khi đang dưới áp lực.'],
    riskNotes: isLove
      ? ['Rủi ro từ kỳ vọng không phù hợp với thực tế.', 'Nguy cơ hiểu nhầm tín hiệu — xác nhận bằng giao tiếp thực tế.']
      : ['Rủi ro từ việc hành động thiếu thông tin.'],
    symbolDetails: { cardInterpretations: [] },
    finalMessage: isLove
      ? 'Tình cảm thực sự không cần được ép buộc — hãy để nó phát triển theo nhịp tự nhiên.'
      : 'Sự thật luôn mang lại tự do — hãy nhìn thẳng vào dữ kiện thực tế.',
  };
}

// ─── Test inputs ─────────────────────────────────────────────────────────────
const QUESTION = 'tình duyên tuần sau như thế nào';
const MOCK_CARDS = [
  { card: { nameVi: 'Mặt Trăng', keywordsUpright: ['Trực giác', 'Ảo ảnh'] }, positionName: 'Thông điệp chính', isReversed: false }
];
const TONE = 'Mystical and poetic';

// ─── Run classifier ───────────────────────────────────────────────────────────
const ctx = classifyQuestionContext(QUESTION);
const result = buildMockTarotResponse(QUESTION, MOCK_CARDS, TONE);
const allText = JSON.stringify(result).toLowerCase();

// ─── Forbidden financial/material terms ───────────────────────────────────────
const FORBIDDEN_TERMS = [
  'pháp lý', 'thanh khoản', 'giao dịch', 'giá trị thực tế', 'tài sản',
  'hợp đồng', 'chi phí', 'lãi suất', 'vay', 'đầu tư', 'cổ phiếu',
  'tài chính', 'giá thị trường', 'sổ đỏ', 'bất động sản'
];

// ─── Required love concepts ───────────────────────────────────────────────────
const REQUIRED_LOVE_CONCEPTS = [
  'cảm xúc', 'giao tiếp', 'kết nối', 'ranh giới', 'quan sát'
];

// ─── Validators ───────────────────────────────────────────────────────────────
const passes = [];
const fails = [];

function pass(msg) { passes.push(`✅ ${msg}`); }
function fail(msg) { fails.push(`❌ ${msg}`); }

// 1. Vietnamese present
/[àáâãèéêìíòóôõùúýăđơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỷỹ]/i.test(allText)
  ? pass('Vietnamese characters present')
  : fail('No Vietnamese characters detected in response');

// 2. questionType = love_relationship
ctx.questionType === 'love_relationship'
  ? pass(`questionType = love_relationship`)
  : fail(`questionType = "${ctx.questionType}" (expected love_relationship)`);

// 3. timeframe detected
ctx.timeframe === 'tuần sau'
  ? pass(`timeframe = "tuần sau"`)
  : fail(`timeframe = "${ctx.timeframe}" (expected tuần sau)`);

// 4. answerMode = emotional_reading
ctx.answerMode === 'emotional_reading'
  ? pass('answerMode = emotional_reading')
  : fail(`answerMode = "${ctx.answerMode}" (expected emotional_reading)`);

// 5. decisionSignal = wait (love questions should advise patience)
result.decisionSignal === 'wait'
  ? pass(`decisionSignal = wait`)
  : fail(`decisionSignal = "${result.decisionSignal}" (expected wait for love/timing)`);

// 6. No forbidden financial terms
const foundForbidden = FORBIDDEN_TERMS.filter(t => allText.includes(t));
foundForbidden.length === 0
  ? pass('No forbidden financial/legal/material terms in response')
  : fail(`Found forbidden terms: ${foundForbidden.join(', ')}`);

// 7. Required love concepts present in interpretation
const interp = result.contextualInterpretation.toLowerCase();
const missingConcepts = REQUIRED_LOVE_CONCEPTS.filter(c => !allText.includes(c));
missingConcepts.length === 0
  ? pass(`All love concepts present: ${REQUIRED_LOVE_CONCEPTS.join(', ')}`)
  : fail(`Missing love concepts: ${missingConcepts.join(', ')}`);

// 8. Checklist is relationship-focused, not financial
const checklist = result.decisionChecklist.join(' ').toLowerCase();
const hasFinancialChecklist = FORBIDDEN_TERMS.some(t => checklist.includes(t));
const hasLoveChecklist = checklist.includes('cảm xúc') || checklist.includes('giao tiếp') || checklist.includes('kết nối') || checklist.includes('tín hiệu');
(!hasFinancialChecklist && hasLoveChecklist)
  ? pass('Checklist is relationship-focused (not financial)')
  : fail(`Checklist problem — hasFinancialChecklist:${hasFinancialChecklist}, hasLoveChecklist:${hasLoveChecklist}`);

// 9. "tuần sau" mentioned in context
const hasTuanSau = allText.includes('tuần sau');
hasTuanSau
  ? pass('"tuần sau" referenced in response')
  : fail('"tuần sau" not mentioned in response despite being the timeframe');

// 10. finalMessage is love-appropriate (not financial)
const finalLower = result.finalMessage.toLowerCase();
const finalHasFinancial = FORBIDDEN_TERMS.some(t => finalLower.includes(t));
!finalHasFinancial
  ? pass('finalMessage has no financial content')
  : fail(`finalMessage contains financial terms: ${FORBIDDEN_TERMS.filter(t => finalLower.includes(t)).join(', ')}`);

// 11. requiredLens contains relationship items
const lensStr = ctx.requiredLens.join(' ').toLowerCase();
const hasRelationshipLens = lensStr.includes('giao tiếp') && lensStr.includes('cảm xúc');
hasRelationshipLens
  ? pass(`requiredLens includes relationship items: ${ctx.requiredLens.slice(0, 3).join(', ')}...`)
  : fail(`requiredLens does not contain relationship items: ${ctx.requiredLens.join(', ')}`);

// 12. No hardcoded "vehicle_property_asset" in fallback for this question
result.questionContext.questionType !== 'vehicle_property_asset'
  ? pass('questionContext.questionType is NOT vehicle_property_asset')
  : fail('questionContext.questionType is vehicle_property_asset — classifier not applied to fallback');

// ─── Print results ────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════════════════════════');
console.log(' LOVE CONTEXT QUALITY TEST');
console.log(` Q: "${QUESTION}"`);
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('── CLASSIFIER OUTPUT ───────────────────────────────────────────');
console.log(`  questionType  : ${ctx.questionType}`);
console.log(`  decisionType  : ${ctx.decisionType}`);
console.log(`  answerMode    : ${ctx.answerMode}`);
console.log(`  timeframe     : ${ctx.timeframe}`);
console.log(`  mainObject    : ${ctx.mainObject}`);
console.log(`  riskLevel     : ${ctx.riskLevel}`);
console.log(`  requiredLens  : ${ctx.requiredLens.join(' | ')}`);
console.log();

console.log('── MOCK RESPONSE PREVIEW ───────────────────────────────────────');
console.log(`  directAnswer  : ${result.directAnswer.substring(0, 100)}...`);
console.log(`  decisionSignal: ${result.decisionSignal}`);
console.log(`  checklist[0]  : ${result.decisionChecklist[0]}`);
console.log(`  finalMessage  : ${result.finalMessage}`);
console.log();

console.log('── VALIDATION ──────────────────────────────────────────────────');
passes.forEach(p => console.log(p));
fails.forEach(f => console.log(f));
console.log();

console.log('── SUMMARY ─────────────────────────────────────────────────────');
console.log(`  ${fails.length === 0 ? '✅ ALL TESTS PASSED' : `❌ ${fails.length} TEST(S) FAILED`} (${passes.length}/${passes.length + fails.length})`);
console.log('═══════════════════════════════════════════════════════════════\n');

// ─── Cross-test: verify financial questions still get financial advice ─────────
console.log('── CROSS-TEST: Ban xe should still classify as asset ───────────');
const banXeCtx = classifyQuestionContext('Có nên bán xe không?');
const banXeOk = banXeCtx.questionType === 'vehicle_property_asset' && banXeCtx.decisionType === 'sell_or_keep';
console.log(`  "Có nên bán xe không?" => ${banXeCtx.questionType} / ${banXeCtx.decisionType} ${banXeOk ? '✅' : '❌'}`);

const muaNhaCtx = classifyQuestionContext('Có nên mua nhà không?');
const muaNhaOk = muaNhaCtx.questionType === 'housing_property';
console.log(`  "Có nên mua nhà không?" => ${muaNhaCtx.questionType} / ${muaNhaCtx.decisionType} ${muaNhaOk ? '✅' : '❌'}`);

const nguoiDoCtx = classifyQuestionContext('người đó còn tình cảm với tôi không?');
const nguoiDoOk = nguoiDoCtx.questionType === 'love_relationship';
console.log(`  "người đó còn tình cảm với tôi không?" => ${nguoiDoCtx.questionType} ${nguoiDoOk ? '✅' : '❌'}`);

const tinhCamCtx = classifyQuestionContext('tình cảm của tôi tuần này ra sao');
const tinhCamOk = tinhCamCtx.questionType === 'love_relationship' && tinhCamCtx.timeframe;
console.log(`  "tình cảm của tôi tuần này ra sao" => ${tinhCamCtx.questionType} / timeframe: ${tinhCamCtx.timeframe || 'none'} ${tinhCamOk ? '✅' : '⚠'}`);
console.log();

if (fails.length > 0) process.exit(1);
