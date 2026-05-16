import { useState, useCallback } from 'react';
import type { ManualHexagramState } from '../types';
import { computeManualHexagramState, DEFAULT_COIN_LINES } from '../utils/hexagram';

export function useManualHexagram() {
  const [coinLines, setCoinLines]   = useState<number[]>(DEFAULT_COIN_LINES);
  const [dayStem, setDayStem]       = useState('Mậu');
  const [question, setQuestion]     = useState('Việc cần xem / tình huống của người dùng');

  const state: ManualHexagramState = computeManualHexagramState(coinLines, dayStem, question);

  const updateLine = useCallback((index: number, value: number) => {
    setCoinLines((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  return { state, coinLines, dayStem, question, setDayStem, setQuestion, updateLine };
}
