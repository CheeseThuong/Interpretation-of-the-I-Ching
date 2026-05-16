#!/usr/bin/env node
/**
 * download-tarot-dataset.mjs
 * Downloads the Dendory/tarot dataset CSV from HuggingFace into src/data/tarot/
 * Usage: node scripts/download-tarot-dataset.mjs
 *   or:  npm run download:tarot
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DATASET_URL =
  'https://huggingface.co/datasets/Dendory/tarot/resolve/main/tarot_readings.csv';
const OUTPUT_DIR = path.join(ROOT, 'src', 'data', 'tarot');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'tarot_readings.csv');

async function download() {
  console.log('[download-tarot-dataset] Fetching:', DATASET_URL);

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const response = await fetch(DATASET_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch dataset: HTTP ${response.status} ${response.statusText}`
    );
  }

  const text = await response.text();
  fs.writeFileSync(OUTPUT_FILE, text, 'utf8');

  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const rowCount = Math.max(0, lines.length - 1); // subtract header
  console.log(
    `[download-tarot-dataset] ✓ Saved to ${OUTPUT_FILE} (${rowCount} data rows)`
  );
}

download().catch((err) => {
  console.error('[download-tarot-dataset] ✗ Error:', err.message);
  process.exit(1);
});
