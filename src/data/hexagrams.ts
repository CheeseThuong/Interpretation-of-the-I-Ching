import type { Hexagram } from '../types';

/**
 * All 64 hexagrams (King Wen sequence).
 * `upper` = upper trigram bits, `lower` = lower trigram bits.
 * Code is computed at runtime as lower + upper (6 bits, bottom-to-top).
 */
export const HEXAGRAMS: Hexagram[] = [
  { no: 1,  name: 'Thuần Càn',            upper: '111', lower: '111' },
  { no: 2,  name: 'Thuần Khôn',           upper: '000', lower: '000' },
  { no: 3,  name: 'Thủy Lôi Truân',       upper: '010', lower: '100' },
  { no: 4,  name: 'Sơn Thủy Mông',        upper: '001', lower: '010' },
  { no: 5,  name: 'Thủy Thiên Nhu',       upper: '010', lower: '111' },
  { no: 6,  name: 'Thiên Thủy Tụng',      upper: '111', lower: '010' },
  { no: 7,  name: 'Địa Thủy Sư',          upper: '000', lower: '010' },
  { no: 8,  name: 'Thủy Địa Tỷ',          upper: '010', lower: '000' },
  { no: 9,  name: 'Phong Thiên Tiểu Súc', upper: '011', lower: '111' },
  { no: 10, name: 'Thiên Trạch Lý',       upper: '111', lower: '110' },
  { no: 11, name: 'Địa Thiên Thái',       upper: '000', lower: '111' },
  { no: 12, name: 'Thiên Địa Bĩ',         upper: '111', lower: '000' },
  { no: 13, name: 'Thiên Hỏa Đồng Nhân',  upper: '111', lower: '101' },
  { no: 14, name: 'Hỏa Thiên Đại Hữu',    upper: '101', lower: '111' },
  { no: 15, name: 'Địa Sơn Khiêm',        upper: '000', lower: '001' },
  { no: 16, name: 'Lôi Địa Dự',           upper: '100', lower: '000' },
  { no: 17, name: 'Trạch Lôi Tùy',        upper: '110', lower: '100' },
  { no: 18, name: 'Sơn Phong Cổ',         upper: '001', lower: '011' },
  { no: 19, name: 'Địa Trạch Lâm',        upper: '000', lower: '110' },
  { no: 20, name: 'Phong Địa Quán',        upper: '011', lower: '000' },
  { no: 21, name: 'Hỏa Lôi Phệ Hạp',     upper: '101', lower: '100' },
  { no: 22, name: 'Sơn Hỏa Bí',           upper: '001', lower: '101' },
  { no: 23, name: 'Sơn Địa Bác',          upper: '001', lower: '000' },
  { no: 24, name: 'Địa Lôi Phục',         upper: '000', lower: '100' },
  { no: 25, name: 'Thiên Lôi Vô Vọng',    upper: '111', lower: '100' },
  { no: 26, name: 'Sơn Thiên Đại Súc',    upper: '001', lower: '111' },
  { no: 27, name: 'Sơn Lôi Di',           upper: '001', lower: '100' },
  { no: 28, name: 'Trạch Phong Đại Quá',  upper: '110', lower: '011' },
  { no: 29, name: 'Thuần Khảm',           upper: '010', lower: '010' },
  { no: 30, name: 'Thuần Ly',             upper: '101', lower: '101' },
  { no: 31, name: 'Trạch Sơn Hàm',        upper: '110', lower: '001' },
  { no: 32, name: 'Lôi Phong Hằng',       upper: '100', lower: '011' },
  { no: 33, name: 'Thiên Sơn Độn',        upper: '111', lower: '001' },
  { no: 34, name: 'Lôi Thiên Đại Tráng',  upper: '100', lower: '111' },
  { no: 35, name: 'Hỏa Địa Tấn',          upper: '101', lower: '000' },
  { no: 36, name: 'Địa Hỏa Minh Di',      upper: '000', lower: '101' },
  { no: 37, name: 'Phong Hỏa Gia Nhân',   upper: '011', lower: '101' },
  { no: 38, name: 'Hỏa Trạch Khuê',       upper: '101', lower: '110' },
  { no: 39, name: 'Thủy Sơn Kiển',        upper: '010', lower: '001' },
  { no: 40, name: 'Lôi Thủy Giải',        upper: '100', lower: '010' },
  { no: 41, name: 'Sơn Trạch Tổn',        upper: '001', lower: '110' },
  { no: 42, name: 'Phong Lôi Ích',         upper: '011', lower: '100' },
  { no: 43, name: 'Trạch Thiên Quải',      upper: '110', lower: '111' },
  { no: 44, name: 'Thiên Phong Cấu',       upper: '111', lower: '011' },
  { no: 45, name: 'Trạch Địa Tụy',         upper: '110', lower: '000' },
  { no: 46, name: 'Địa Phong Thăng',       upper: '000', lower: '011' },
  { no: 47, name: 'Trạch Thủy Khốn',       upper: '110', lower: '010' },
  { no: 48, name: 'Thủy Phong Tỉnh',       upper: '010', lower: '011' },
  { no: 49, name: 'Trạch Hỏa Cách',        upper: '110', lower: '101' },
  { no: 50, name: 'Hỏa Phong Đỉnh',        upper: '101', lower: '011' },
  { no: 51, name: 'Thuần Chấn',            upper: '100', lower: '100' },
  { no: 52, name: 'Thuần Cấn',             upper: '001', lower: '001' },
  { no: 53, name: 'Phong Sơn Tiệm',        upper: '011', lower: '001' },
  { no: 54, name: 'Lôi Trạch Quy Muội',    upper: '100', lower: '110' },
  { no: 55, name: 'Lôi Hỏa Phong',         upper: '100', lower: '101' },
  { no: 56, name: 'Hỏa Sơn Lữ',            upper: '101', lower: '001' },
  { no: 57, name: 'Thuần Tốn',             upper: '011', lower: '011' },
  { no: 58, name: 'Thuần Đoài',            upper: '110', lower: '110' },
  { no: 59, name: 'Phong Thủy Hoán',        upper: '011', lower: '010' },
  { no: 60, name: 'Thủy Trạch Tiết',        upper: '010', lower: '110' },
  { no: 61, name: 'Phong Trạch Trung Phu',  upper: '011', lower: '110' },
  { no: 62, name: 'Lôi Sơn Tiểu Quá',      upper: '100', lower: '001' },
  { no: 63, name: 'Thủy Hỏa Ký Tế',        upper: '010', lower: '101' },
  { no: 64, name: 'Hỏa Thủy Vị Tế',        upper: '101', lower: '010' },
];

// ============================================================
// PALACE SEQUENCES (Bát Cung / Nạp Giáp)
// ============================================================

/** Maps palace name → ordered hexagram numbers (Bản cung → Quy hồn) */
export const palaceSequences: Record<string, number[]> = {
  Càn:  [1, 44, 33, 12, 20, 23, 35, 14],
  Khảm: [29, 60, 3, 63, 49, 55, 36, 7],
  Cấn:  [52, 22, 26, 41, 38, 10, 61, 53],
  Chấn: [51, 16, 40, 32, 46, 48, 28, 17],
  Tốn:  [57, 9, 37, 42, 25, 21, 27, 18],
  Ly:   [30, 56, 50, 64, 4, 59, 6, 13],
  Khôn: [2, 24, 19, 11, 34, 43, 5, 8],
  Đoài: [58, 47, 45, 31, 39, 15, 62, 54],
};

export const palaceElements: Record<string, string> = {
  Càn:  'Kim',
  Đoài: 'Kim',
  Ly:   'Hỏa',
  Chấn: 'Mộc',
  Tốn:  'Mộc',
  Khảm: 'Thủy',
  Cấn:  'Thổ',
  Khôn: 'Thổ',
};

export const palaceStageNames = [
  'Bản cung', 'Nhất thế', 'Nhị thế', 'Tam thế',
  'Tứ thế',   'Ngũ thế',  'Du hồn',  'Quy hồn',
];

export const selfResponseByStage: Record<string, { self: number; response: number }> = {
  'Bản cung': { self: 6, response: 3 },
  'Nhất thế': { self: 1, response: 4 },
  'Nhị thế':  { self: 2, response: 5 },
  'Tam thế':  { self: 3, response: 6 },
  'Tứ thế':   { self: 4, response: 1 },
  'Ngũ thế':  { self: 5, response: 2 },
  'Du hồn':   { self: 4, response: 1 },
  'Quy hồn':  { self: 3, response: 6 },
};

// ============================================================
// NAJIA (Nạp Giáp Can Chi mapping)
// ============================================================

export const najia: Record<string, { inner: string[]; outer: string[] }> = {
  '111': { inner: ['Giáp Tý', 'Giáp Dần', 'Giáp Thìn'], outer: ['Nhâm Ngọ', 'Nhâm Thân', 'Nhâm Tuất'] },
  '000': { inner: ['Ất Mùi', 'Ất Tỵ', 'Ất Mão'],       outer: ['Quý Sửu', 'Quý Hợi', 'Quý Dậu']     },
  '010': { inner: ['Mậu Dần', 'Mậu Thìn', 'Mậu Ngọ'],  outer: ['Mậu Thân', 'Mậu Tuất', 'Mậu Tý']    },
  '101': { inner: ['Kỷ Mão', 'Kỷ Sửu', 'Kỷ Hợi'],      outer: ['Kỷ Dậu', 'Kỷ Mùi', 'Kỷ Tỵ']        },
  '100': { inner: ['Canh Tý', 'Canh Dần', 'Canh Thìn'], outer: ['Canh Ngọ', 'Canh Thân', 'Canh Tuất'] },
  '011': { inner: ['Tân Sửu', 'Tân Hợi', 'Tân Dậu'],   outer: ['Tân Mùi', 'Tân Tỵ', 'Tân Mão']      },
  '001': { inner: ['Bính Thìn', 'Bính Ngọ', 'Bính Thân'], outer: ['Bính Tuất', 'Bính Tý', 'Bính Dần'] },
  '110': { inner: ['Đinh Tỵ', 'Đinh Mão', 'Đinh Sửu'], outer: ['Đinh Hợi', 'Đinh Dậu', 'Đinh Mùi']  },
};

// ============================================================
// RANDOM READING THEMES
// ============================================================

export const hexagramThemes: string[] = [
  'Khởi đầu có lực nhưng cần giữ chính đạo.',
  'Thời điểm thuận để tích lũy, chưa nên ép kết quả.',
  'Có cơ hội mở ra nếu giao tiếp rõ ràng.',
  'Việc đang có biến động, nên đi từng bước nhỏ.',
  'Cần nhìn lại động cơ trước khi quyết định.',
  'Được lợi khi hợp tác thay vì làm một mình.',
  'Nên chờ thêm dữ kiện, tránh quyết theo cảm xúc.',
  'Có thể tiến, nhưng phải đặt giới hạn rủi ro.',
  'Hợp với hướng lâu dài hơn là lợi ích nhanh.',
  'Dấu hiệu cho thấy cần thay đổi cách tiếp cận.',
  'Nên đơn giản hóa vấn đề để thấy trọng tâm.',
  'Kết quả tốt nếu giữ sự khiêm tốn và bền bỉ.',
];
