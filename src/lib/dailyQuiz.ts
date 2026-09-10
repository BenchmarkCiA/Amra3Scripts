import type { QuizQuestion } from '../types';
import { dayNumber, seededShuffle } from './seededRandom';

// Picks a stable-for-the-day subset of `count` questions from a pool, keyed
// by challengeId + calendar date. Rather than reshuffling the whole pool
// fresh every single day (which let the same question reappear the very
// next day purely by chance — especially likely on smaller pools, e.g. a
// 30-question pool showing 10/day had roughly a 1-in-3 chance any given
// question repeats immediately), this treats the pool as a shuffled deck
// ("bag randomization", the same technique behind e.g. Tetris' 7-bag piece
// order) dealt out `count` at a time with zero repeats within one full pass
// through the pool, then reshuffled (new seed) for the next pass. The one
// accepted gap: right at the seam between two passes, the incoming pass is
// an independent shuffle, so a small, bounded amount of overlap with the
// outgoing pass's last day is possible by chance — same trade-off bag
// randomizers always make. That seam happens once every ~`pool.length /
// count` days, not on every single day like before.
export function getDailyQuestions(pool: QuizQuestion[], challengeId: string, dateISO: string, count = 10): QuizQuestion[] {
  if (pool.length <= count) return pool;

  const startIndex = dayNumber(dateISO) * count;
  const shuffleCache = new Map<number, QuizQuestion[]>();
  const result: QuizQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const globalIndex = startIndex + i;
    const pass = Math.floor(globalIndex / pool.length);
    const posInPass = globalIndex % pool.length;
    let shuffled = shuffleCache.get(pass);
    if (!shuffled) {
      shuffled = seededShuffle(pool, `${challengeId}-pass-${pass}`);
      shuffleCache.set(pass, shuffled);
    }
    result.push(shuffled[posInPass]);
  }

  return result;
}
