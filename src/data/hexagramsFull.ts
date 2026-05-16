import type { HexagramFull } from '../types';

/**
 * Dữ liệu diễn giải đầy đủ cho 64 quẻ Kinh Dịch.
 *
 * Hiện tại có 3 quẻ mẫu (Thuần Càn, Thuần Khôn, Thủy Lôi Truân).
 * TODO: Bổ sung 61 quẻ còn lại (quẻ 4–64) theo cùng schema.
 *
 * Schema: HexagramFull (src/types/index.ts)
 *   - overallMeaning, workMeaning, loveMeaning, financeMeaning, healthNote
 *   - judgment (Thoán từ), image (Tượng từ), keywords, lines (6 hào)
 */
export const HEXAGRAMS_FULL: HexagramFull[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // Quẻ 1 — Thuần Càn (乾為天)
  // ──────────────────────────────────────────────────────────────────────────
  {
    no: 1,
    name: 'Thuần Càn',
    upper: '111',
    lower: '111',
    chineseName: '乾為天',
    pinyin: 'Qián wéi Tiān',
    symbol: '䷀',
    relatedElement: 'Kim',
    keywords: ['sức mạnh', 'sáng tạo', 'lãnh đạo', 'kiên định', 'chính trực', 'tiến lên'],
    judgment:
      'Thuần Càn: Nguyên, hanh, lợi, trinh. (Bốn đức: khởi đầu vĩ đại, hanh thông, có lợi, chính bền.)',
    image:
      'Trời vận hành mạnh mẽ không ngừng. Người quân tử tự mình phấn đấu không nghỉ.',
    overallMeaning:
      'Thuần Càn tượng trưng cho sức mạnh thuần dương, sáng tạo và tinh thần lãnh đạo. ' +
      'Đây là thời điểm thuận lợi nhất để khởi đầu, hành động và tiến lên. ' +
      'Tuy nhiên cần giữ chính trực — sức mạnh không đi kèm đức hạnh sẽ dễ kiêu ngạo và đổ vỡ.',
    workMeaning:
      'Thời cơ tốt để lãnh đạo, đề xuất ý tưởng mới, hoặc khởi động dự án lớn. ' +
      'Nên hành động quyết đoán nhưng vẫn lắng nghe người khác.',
    loveMeaning:
      'Dương khí mạnh — dễ quá chủ động hoặc áp đặt. Cần học cách lắng nghe và nhường nhịn. ' +
      'Nếu đang tìm bạn đời, đây là giai đoạn tự nâng cao bản thân trước.',
    financeMeaning:
      'Có thể đầu tư hoặc mở rộng kinh doanh, nhưng cần đánh giá rủi ro kỹ. ' +
      'Tránh quyết định theo cảm xúc — sức mạnh cần được định hướng đúng.',
    healthNote:
      'Cần chú ý không làm việc quá sức. Năng lượng cao nhưng cần nghỉ ngơi đúng lúc để duy trì bền vững. ' +
      '(Tham khảo — không thay thế ý kiến y tế.)',
    lines: [
      {
        lineNo: 1,
        originalText: '潛龍勿用。(Tiềm long vật dụng.)',
        translationVi: 'Rồng còn ẩn, chưa nên ra tay.',
        modernAdvice: 'Giai đoạn đầu cần tích lũy âm thầm. Chưa phải lúc thể hiện tài năng công khai.',
        warning: 'Hành động quá sớm sẽ thất bại vì chưa đủ điều kiện.',
        reflectionQuestion: 'Bạn đã chuẩn bị đủ nền tảng chưa, hay đang nóng vội ra sân?',
      },
      {
        lineNo: 2,
        originalText: '見龍在田，利見大人。(Kiến long tại điền, lợi kiến đại nhân.)',
        translationVi: 'Rồng xuất hiện trên đồng, lợi khi gặp bậc đại nhân.',
        modernAdvice: 'Đây là lúc kết nối với mentor, cố vấn hoặc người có kinh nghiệm.',
        warning: 'Đừng cố làm một mình — hãy tìm kiếm sự hướng dẫn.',
        reflectionQuestion: 'Ai là người bạn có thể học hỏi hoặc nhờ tư vấn lúc này?',
      },
      {
        lineNo: 3,
        originalText: '君子終日乾乾，夕惕若，厲無咎。',
        translationVi: 'Người quân tử suốt ngày cố gắng, tối vẫn cảnh giác, nguy nhưng không lỗi.',
        modernAdvice: 'Giai đoạn căng thẳng — cần làm việc chăm chỉ nhưng đừng quên tự kiểm tra bản thân.',
        warning: 'Dễ kiêu ngạo khi đạt được kết quả — hãy giữ sự khiêm tốn.',
        reflectionQuestion: 'Bạn có đang tự đánh giá lại hành động của mình mỗi ngày không?',
      },
      {
        lineNo: 4,
        originalText: '或躍在淵，無咎。(Hoặc dược tại uyên, vô cữu.)',
        translationVi: 'Có thể nhảy vọt hoặc lùi lại nước sâu — không lỗi.',
        modernAdvice: 'Thời điểm có hai lựa chọn: tiến mạnh hoặc chờ đợi. Cả hai đều hợp lý nếu có cân nhắc kỹ.',
        reflectionQuestion: 'Tiến hay đợi — bạn đã cân nhắc đủ yếu tố chưa?',
      },
      {
        lineNo: 5,
        originalText: '飛龍在天，利見大人。(Phi long tại thiên, lợi kiến đại nhân.)',
        translationVi: 'Rồng bay trên trời — hào vị tốt nhất, lợi khi gặp đại nhân.',
        modernAdvice: 'Đỉnh cao của thời kỳ thịnh vượng. Nên hợp tác với người tài năng để tạo ra giá trị lớn hơn.',
        warning: 'Vị trí cao dễ cô đơn — đừng xa rời những người đã đồng hành.',
        reflectionQuestion: 'Ở vị trí tốt hiện tại, bạn đang dùng ảnh hưởng của mình để giúp ai?',
      },
      {
        lineNo: 6,
        originalText: '亢龍有悔。(Kháng long hữu hối.)',
        translationVi: 'Rồng lên quá cao — sẽ hối hận.',
        modernAdvice: 'Cảnh báo về sự kiêu ngạo và quá đà. Cần biết điểm dừng đúng lúc.',
        warning: 'Tiếp tục leo lên mà không nhìn lại sẽ dẫn đến sụp đổ.',
        reflectionQuestion: 'Bạn có đang bỏ qua những dấu hiệu cảnh báo vì quá tự tin không?',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Quẻ 2 — Thuần Khôn (坤為地)
  // ──────────────────────────────────────────────────────────────────────────
  {
    no: 2,
    name: 'Thuần Khôn',
    upper: '000',
    lower: '000',
    chineseName: '坤為地',
    pinyin: 'Kūn wéi Dì',
    symbol: '䷁',
    relatedElement: 'Thổ',
    keywords: ['tiếp nhận', 'nuôi dưỡng', 'kiên nhẫn', 'khiêm tốn', 'bền bỉ', 'phụng sự'],
    judgment:
      'Thuần Khôn: Nguyên hanh, lợi trinh. Người quân tử có nơi để đi. ' +
      'Đi trước thì lạc đường, đi sau thì đắc lợi chủ. Lợi ở Tây Nam được bạn, Đông Bắc mất bạn.',
    image:
      'Thế đất rộng lớn — người quân tử lấy đức dày để nâng đỡ vạn vật.',
    overallMeaning:
      'Thuần Khôn là năng lượng âm thuần túy — tiếp nhận, nuôi dưỡng và kiên nhẫn. ' +
      'Đây không phải lúc dẫn đầu mà là lúc hỗ trợ, bổ sung và chuẩn bị nền móng. ' +
      'Kết quả tốt đến từ sự bền bỉ và khiêm tốn, không phải từ hành động gấp.',
    workMeaning:
      'Nên đóng vai trò hỗ trợ, thực thi thay vì lãnh đạo lúc này. ' +
      'Làm tốt những việc nhỏ — đây là giai đoạn tích lũy uy tín.',
    loveMeaning:
      'Tình cảm cần thời gian vun đắp. Hãy cho đi mà không tính toán. ' +
      'Sự quan tâm chân thành và kiên nhẫn sẽ tạo nền tảng bền vững.',
    financeMeaning:
      'Không phải thời điểm mạo hiểm hay đầu tư lớn. Tiết kiệm, bảo tồn và chờ đợi cơ hội rõ ràng hơn.',
    healthNote:
      'Chú ý hệ tiêu hóa và vấn đề liên quan đến dạ dày, đất. Nghỉ ngơi đủ giấc. ' +
      '(Tham khảo — không thay thế ý kiến y tế.)',
    lines: [
      {
        lineNo: 1,
        originalText: '履霜，堅冰至。(Lý sương, kiên băng chí.)',
        translationVi: 'Dẫm sương — băng cứng sắp đến.',
        modernAdvice: 'Nhận ra dấu hiệu sớm. Một vấn đề nhỏ bây giờ có thể thành lớn nếu không chú ý.',
        warning: 'Đừng bỏ qua những tín hiệu nhỏ trong cuộc sống hoặc công việc.',
        reflectionQuestion: 'Bạn có đang cố tình lờ đi một dấu hiệu cảnh báo nào không?',
      },
      {
        lineNo: 2,
        originalText: '直方大，不習，無不利。',
        translationVi: 'Thẳng thắn, vuông vắn, rộng lớn — không cần học thêm, chẳng có gì bất lợi.',
        modernAdvice: 'Lúc này cứ làm theo bản năng tốt đẹp và đức hạnh tự nhiên của mình.',
        reflectionQuestion: 'Bạn đang làm điều này vì đúng, hay vì lợi ích riêng?',
      },
      {
        lineNo: 3,
        originalText: '含章可貞。或從王事，無成，有終。',
        translationVi: 'Ẩn chứa vẻ đẹp bên trong, có thể bền. Phụng sự vua không cầu thành danh — rốt cuộc thành công.',
        modernAdvice: 'Làm tốt công việc âm thầm — đừng cần được ghi nhận ngay.',
        reflectionQuestion: 'Bạn có thể cống hiến mà không cần được công nhận không?',
      },
      {
        lineNo: 4,
        originalText: '括囊，無咎，無譽。(Quát nang, vô cữu, vô dự.)',
        translationVi: 'Buộc miệng túi — không lỗi, không tiếng khen.',
        modernAdvice: 'Thời điểm cần im lặng và kín đáo. Không phải lúc để tỏa sáng.',
        warning: 'Nói nhiều lúc này có thể gây hại.',
        reflectionQuestion: 'Bạn có đang nói hoặc chia sẻ nhiều hơn mức cần thiết không?',
      },
      {
        lineNo: 5,
        originalText: '黃裳，元吉。(Hoàng thường, nguyên cát.)',
        translationVi: 'Áo vàng — đại cát.',
        modernAdvice: 'Vị trí tốt nhất khi thể hiện đức hạnh mà không cạnh tranh. Khiêm tốn mang lại thành công thực sự.',
        reflectionQuestion: 'Bạn có thể ở vị trí tốt mà vẫn giữ được sự khiêm nhường không?',
      },
      {
        lineNo: 6,
        originalText: '龍戰于野，其血玄黃。',
        translationVi: 'Rồng chiến đấu ngoài đồng nội — máu đen vàng đổ xuống.',
        modernAdvice: 'Cảnh báo: âm cực thì phải đối đầu với dương. Xung đột xảy ra khi không còn nhường nhịn được.',
        warning: 'Nếu đã nhịn quá lâu, xung đột tích tụ có thể bùng phát — cần giải quyết sớm.',
        reflectionQuestion: 'Bạn có đang dồn nén cảm xúc hoặc mâu thuẫn thay vì giải quyết thẳng thắn?',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Quẻ 3 — Thủy Lôi Truân (水雷屯)
  // ──────────────────────────────────────────────────────────────────────────
  {
    no: 3,
    name: 'Thủy Lôi Truân',
    upper: '010',
    lower: '100',
    chineseName: '水雷屯',
    pinyin: 'Shuǐ Léi Zhūn',
    symbol: '䷂',
    relatedElement: 'Thủy',
    keywords: ['khó khởi đầu', 'gian nan ban đầu', 'kiên trì', 'tìm trợ giúp', 'vượt khó', 'mầm mống'],
    judgment:
      'Truân: Nguyên hanh lợi trinh. Chớ dùng hành hướng — lợi khi lập chư hầu.',
    image:
      'Mây và sấm — khởi đầu. Người quân tử lấy đó mà sắp xếp, dựng nền tảng.',
    overallMeaning:
      'Truân tượng trưng cho sự khó khăn ngay tại điểm khởi đầu — như mầm cây đang cố thoát khỏi lớp đất cứng. ' +
      'Đây không phải dấu hiệu thất bại mà là giai đoạn thử thách tự nhiên của mọi khởi đầu mới. ' +
      'Cần kiên nhẫn, tìm người hỗ trợ và không nên tự mình làm tất cả.',
    workMeaning:
      'Dự án hoặc kế hoạch đang gặp trở ngại ban đầu — đây là chuyện bình thường. ' +
      'Hãy tìm cộng sự hoặc người có kinh nghiệm thay vì cố làm một mình.',
    loveMeaning:
      'Mối quan hệ đang ở giai đoạn non nớt, nhiều hiểu lầm. Cần thời gian và giao tiếp thẳng thắn để xây dựng tin tưởng.',
    financeMeaning:
      'Chưa phải lúc đầu tư lớn. Giai đoạn này cần quản lý dòng tiền cẩn thận và tránh rủi ro không cần thiết.',
    healthNote:
      'Chú ý không để stress tích tụ khi gặp khó khăn liên tiếp. Chăm sóc giấc ngủ và tinh thần là ưu tiên. ' +
      '(Tham khảo — không thay thế ý kiến y tế.)',
    lines: [
      {
        lineNo: 1,
        originalText: '磐桓，利居貞，利建侯。',
        translationVi: 'Do dự, lưỡng lự — lợi khi giữ vững chí, lợi khi lập lãnh đạo.',
        modernAdvice: 'Giai đoạn đầu không chắc chắn là bình thường. Đừng từ bỏ, hãy tìm người dẫn đường.',
        reflectionQuestion: 'Bạn có đang tự làm khó mình bằng cách không chịu nhờ trợ giúp không?',
      },
      {
        lineNo: 2,
        originalText: '屯如邅如，乘馬班如。匪寇婚媾，女子貞不字，十年乃字。',
        translationVi: 'Truân chuyên, lưỡng lự — ngựa quanh quẩn. Không phải giặc mà muốn hôn nhân. Người nữ giữ tiết — mười năm sau mới có con.',
        modernAdvice: 'Cơ hội đến không đúng lúc — hãy chờ và giữ vững lập trường của mình.',
        warning: 'Đừng nhượng bộ vì áp lực khi thời điểm chưa chín muồi.',
        reflectionQuestion: 'Bạn có đang vội vàng kết thúc sự mơ hồ bằng một quyết định chưa đúng không?',
      },
      {
        lineNo: 3,
        originalText: '即鹿無虞，惟入于林中，君子幾不如舍，往吝。',
        translationVi: 'Đuổi nai không có người dẫn đường — lạc vào rừng. Người quân tử biết thì nên bỏ — cứ tiến sẽ hổ thẹn.',
        modernAdvice: 'Nếu không có đủ thông tin hoặc dẫn đường, tốt hơn là dừng lại hơn cố tiến mà lạc đường.',
        warning: 'Kiên trì mà thiếu định hướng khác với liều lĩnh thiếu khôn ngoan.',
        reflectionQuestion: 'Bạn có đang tiếp tục chỉ vì không muốn thừa nhận mình đi sai đường không?',
      },
      {
        lineNo: 4,
        originalText: '乘馬班如，求婚媾，往吉，無不利。',
        translationVi: 'Ngựa lưỡng lự — cầu hôn, tiến thì tốt, không bất lợi.',
        modernAdvice: 'Lúc này nên chủ động tìm kiếm hợp tác hoặc liên minh. Đừng quá tự lập.',
        reflectionQuestion: 'Bạn đã sẵn sàng nhờ người khác giúp chưa?',
      },
      {
        lineNo: 5,
        originalText: '屯其膏，小貞吉，大貞凶。',
        translationVi: 'Tích lũy dư thừa — việc nhỏ giữ chí tốt, việc lớn giữ chí xấu.',
        modernAdvice: 'Giai đoạn này phù hợp với mục tiêu nhỏ, cụ thể. Tránh tham vọng quá lớn.',
        warning: 'Cẩn thận với việc tích trữ quá mức trong khi người xung quanh đang cần.',
        reflectionQuestion: 'Mục tiêu của bạn có thực tế với giai đoạn này không?',
      },
      {
        lineNo: 6,
        originalText: '乘馬班如，泣血漣如。',
        translationVi: 'Ngựa lưỡng lự mãi — khóc máu liên hồi.',
        modernAdvice: 'Nếu cứ do dự và không hành động, cơ hội sẽ qua đi và hậu quả sẽ nặng nề.',
        warning: 'Thời điểm để quyết định — tiếp tục mãi trạng thái treo lơ lửng gây kiệt sức.',
        reflectionQuestion: 'Bạn đang trì hoãn quyết định gì mà biết là cần phải đưa ra?',
      },
    ],
  },

  // TODO: Thêm 61 quẻ còn lại (quẻ 4–64) theo cùng schema HexagramFull.
  // Thứ tự ưu tiên: Quẻ hay tra nhất trong luận sự: 11, 12, 63, 64, 1, 2, thì đến các quẻ khác.
];

/**
 * Lookup helper: lấy HexagramFull theo số quẻ King Wen.
 * Trả về undefined nếu chưa có dữ liệu diễn giải.
 */
export function getHexagramFull(no: number): HexagramFull | undefined {
  return HEXAGRAMS_FULL.find((h) => h.no === no);
}
