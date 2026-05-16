import type { BatTuChart } from '../types';
import { heavenlyStems, earthlyBranches } from './canchi';

/**
 * Example mock chart for demonstration only.
 * TODO: Replace with real calculation algorithm.
 *
 * To compute a real BatTu chart you need:
 * 1. Convert Gregorian date → Chinese calendar year (see lookup tables or library)
 * 2. Determine the month pillar from solar terms (tiết khí)
 * 3. Determine the day pillar via 60-cycle counting
 * 4. Determine the hour pillar based on 2-hour intervals (giờ địa chi)
 */
export const MOCK_BAT_TU_CHART: BatTuChart = {
  year: {
    stem: heavenlyStems[0],   // Giáp - Mộc Dương
    branch: earthlyBranches[2], // Dần - Mộc Dương
    element: 'Mộc',
    polarity: 'Dương',
  },
  month: {
    stem: heavenlyStems[4],   // Mậu - Thổ Dương
    branch: earthlyBranches[3], // Mão - Mộc Âm
    element: 'Thổ',
    polarity: 'Dương',
  },
  day: {
    stem: heavenlyStems[7],   // Tân - Kim Âm
    branch: earthlyBranches[9], // Dậu - Kim Âm
    element: 'Kim',
    polarity: 'Âm',
  },
  hour: {
    stem: heavenlyStems[1],   // Ất - Mộc Âm
    branch: earthlyBranches[0], // Tý - Thủy Dương
    element: 'Mộc',
    polarity: 'Âm',
  },
  dayMaster: heavenlyStems[7], // Tân Kim — Nhật Chủ
  elementBalance: {
    Kim:  2,
    Mộc:  3,
    Thủy: 1,
    Hỏa:  0,
    Thổ:  1,
  },
  generalInterpretation:
    '[MOCK DATA] Nhật chủ Tân Kim trong môi trường Mộc mạnh. Cần hành Hỏa và Kim để cân bằng. ' +
    'Đây là dữ liệu mẫu — chưa có thuật toán tính tứ trụ chính xác.',
};

// TODO: Implement batTuFromDate(year, month, day, hour) returning BatTuChart
// Required:
// - Solar term (tiết khí) lookup table for month pillar
// - 60-cycle day counting from a known epoch
// - Stem calculation from day index
