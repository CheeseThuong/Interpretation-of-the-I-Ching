import type { TarotCard, TarotSpread } from '../types/tarot';

export const SPREADS: TarotSpread[] = [
  {
    id: 'daily',
    name: 'Lá Bài Hôm Nay',
    description: 'Rút một lá để nhận thông điệp, năng lượng và điều nên chú ý trong ngày.',
    cardCount: 1,
    positions: ['Thông điệp hôm nay']
  },
  {
    id: 'one-card',
    name: 'Một Lá Bài (One Card)',
    description: 'Trải bài đơn giản nhất để có câu trả lời trực tiếp hoặc thông điệp cho ngày mới.',
    cardCount: 1,
    positions: ['Thông điệp chính']
  },
  {
    id: 'three-cards',
    name: 'Quá Khứ - Hiện Tại - Tương Lai',
    description: 'Trải bài 3 lá kinh điển để nhìn nhận dòng chảy thời gian của một sự việc.',
    cardCount: 3,
    positions: ['Quá Khứ', 'Hiện Tại', 'Tương Lai']
  },
  {
    id: 'love',
    name: 'Tình Yêu (Love Connection)',
    description: 'Phân tích mối quan hệ giữa bạn và người ấy.',
    cardCount: 3,
    positions: ['Bạn', 'Người Ấy', 'Kết Nối/Tương Lai']
  },
  {
    id: 'yes-no',
    name: 'Có hoặc Không (Yes/No)',
    description: 'Trải bài nhanh gọn giúp bạn đưa ra quyết định dứt khoát.',
    cardCount: 1,
    positions: ['Câu trả lời']
  },
  {
    id: 'five-cards',
    name: 'Trải Bài 5 Lá',
    description: 'Phân tích sâu tình huống, trở ngại, điều ẩn sau, lời khuyên và xu hướng kết quả.',
    cardCount: 5,
    positions: [
      'Tình huống hiện tại',
      'Điều đang cản trở',
      'Điều bị che khuất',
      'Lời khuyên',
      'Xu hướng kết quả'
    ]
  }
];

export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 'm00',
    name: 'The Fool',
    nameVi: 'Kẻ Khờ',
    suit: 'Major',
    value: 0,
    imageSlug: 'the-fool',
    image: '/tarot/rws/the-fool.jpg',
    symbol: '✧',
    keywordsUpright: ['Khởi đầu mới', 'Ngây thơ', 'Tự do', 'Phiêu lưu'],
    keywordsReversed: ['Bất cẩn', 'Ngây ngô', 'Rủi ro', 'Thiếu suy nghĩ'],
    meaningUpright: 'The Fool đại diện cho những khởi đầu mới, mang theo niềm tin thuần khiết vào vũ trụ. Hãy sẵn sàng dấn bước vào hành trình chưa biết.',
    meaningReversed: 'Bạn đang do dự trước một quyết định quan trọng hoặc đang hành động quá khinh suất mà không lường trước hậu quả.'
  },
  {
    id: 'm01',
    name: 'The Magician',
    nameVi: 'Pháp Sư',
    suit: 'Major',
    value: 1,
    imageSlug: 'the-magician',
    image: '/tarot/rws/the-magician.jpg',
    symbol: '⚡',
    keywordsUpright: ['Sức mạnh', 'Kỹ năng', 'Tập trung', 'Hành động'],
    keywordsReversed: ['Thao túng', 'Kế hoạch kém', 'Tài năng tiềm ẩn'],
    meaningUpright: 'Bạn có đủ mọi công cụ và nguồn lực trong tay để biến ước mơ thành hiện thực. Đây là lúc hành động quyết liệt.',
    meaningReversed: 'Có thể bạn đang bị lợi dụng hoặc chưa phát huy hết tiềm năng thực sự của mình.'
  },
  {
    id: 'm02',
    name: 'The High Priestess',
    nameVi: 'Nữ Tư Tế',
    suit: 'Major',
    value: 2,
    imageSlug: 'the-high-priestess',
    image: '/tarot/rws/the-high-priestess.jpg',
    symbol: '☾',
    keywordsUpright: ['Trực giác', 'Vô thức', 'Tiếng nói nội tâm'],
    keywordsReversed: ['Giấu giếm', 'Mất kết nối', 'Phớt lờ trực giác'],
    meaningUpright: 'Hãy lắng nghe tiếng nói sâu thẳm bên trong. Câu trả lời bạn tìm kiếm không nằm ở thế giới bên ngoài mà ẩn chứa trong vô thức của bạn.',
    meaningReversed: 'Bạn đang bị xao lãng bởi những ồn ào xung quanh và từ chối lắng nghe trực giác của chính mình.'
  },
  {
    id: 'm03',
    name: 'The Empress',
    nameVi: 'Nữ Hoàng',
    suit: 'Major',
    value: 3,
    imageSlug: 'the-empress',
    image: '/tarot/rws/the-empress.jpg',
    symbol: '⚘',
    keywordsUpright: ['Nuôi dưỡng', 'Mẹ', 'Sinh sôi', 'Trù phú'],
    keywordsReversed: ['Phụ thuộc', 'Kìm hãm', 'Thiếu chăm sóc bản thân'],
    meaningUpright: 'Năng lượng của tình yêu thương, sự trù phú và sáng tạo đang bao quanh bạn. Hãy kết nối với thiên nhiên và chăm sóc những người thân yêu.',
    meaningReversed: 'Có thể bạn đang cho đi quá nhiều mà quên mất việc yêu thương bản thân, hoặc đang trở nên bảo bọc quá mức.'
  },
  // Adding just a few more for the mock demo...
  {
    id: 'm06',
    name: 'The Lovers',
    nameVi: 'Người Tình',
    suit: 'Major',
    value: 6,
    imageSlug: 'the-lovers',
    image: '/tarot/rws/the-lovers.jpg',
    symbol: 'ᛦ',
    keywordsUpright: ['Tình yêu', 'Hòa hợp', 'Lựa chọn', 'Kết nối'],
    keywordsReversed: ['Bất hòa', 'Mất cân bằng', 'Lựa chọn sai lầm'],
    meaningUpright: 'Sự hòa hợp hoàn hảo và những quyết định quan trọng mang tính thiêng liêng từ trái tim.',
    meaningReversed: 'Có sự thiếu trung thực hoặc mất kết nối trong một mối quan hệ quan trọng.'
  },
  {
    id: 'm10',
    name: 'Wheel of Fortune',
    nameVi: 'Vòng Quay Số Phận',
    suit: 'Major',
    value: 10,
    imageSlug: 'wheel-of-fortune',
    image: '/tarot/rws/wheel-of-fortune.jpg',
    symbol: '❂',
    keywordsUpright: ['Định mệnh', 'Vận may', 'Chuyển biến', 'Chu kỳ'],
    keywordsReversed: ['Xui xẻo', 'Ngoài tầm kiểm soát', 'Kháng cự sự thay đổi'],
    meaningUpright: 'Bánh xe số phận đang quay. Những thay đổi bất ngờ mang ý nghĩa tích cực sắp đến. Mọi thứ đang diễn ra theo đúng an bài của vũ trụ.',
    meaningReversed: 'Cảm giác như mọi thứ đang tuột khỏi tầm tay. Hãy học cách chấp nhận sự thay đổi thay vì chống lại nó.'
  },
  {
    id: 'm17',
    name: 'The Star',
    nameVi: 'Ngôi Sao',
    suit: 'Major',
    value: 17,
    imageSlug: 'the-star',
    image: '/tarot/rws/the-star.jpg',
    symbol: '✨',
    keywordsUpright: ['Hy vọng', 'Niềm tin', 'Chữa lành', 'Định hướng'],
    keywordsReversed: ['Tuyệt vọng', 'Mất niềm tin', 'Bi quan'],
    meaningUpright: 'Ánh sáng của hy vọng và sự chữa lành. Vũ trụ đang lắng nghe và ban phước cho bạn.',
    meaningReversed: 'Bạn đang đánh mất hy vọng hoặc từ chối sự giúp đỡ từ vũ trụ.'
  },
  {
    id: 'm18',
    name: 'The Moon',
    nameVi: 'Mặt Trăng',
    suit: 'Major',
    value: 18,
    imageSlug: 'the-moon',
    image: '/tarot/rws/the-moon.jpg',
    symbol: '☽',
    keywordsUpright: ['Ảo ảnh', 'Sợ hãi', 'Trực giác', 'Tiềm thức'],
    keywordsReversed: ['Giải phóng', 'Sự thật hé lộ', 'Giảm bớt lo âu'],
    meaningUpright: 'Mọi thứ không như vẻ bề ngoài. Hãy cẩn thận với những ảo giác và lắng nghe trực giác thay vì nỗi sợ.',
    meaningReversed: 'Sự thật đang dần sáng tỏ, những nỗi sợ hãi vô hình đang dần tan biến.'
  },
  {
    id: 'm19',
    name: 'The Sun',
    nameVi: 'Mặt Trời',
    suit: 'Major',
    value: 19,
    imageSlug: 'the-sun',
    image: '/tarot/rws/the-sun.jpg',
    symbol: '☼',
    keywordsUpright: ['Niềm vui', 'Thành công', 'Lạc quan', 'Ấm áp'],
    keywordsReversed: ['Nỗi buồn tạm thời', 'Thiếu tự tin', 'Lạc quan thái quá'],
    meaningUpright: 'Ánh sáng của Mặt Trời mang lại sự rõ ràng, niềm vui và thành công rực rỡ. Đây là một trong những lá bài tích cực nhất của bộ bài.',
    meaningReversed: 'Đám mây đen tạm thời che khuất ánh sáng, nhưng Mặt Trời vẫn luôn ở đó. Đừng đánh mất niềm tin.'
  }
];

export const MOCK_DECK = [...MAJOR_ARCANA]; // Expand later with minor arcana
