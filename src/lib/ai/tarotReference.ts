/**
 * tarotReference.ts
 * Server-side helper for the Dendory/tarot reference dataset.
 * NEVER imported from client-side / React components.
 *
 * Functions exported:
 *  - normalizeCardName(name)
 *  - loadTarotReferenceDataset()
 *  - findTarotReferenceReadings(cards, limit?)
 *  - findClosestTarotReadingExamples(cards, limit?)
 *  - prepareTarotReferenceContext(cards, limit?)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Path resolution ────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.resolve(
  __dirname,
  '../../data/tarot/tarot_readings.csv'
);

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TarotReferenceRow {
  card1: string;
  card2: string;
  card3: string;
  reading: string;
}

// ─── In-memory cache (module-level singleton) ────────────────────────────────

let _cache: TarotReferenceRow[] | null = null;

// ─── Minimal CSV parser ──────────────────────────────────────────────────────

function parseCSVRow(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Normalise a card name for fuzzy matching:
 * lower-case, strip "the ", collapse whitespace, remove non-alphanumeric.
 */
export function normalizeCardName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Load (and cache) the dataset CSV.
 * Returns [] if the file does not exist — never throws.
 */
export function loadTarotReferenceDataset(): TarotReferenceRow[] {
  if (_cache !== null) return _cache;

  try {
    if (!fs.existsSync(CSV_PATH)) {
      console.warn(
        '[tarotReference] CSV not found at',
        CSV_PATH,
        '— run npm run download:tarot'
      );
      _cache = [];
      return _cache;
    }

    const content = fs.readFileSync(CSV_PATH, 'utf8');
    const lines = content.split('\n').filter((l) => l.trim().length > 0);

    if (lines.length < 2) {
      _cache = [];
      return _cache;
    }

    // Validate headers
    const headers = parseCSVRow(lines[0]);
    const idx = {
      card1: headers.indexOf('Card 1'),
      card2: headers.indexOf('Card 2'),
      card3: headers.indexOf('Card 3'),
      reading: headers.indexOf('Reading'),
    };

    if (idx.card1 < 0 || idx.reading < 0) {
      console.warn('[tarotReference] Unexpected CSV headers:', headers);
      _cache = [];
      return _cache;
    }

    _cache = lines.slice(1).map((line) => {
      const cols = parseCSVRow(line);
      return {
        card1: cols[idx.card1] ?? '',
        card2: cols[idx.card2] ?? '',
        card3: cols[idx.card3] ?? '',
        reading: cols[idx.reading] ?? '',
      };
    });

    console.log(`[tarotReference] Loaded ${_cache.length} reference rows.`);
    return _cache;
  } catch (err) {
    console.error('[tarotReference] Error loading CSV:', err);
    _cache = [];
    return _cache;
  }
}

/**
 * Find rows that mention all provided card names (strict match).
 * Falls back to partial matching if no full match found.
 * @param cards  Array of English card names (e.g. ["The Moon", "The Star"])
 * @param limit  Maximum results to return (default 3)
 */
export function findTarotReferenceReadings(
  cards: string[],
  limit = 3
): TarotReferenceRow[] {
  const dataset = loadTarotReferenceDataset();
  if (dataset.length === 0 || cards.length === 0) return [];

  const normalised = cards.map(normalizeCardName);

  // Score each row by how many queried cards appear in its card columns
  const scored = dataset.map((row) => {
    const rowCards = [row.card1, row.card2, row.card3].map(normalizeCardName);
    let matches = 0;
    for (const n of normalised) {
      if (rowCards.some((rc) => rc.includes(n) || n.includes(rc))) {
        matches++;
      }
    }
    return { row, matches };
  });

  // Sort descending by match count, pick rows with at least 1 match
  return scored
    .filter((s) => s.matches > 0)
    .sort((a, b) => b.matches - a.matches)
    .slice(0, limit)
    .map((s) => s.row);
}

/**
 * Alias for findTarotReferenceReadings — kept for naming symmetry.
 */
export function findClosestTarotReadingExamples(
  cards: string[],
  limit = 3
): TarotReferenceRow[] {
  return findTarotReferenceReadings(cards, limit);
}

/**
 * Prepare a concise, prompt-safe reference context string.
 * Returns empty string if no references found.
 *
 * Rule: references are English symbolic inspiration only.
 * The prompt instructions tell the AI NOT to copy them literally.
 */
export function prepareTarotReferenceContext(
  cards: string[],
  limit = 3
): string {
  const refs = findTarotReferenceReadings(cards, limit);
  if (refs.length === 0) return '';

  const lines = refs.map((r, i) => {
    const cardList = [r.card1, r.card2, r.card3].filter(Boolean).join(' + ');
    return `[Ref ${i + 1}] Cards: ${cardList}\nSymbolic meaning: ${r.reading}`;
  });

  return (
    `ENGLISH SYMBOLIC REFERENCES (${refs.length} found — for internal AI use only):\n` +
    `These are example readings from the Dendory/tarot dataset. ` +
    `Extract the SYMBOLIC MEANING internally. ` +
    `Do NOT copy, translate, or quote them. Answer in Vietnamese based on the user's actual question.\n\n` +
    lines.join('\n\n')
  );
}
