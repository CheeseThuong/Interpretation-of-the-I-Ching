/**
 * src/lib/astrology/zodiacReference.ts
 *
 * SERVER-SIDE ONLY — DO NOT import in frontend components.
 *
 * Optional reference helper for the ZodiacViews/zodiac-horoscope-daily dataset.
 * If the dataset file is missing, all functions gracefully return empty results.
 * The dataset text is used only as symbolic/personality inspiration — never copied
 * verbatim into the final Vietnamese answer.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface ZodiacDailyEntry {
  instruction: string;
  input: string;
  output: string;
}

let _cache: ZodiacDailyEntry[] | null = null;

function loadDataset(): ZodiacDailyEntry[] {
  if (_cache !== null) return _cache;
  try {
    const filePath = join(process.cwd(), 'src', 'data', 'zodiac', 'zodiac_horoscope_daily.jsonl');
    const raw = readFileSync(filePath, 'utf8');
    _cache = raw
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line) as ZodiacDailyEntry);
    return _cache;
  } catch {
    // Dataset missing or inaccessible — fail silently
    _cache = [];
    return _cache;
  }
}

/** Find up to `limit` relevant entries for a given zodiac sign */
export function findZodiacDailyReferences(sign: string, _date?: string, limit = 2): ZodiacDailyEntry[] {
  const dataset = loadDataset();
  if (!dataset.length) return [];
  const signLower = sign.toLowerCase();
  const matches = dataset.filter(entry =>
    entry.instruction.toLowerCase().includes(signLower) ||
    entry.input.toLowerCase().includes(signLower)
  );
  // Return a pseudo-random selection so different calls get variety
  if (matches.length <= limit) return matches;
  const offset = Math.floor(Math.random() * (matches.length - limit));
  return matches.slice(offset, offset + limit);
}

/**
 * Returns a short English context string to inject into the AI prompt.
 * The AI is explicitly told: do not copy this — use as symbolic lens only.
 */
export function prepareZodiacReferenceContext(sign: string, date?: string, limit = 2): string {
  const refs = findZodiacDailyReferences(sign, date, limit);
  if (!refs.length) return '';
  const snippets = refs.map((r, i) =>
    `[ZodiacRef ${i + 1}] ${r.instruction} | ${r.output.slice(0, 200)}`
  );
  return `ZODIAC DATASET REFERENCES (${sign} — symbolic lens only, DO NOT copy verbatim):\n${snippets.join('\n')}`;
}
