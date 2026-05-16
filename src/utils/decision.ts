import type { ScoredChoice, RiskLevel, UrgencyLevel } from '../types';
import { decisionKeywords } from '../data/shared';
import { hashText } from './hexagram';

/**
 * Scores a single choice against context + risk/urgency profile.
 * Algorithm: keyword-weighted score + deterministic pseudo-random noise.
 * Not a true AI — acts as a structured thinking filter.
 */
export function scoreChoice(
  choice: string,
  context: string,
  riskLevel: RiskLevel,
  urgency: UrgencyLevel,
): number {
  const text = `${choice} ${context}`.toLowerCase();
  let score = 50;

  const hits = (group: string) =>
    decisionKeywords[group]?.filter((w) => text.includes(w)).length ?? 0;

  score += hits('safe') * 6;
  score += hits('bold') * (urgency === 'high' ? 7 : 4);
  score += hits('social') * 4;
  score -= hits('risk') * (riskLevel === 'low' ? 9 : riskLevel === 'medium' ? 5 : 2);

  if (context.length > 80) score += 4;
  if (choice.length < 8)   score -= 3;
  if (urgency === 'low'  && text.includes('chờ'))                                     score += 9;
  if (urgency === 'high' && (text.includes('làm') || text.includes('đi') || text.includes('gửi'))) score += 8;

  const noise = (hashText(choice + context) % 17) - 8;
  return Math.max(1, Math.min(99, score + noise));
}

/**
 * Returns all choices sorted by score descending.
 */
export function rankChoices(
  choices: string[],
  context: string,
  riskLevel: RiskLevel,
  urgency: UrgencyLevel,
): ScoredChoice[] {
  return choices
    .filter(Boolean)
    .map((choice) => ({ choice, score: scoreChoice(choice, context, riskLevel, urgency) }))
    .sort((a, b) => b.score - a.score);
}
