#!/usr/bin/env node
/**
 * validate-tarot-dataset.mjs
 * Validates the Dendory/tarot CSV file structure.
 * Usage: node scripts/validate-tarot-dataset.mjs
 *   or:  npm run validate:tarot
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CSV_FILE = path.join(ROOT, 'src', 'data', 'tarot', 'tarot_readings.csv');

const EXPECTED_HEADERS = ['Card 1', 'Card 2', 'Card 3', 'Reading'];

function validate() {
  console.log('[validate-tarot-dataset] Checking:', CSV_FILE);

  // Check file exists
  if (!fs.existsSync(CSV_FILE)) {
    console.error(
      '[validate-tarot-dataset] ✗ File not found. Run: npm run download:tarot'
    );
    process.exit(1);
  }

  const content = fs.readFileSync(CSV_FILE, 'utf8');
  const lines = content.split('\n').filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    console.error('[validate-tarot-dataset] ✗ File is empty or has no data rows.');
    process.exit(1);
  }

  // Parse headers — handle quoted CSV
  const headerLine = lines[0];
  const headers = parseCSVRow(headerLine);

  for (const expected of EXPECTED_HEADERS) {
    if (!headers.includes(expected)) {
      console.error(
        `[validate-tarot-dataset] ✗ Missing column "${expected}". Found: ${headers.join(', ')}`
      );
      process.exit(1);
    }
  }

  const rowCount = lines.length - 1;
  console.log('[validate-tarot-dataset] ✓ Headers OK:', headers.join(', '));
  console.log(`[validate-tarot-dataset] ✓ Row count: ${rowCount}`);
  console.log('[validate-tarot-dataset] ✓ Dataset is valid.');
}

/**
 * Minimal CSV row parser that handles double-quoted fields with commas.
 */
function parseCSVRow(line) {
  const result = [];
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

validate();
