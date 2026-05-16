import { useState, useCallback } from 'react';
import type { ManualHexagramState } from '../types';
import { computeManualHexagramState, DEFAULT_COIN_LINES } from '../utils/hexagram';

export function useManualHexagram() {
  const [coinLines, setCoinLines]   = useState<number[]>(DEFAULT_COIN_LINES);
  const [dayStem, setDayStem]       = useState('Mậu');
  const [question, setQuestion]     = useState('Việc cần xem / tình huống của người dùng');
  const [error, setError]           = useState<string | null>(null);
  const [state, setState]           = useState<ManualHexagramState>(() =>
    computeManualHexagramState(DEFAULT_COIN_LINES, 'Mậu', 'Việc cần xem / tình huống của người dùng'),
  );

  /** Update a single line value and recompute state. */
  const updateLine = useCallback(
    (index: number, value: number) => {
      setCoinLines((prev) => {
        const next = [...prev];
        next[index] = value;
        try {
          const newState = computeManualHexagramState(next, dayStem, question);
          setError(null);
          setState(newState);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Lỗi không xác định.');
        }
        return next;
      });
    },
    [dayStem, question],
  );

  /** Recompute when dayStem changes. */
  const handleSetDayStem = useCallback(
    (stem: string) => {
      setDayStem(stem);
      try {
        const newState = computeManualHexagramState(coinLines, stem, question);
        setError(null);
        setState(newState);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi không xác định.');
      }
    },
    [coinLines, question],
  );

  /** Recompute when question changes. */
  const handleSetQuestion = useCallback(
    (q: string) => {
      setQuestion(q);
      try {
        const newState = computeManualHexagramState(coinLines, dayStem, q);
        setError(null);
        setState(newState);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi không xác định.');
      }
    },
    [coinLines, dayStem],
  );

  return {
    state,
    coinLines,
    dayStem,
    question,
    error,
    setDayStem: handleSetDayStem,
    setQuestion: handleSetQuestion,
    updateLine,
  };
}
