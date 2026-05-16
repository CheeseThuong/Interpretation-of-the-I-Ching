import type { TarotCard, TarotSpread } from '../types/tarot';

export const SPREADS: TarotSpread[] = [
  {
    id: 'daily',
    name: 'Lá Bài Hôm Nay',
    description: 'Rút một lá để nhận thông điệp, năng lượng và điều nên chú ý trong ngày.',
    cardCount: 1,
    positions: ['Thông điệp hôm nay'],
    positionMeta: [
      {
        id: 'daily-message',
        label: 'Thông điệp hôm nay',
        functionDescription: 'Lá này phản ánh năng lượng chủ đạo của ngày hôm nay — tâm thế nên mang, điều nên chú ý và nhịp hành động phù hợp.',
        interpretationFocus: ['mood và năng lượng ngày', 'điều nên chú ý', 'điều nên tránh', 'câu chốt cho ngày'],
      }
    ]
  },
  {
    id: 'one-card',
    name: 'Một Lá Bài (One Card)',
    description: 'Trải bài đơn giản nhất để có câu trả lời trực tiếp hoặc thông điệp cho ngày mới.',
    cardCount: 1,
    positions: ['Thông điệp chính'],
    positionMeta: [
      {
        id: 'main-message',
        label: 'Thông điệp chính',
        functionDescription: 'Lá này trả lời trực tiếp câu hỏi của bạn — phản ánh năng lượng cốt lõi, tín hiệu hành động và góc nhìn biểu tượng cần nhớ.',
        interpretationFocus: ['câu trả lời trực tiếp', 'tín hiệu tiến/dừng', 'năng lượng cốt lõi', 'lời khuyên thực tế'],
      }
    ]
  },
  {
    id: 'three-cards',
    name: 'Quá Khứ - Hiện Tại - Tương Lai',
    description: 'Trải bài 3 lá kinh điển để nhìn nhận dòng chảy thời gian của một sự việc.',
    cardCount: 3,
    positions: ['Quá Khứ', 'Hiện Tại', 'Tương Lai'],
    positionMeta: [
      {
        id: 'past',
        label: 'Quá Khứ',
        functionDescription: 'Lá này cho thấy nền tảng, nguyên nhân hoặc tình huống trước đây đã tạo ra bối cảnh hiện tại.',
        interpretationFocus: ['nguyên nhân gốc rễ', 'ảnh hưởng từ trước', 'bài học chưa giải quyết'],
      },
      {
        id: 'present',
        label: 'Hiện Tại',
        functionDescription: 'Lá này mô tả trạng thái hiện tại, tâm thế của người hỏi và năng lượng đang bao phủ tình huống ngay lúc này.',
        interpretationFocus: ['hiện trạng', 'tâm lý người hỏi', 'bối cảnh chính đang diễn ra'],
      },
      {
        id: 'future',
        label: 'Tương Lai',
        functionDescription: 'Lá này chỉ ra xu hướng có thể xảy ra nếu tình hình tiếp tục theo hướng hiện tại — không phải định mệnh tuyệt đối.',
        interpretationFocus: ['hướng phát triển', 'kết quả khả thi', 'điều kiện để kết quả tốt/xấu'],
      }
    ]
  },
  {
    id: 'love',
    name: 'Tình Yêu (Love Connection)',
    description: 'Phân tích mối quan hệ giữa bạn và người ấy.',
    cardCount: 3,
    positions: ['Bạn', 'Người Ấy', 'Kết Nối/Tương Lai'],
    positionMeta: [
      {
        id: 'you',
        label: 'Bạn',
        functionDescription: 'Lá này phản ánh năng lượng, tâm thế và cảm xúc hiện tại của bạn trong mối quan hệ này.',
        interpretationFocus: ['cảm xúc nội tâm', 'mong muốn thực sự', 'tâm thế giao tiếp'],
      },
      {
        id: 'them',
        label: 'Người Ấy',
        functionDescription: 'Lá này gợi ý về năng lượng và trạng thái của người kia — không phải đọc tâm, mà là tín hiệu biểu tượng.',
        interpretationFocus: ['tín hiệu từ phía họ', 'tâm thế của họ', 'điều họ có thể đang trải qua'],
      },
      {
        id: 'connection',
        label: 'Kết Nối / Tương Lai',
        functionDescription: 'Lá này cho thấy mối liên kết giữa hai người và hướng phát triển có thể xảy ra.',
        interpretationFocus: ['chất lượng kết nối', 'hướng phát triển', 'điều kiện để mối quan hệ tiến triển'],
      }
    ]
  },
  {
    id: 'yes-no',
    name: 'Có hoặc Không (Yes/No)',
    description: 'Trải bài nhanh gọn giúp bạn đưa ra quyết định dứt khoát.',
    cardCount: 1,
    positions: ['Câu trả lời'],
    positionMeta: [
      {
        id: 'answer',
        label: 'Câu trả lời',
        functionDescription: 'Lá này đưa ra tín hiệu định hướng nhanh — xuôi thường nghiêng về có/tiến, ngược nghiêng về chờ/xem xét lại.',
        interpretationFocus: ['tín hiệu có/không', 'điều kiện đi kèm', 'rủi ro cần cân nhắc'],
      }
    ]
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
    ],
    positionMeta: [
      {
        id: 'current-situation',
        label: 'Tình huống hiện tại',
        functionDescription: 'Lá này mô tả trạng thái hiện tại của vấn đề, tâm thế của người hỏi, hoặc năng lượng đang bao phủ tình huống.',
        interpretationFocus: ['hiện trạng', 'tâm lý người hỏi', 'bối cảnh chính', 'năng lượng chủ đạo hiện tại'],
      },
      {
        id: 'obstacle',
        label: 'Điều đang cản trở',
        functionDescription: 'Lá này chỉ ra trở ngại, nỗi sợ, thói quen, điều kiện bên ngoài hoặc yếu tố đang khiến vấn đề khó tiến triển.',
        interpretationFocus: ['điểm nghẽn', 'rào cản nội tâm hoặc bên ngoài', 'sự thiếu rõ ràng', 'yếu tố làm chậm quyết định'],
      },
      {
        id: 'hidden-factor',
        label: 'Điều bị che khuất',
        functionDescription: 'Lá này cho thấy điều người hỏi chưa nhìn rõ, thông tin tiềm ẩn, cơ hội hoặc rủi ro chưa được đánh giá đủ.',
        interpretationFocus: ['điều chưa thấy', 'mặt ẩn của tình huống', 'tiềm năng hoặc rủi ro chìm', 'góc nhìn bị bỏ sót'],
      },
      {
        id: 'advice',
        label: 'Lời khuyên',
        functionDescription: 'Lá này đưa ra thái độ hoặc hướng hành động nên cân nhắc dựa trên những gì các lá trước đã tiết lộ.',
        interpretationFocus: ['nên làm gì', 'nên tiếp cận ra sao', 'nhịp hành động', 'thái độ phù hợp'],
      },
      {
        id: 'likely-trend',
        label: 'Xu hướng kết quả',
        functionDescription: 'Lá này cho thấy xu hướng nếu tình hình tiếp tục theo hướng hiện tại. Không phải định mệnh tuyệt đối — là chiều hướng khả thi.',
        interpretationFocus: ['hướng phát triển', 'khả năng kết quả', 'điều kiện để kết quả tốt', 'rủi ro nếu không thay đổi'],
      }
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
