import { buildTarotContextBundle } from './src/lib/ai/contextBundle';
import { buildTarotReadingPrompt } from './src/lib/ai/prompts';

const inputData = {
  question: "nên đầu tư vào quỹ tín dụng, trái phiếu, cổ phiếu không?",
  topic: "Tài chính",
  spreadType: "5-card Tarot",
  userMemorySummary: "Người dùng thường hỏi về quyết định tài chính và thích câu trả lời rõ ràng, có checklist. Người dùng có xu hướng cẩn trọng, cần biết rủi ro trước khi hành động.",
  drawnCards: [
    { card: { name: "The Star", nameVi: "Ngôi Sao" }, positionName: "Tình huống hiện tại", isReversed: true },
    { card: { name: "Nine of Pentacles", nameVi: "Chín Tiền" }, positionName: "Điều đang cản trở", isReversed: true },
    { card: { name: "Ten of Pentacles", nameVi: "Mười Tiền" }, positionName: "Điều bị che khuất", isReversed: false },
    { card: { name: "Knight of Pentacles", nameVi: "Hiệp Sĩ Tiền" }, positionName: "Lời khuyên", isReversed: true },
    { card: { name: "The Chariot", nameVi: "Cỗ Xe" }, positionName: "Xu hướng kết quả", isReversed: false }
  ],
  synthesisContext: "Synthesis says: Be careful but there is hidden wealth.",
  tarotReferenceContext: "HuggingFace references..."
};

const contextBundle = buildTarotContextBundle(inputData);
const prompt = buildTarotReadingPrompt(contextBundle);

console.log("=== CONTEXT BUNDLE ===");
console.log(JSON.stringify(contextBundle, null, 2));
console.log("\n=== GENERATED PROMPT ===");
console.log(prompt);
