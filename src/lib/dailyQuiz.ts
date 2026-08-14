import type { QuizQuestion } from '../types';
import { seededSubset } from './seededRandom';

// Picks a stable-for-the-day, varies-by-day subset of `count` questions from
// a larger pool, keyed by an arbitrary seed (typically `${challengeId}-${dateISO}`).
export function getDailyQuestions(pool: QuizQuestion[], seedKey: string, count = 10): QuizQuestion[] {
  return seededSubset(pool, seedKey, count);
}
