/**
 * src/lib/astrology/zodiac.ts
 * Pure local zodiac calculation — no API, no dataset.
 * Used to add a personalization lens to Tarot readings.
 */

export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water';
export type ZodiacModality = 'cardinal' | 'fixed' | 'mutable';

export interface ZodiacProfile {
  sign: ZodiacSign;
  viName: string;
  dateRange: string;
  element: ZodiacElement;
  modality: ZodiacModality;
  strengths: string[];
  shadowPatterns: string[];
  emotionalStyle: string;
  decisionStyle: string;
  relationshipStyle: string;
  moneyStyle: string;
  riskPattern: string;
  adviceStyle: string;
}

export interface ZodiacLens {
  sign: ZodiacSign;
  viName: string;
  element: ZodiacElement;
  modality: ZodiacModality;
  personalizationSummary: string;   // 1-sentence context label shown in UI
  psychologicalTendency: string;    // How they tend to process this question type
  decisionStyle: string;
  adviceStyle: string;
  riskNote: string;
}

/* ── Zodiac profiles ── */
const ZODIAC_PROFILES: Record<ZodiacSign, ZodiacProfile> = {
  Aries: {
    sign: 'Aries', viName: 'Bạch Dương', dateRange: '21/3–19/4',
    element: 'fire', modality: 'cardinal',
    strengths: ['hành động nhanh', 'dũng cảm', 'khởi xướng', 'nhiệt huyết'],
    shadowPatterns: ['có thể quyết định vội vàng', 'đôi khi thiếu kiên nhẫn với quy trình', 'dễ bỏ dở khi mất hứng'],
    emotionalStyle: 'Thẳng thắn, biểu đạt rõ ràng, có thể phản ứng nhanh trước áp lực.',
    decisionStyle: 'Có xu hướng quyết định nhanh dựa trên trực giác và năng lượng ban đầu.',
    relationshipStyle: 'Nhiệt tình, trực tiếp, có thể cần nhiều không gian tự do.',
    moneyStyle: 'Có thể chi tiêu theo cảm hứng, thích cơ hội tăng trưởng nhanh.',
    riskPattern: 'Có thể chấp nhận rủi ro cao mà chưa đánh giá đủ các hệ quả dài hạn.',
    adviceStyle: 'Cần lời khuyên ngắn gọn, hành động cụ thể, không rườm rà lý thuyết.',
  },
  Taurus: {
    sign: 'Taurus', viName: 'Kim Ngưu', dateRange: '20/4–20/5',
    element: 'earth', modality: 'fixed',
    strengths: ['kiên trì', 'đáng tin cậy', 'thực tế', 'ổn định'],
    shadowPatterns: ['có thể kháng cự thay đổi', 'đôi khi giữ quá lâu điều không còn phù hợp', 'cứng nhắc khi áp lực'],
    emotionalStyle: 'Ổn định, cần thời gian để xử lý cảm xúc, không thích sự hỗn loạn.',
    decisionStyle: 'Có xu hướng quyết định chậm, cần sự chắc chắn và bằng chứng thực tế trước khi hành động.',
    relationshipStyle: 'Trung thành, cần sự ổn định, đánh giá cao sự nhất quán.',
    moneyStyle: 'Thận trọng, ưu tiên bảo toàn vốn và giá trị thực tế, không thích đầu cơ.',
    riskPattern: 'Có thể né tránh rủi ro cần thiết hoặc giữ nguyên trạng thái dù cần thay đổi.',
    adviceStyle: 'Cần kế hoạch rõ ràng, giá trị thực tế, và sự đảm bảo về tính ổn định.',
  },
  Gemini: {
    sign: 'Gemini', viName: 'Song Tử', dateRange: '21/5–20/6',
    element: 'air', modality: 'mutable',
    strengths: ['linh hoạt', 'giao tiếp tốt', 'tò mò', 'thích ứng nhanh'],
    shadowPatterns: ['có thể phân tâm giữa nhiều lựa chọn', 'dễ thay đổi ý kiến', 'khó cam kết dài hạn'],
    emotionalStyle: 'Xử lý cảm xúc qua ngôn ngữ và phân tích, cần giao tiếp để hiểu bản thân.',
    decisionStyle: 'Có xu hướng so sánh nhiều phương án, có thể bị mắc kẹt trong phân tích quá mức.',
    relationshipStyle: 'Cần sự kích thích trí tuệ, giao tiếp đa dạng, không thích nhàm chán.',
    moneyStyle: 'Hay thay đổi chiến lược, thích đa dạng hóa nhưng cần kỷ luật để đi đường dài.',
    riskPattern: 'Có thể phân tán năng lượng và vốn vào quá nhiều hướng cùng lúc.',
    adviceStyle: 'Cần sự rõ ràng về ưu tiên, từng bước một, không thả lỏng quá nhiều hướng cùng lúc.',
  },
  Cancer: {
    sign: 'Cancer', viName: 'Cự Giải', dateRange: '21/6–22/7',
    element: 'water', modality: 'cardinal',
    strengths: ['trực giác mạnh', 'quan tâm sâu sắc', 'bảo vệ', 'cảm nhận tinh tế'],
    shadowPatterns: ['có thể quyết định theo cảm xúc nhất thời', 'dễ giữ nỗi lo quá lâu', 'khó buông bỏ'],
    emotionalStyle: 'Sâu sắc về cảm xúc, cần cảm thấy an toàn trước khi mở lòng.',
    decisionStyle: 'Có xu hướng đặt nặng cảm giác và sự an toàn trong mọi quyết định.',
    relationshipStyle: 'Chăm sóc, bảo vệ, cần được cảm thấy được trân trọng và an toàn.',
    moneyStyle: 'Ưu tiên an toàn tài chính và gia đình, thận trọng với rủi ro.',
    riskPattern: 'Có thể né tránh cơ hội tốt vì lo sợ mất an toàn cảm xúc hoặc tài chính.',
    adviceStyle: 'Cần lời khuyên ấm áp, đặt nặng yếu tố an toàn và giá trị cảm xúc.',
  },
  Leo: {
    sign: 'Leo', viName: 'Sư Tử', dateRange: '23/7–22/8',
    element: 'fire', modality: 'fixed',
    strengths: ['tự tin', 'sáng tạo', 'lãnh đạo', 'hào phóng'],
    shadowPatterns: ['có thể đặt nặng cái tôi trong quyết định', 'khó nhận lời phê bình', 'đôi khi kỳ vọng quá cao'],
    emotionalStyle: 'Biểu đạt mạnh mẽ, cần được công nhận, xử lý cảm xúc qua sáng tạo hoặc hành động.',
    decisionStyle: 'Có xu hướng quyết định với sự tự tin cao, đôi khi cần kiểm tra thêm thực tế.',
    relationshipStyle: 'Nhiệt tình, trung thành, cần sự thừa nhận và kết nối chân thực.',
    moneyStyle: 'Thích đầu tư vào thứ có giá trị và thể hiện bản thân, có thể chi tiêu hào phóng.',
    riskPattern: 'Có thể đánh giá quá lạc quan vào năng lực bản thân khi đối mặt rủi ro.',
    adviceStyle: 'Cần lời khuyên tôn trọng điểm mạnh, chỉ ra rủi ro cụ thể mà không làm tổn thương tự ái.',
  },
  Virgo: {
    sign: 'Virgo', viName: 'Xử Nữ', dateRange: '23/8–22/9',
    element: 'earth', modality: 'mutable',
    strengths: ['phân tích', 'kỹ lưỡng', 'thực tế', 'cải thiện liên tục'],
    shadowPatterns: ['có thể bị kẹt trong phân tích quá chi tiết', 'dễ lo âu về sai sót', 'khó chấp nhận sự không hoàn hảo'],
    emotionalStyle: 'Xử lý cảm xúc qua phân tích và tìm giải pháp, có thể lo lắng nhiều về chi tiết.',
    decisionStyle: 'Có xu hướng nghiên cứu kỹ trước khi quyết định, cần dữ liệu và quy trình rõ ràng.',
    relationshipStyle: 'Quan tâm thực tế, trung thực, cần sự tin tưởng xây dựng qua thời gian.',
    moneyStyle: 'Tiết kiệm, lên kế hoạch chi tiết, thích biết rõ từng khoản.',
    riskPattern: 'Có thể phân tích quá lâu đến mức bỏ lỡ cơ hội vì chờ điều kiện hoàn hảo.',
    adviceStyle: 'Cần dữ liệu cụ thể, checklist rõ ràng, và sự đảm bảo về tính chính xác.',
  },
  Libra: {
    sign: 'Libra', viName: 'Thiên Bình', dateRange: '23/9–22/10',
    element: 'air', modality: 'cardinal',
    strengths: ['cân bằng', 'công bằng', 'hòa giải', 'thẩm mỹ tốt'],
    shadowPatterns: ['có thể khó đưa ra quyết định dứt khoát', 'đôi khi tránh xung đột cần thiết', 'dễ dao động theo ý kiến người khác'],
    emotionalStyle: 'Cần sự hài hòa, xử lý cảm xúc qua đối thoại và cân nhắc nhiều góc độ.',
    decisionStyle: 'Có xu hướng cân nhắc rất kỹ cả hai phía, đôi khi cần áp lực bên ngoài để quyết.',
    relationshipStyle: 'Hợp tác, lãng mạn, cần sự cân bằng và sự công bằng trong mối quan hệ.',
    moneyStyle: 'Thích giải pháp cân bằng giữa an toàn và tăng trưởng, tham khảo nhiều ý kiến.',
    riskPattern: 'Có thể trì hoãn quyết định đến mức cơ hội đã qua.',
    adviceStyle: 'Cần lời khuyên rõ ràng về ưu và nhược, giúp đưa ra quyết định dứt khoát.',
  },
  Scorpio: {
    sign: 'Scorpio', viName: 'Bọ Cạp', dateRange: '23/10–21/11',
    element: 'water', modality: 'fixed',
    strengths: ['trực giác sâu sắc', 'quyết tâm', 'biến đổi', 'kiên trì'],
    shadowPatterns: ['có thể giữ bí mật hoặc nỗi đau quá lâu', 'dễ nghi ngờ', 'đôi khi dùng kiểm soát để đối phó với lo sợ'],
    emotionalStyle: 'Cảm xúc mạnh mẽ và sâu, không dễ mở lòng nhưng rất trung thành khi đã tin.',
    decisionStyle: 'Có xu hướng quyết định dựa trên trực giác và nghiên cứu sâu, không dễ bị lay chuyển.',
    relationshipStyle: 'Cần độ sâu và sự tin tưởng, không thích bề ngoài, cần sự chân thực.',
    moneyStyle: 'Chiến lược, thích quyền kiểm soát tài chính, có thể đầu tư dài hạn kiên định.',
    riskPattern: 'Có thể khó tha thứ khi mất niềm tin hoặc bị phản bội trong quyết định.',
    adviceStyle: 'Cần lời khuyên thẳng thắn, không che giấu rủi ro, tôn trọng trực giác của họ.',
  },
  Sagittarius: {
    sign: 'Sagittarius', viName: 'Nhân Mã', dateRange: '22/11–21/12',
    element: 'fire', modality: 'mutable',
    strengths: ['lạc quan', 'tự do', 'triết học', 'phiêu lưu'],
    shadowPatterns: ['có thể hứa nhiều hơn thực hiện', 'đôi khi thiếu kiên nhẫn với chi tiết thực tế', 'dễ bỏ qua rủi ro'],
    emotionalStyle: 'Lạc quan tự nhiên, tìm kiếm ý nghĩa lớn, không thích bị giam hãm bởi chi tiết.',
    decisionStyle: 'Có xu hướng quyết định theo bức tranh lớn, đôi khi bỏ qua các bước thực tế quan trọng.',
    relationshipStyle: 'Tự do, phiêu lưu, cần không gian và sự phát triển trong mối quan hệ.',
    moneyStyle: 'Thích cơ hội lớn, đôi khi hy sinh an toàn cho tự do tài chính.',
    riskPattern: 'Có thể đánh giá thấp rủi ro hoặc bỏ qua cảnh báo vì lạc quan quá.',
    adviceStyle: 'Cần lời khuyên kết nối với ý nghĩa lớn hơn, nhưng chỉ ra các bước thực tế không thể bỏ qua.',
  },
  Capricorn: {
    sign: 'Capricorn', viName: 'Ma Kết', dateRange: '22/12–19/1',
    element: 'earth', modality: 'cardinal',
    strengths: ['kỷ luật', 'tham vọng', 'kiên nhẫn', 'có trách nhiệm'],
    shadowPatterns: ['có thể đặt nặng mục tiêu đến mức quên cảm xúc', 'khó buông bỏ kiểm soát', 'đôi khi cứng nhắc về tiêu chuẩn'],
    emotionalStyle: 'Kiểm soát cảm xúc tốt bề ngoài, nhưng có thể gánh nặng bên trong lâu dài.',
    decisionStyle: 'Có xu hướng quyết định dựa trên kết quả dài hạn và lộ trình rõ ràng.',
    relationshipStyle: 'Ổn định, có trách nhiệm, cần được tôn trọng và đánh giá đúng giá trị.',
    moneyStyle: 'Tiết kiệm dài hạn, đầu tư theo kế hoạch, không thích rủi ro không cần thiết.',
    riskPattern: 'Có thể quá thận trọng đến mức bỏ lỡ cơ hội có giá trị hoặc hy sinh cảm xúc cho mục tiêu.',
    adviceStyle: 'Cần kế hoạch dài hạn rõ ràng, mốc thời gian cụ thể, và sự đảm bảo về tính khả thi.',
  },
  Aquarius: {
    sign: 'Aquarius', viName: 'Bảo Bình', dateRange: '20/1–18/2',
    element: 'air', modality: 'fixed',
    strengths: ['sáng tạo', 'độc lập', 'nhân văn', 'tư duy đột phá'],
    shadowPatterns: ['có thể quá sống trong đầu', 'đôi khi tách biệt khỏi cảm xúc', 'khó cam kết với những gì cảm thấy giới hạn'],
    emotionalStyle: 'Xử lý cảm xúc qua tư duy và nguyên tắc, đôi khi cần nhắc nhở về chiều sâu cảm xúc.',
    decisionStyle: 'Có xu hướng quyết định dựa trên nguyên tắc và góc nhìn độc lập, không bị ảnh hưởng bởi số đông.',
    relationshipStyle: 'Cần tự do và sự kết nối trí tuệ, không thích kiểm soát hoặc kỳ vọng thông thường.',
    moneyStyle: 'Thích đầu tư vào ý tưởng mới, có thể chấp nhận rủi ro phi truyền thống.',
    riskPattern: 'Có thể tách biệt khỏi thực tế tài chính hoặc cảm xúc khi tập trung vào lý thuyết.',
    adviceStyle: 'Cần lời khuyên tôn trọng sự độc lập, kết nối với giá trị cá nhân, không áp đặt khuôn mẫu.',
  },
  Pisces: {
    sign: 'Pisces', viName: 'Song Ngư', dateRange: '19/2–20/3',
    element: 'water', modality: 'mutable',
    strengths: ['trực giác', 'đồng cảm', 'sáng tạo', 'linh hoạt'],
    shadowPatterns: ['có thể tránh thực tế khó khăn', 'dễ bị ảnh hưởng bởi người khác', 'đôi khi thiếu ranh giới rõ ràng'],
    emotionalStyle: 'Cảm nhận sâu sắc, dễ bị ảnh hưởng bởi môi trường và người xung quanh.',
    decisionStyle: 'Có xu hướng quyết định theo trực giác và cảm xúc, đôi khi cần neo đậu vào thực tế.',
    relationshipStyle: 'Lãng mạn, đồng cảm, cần ranh giới rõ ràng để không mất bản thân.',
    moneyStyle: 'Có thể mơ hồ về tài chính, cần cấu trúc và kế hoạch rõ ràng từ bên ngoài.',
    riskPattern: 'Có thể đưa ra quyết định dựa trên kỳ vọng hoặc ảo tưởng hơn là thực tế.',
    adviceStyle: 'Cần lời khuyên ấm áp, kết nối trực giác với hành động thực tế cụ thể.',
  },
};

/* ── Date → sign ── */
export function getZodiacSignFromDate(birthDate: string): ZodiacSign | null {
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return null;
  const m = d.getMonth() + 1; // 1-12
  const day = d.getDate();

  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return 'Aries';
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return 'Taurus';
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return 'Gemini';
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return 'Cancer';
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return 'Leo';
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return 'Virgo';
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return 'Libra';
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return 'Scorpio';
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return 'Sagittarius';
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return 'Capricorn';
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces'; // Feb 19 – Mar 20
}

export function getZodiacProfile(sign: ZodiacSign): ZodiacProfile {
  return ZODIAC_PROFILES[sign];
}

/** Build a soft, non-deterministic zodiac lens for the AI prompt */
export function buildZodiacLens(sign: ZodiacSign, questionType?: string): ZodiacLens {
  const p = ZODIAC_PROFILES[sign];

  // Question-type-aware psychological tendency
  const psychologicalTendency =
    questionType === 'love_relationship'
      ? p.relationshipStyle
      : questionType === 'money_finance' || questionType === 'vehicle_property_asset' || questionType === 'housing_property'
        ? `${p.moneyStyle} ${p.riskPattern}`
        : questionType === 'career_work'
          ? p.decisionStyle
          : p.emotionalStyle;

  const personalizationSummary = `Cá nhân hóa theo cung ${p.viName} (${p.element === 'fire' ? 'lửa' : p.element === 'earth' ? 'đất' : p.element === 'air' ? 'khí' : 'nước'}, ${p.modality === 'cardinal' ? 'khởi động' : p.modality === 'fixed' ? 'cố định' : 'biến đổi'}): có xu hướng ${p.strengths.slice(0,2).join(' và ')}.`;

  return {
    sign,
    viName: p.viName,
    element: p.element,
    modality: p.modality,
    personalizationSummary,
    psychologicalTendency,
    decisionStyle: p.decisionStyle,
    adviceStyle: p.adviceStyle,
    riskNote: p.riskPattern,
  };
}
