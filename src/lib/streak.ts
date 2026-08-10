import type { StreakInfo } from '../types';

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00Z').getTime();
  const db = new Date(b + 'T00:00:00Z').getTime();
  return Math.round((db - da) / 86400000);
}

export function initialStreak(childId: string, monthlyFreezeTokens: number): StreakInfo {
  return {
    childId,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    freezeTokensAvailable: monthlyFreezeTokens,
    freezeTokensUsed: 0,
  };
}

// PRD §21 — a streak survives one missed day per freeze token, consumed
// silently. Call this once per day the first time a child crosses the
// minimum-challenges-for-streak threshold.
export function bumpStreak(streak: StreakInfo, dateISO: string): StreakInfo {
  if (streak.lastCompletedDate === dateISO) return streak; // already counted today

  if (streak.lastCompletedDate === null) {
    return { ...streak, currentStreak: 1, longestStreak: Math.max(1, streak.longestStreak), lastCompletedDate: dateISO };
  }

  const gap = daysBetween(streak.lastCompletedDate, dateISO);

  if (gap === 1) {
    const next = streak.currentStreak + 1;
    return { ...streak, currentStreak: next, longestStreak: Math.max(next, streak.longestStreak), lastCompletedDate: dateISO };
  }

  if (gap === 2 && streak.freezeTokensAvailable > 0) {
    const next = streak.currentStreak + 1;
    return {
      ...streak,
      currentStreak: next,
      longestStreak: Math.max(next, streak.longestStreak),
      lastCompletedDate: dateISO,
      freezeTokensAvailable: streak.freezeTokensAvailable - 1,
      freezeTokensUsed: streak.freezeTokensUsed + 1,
    };
  }

  // Missed more than a freeze token can cover — restart.
  return { ...streak, currentStreak: 1, lastCompletedDate: dateISO };
}
