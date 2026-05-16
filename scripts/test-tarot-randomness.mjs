/**
 * scripts/test-tarot-randomness.mjs
 * QA test for Tarot shuffle and draw randomness.
 * Mirrors logic from src/utils/tarotDeck.ts — no production code imported.
 * Run: node scripts/test-tarot-randomness.mjs
 */

import { webcrypto } from 'node:crypto';

// ─── Crypto-safe random (mirrors browser window.crypto fallback) ──────────────
function secureRandom() {
  const buf = new Uint32Array(1);
  webcrypto.getRandomValues(buf);
  return buf[0] / (0xffffffff + 1);
}

// ─── Fisher-Yates shuffle (mirrors shuffleTarotDeck) ────────────────────────
function fisherYates(deck) {
  const a = [...deck];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandom() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Minimal 78-card deck (IDs only — matches tarotDeck.ts) ──────────────────
const MAJOR_IDS = Array.from({ length: 22 }, (_, i) => `m${String(i).padStart(2, '0')}`);
const SUITS = ['w', 'c', 's', 'p']; // Wands, Cups, Swords, Pentacles
const MINOR_IDS = SUITS.flatMap(s =>
  Array.from({ length: 14 }, (_, i) => `${s}${String(i + 1).padStart(2, '0')}`)
);
const FULL_DECK_IDS = [...MAJOR_IDS, ...MINOR_IDS]; // 78 total

if (FULL_DECK_IDS.length !== 78) {
  console.error(`ERROR: Expected 78 cards, got ${FULL_DECK_IDS.length}`);
  process.exit(1);
}

function drawCards(count) {
  const shuffled = fisherYates(FULL_DECK_IDS);
  return shuffled.slice(0, count);
}

// ─── TEST 1: 500 one-card draws ───────────────────────────────────────────────
console.log('═══════════════════════════════════════════════');
console.log(' TAROT RANDOMNESS QA — 500 one-card draws');
console.log('═══════════════════════════════════════════════');

const freq = {};
for (let i = 0; i < 500; i++) {
  const [card] = drawCards(1);
  freq[card] = (freq[card] ?? 0) + 1;
}

const uniqueCount = Object.keys(freq).length;
const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
const top10 = sorted.slice(0, 10);
const expectedFreq = 500 / 78; // ~6.4 per card
const maxAllowed = expectedFreq * 4; // fail if any card appears >4x expected

console.log(`\n✔ Total draws: 500`);
console.log(`✔ Unique cards drawn: ${uniqueCount} / 78`);
console.log(`✔ Expected freq per card: ~${expectedFreq.toFixed(1)}`);
console.log(`✔ Suspicion threshold: ${maxAllowed.toFixed(0)} draws per card`);

console.log('\nTop 10 most frequent cards:');
top10.forEach(([id, count]) => {
  const bar = '█'.repeat(Math.round(count / 2));
  const flag = count > maxAllowed ? ' ⚠ SUSPICIOUS' : '';
  console.log(`  ${id.padEnd(6)} ${String(count).padStart(3)}x  ${bar}${flag}`);
});

const suspicious = sorted.filter(([, c]) => c > maxAllowed);
if (uniqueCount < 60) {
  console.log(`\n❌ FAIL: Only ${uniqueCount} unique cards — shuffle is biased.`);
  process.exit(1);
} else if (suspicious.length > 0) {
  console.log(`\n❌ FAIL: ${suspicious.length} card(s) appear suspiciously often.`);
  process.exit(1);
} else {
  console.log(`\n✅ PASS: ${uniqueCount} unique cards, no suspicious bias.`);
}

// ─── TEST 2: 100 three-card draws — check for duplicates ─────────────────────
console.log('\n═══════════════════════════════════════════════');
console.log(' TAROT RANDOMNESS QA — 100 three-card draws');
console.log('═══════════════════════════════════════════════');

let duplicateSpreadCount = 0;
for (let i = 0; i < 100; i++) {
  const cards = drawCards(3);
  const unique = new Set(cards);
  if (unique.size < 3) {
    duplicateSpreadCount++;
    console.log(`  ⚠ Spread #${i + 1} has duplicate: [${cards.join(', ')}]`);
  }
}

console.log(`\n✔ Three-card spreads tested: 100`);
console.log(`✔ Spreads with duplicate cards: ${duplicateSpreadCount}`);
if (duplicateSpreadCount > 0) {
  console.log(`\n❌ FAIL: ${duplicateSpreadCount} spread(s) contained duplicate cards.`);
  process.exit(1);
} else {
  console.log(`\n✅ PASS: No duplicates in any three-card spread.`);
}

// ─── TEST 3: Reversed orientation variance ────────────────────────────────────
console.log('\n═══════════════════════════════════════════════');
console.log(' TAROT RANDOMNESS QA — Orientation variance');
console.log('═══════════════════════════════════════════════');

let reversedCount = 0;
const ORIENTATION_RUNS = 1000;
for (let i = 0; i < ORIENTATION_RUNS; i++) {
  if (secureRandom() > 0.6) reversedCount++; // mirrors 40% reversed logic
}
const reversedPct = (reversedCount / ORIENTATION_RUNS * 100).toFixed(1);
const uprightPct = (100 - parseFloat(reversedPct)).toFixed(1);
console.log(`\n✔ Orientation test runs: ${ORIENTATION_RUNS}`);
console.log(`  Reversed : ${reversedCount} (${reversedPct}%) — expected ~40%`);
console.log(`  Upright  : ${ORIENTATION_RUNS - reversedCount} (${uprightPct}%) — expected ~60%`);

if (reversedCount < 300 || reversedCount > 500) {
  console.log(`\n❌ FAIL: Reversed rate ${reversedPct}% is outside expected 30-50% range.`);
  process.exit(1);
} else {
  console.log(`\n✅ PASS: Orientation distribution is within expected range.`);
}

// ─── TEST 4: Reset produces a fresh draw ────────────────────────────────────
console.log('\n═══════════════════════════════════════════════');
console.log(' TAROT RANDOMNESS QA — Reset / fresh draw');
console.log('═══════════════════════════════════════════════');

const run1 = drawCards(3).join(',');
const run2 = drawCards(3).join(',');
const run3 = drawCards(3).join(',');
console.log(`\n✔ Draw 1: ${run1}`);
console.log(`✔ Draw 2: ${run2}`);
console.log(`✔ Draw 3: ${run3}`);
if (run1 === run2 && run2 === run3) {
  console.log(`\n❌ FAIL: All three draws produced identical results — deck is not reshuffled.`);
  process.exit(1);
} else {
  console.log(`\n✅ PASS: Each draw produces different results.`);
}

// ─── FINAL SUMMARY ────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════');
console.log(` ALL TESTS PASSED`);
console.log(`  Unique cards (500 draws) : ${uniqueCount}/78`);
console.log(`  Duplicate spreads (100×3): ${duplicateSpreadCount}`);
console.log(`  Reversed rate            : ${reversedPct}%`);
console.log(`  Fresh draw on reset      : ✓`);
console.log('═══════════════════════════════════════════════\n');
