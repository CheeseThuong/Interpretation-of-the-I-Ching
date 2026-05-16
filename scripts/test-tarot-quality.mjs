/**
 * scripts/test-tarot-quality.mjs
 * Live quality test: "Có nên bán xe không?" + The Moon (Upright)
 * Validates all 9 criteria from the quality spec.
 * Run: node scripts/test-tarot-quality.mjs
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load API key from .env.local
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env.local');
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const m = line.match(/^AI_API_KEY=(.+)$/);
      if (m) return m[1].trim();
    }
  } catch {}
  return process.env.AI_API_KEY || '';
}

const API_KEY = loadEnv();
if (!API_KEY) {
  console.error('❌ No AI_API_KEY found in .env.local');
  process.exit(1);
}

// ─── Mirror classifyQuestionContext from prompts.ts ───────────────────────────
function classifyQuestion(question) {
  const q = question.toLowerCase();
  if (/\b(xe|xe hơi|ô tô|moto|xe máy|phương tiện)\b/.test(q)) {
    const lens = ['giá thị trường', 'chi phí sửa chữa', 'bảo hiểm', 'nhu cầu đi lại', 'áp lực tiền mặt', 'giấy tờ pháp lý'];
    const decisionType = /\b(bán|sang nhượng|thanh lý)\b/.test(q) ? 'sell_or_keep' : 'unclear';
    return { questionType: 'vehicle_property_asset', decisionType, mainObject: 'xe', riskLevel: 'medium', requiredLens: lens };
  }
  return { questionType: 'unclear', decisionType: 'unclear', mainObject: '', riskLevel: 'medium', requiredLens: [] };
}

// ─── Build the exact prompt for this test case ────────────────────────────────
function buildTestPrompt() {
  const question = 'Có nên bán xe không?';
  const card = {
    name: 'The Moon',
    nameVi: 'Mặt Trăng',
    position: 'Thông điệp chính',
    isReversed: false,
    meaningUpright: 'Mọi thứ không như vẻ bề ngoài. Hãy cẩn thận với những ảo giác và lắng nghe trực giác thay vì nỗi sợ.',
    meaningReversed: 'Sự thật đang dần sáng tỏ, những nỗi sợ hãi vô hình đang dần tan biến.',
  };

  const ctx = classifyQuestion(question);
  const isHighStakes = ctx.decisionType !== 'general_guidance' && ctx.decisionType !== 'unclear';

  const cardStr = `- Vị trí: ${card.position}
  Lá bài: ${card.nameVi} (${card.name})
  Trạng thái: Xuôi (Upright)
  Nghĩa xuôi: ${card.meaningUpright}
  Nghĩa ngược: ${card.meaningReversed}`;

  const decisionBlock = isHighStakes ? `
DECISION-SPECIFIC RULES (active — this is a "sell_or_keep" question about a vehicle):
- decisionSignal MUST be: wait OR conditional (The Moon = uncertainty, hidden info, incomplete facts)
- questionType MUST be: vehicle_property_asset
- decisionType MUST be: sell_or_keep
- decisionChecklist MUST include ALL of: ${ctx.requiredLens.join(', ')}
- contextualInterpretation MUST connect The Moon directly to the car-selling decision:
    → Ảo ảnh = giá kỳ vọng có thể không phản ánh thị trường thực tế
    → Sương mù = thông tin chưa đủ (xe có lỗi ẩn? người mua tiềm năng đáng tin không?)
    → Trực giác mơ hồ = chưa đến lúc quyết định vội
- practicalAdvice must be actions specific to selling a vehicle, NOT generic life advice
- thingsToAvoid must name real car-sale risks (bán non, ký hợp đồng thiếu kiểm tra, không có xe thay thế)
- riskNotes must flag: giá bán thấp hơn thị trường, giấy tờ chưa rõ, không có phương tiện đi lại
- FORBIDDEN PHRASES (do not use): "mở rộng mạng lưới", "khởi đầu mới", "vũ trụ gửi tín hiệu", "tin vào trực giác" (unless directly tied to a concrete car-related fact)
- Answer 100% in Vietnamese. No English filler.
`.trim() : '';

  return `Bạn là một trợ lý AI Oracle cao cấp. Nhiệm vụ: dùng lá bài Tarot như khung tư duy biểu tượng để trả lời câu hỏi thực tế.

NGUYÊN TẮC CỐT LÕI:
- Câu hỏi của người dùng là ưu tiên tuyệt đối số 1.
- Mọi biểu tượng Tarot phải được diễn giải trong ngữ cảnh câu hỏi, không phải diễn giải chung chung.
- Câu trả lời phải hoàn toàn bằng tiếng Việt.
- Không được dùng filler tâm linh không liên quan.

━━━ DỮ LIỆU ĐẦU VÀO ━━━
Câu hỏi: "${question}"
Chủ đề: Tài sản / Phương tiện
Trải bài: Một lá bài (One Card)
BỐI CẢNH: questionType=vehicle_property_asset | decisionType=sell_or_keep | riskLevel=medium
Lá bài cần luận: The Moon (Mặt Trăng) — Xuôi (Upright)
━━━━━━━━━━━━━━━━━━━━━━━━

CÁC LÁ BÀI:
${cardStr}

${decisionBlock}

YÊU CẦU ĐẦU RA — Chỉ trả về JSON hợp lệ, không markdown, không text bên ngoài:
{
  "directAnswer": "Trả lời thẳng: có nên bán xe không, trong 1-2 câu bằng tiếng Việt.",
  "decisionSignal": "wait | conditional",
  "confidenceLevel": "low | medium | high",
  "questionContext": {
    "questionType": "vehicle_property_asset",
    "decisionType": "sell_or_keep",
    "mainObject": "xe",
    "userIntent": "Quyết định có nên bán xe trong thời điểm này không",
    "riskLevel": "medium",
    "answerMode": "decision_guidance",
    "requiredLens": ["giá thị trường", "chi phí sửa chữa", "bảo hiểm", "nhu cầu đi lại", "áp lực tiền mặt", "giấy tờ pháp lý"]
  },
  "quickSummary": "Tóm tắt 1 câu về tình huống bán xe hiện tại.",
  "symbolicReading": {
    "mainSymbol": "The Moon — Mặt Trăng",
    "mainPattern": "Thông điệp của The Moon liên quan đến quyết định bán xe.",
    "changingFactor": "Yếu tố ẩn hoặc chưa rõ trong vụ bán xe.",
    "futureTrend": "Xu hướng nếu bán ngay vs chờ thêm."
  },
  "contextualInterpretation": "Luận giải chi tiết kết nối The Moon với quyết định bán xe. Phải đề cập: thông tin ẩn về xe/người mua, sự không chắc chắn về giá, rủi ro khi bán vội.",
  "decisionChecklist": [
    "Giá thị trường hiện tại của xe so với kỳ vọng",
    "Chi phí sửa chữa/bảo trì còn tồn đọng",
    "Tình trạng bảo hiểm và phí đỗ xe",
    "Phương án đi lại thay thế sau khi bán",
    "Áp lực tiền mặt hiện tại — có thực sự cần bán gấp không",
    "Giấy tờ xe, khoản vay/thế chấp, tình trạng pháp lý"
  ],
  "practicalAdvice": [
    "Hành động cụ thể liên quan đến bán xe 1",
    "Hành động cụ thể liên quan đến bán xe 2"
  ],
  "thingsToAvoid": [
    "Rủi ro cụ thể cần tránh khi bán xe trong tình trạng hiện tại"
  ],
  "riskNotes": [
    "Rủi ro tài chính/pháp lý cụ thể khi bán xe lúc này"
  ],
  "symbolDetails": {
    "cardInterpretations": [{
      "position": "Thông điệp chính",
      "cardName": "The Moon",
      "orientation": "upright",
      "meaningInThisQuestion": "Ý nghĩa The Moon trong ngữ cảnh bán xe cụ thể.",
      "decisionImpact": "wait | conditional",
      "advice": "Lời khuyên cụ thể từ The Moon cho quyết định bán xe."
    }]
  },
  "referenceUsed": [],
  "finalMessage": "Thông điệp kết thúc — ngắn gọn, thực tế, liên quan đến xe."
}`;
}

// ─── Call Gemini ──────────────────────────────────────────────────────────────
async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { response_mime_type: 'application/json', temperature: 0.5, topP: 0.8, topK: 40 }
    })
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.statusText} — ${await res.text()}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return JSON.parse(text);
}

// ─── Validators ───────────────────────────────────────────────────────────────
const FORBIDDEN = ['mở rộng mạng lưới', 'một khởi đầu mới', 'vũ trụ gửi tín hiệu', 'hãy tin trực giác'];
const REQUIRED_CHECKLIST = ['giá thị trường', 'sửa chữa', 'bảo hiểm', 'đi lại', 'tiền mặt', 'giấy tờ'];
const MOON_CONCEPTS = ['ảo ảnh', 'sương mù', 'ẩn', 'chưa rõ', 'mơ hồ', 'không chắc', 'thông tin thiếu', 'tiềm thức', 'cảm xúc', 'sợ hãi'];

function validate(result) {
  const fails = [];
  const passes = [];

  // 1. Vietnamese only
  const allText = JSON.stringify(result);
  const hasVietnamese = /[àáâãèéêìíòóôõùúýăđơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỷỹ]/i.test(allText);
  hasVietnamese ? passes.push('✅ 1. Vietnamese present') : fails.push('❌ 1. No Vietnamese characters detected');

  // 2. Direct answer about the car
  const direct = (result.directAnswer || '').toLowerCase();
  (direct.includes('xe') || direct.includes('bán')) ? passes.push('✅ 2. directAnswer mentions car/sell') : fails.push(`❌ 2. directAnswer doesn't mention xe/bán: "${result.directAnswer}"`);

  // 3. questionType classification
  const qt = result.questionContext?.questionType;
  (qt === 'vehicle_property_asset' || qt === 'money_finance') ? passes.push(`✅ 3. questionType = ${qt}`) : fails.push(`❌ 3. questionType = "${qt}" (expected vehicle_property_asset or money_finance)`);

  // 4. decisionType
  const dt = result.questionContext?.decisionType;
  dt === 'sell_or_keep' ? passes.push('✅ 4. decisionType = sell_or_keep') : fails.push(`❌ 4. decisionType = "${dt}" (expected sell_or_keep)`);

  // 5. decisionSignal
  const ds = result.decisionSignal;
  (ds === 'wait' || ds === 'conditional') ? passes.push(`✅ 5. decisionSignal = ${ds}`) : fails.push(`❌ 5. decisionSignal = "${ds}" (expected wait or conditional)`);

  // 6. The Moon concept in interpretation
  const interp = (result.contextualInterpretation || '').toLowerCase();
  const hasMoonConcept = MOON_CONCEPTS.some(c => interp.includes(c));
  hasMoonConcept ? passes.push('✅ 6. Moon concepts (uncertainty/fog/hidden) present in interpretation') : fails.push(`❌ 6. Interpretation missing Moon concepts. Got: "${result.contextualInterpretation?.substring(0, 100)}..."`);

  // 7. The Moon connected to car
  const hasCarInInterp = interp.includes('xe') || interp.includes('bán') || interp.includes('phương tiện');
  hasCarInInterp ? passes.push('✅ 7. Interpretation connects Moon to car decision') : fails.push('❌ 7. Interpretation does not mention xe/bán');

  // 8. Checklist coverage
  const checklist = (result.decisionChecklist || []).join(' ').toLowerCase();
  const missingLens = REQUIRED_CHECKLIST.filter(l => !checklist.includes(l));
  missingLens.length === 0 ? passes.push('✅ 8. All required checklist items present') : fails.push(`❌ 8. Missing checklist items: ${missingLens.join(', ')}`);

  // 9. No generic filler
  const lowerAll = allText.toLowerCase();
  const foundFiller = FORBIDDEN.filter(f => lowerAll.includes(f));
  foundFiller.length === 0 ? passes.push('✅ 9. No forbidden generic filler detected') : fails.push(`❌ 9. Found generic filler: ${foundFiller.join(', ')}`);

  return { passes, fails };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════════');
console.log(' TAROT AI QUALITY TEST');
console.log(' Q: "Có nên bán xe không?" + The Moon (Upright)');
console.log('═══════════════════════════════════════════════\n');

const prompt = buildTestPrompt();
console.log('▶ Calling Gemini...\n');

try {
  const result = await callGemini(prompt);

  console.log('── RAW RESULT ─────────────────────────────────');
  console.log(JSON.stringify(result, null, 2));
  console.log('───────────────────────────────────────────────\n');

  const { passes, fails } = validate(result);

  console.log('── VALIDATION ─────────────────────────────────');
  passes.forEach(p => console.log(p));
  fails.forEach(f => console.log(f));
  console.log('───────────────────────────────────────────────');
  console.log(`\n${fails.length === 0 ? '✅ ALL TESTS PASSED' : `❌ ${fails.length} TEST(S) FAILED`} (${passes.length}/${passes.length + fails.length})\n`);

  if (fails.length > 0) process.exit(1);
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
