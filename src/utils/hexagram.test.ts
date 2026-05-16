import { describe, it, expect } from 'vitest';
import {
  validateCoinLines,
  computeManualHexagramState,
  getNuclearHexagramLines,
  buildLineDetails,
  getHexInfoFromLines,
} from './hexagram';
import type { LineType } from '../types';

// ---------------------------------------------------------------------------
// 1. validateCoinLines
// ---------------------------------------------------------------------------

describe('validateCoinLines', () => {
  it('throws when fewer than 6 values are given', () => {
    expect(() => validateCoinLines([7, 8, 9])).toThrow('Cần nhập đúng 6 hào');
  });

  it('throws when more than 6 values are given', () => {
    expect(() => validateCoinLines([7, 8, 9, 6, 7, 8, 9])).toThrow('Cần nhập đúng 6 hào');
  });

  it('throws when a value outside 6-9 is provided', () => {
    expect(() => validateCoinLines([7, 8, 9, 6, 5, 8])).toThrow('Hào 5 không hợp lệ');
  });

  it('throws when a value of 0 is provided', () => {
    expect(() => validateCoinLines([7, 8, 9, 0, 7, 8])).toThrow('Hào 4 không hợp lệ');
  });

  it('does not throw for a valid set [6, 7, 8, 9, 7, 8]', () => {
    expect(() => validateCoinLines([6, 7, 8, 9, 7, 8])).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// 2. computeManualHexagramState — moving lines
// ---------------------------------------------------------------------------

describe('computeManualHexagramState', () => {
  const VALID_INPUT = [9, 8, 7, 7, 8, 8] as const; // 9 = lão dương → moving

  it('throws for invalid input instead of silently falling back', () => {
    expect(() => computeManualHexagramState([7, 8, 9, 5, 7, 8], 'Mậu', 'test')).toThrow();
  });

  it('hào 1 (index 0) is a moving line when value is 9', () => {
    const state = computeManualHexagramState([...VALID_INPUT], 'Mậu', 'Test');
    expect(state.movingLines).toContain(1);
  });

  it('quẻ biến khác quẻ chính khi có hào động', () => {
    const state = computeManualHexagramState([...VALID_INPUT], 'Mậu', 'Test');
    expect(state.movingLines.length).toBeGreaterThan(0);
    // At least one line differs → changed code ≠ primary code
    expect(state.changedInfo.code).not.toBe(state.primaryInfo.code);
  });

  it('quẻ biến bằng quẻ chính khi không có hào động', () => {
    const state = computeManualHexagramState([7, 8, 7, 8, 7, 8], 'Mậu', 'Test');
    expect(state.movingLines.length).toBe(0);
    expect(state.changedInfo.code).toBe(state.primaryInfo.code);
  });
});

// ---------------------------------------------------------------------------
// 3. getNuclearHexagramLines
// ---------------------------------------------------------------------------

describe('getNuclearHexagramLines', () => {
  const lines: LineType[] = ['yang', 'yin', 'yang', 'yin', 'yang', 'yin'];
  // Indices: 0=hào1, 1=hào2, 2=hào3, 3=hào4, 4=hào5, 5=hào6

  it('hạ quái hỗ lấy từ hào 2-3-4 (index 1,2,3)', () => {
    const nuclear = getNuclearHexagramLines(lines);
    expect(nuclear[0]).toBe(lines[1]); // hào 2
    expect(nuclear[1]).toBe(lines[2]); // hào 3
    expect(nuclear[2]).toBe(lines[3]); // hào 4
  });

  it('thượng quái hỗ lấy từ hào 3-4-5 (index 2,3,4)', () => {
    const nuclear = getNuclearHexagramLines(lines);
    expect(nuclear[3]).toBe(lines[2]); // hào 3
    expect(nuclear[4]).toBe(lines[3]); // hào 4
    expect(nuclear[5]).toBe(lines[4]); // hào 5
  });

  it('returns an array of length 6', () => {
    const nuclear = getNuclearHexagramLines(lines);
    expect(nuclear).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// 4. buildLineDetails — selfOrResponse type safety
// ---------------------------------------------------------------------------

describe('buildLineDetails — selfOrResponse', () => {
  it('only returns "-", "Thế", or "Ứng"', () => {
    const lines: LineType[] = ['yang', 'yin', 'yang', 'yin', 'yang', 'yin'];
    const hexInfo = getHexInfoFromLines(lines);
    const details = buildLineDetails(lines, hexInfo, [], 'Mậu');
    const allowed = new Set(['-', 'Thế', 'Ứng']);
    details.forEach((d) => {
      expect(allowed.has(d.selfOrResponse)).toBe(true);
    });
  });

  it('at most one Thế and one Ứng per hexagram', () => {
    const lines: LineType[] = ['yang', 'yang', 'yang', 'yin', 'yin', 'yin'];
    const hexInfo = getHexInfoFromLines(lines);
    const details = buildLineDetails(lines, hexInfo, [], 'Giáp');
    const selfCount = details.filter((d) => d.selfOrResponse === 'Thế').length;
    const responseCount = details.filter((d) => d.selfOrResponse === 'Ứng').length;
    expect(selfCount).toBeLessThanOrEqual(1);
    expect(responseCount).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// 5. Nuclear hexagram integrated into state
// ---------------------------------------------------------------------------

describe('computeManualHexagramState nuclear', () => {
  it('nuclearLines has length 6', () => {
    const state = computeManualHexagramState([7, 8, 9, 6, 7, 8], 'Mậu', 'Test');
    expect(state.nuclearLines).toHaveLength(6);
  });

  it('nuclearInfo is populated', () => {
    const state = computeManualHexagramState([7, 8, 9, 6, 7, 8], 'Mậu', 'Test');
    expect(state.nuclearInfo).toBeDefined();
    expect(typeof state.nuclearInfo.name).toBe('string');
  });
});
