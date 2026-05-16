import type { FiveElementData, HeavenlyStem, EarthlyBranch } from '../types';

// ============================================================
// NGŨ HÀNH (Five Elements)
// ============================================================

export const fiveElements: FiveElementData[] = [
  {
    name: 'Kim',
    generates: 'Thủy',
    controls: 'Mộc',
    color: '#C0C0C0',
    direction: 'Tây',
    season: 'Thu',
    nature: 'Cứng rắn, trong sáng, dứt khoát, chính xác',
    shortInterpretation: 'Thời điểm cần quyết đoán và rõ ràng. Hành động có kỷ luật sẽ mang lại kết quả.',
  },
  {
    name: 'Mộc',
    generates: 'Hỏa',
    controls: 'Thổ',
    color: '#228B22',
    direction: 'Đông',
    season: 'Xuân',
    nature: 'Phát triển, linh hoạt, sáng tạo, hướng thượng',
    shortInterpretation: 'Thời điểm của sự khởi đầu và tăng trưởng. Phù hợp để gieo ý tưởng và mở rộng.',
  },
  {
    name: 'Thủy',
    generates: 'Mộc',
    controls: 'Hỏa',
    color: '#1E90FF',
    direction: 'Bắc',
    season: 'Đông',
    nature: 'Uyển chuyển, trí tuệ, thấm sâu, lưu động',
    shortInterpretation: 'Thời điểm cần suy nghĩ sâu và thích nghi. Không nên cứng nhắc, hãy chảy theo tình thế.',
  },
  {
    name: 'Hỏa',
    generates: 'Thổ',
    controls: 'Kim',
    color: '#FF4500',
    direction: 'Nam',
    season: 'Hạ',
    nature: 'Nhiệt tình, sáng rực, truyền cảm hứng, bùng phát',
    shortInterpretation: 'Thời điểm của sự bùng nổ và hiện diện mạnh mẽ. Tốt cho giao tiếp và thể hiện bản thân.',
  },
  {
    name: 'Thổ',
    generates: 'Kim',
    controls: 'Thủy',
    color: '#D2B48C',
    direction: 'Trung tâm',
    season: 'Giao mùa (cuối mỗi mùa)',
    nature: 'Ổn định, nuôi dưỡng, trung hòa, bao dung',
    shortInterpretation: 'Thời điểm củng cố nền tảng. Hãy chú trọng sự bền vững thay vì kết quả ngắn hạn.',
  },
];

// ============================================================
// THIÊN CAN (10 Heavenly Stems)
// ============================================================

export const heavenlyStems: HeavenlyStem[] = [
  { name: 'Giáp', polarity: 'Dương', element: 'Mộc'  },
  { name: 'Ất',   polarity: 'Âm',    element: 'Mộc'  },
  { name: 'Bính', polarity: 'Dương', element: 'Hỏa'  },
  { name: 'Đinh', polarity: 'Âm',    element: 'Hỏa'  },
  { name: 'Mậu',  polarity: 'Dương', element: 'Thổ'  },
  { name: 'Kỷ',   polarity: 'Âm',    element: 'Thổ'  },
  { name: 'Canh', polarity: 'Dương', element: 'Kim'  },
  { name: 'Tân',  polarity: 'Âm',    element: 'Kim'  },
  { name: 'Nhâm', polarity: 'Dương', element: 'Thủy' },
  { name: 'Quý',  polarity: 'Âm',    element: 'Thủy' },
];

// ============================================================
// ĐỊA CHI (12 Earthly Branches)
// ============================================================

export const earthlyBranches: EarthlyBranch[] = [
  { name: 'Tý',   polarity: 'Dương', element: 'Thủy', zodiac: 'Chuột'   },
  { name: 'Sửu',  polarity: 'Âm',    element: 'Thổ',  zodiac: 'Trâu'    },
  { name: 'Dần',  polarity: 'Dương', element: 'Mộc',  zodiac: 'Hổ'      },
  { name: 'Mão',  polarity: 'Âm',    element: 'Mộc',  zodiac: 'Mèo'     },
  { name: 'Thìn', polarity: 'Dương', element: 'Thổ',  zodiac: 'Rồng'    },
  { name: 'Tỵ',   polarity: 'Âm',    element: 'Hỏa',  zodiac: 'Rắn'     },
  { name: 'Ngọ',  polarity: 'Dương', element: 'Hỏa',  zodiac: 'Ngựa'    },
  { name: 'Mùi',  polarity: 'Âm',    element: 'Thổ',  zodiac: 'Dê'      },
  { name: 'Thân', polarity: 'Dương', element: 'Kim',  zodiac: 'Khỉ'     },
  { name: 'Dậu',  polarity: 'Âm',    element: 'Kim',  zodiac: 'Gà'      },
  { name: 'Tuất', polarity: 'Dương', element: 'Thổ',  zodiac: 'Chó'     },
  { name: 'Hợi',  polarity: 'Âm',    element: 'Thủy', zodiac: 'Lợn'     },
];

// ============================================================
// BRANCH ELEMENTS (lookup map)
// ============================================================

export const branchElements: Record<string, string> = Object.fromEntries(
  earthlyBranches.map((b) => [b.name, b.element]),
);

// ============================================================
// SIX BEASTS (Lục Thú / Lục Thần)
// ============================================================

export const beastOrder = ['Thanh Long', 'Chu Tước', 'Câu Trần', 'Đằng Xà', 'Bạch Hổ', 'Huyền Vũ'];

export const beastStartByDayStem: Record<string, number> = {
  'Giáp': 0, 'Ất': 0,
  'Bính': 1, 'Đinh': 1,
  'Mậu':  2,
  'Kỷ':   3,
  'Canh': 4, 'Tân': 4,
  'Nhâm': 5, 'Quý': 5,
};
