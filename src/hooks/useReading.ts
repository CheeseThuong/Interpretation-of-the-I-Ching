import { useState, useCallback } from 'react';
import type { ReadingResult } from '../types';
import { trigrams } from '../data/trigrams';
import { hexagramThemes } from '../data/hexagrams';
import { hashText, buildLinesFromSeed } from '../utils/hexagram';

export function useReading() {
  const [seedSalt, setSeedSalt] = useState(11);

  const computeReading = useCallback(
    (question: string, field: string, mood: string): ReadingResult => {
      const seed = hashText(`${question}-${field}-${mood}-${seedSalt}`);
      const lower = trigrams[seed % trigrams.length];
      const upper = trigrams[Math.floor(seed / 7) % trigrams.length];
      const lines = buildLinesFromSeed(seed);
      const movingLine = (seed % 6) + 1;
      const theme = hexagramThemes[seed % hexagramThemes.length];
      const confidence = 68 + (seed % 21);
      return { field, lower, upper, lines, movingLine, theme, confidence };
    },
    [seedSalt],
  );

  const reroll = useCallback(() => setSeedSalt((s) => s + 97), []);

  return { computeReading, reroll };
}
