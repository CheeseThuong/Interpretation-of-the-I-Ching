import type { LineType, Trigram, Hexagram, LineDetail, ManualHexagramState, CoinLineOption } from '../types';
import { DEFAULT_SELF_RESPONSE } from '../types';
import { trigramByBits } from '../data/trigrams';
import { HEXAGRAMS, palaceSequences, palaceElements, palaceStageNames, selfResponseByStage, najia } from '../data/hexagrams';
import { branchElements, beastOrder, beastStartByDayStem } from '../data/canchi';
import { coinLineOptions } from '../data/shared';

// Re-export download/SVG helpers so existing imports don't break (Phase 6)
export { buildManualChartSvg, downloadFile, downloadSvg, downloadPng } from './export';

// ============================================================
// INDEX LOOKUPS
// ============================================================

/** hexagram lookup by 6-bit code string (lower+upper) */
const hexagramByCode: Record<string, Hexagram> = {};
/** hexagram lookup by King Wen number */
const hexagramByNo: Record<number, Hexagram> = {};

HEXAGRAMS.forEach((hex) => {
  const code = hex.lower + hex.upper;
  const entry: Hexagram = { ...hex, code };
  hexagramByCode[code] = entry;
  hexagramByNo[hex.no] = entry;
});

// Attach palace info
Object.entries(palaceSequences).forEach(([palace, sequence]) => {
  sequence.forEach((hexNo, index) => {
    if (hexagramByNo[hexNo]) {
      hexagramByNo[hexNo].palace = palace;
      hexagramByNo[hexNo].palaceElement = palaceElements[palace];
      hexagramByNo[hexNo].palaceStage = palaceStageNames[index];
    }
  });
});

// ============================================================
// BASIC HELPERS
// ============================================================

/** Simple FNV-1a hash — deterministic "random" from strings */
export function hashText(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

export function bitsFromLineTypes(lines: LineType[]): string {
  return lines.map((l) => (l === 'yang' ? '1' : '0')).join('');
}

export function getTrigramFromLines(lines: LineType[]): Trigram {
  const key = bitsFromLineTypes(lines);
  return trigramByBits[key] ?? trigramByBits['000'];
}

export function getHexInfoFromLines(lines: LineType[]): Hexagram {
  const code = bitsFromLineTypes(lines);
  if (hexagramByCode[code]) return hexagramByCode[code];

  // Fallback if not found (should not happen with valid 6 lines)
  const fallbackLower = getTrigramFromLines(lines.slice(0, 3));
  const fallbackUpper = getTrigramFromLines(lines.slice(3, 6));
  return {
    no: 0,
    name: `${fallbackUpper.name} trên ${fallbackLower.name}`,
    upper: bitsFromLineTypes(lines.slice(3, 6)),
    lower: bitsFromLineTypes(lines.slice(0, 3)),
    code,
    palace: 'Chưa xác định',
    palaceElement: '-',
    palaceStage: '-',
  };
}

/** Build 6 yin/yang lines from a numeric seed */
export function buildLinesFromSeed(seed: number): LineType[] {
  return Array.from({ length: 6 }, (_, i) => {
    const v = (seed >> (i * 3)) & 7;
    return v % 2 === 0 ? 'yang' : 'yin';
  });
}

// ============================================================
// NUCLEAR HEXAGRAM (Quẻ Hỗ) — Phase 5
// ============================================================

/**
 * Builds the 6 lines of the nuclear hexagram.
 * - Lower trigram of nuclear: lines[1], lines[2], lines[3]  (hào 2, 3, 4)
 * - Upper trigram of nuclear: lines[2], lines[3], lines[4]  (hào 3, 4, 5)
 *
 * Input `lines` must be ordered bottom-to-top (lines[0] = hào 1, lines[5] = hào 6).
 */
export function getNuclearHexagramLines(lines: LineType[]): LineType[] {
  return [
    lines[1], // hào 2 → nuclear lower hào 1
    lines[2], // hào 3 → nuclear lower hào 2
    lines[3], // hào 4 → nuclear lower hào 3
    lines[2], // hào 3 → nuclear upper hào 1
    lines[3], // hào 4 → nuclear upper hào 2
    lines[4], // hào 5 → nuclear upper hào 3
  ];
}

// ============================================================
// VALIDATION — Phase 3
// ============================================================

const VALID_COIN_VALUES = new Set([6, 7, 8, 9]);

/**
 * Validates that exactly 6 coin values are provided and each is one of 6, 7, 8, 9.
 * Throws a descriptive Error on the first violation found.
 */
export function validateCoinLines(coinLines: number[]): void {
  if (coinLines.length !== 6) {
    throw new Error(`Cần nhập đúng 6 hào. Hiện tại chỉ có ${coinLines.length} hào.`);
  }

  coinLines.forEach((line, index) => {
    if (!VALID_COIN_VALUES.has(Number(line))) {
      throw new Error(
        `Hào ${index + 1} không hợp lệ (giá trị: ${line}). Chỉ được nhập 6, 7, 8 hoặc 9.`,
      );
    }
  });
}

// ============================================================
// NAJIA / PALACE LOGIC
// ============================================================

function getBranchFromCanChi(canChi: string): string {
  return canChi.split(' ')[1] ?? '';
}

function getRelation(palaceElement: string, branchElement: string): string {
  const generates: Record<string, string> = { Mộc: 'Hỏa', Hỏa: 'Thổ', Thổ: 'Kim', Kim: 'Thủy', Thủy: 'Mộc' };
  const controls: Record<string, string> = { Mộc: 'Thổ', Thổ: 'Thủy', Thủy: 'Hỏa', Hỏa: 'Kim', Kim: 'Mộc' };

  if (branchElement === palaceElement) return 'Huynh Đệ';
  if (generates[branchElement] === palaceElement) return 'Phụ Mẫu';
  if (generates[palaceElement] === branchElement) return 'Tử Tôn';
  if (controls[palaceElement] === branchElement) return 'Thê Tài';
  if (controls[branchElement] === palaceElement) return 'Quan Quỷ';
  return '-';
}

function getSixBeasts(dayStem: string): string[] {
  const start = beastStartByDayStem[dayStem] ?? 0;
  return Array.from({ length: 6 }, (_, i) => beastOrder[(start + i) % beastOrder.length]);
}

function getNajiaLines(lowerBits: string, upperBits: string): string[] {
  const lower = najia[lowerBits]?.inner ?? ['-', '-', '-'];
  const upper = najia[upperBits]?.outer ?? ['-', '-', '-'];
  return [...lower, ...upper];
}

export function buildLineDetails(
  lines: LineType[],
  hexInfo: Hexagram,
  movingLineNumbers: number[],
  dayStem: string,
): LineDetail[] {
  const lowerBits = bitsFromLineTypes(lines.slice(0, 3));
  const upperBits = bitsFromLineTypes(lines.slice(3, 6));
  const canChiLines = getNajiaLines(lowerBits, upperBits);
  const beasts = getSixBeasts(dayStem);
  const palaceElement = hexInfo.palaceElement ?? '-';

  // Resolve Thế / Ứng position ONCE outside the map (Phase 2)
  const selfResponse = selfResponseByStage[hexInfo.palaceStage ?? ''] ?? DEFAULT_SELF_RESPONSE;

  return lines.map((lineType, index): LineDetail => {
    const lineNo = index + 1;
    const canChi = canChiLines[index] ?? '-';
    const branch = getBranchFromCanChi(canChi);
    const branchElement = branchElements[branch] ?? '-';

    // Use else-if: a line cannot be both Thế and Ứng (Phase 2)
    let selfOrResponse: '-' | 'Thế' | 'Ứng' = '-';
    if (selfResponse.self === lineNo) {
      selfOrResponse = 'Thế';
    } else if (selfResponse.response === lineNo) {
      selfOrResponse = 'Ứng';
    }

    return {
      lineNo,
      lineType,
      moving: movingLineNumbers.includes(lineNo),
      selfOrResponse,
      lucThan: getRelation(palaceElement, branchElement),
      canChi: branchElement !== '-' ? `${canChi}-${branchElement}` : canChi,
      lucThu: beasts[index] ?? '-',
    };
  });
}

// ============================================================
// MANUAL HEXAGRAM STATE
// ============================================================

/** Default 6 coin values — Lôi Hỏa Phong → Lôi Sơn Tiểu Quá */
export const DEFAULT_COIN_LINES: number[] = [9, 8, 7, 7, 8, 8];

export function computeManualHexagramState(
  coinLines: number[],
  dayStem: string,
  manualQuestion: string,
): ManualHexagramState {
  // Phase 3: validate before any computation
  validateCoinLines(coinLines);

  const lineObjects: CoinLineOption[] = coinLines.map(
    (v) => coinLineOptions.find((o) => o.value === Number(v)) ?? coinLineOptions[2],
  );

  const primaryLines = lineObjects.map((l) => l.type);
  const changedLines = lineObjects.map((l) => l.changingTo);
  const movingLines = lineObjects
    .map((l, i) => (l.type !== l.changingTo ? i + 1 : null))
    .filter((n): n is number => n !== null);

  const lower = getTrigramFromLines(primaryLines.slice(0, 3));
  const upper = getTrigramFromLines(primaryLines.slice(3, 6));
  const changedLower = getTrigramFromLines(changedLines.slice(0, 3));
  const changedUpper = getTrigramFromLines(changedLines.slice(3, 6));

  // Phase 5: nuclear hexagram
  const nuclearLines = getNuclearHexagramLines(primaryLines);
  const nuclearLower = getTrigramFromLines(nuclearLines.slice(0, 3));
  const nuclearUpper = getTrigramFromLines(nuclearLines.slice(3, 6));

  const primaryInfo = getHexInfoFromLines(primaryLines);
  const changedInfo = getHexInfoFromLines(changedLines);
  const nuclearInfo = getHexInfoFromLines(nuclearLines);

  return {
    dayStem,
    manualQuestion,
    lineObjects,
    primaryLines,
    changedLines,
    nuclearLines,
    movingLines,
    lower,
    upper,
    changedLower,
    changedUpper,
    nuclearLower,
    nuclearUpper,
    primaryInfo,
    changedInfo,
    nuclearInfo,
    primaryDetails: buildLineDetails(primaryLines, primaryInfo, movingLines, dayStem),
    changedDetails: buildLineDetails(changedLines, changedInfo, movingLines, dayStem),
  };
}
