// A tiny deterministic string hash (djb2) feeding a seeded PRNG (mulberry32) —
// lets every device independently compute the same "random" shuffle for the
// same seed (e.g. `${childId}-${dateISO}`) with no backend job needed to
// "roll" daily content.
export function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(pool: T[], seedKey: string): T[] {
  const rand = mulberry32(hashString(seedKey));
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const EPOCH_MS = Date.UTC(2020, 0, 1);
const MS_PER_DAY = 86400000;

// Days since a fixed reference point — the shared "clock" behind every
// stable-for-the-day, non-repeating pick in the app (quiz rotation, daily
// facts, etc.), so they all agree on which calendar day it is regardless of
// which challenge or subject is asking.
export function dayNumber(dateISO: string): number {
  return Math.floor((Date.parse(`${dateISO}T00:00:00Z`) - EPOCH_MS) / MS_PER_DAY);
}

// Deterministic "shuffle-bag" pick, generalized to a single index rather
// than a whole subset: returns a stable-for-the-day index into an array of
// `length`, cycling through every index with no repeat before reshuffling —
// same technique as getDailyQuestions (lib/dailyQuiz.ts), sized down for
// "one item per day" cases like a daily fact.
export function dailyBagIndex(length: number, seedKey: string, day: number): number {
  if (length <= 1) return 0;
  const pass = Math.floor(day / length);
  const posInPass = day % length;
  const order = seededShuffle(
    Array.from({ length }, (_, i) => i),
    `${seedKey}-pass-${pass}`,
  );
  return order[posInPass];
}
