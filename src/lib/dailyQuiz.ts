import type { QuizQuestion } from '../types';

// A tiny deterministic string hash (djb2) feeding a seeded PRNG (mulberry32) —
// no backend job needed to "roll" daily content: every device computes the
// same shuffle for the same (challenge, date) pair independently.
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Picks a stable-for-the-day, varies-by-day subset of `count` questions from
// a larger pool, keyed by an arbitrary seed (typically `${challengeId}-${dateISO}`).
// A pool no bigger than `count` is returned as-is (e.g. a parent-authored
// single-question quiz).
export function getDailyQuestions(pool: QuizQuestion[], seedKey: string, count = 10): QuizQuestion[] {
  if (pool.length <= count) return pool;
  const rand = mulberry32(hashString(seedKey));
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
