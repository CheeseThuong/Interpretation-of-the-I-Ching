/**
 * tarotDeck.ts
 * Full 78-card Rider-Waite-Smith deck + safe shuffle/draw helpers.
 * Fixes: deck was only 9 cards; shuffle used biased .sort(Math.random).
 */
import type { TarotCard, DrawnCard, TarotSpread } from '../types/tarot';

// ─── Crypto-safe random [0, 1) ───────────────────────────────────────────────
function secureRandom(): number {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    return buf[0] / (0xffffffff + 1);
  }
  return Math.random();
}

// ─── Fisher-Yates in-place shuffle ───────────────────────────────────────────
export function shuffleTarotDeck(deck: TarotCard[]): TarotCard[] {
  const a = [...deck];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandom() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Draw n unique cards from a freshly shuffled deck ────────────────────────
export function drawTarotCards(
  deck: TarotCard[],
  count: number,
  spread: TarotSpread
): DrawnCard[] {
  const shuffled = shuffleTarotDeck(deck);
  return shuffled.slice(0, count).map((card, i) => ({
    card,
    isReversed: secureRandom() > 0.6, // ~40% reversed
    positionName: spread.positions[i] ?? `Lá ${i + 1}`,
  }));
}

// ─── Full 78-card deck ────────────────────────────────────────────────────────

const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'] as const;

const SUIT_VI: Record<string, string> = {
  Wands: 'Gậy', Cups: 'Chén', Swords: 'Kiếm', Pentacles: 'Đồng Tiền',
};

const SUIT_THEME: Record<typeof SUITS[number], {
  domain: string;
  uprightFocus: string;
  reversedFocus: string;
}> = {
  Wands: {
    domain: 'động lực, ham muốn, sáng tạo và nhịp hành động',
    uprightFocus: 'chủ động, nhiệt huyết và dám mở đường',
    reversedFocus: 'nóng vội, cạn năng lượng hoặc hành động thiếu hướng',
  },
  Cups: {
    domain: 'cảm xúc, tình yêu, trực giác và sự kết nối',
    uprightFocus: 'mở lòng, cảm thông và nuôi dưỡng cảm xúc',
    reversedFocus: 'cảm xúc tắc nghẽn, kỳ vọng mơ hồ hoặc thiếu ranh giới',
  },
  Swords: {
    domain: 'suy nghĩ, giao tiếp, sự thật và quyết định',
    uprightFocus: 'nhìn thẳng sự thật, nói rõ và chọn bằng lý trí',
    reversedFocus: 'rối trí, tránh né đối thoại hoặc tự làm đau bằng suy diễn',
  },
  Pentacles: {
    domain: 'an toàn, giá trị, tiền bạc, thân thể và cam kết thực tế',
    uprightFocus: 'ổn định, xây nền và kiểm chứng bằng hành động cụ thể',
    reversedFocus: 'bám giữ, thiếu an toàn, lệ thuộc hoặc mất nhịp thực tế',
  },
};

const RANK_THEME: Record<number, {
  keywordsUpright: string[];
  keywordsReversed: string[];
  upright: string;
  reversed: string;
}> = {
  1: {
    keywordsUpright: ['Khởi đầu', 'Cơ hội', 'Hạt giống mới'],
    keywordsReversed: ['Chậm khởi động', 'Cơ hội chưa chín', 'Thiếu tin tưởng'],
    upright: 'mở ra một hạt giống mới cần được nhận ra và nuôi dưỡng đúng lúc',
    reversed: 'cho thấy cơ hội có thật nhưng chưa đủ điều kiện, hoặc người hỏi chưa sẵn sàng đón nhận',
  },
  2: {
    keywordsUpright: ['Cân bằng', 'Lựa chọn', 'Điều phối'],
    keywordsReversed: ['Dao động', 'Quá tải', 'Thiếu ưu tiên'],
    upright: 'đòi hỏi cân bằng giữa hai phía, hai nhu cầu hoặc hai nhịp phát triển',
    reversed: 'cho thấy sự dao động và cần giảm nhiễu trước khi chọn hướng',
  },
  3: {
    keywordsUpright: ['Tăng trưởng', 'Hợp tác', 'Mở rộng'],
    keywordsReversed: ['Thiếu phối hợp', 'Chậm tiến', 'Kỳ vọng lệch'],
    upright: 'đưa tình huống sang giai đoạn hợp tác, biểu lộ hoặc phát triển rõ hơn',
    reversed: 'cho thấy sự phối hợp chưa ăn khớp hoặc kỳ vọng của các bên chưa cùng nhịp',
  },
  4: {
    keywordsUpright: ['Ổn định', 'Giữ gìn', 'Ranh giới'],
    keywordsReversed: ['Bám giữ', 'Nới kiểm soát', 'Sợ mất an toàn'],
    upright: 'nhấn mạnh nhu cầu ổn định, ranh giới và bảo vệ điều đã có',
    reversed: 'cho thấy việc bám quá chặt, sợ mất an toàn, hoặc đang buộc phải học cách nới kiểm soát',
  },
  5: {
    keywordsUpright: ['Xung đột', 'Thử thách', 'Bất ổn'],
    keywordsReversed: ['Hạ nhiệt', 'Tránh xung đột', 'Học từ va chạm'],
    upright: 'đưa ra một điểm căng cần đối diện thay vì phủ nhận',
    reversed: 'cho thấy xung đột đang hạ nhiệt nhưng vẫn cần xử lý gốc rễ',
  },
  6: {
    keywordsUpright: ['Trao nhận', 'Hòa giải', 'Tiến triển'],
    keywordsReversed: ['Mất cân bằng', 'Một chiều', 'Nợ cảm xúc'],
    upright: 'nói về sự trao nhận, hòa giải và khả năng tiến lên khi hai bên cùng góp phần',
    reversed: 'nhắc tới cán cân lệch, cho nhiều hơn nhận hoặc nhận mà không đáp lại',
  },
  7: {
    keywordsUpright: ['Đánh giá', 'Kiên trì', 'Phòng thủ'],
    keywordsReversed: ['Nghi ngờ', 'Mệt mỏi', 'Sai chiến lược'],
    upright: 'yêu cầu kiên trì nhưng cũng phải đánh giá lại chiến lược',
    reversed: 'cho thấy sự mệt mỏi, nghi ngờ hoặc cách tiếp cận hiện tại chưa hiệu quả',
  },
  8: {
    keywordsUpright: ['Nỗ lực', 'Chuyển động', 'Rèn luyện'],
    keywordsReversed: ['Tắc tiến độ', 'Lặp lỗi', 'Vội vàng'],
    upright: 'đẩy tình huống vào nhịp chuyển động, học hỏi hoặc cải thiện có kỷ luật',
    reversed: 'cảnh báo tiến độ bị kẹt, lặp lại lỗi cũ hoặc vội vàng mà thiếu chất lượng',
  },
  9: {
    keywordsUpright: ['Độc lập', 'Đỉnh điểm', 'Tự chủ'],
    keywordsReversed: ['Cô lập', 'Thiếu thỏa mãn', 'Phòng vệ'],
    upright: 'cho thấy thành quả cá nhân, sự tự chủ hoặc một cảm xúc đã gần đến đỉnh',
    reversed: 'cho thấy sự cô lập, phòng vệ hoặc thành quả chưa đem lại cảm giác đủ đầy',
  },
  10: {
    keywordsUpright: ['Hoàn tất', 'Gánh nặng', 'Chu kỳ'],
    keywordsReversed: ['Buông bớt', 'Quá tải', 'Chưa khép lại'],
    upright: 'đưa một chu kỳ đến điểm đầy đủ, cần nhìn cả thành quả lẫn gánh nặng',
    reversed: 'cho thấy cần buông bớt gánh nặng hoặc khép lại điều kéo dài quá lâu',
  },
  11: {
    keywordsUpright: ['Tin nhắn', 'Tò mò', 'Bước đầu'],
    keywordsReversed: ['Non nớt', 'Tin chưa rõ', 'Thiếu ổn định'],
    upright: 'mở ra tín hiệu ban đầu, lời nhắn hoặc sự tò mò cần được kiểm chứng',
    reversed: 'cho thấy tín hiệu chưa trưởng thành, dễ đổi hướng hoặc thiếu cam kết',
  },
  12: {
    keywordsUpright: ['Hành động', 'Theo đuổi', 'Dịch chuyển'],
    keywordsReversed: ['Bốc đồng', 'Chậm trễ', 'Thiếu nhất quán'],
    upright: 'đưa năng lượng vào chuyển động, theo đuổi và thử nghiệm',
    reversed: 'cảnh báo sự bốc đồng, thất thường hoặc thiếu nhất quán',
  },
  13: {
    keywordsUpright: ['Nuôi dưỡng', 'Trưởng thành', 'Cảm nhận sâu'],
    keywordsReversed: ['Lệ thuộc', 'Quá kiểm soát', 'Cạn cảm xúc'],
    upright: 'đại diện cho cách tiếp cận chín chắn, biết nuôi dưỡng và cảm nhận sâu',
    reversed: 'cho thấy sự lệ thuộc, kiểm soát quá mức hoặc cạn năng lượng chăm sóc',
  },
  14: {
    keywordsUpright: ['Làm chủ', 'Trách nhiệm', 'Định hướng'],
    keywordsReversed: ['Cứng nhắc', 'Lạm quyền', 'Thiếu trách nhiệm'],
    upright: 'đòi hỏi sự làm chủ, định hướng rõ và hành động có trách nhiệm',
    reversed: 'cảnh báo sự cứng nhắc, né trách nhiệm hoặc dùng quyền kiểm soát sai cách',
  },
};

const MINOR_VALUES = [
  { v: 1, name: 'Ace', nameVi: 'Át' },
  { v: 2, name: 'Two', nameVi: 'Hai' },
  { v: 3, name: 'Three', nameVi: 'Ba' },
  { v: 4, name: 'Four', nameVi: 'Bốn' },
  { v: 5, name: 'Five', nameVi: 'Năm' },
  { v: 6, name: 'Six', nameVi: 'Sáu' },
  { v: 7, name: 'Seven', nameVi: 'Bảy' },
  { v: 8, name: 'Eight', nameVi: 'Tám' },
  { v: 9, name: 'Nine', nameVi: 'Chín' },
  { v: 10, name: 'Ten', nameVi: 'Mười' },
  { v: 11, name: 'Page', nameVi: 'Hầu' },
  { v: 12, name: 'Knight', nameVi: 'Kỵ Sĩ' },
  { v: 13, name: 'Queen', nameVi: 'Hoàng Hậu' },
  { v: 14, name: 'King', nameVi: 'Vua' },
];

function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-');
}

function publicAssetPath(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base.replace(/\/?$/, '/')}${path.replace(/^\//, '')}`;
}

function tarotImage(slug: string): string {
  return publicAssetPath(`/tarot/rws/${slug}.jpg`);
}

function buildMinorArcana(): TarotCard[] {
  const cards: TarotCard[] = [];
  SUITS.forEach((suit) => {
    MINOR_VALUES.forEach(({ v, name, nameVi }) => {
      const fullName = `${name} of ${suit}`;
      const slug = slugify(fullName);
      const suitTheme = SUIT_THEME[suit];
      const rankTheme = RANK_THEME[v];
      cards.push({
        id: `${suit[0].toLowerCase()}${String(v).padStart(2, '0')}`,
        name: fullName,
        nameVi: `${nameVi} ${SUIT_VI[suit]}`,
        suit,
        value: v,
        imageSlug: slug,
        image: tarotImage(slug),
        symbol: '◆',
        keywordsUpright: [...rankTheme.keywordsUpright, suitTheme.uprightFocus],
        keywordsReversed: [...rankTheme.keywordsReversed, suitTheme.reversedFocus],
        meaningUpright: `${nameVi} ${SUIT_VI[suit]} trong hệ ${suitTheme.domain} ${rankTheme.upright}. Trong trải bài, lá này khuyên nhìn vào bằng chứng cụ thể và cách năng lượng đang được trao đổi.`,
        meaningReversed: `${nameVi} ${SUIT_VI[suit]} ngược trong hệ ${suitTheme.domain} ${rankTheme.reversed}. Cần nhận diện điểm kẹt thực tế trước khi kết luận hoặc hành động.`,
      });
    });
  });
  return cards;
}

export const MAJOR_ARCANA_FULL: TarotCard[] = [
  { id:'m00', name:'The Fool', nameVi:'Kẻ Khờ', suit:'Major', value:0, imageSlug:'the-fool', image:'/tarot/rws/the-fool.jpg', symbol:'✧', keywordsUpright:['Khởi đầu mới','Ngây thơ','Tự do','Phiêu lưu'], keywordsReversed:['Bất cẩn','Ngây ngô','Rủi ro','Thiếu suy nghĩ'], meaningUpright:'The Fool đại diện cho những khởi đầu mới, mang theo niềm tin thuần khiết vào vũ trụ. Hãy sẵn sàng dấn bước vào hành trình chưa biết.', meaningReversed:'Bạn đang do dự trước một quyết định quan trọng hoặc đang hành động quá khinh suất mà không lường trước hậu quả.' },
  { id:'m01', name:'The Magician', nameVi:'Pháp Sư', suit:'Major', value:1, imageSlug:'the-magician', image:'/tarot/rws/the-magician.jpg', symbol:'⚡', keywordsUpright:['Sức mạnh','Kỹ năng','Tập trung','Hành động'], keywordsReversed:['Thao túng','Kế hoạch kém','Tài năng tiềm ẩn'], meaningUpright:'Bạn có đủ mọi công cụ và nguồn lực trong tay để biến ước mơ thành hiện thực. Đây là lúc hành động quyết liệt.', meaningReversed:'Có thể bạn đang bị lợi dụng hoặc chưa phát huy hết tiềm năng thực sự của mình.' },
  { id:'m02', name:'The High Priestess', nameVi:'Nữ Tư Tế', suit:'Major', value:2, imageSlug:'the-high-priestess', image:'/tarot/rws/the-high-priestess.jpg', symbol:'☾', keywordsUpright:['Trực giác','Vô thức','Tiếng nói nội tâm'], keywordsReversed:['Giấu giếm','Mất kết nối','Phớt lờ trực giác'], meaningUpright:'Hãy lắng nghe tiếng nói sâu thẳm bên trong. Câu trả lời bạn tìm kiếm ẩn chứa trong vô thức của bạn.', meaningReversed:'Bạn đang bị xao lãng bởi những ồn ào xung quanh và từ chối lắng nghe trực giác của chính mình.' },
  { id:'m03', name:'The Empress', nameVi:'Nữ Hoàng', suit:'Major', value:3, imageSlug:'the-empress', image:'/tarot/rws/the-empress.jpg', symbol:'⚘', keywordsUpright:['Nuôi dưỡng','Mẹ','Sinh sôi','Trù phú'], keywordsReversed:['Phụ thuộc','Kìm hãm','Thiếu chăm sóc bản thân'], meaningUpright:'Năng lượng của tình yêu thương, sự trù phú và sáng tạo đang bao quanh bạn.', meaningReversed:'Có thể bạn đang cho đi quá nhiều mà quên mất việc yêu thương bản thân.' },
  { id:'m04', name:'The Emperor', nameVi:'Hoàng Đế', suit:'Major', value:4, imageSlug:'the-emperor', image:'/tarot/rws/the-emperor.jpg', symbol:'♜', keywordsUpright:['Quyền lực','Cấu trúc','Kỷ luật','Ổn định'], keywordsReversed:['Độc đoán','Cứng nhắc','Thiếu linh hoạt'], meaningUpright:'Sự lãnh đạo có nguyên tắc và nền tảng vững chắc là chìa khóa thành công.', meaningReversed:'Hãy tránh sự cứng nhắc và độc đoán trong việc kiểm soát mọi thứ.' },
  { id:'m05', name:'The Hierophant', nameVi:'Giáo Hoàng', suit:'Major', value:5, imageSlug:'the-hierophant', image:'/tarot/rws/the-hierophant.jpg', symbol:'✙', keywordsUpright:['Truyền thống','Niềm tin','Giáo dục','Cộng đồng'], keywordsReversed:['Nổi loạn','Phi truyền thống','Thay đổi niềm tin'], meaningUpright:'Tuân theo các nguyên tắc và học hỏi từ những người đi trước sẽ giúp bạn vững vàng.', meaningReversed:'Đã đến lúc thách thức những quy tắc cũ và tìm con đường riêng của mình.' },
  { id:'m06', name:'The Lovers', nameVi:'Người Tình', suit:'Major', value:6, imageSlug:'the-lovers', image:'/tarot/rws/the-lovers.jpg', symbol:'ᛦ', keywordsUpright:['Tình yêu','Hòa hợp','Lựa chọn','Kết nối'], keywordsReversed:['Bất hòa','Mất cân bằng','Lựa chọn sai lầm'], meaningUpright:'Sự hòa hợp hoàn hảo và những quyết định quan trọng mang tính thiêng liêng từ trái tim.', meaningReversed:'Có sự thiếu trung thực hoặc mất kết nối trong một mối quan hệ quan trọng.' },
  { id:'m07', name:'The Chariot', nameVi:'Cỗ Xe', suit:'Major', value:7, imageSlug:'the-chariot', image:'/tarot/rws/the-chariot.jpg', symbol:'⚔', keywordsUpright:['Ý chí','Kiểm soát','Chiến thắng','Quyết tâm'], keywordsReversed:['Mất kiểm soát','Hung hăng','Thiếu hướng đi'], meaningUpright:'Bạn đang trên đường đến chiến thắng. Hãy giữ vững ý chí và kiểm soát mọi tình huống.', meaningReversed:'Cảnh báo về sự mất kiểm soát hoặc hành động thiếu suy nghĩ.' },
  { id:'m08', name:'Strength', nameVi:'Sức Mạnh', suit:'Major', value:8, imageSlug:'strength', image:'/tarot/rws/strength.jpg', symbol:'♾', keywordsUpright:['Dũng cảm','Kiên nhẫn','Nội lực','Lòng trắc ẩn'], keywordsReversed:['Yếu đuối','Thiếu tự tin','Nghi ngờ bản thân'], meaningUpright:'Sức mạnh thực sự đến từ bên trong — từ lòng dũng cảm, sự kiên nhẫn và tình yêu thương.', meaningReversed:'Hãy chú ý đến những điểm yếu nội tâm và tìm cách vượt qua chúng.' },
  { id:'m09', name:'The Hermit', nameVi:'Ẩn Sĩ', suit:'Major', value:9, imageSlug:'the-hermit', image:'/tarot/rws/the-hermit.jpg', symbol:'🕯', keywordsUpright:['Nội tâm','Cô đơn','Trí tuệ','Dẫn đường'], keywordsReversed:['Cô lập','Từ chối sự giúp đỡ','Lạc đường'], meaningUpright:'Đây là thời điểm tìm kiếm sự yên tĩnh và soi sáng nội tâm thay vì tìm kiếm câu trả lời bên ngoài.', meaningReversed:'Sự cô lập quá mức có thể gây hại. Hãy cho phép bản thân kết nối lại với thế giới.' },
  { id:'m10', name:'Wheel of Fortune', nameVi:'Vòng Quay Số Phận', suit:'Major', value:10, imageSlug:'wheel-of-fortune', image:'/tarot/rws/wheel-of-fortune.jpg', symbol:'❂', keywordsUpright:['Định mệnh','Vận may','Chuyển biến','Chu kỳ'], keywordsReversed:['Xui xẻo','Ngoài tầm kiểm soát','Kháng cự sự thay đổi'], meaningUpright:'Bánh xe số phận đang quay. Những thay đổi bất ngờ mang ý nghĩa tích cực sắp đến.', meaningReversed:'Cảm giác như mọi thứ đang tuột khỏi tầm tay. Hãy học cách chấp nhận sự thay đổi.' },
  { id:'m11', name:'Justice', nameVi:'Công Lý', suit:'Major', value:11, imageSlug:'justice', image:'/tarot/rws/justice.jpg', symbol:'⚖', keywordsUpright:['Công bằng','Sự thật','Nhân quả','Cân bằng'], keywordsReversed:['Bất công','Thiên vị','Trốn tránh trách nhiệm'], meaningUpright:'Mọi hành động đều có hậu quả. Sự thật và công bằng sẽ được thực thi.', meaningReversed:'Cảnh giác với sự bất công hoặc thiếu trung thực trong tình huống hiện tại.' },
  { id:'m12', name:'The Hanged Man', nameVi:'Người Bị Treo', suit:'Major', value:12, imageSlug:'the-hanged-man', image:'/tarot/rws/the-hanged-man.jpg', symbol:'🔱', keywordsUpright:['Buông bỏ','Góc nhìn mới','Hy sinh','Chờ đợi'], keywordsReversed:['Trì hoãn','Kháng cự','Hy sinh vô nghĩa'], meaningUpright:'Đôi khi để tiến lên phía trước, bạn cần dừng lại và nhìn mọi thứ từ góc độ hoàn toàn khác.', meaningReversed:'Bạn đang chống lại sự thay đổi cần thiết. Hãy thử buông bỏ để thấy rõ hơn.' },
  { id:'m13', name:'Death', nameVi:'Cái Chết', suit:'Major', value:13, imageSlug:'death', image:'/tarot/rws/death.jpg', symbol:'☠', keywordsUpright:['Kết thúc','Chuyển đổi','Thay đổi','Tái sinh'], keywordsReversed:['Kháng cự thay đổi','Trì hoãn','Mắc kẹt'], meaningUpright:'Sự kết thúc của một giai đoạn và sự khởi đầu của điều gì đó mới mẻ và tốt đẹp hơn.', meaningReversed:'Bạn đang cố bám víu vào những thứ đã lỗi thời. Hãy dũng cảm buông bỏ.' },
  { id:'m14', name:'Temperance', nameVi:'Điều Độ', suit:'Major', value:14, imageSlug:'temperance', image:'/tarot/rws/temperance.jpg', symbol:'◎', keywordsUpright:['Cân bằng','Kiên nhẫn','Điều độ','Hòa hợp'], keywordsReversed:['Mất cân bằng','Thái quá','Thiếu kiên nhẫn'], meaningUpright:'Sự cân bằng và kiên nhẫn là chìa khóa. Hãy pha trộn mọi yếu tố một cách khéo léo.', meaningReversed:'Cảnh báo về sự thái quá hoặc mất cân bằng trong cuộc sống.' },
  { id:'m15', name:'The Devil', nameVi:'Ác Quỷ', suit:'Major', value:15, imageSlug:'the-devil', image:'/tarot/rws/the-devil.jpg', symbol:'♟', keywordsUpright:['Ràng buộc','Vật chất','Nghiện ngập','Ảo tưởng'], keywordsReversed:['Giải phóng','Vượt qua ràng buộc','Tự do'], meaningUpright:'Bạn đang bị ràng buộc bởi những thứ vật chất hoặc thói quen tiêu cực. Hãy nhận ra và phá vỡ chúng.', meaningReversed:'Bạn đang trên đường thoát khỏi những ràng buộc. Tự do đang đến gần.' },
  { id:'m16', name:'The Tower', nameVi:'Tháp Sụp Đổ', suit:'Major', value:16, imageSlug:'the-tower', image:'/tarot/rws/the-tower.jpg', symbol:'⚡', keywordsUpright:['Biến động','Sụp đổ','Thức tỉnh','Hỗn loạn'], keywordsReversed:['Tránh thảm họa','Sợ thay đổi','Trì hoãn'], meaningUpright:'Những thay đổi đột ngột và mạnh mẽ đang đến. Dù khó khăn nhưng đây là sự thức tỉnh cần thiết.', meaningReversed:'Bạn đang tránh né một sự thay đổi cần thiết. Điều đó chỉ kéo dài sự khổ sở.' },
  { id:'m17', name:'The Star', nameVi:'Ngôi Sao', suit:'Major', value:17, imageSlug:'the-star', image:'/tarot/rws/the-star.jpg', symbol:'✨', keywordsUpright:['Hy vọng','Niềm tin','Chữa lành','Định hướng'], keywordsReversed:['Tuyệt vọng','Mất niềm tin','Bi quan'], meaningUpright:'Ánh sáng của hy vọng và sự chữa lành. Vũ trụ đang lắng nghe và ban phước cho bạn.', meaningReversed:'Bạn đang đánh mất hy vọng hoặc từ chối sự giúp đỡ từ vũ trụ.' },
  { id:'m18', name:'The Moon', nameVi:'Mặt Trăng', suit:'Major', value:18, imageSlug:'the-moon', image:'/tarot/rws/the-moon.jpg', symbol:'☽', keywordsUpright:['Ảo ảnh','Sợ hãi','Trực giác','Tiềm thức'], keywordsReversed:['Giải phóng','Sự thật hé lộ','Giảm bớt lo âu'], meaningUpright:'Mọi thứ không như vẻ bề ngoài. Hãy cẩn thận với những ảo giác và lắng nghe trực giác thay vì nỗi sợ.', meaningReversed:'Sự thật đang dần sáng tỏ, những nỗi sợ hãi vô hình đang dần tan biến.' },
  { id:'m19', name:'The Sun', nameVi:'Mặt Trời', suit:'Major', value:19, imageSlug:'the-sun', image:'/tarot/rws/the-sun.jpg', symbol:'☼', keywordsUpright:['Niềm vui','Thành công','Lạc quan','Ấm áp'], keywordsReversed:['Nỗi buồn tạm thời','Thiếu tự tin','Lạc quan thái quá'], meaningUpright:'Ánh sáng của Mặt Trời mang lại sự rõ ràng, niềm vui và thành công rực rỡ.', meaningReversed:'Đám mây đen tạm thời che khuất ánh sáng, nhưng Mặt Trời vẫn luôn ở đó. Đừng đánh mất niềm tin.' },
  { id:'m20', name:'Judgement', nameVi:'Phán Xét', suit:'Major', value:20, imageSlug:'judgement', image:'/tarot/rws/judgement.jpg', symbol:'📯', keywordsUpright:['Thức tỉnh','Tái sinh','Tha thứ','Đánh giá lại'], keywordsReversed:['Tự phê bình','Nghi ngờ','Bỏ lỡ cơ hội'], meaningUpright:'Một sự thức tỉnh mạnh mẽ đang đến. Đây là cơ hội để đánh giá lại và đưa ra lựa chọn sáng suốt.', meaningReversed:'Hãy chú ý đến sự tự phê bình quá mức hoặc bỏ lỡ cơ hội quan trọng.' },
  { id:'m21', name:'The World', nameVi:'Thế Giới', suit:'Major', value:21, imageSlug:'the-world', image:'/tarot/rws/the-world.jpg', symbol:'🌐', keywordsUpright:['Hoàn thành','Thành tựu','Trọn vẹn','Hành trình'], keywordsReversed:['Chưa hoàn thành','Trì hoãn','Thiếu kết thúc'], meaningUpright:'Bạn đang ở đỉnh cao của một hành trình. Sự hoàn thành và thành tựu trọn vẹn đang chờ đón bạn.', meaningReversed:'Vẫn còn những việc chưa hoàn thành. Hãy kiên trì để đi đến đích.' },
];

export const FULL_TAROT_DECK: TarotCard[] = [
  ...MAJOR_ARCANA_FULL,
  ...buildMinorArcana(),
];

/** Create a fresh copy of the full 78-card deck (never mutates the original) */
export function createFreshTarotDeck(): TarotCard[] {
  return FULL_TAROT_DECK.map((card) => ({
    ...card,
    image: tarotImage(card.imageSlug),
  }));
}
