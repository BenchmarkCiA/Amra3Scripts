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

// A pool no bigger than `count` is returned as-is.
export function seededSubset<T>(pool: T[], seedKey: string, count: number): T[] {
  if (pool.length <= count) return pool;
  return seededShuffle(pool, seedKey).slice(0, count);
}
