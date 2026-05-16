import type { Trigram } from '../types';

/**
 * 8 trigrams (Bát Quái) indexed by their 3-bit binary string.
 * "1" = yang line, "0" = yin line (top-to-bottom read = bit[2]bit[1]bit[0])
 */
export const trigramByBits: Record<string, Trigram> = {
  '111': { bits: '111', name: 'Càn',  symbol: '☰', nature: 'Trời',  tone: 'chủ động, mạnh mẽ, quyết đoán',        element: 'Kim'  },
  '110': { bits: '110', name: 'Đoài', symbol: '☱', nature: 'Đầm',   tone: 'giao tiếp, niềm vui, mềm dẻo',         element: 'Kim'  },
  '101': { bits: '101', name: 'Ly',   symbol: '☲', nature: 'Lửa',   tone: 'sáng rõ, danh tiếng, nhận thức',        element: 'Hỏa' },
  '100': { bits: '100', name: 'Chấn', symbol: '☳', nature: 'Sấm',   tone: 'khởi động, biến chuyển, hành động',     element: 'Mộc' },
  '011': { bits: '011', name: 'Tốn',  symbol: '☴', nature: 'Gió',   tone: 'thẩm thấu, linh hoạt, kiên nhẫn',       element: 'Mộc' },
  '010': { bits: '010', name: 'Khảm', symbol: '☵', nature: 'Nước',  tone: 'rủi ro, chiều sâu, cần thận trọng',     element: 'Thủy'},
  '001': { bits: '001', name: 'Cấn',  symbol: '☶', nature: 'Núi',   tone: 'dừng lại, ổn định, quan sát',           element: 'Thổ' },
  '000': { bits: '000', name: 'Khôn', symbol: '☷', nature: 'Đất',   tone: 'tiếp nhận, nuôi dưỡng, thực tế',        element: 'Thổ' },
};

export const trigrams: Trigram[] = Object.values(trigramByBits);
