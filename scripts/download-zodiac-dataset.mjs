#!/usr/bin/env node
/**
 * scripts/download-zodiac-dataset.mjs
 *
 * Attempts to download ZodiacViews/zodiac-horoscope-daily from Hugging Face.
 * Fails gracefully — the app works without this dataset.
 *
 * Usage:  node scripts/download-zodiac-dataset.mjs
 * Env:    HF_TOKEN=your_token node scripts/download-zodiac-dataset.mjs  (optional)
 */

import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR  = join(ROOT, 'src', 'data', 'zodiac');
const OUTPUT_FILE = join(OUTPUT_DIR, 'zodiac_horoscope_daily.jsonl');

const HF_URL =
  'https://huggingface.co/datasets/ZodiacViews/zodiac-horoscope-daily/resolve/main/data/train-00000-of-00001.parquet';

// Parquet is the typical HF format; try plain JSONL URL first.
const HF_JSONL_URL =
  'https://huggingface.co/datasets/ZodiacViews/zodiac-horoscope-daily/resolve/main/zodiac_horoscope_daily.jsonl';

async function tryDownload(url) {
  const headers = { 'User-Agent': 'kinh-dich-app/1.0' };
  const token = process.env.HF_TOKEN;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res;
}

async function main() {
  console.log('Zodiac dataset downloader');
  console.log('=========================');

  if (existsSync(OUTPUT_FILE)) {
    console.log(`Dataset already exists at: ${OUTPUT_FILE}`);
    console.log('Delete it and re-run to force refresh.');
    return;
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const urls = [HF_JSONL_URL, HF_URL];
  for (const url of urls) {
    console.log(`\nTrying: ${url}`);
    try {
      const res = await tryDownload(url);
      const ws = createWriteStream(OUTPUT_FILE);
      await pipeline(res.body, ws);
      console.log(`\nDataset saved to: ${OUTPUT_FILE}`);
      console.log('Restart the dev server or redeploy to activate zodiac references.');
      return;
    } catch (err) {
      console.warn(`  Failed: ${err.message}`);
    }
  }

  console.log(`
Download failed. This is expected if the dataset requires Hugging Face access.

Manual steps:
1. Visit: https://huggingface.co/datasets/ZodiacViews/zodiac-horoscope-daily
2. Accept access terms if prompted.
3. Download the JSONL file.
4. Place it at:  src/data/zodiac/zodiac_horoscope_daily.jsonl

The app works normally without this file.
`);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(0); // exit 0 — don't break CI
});
