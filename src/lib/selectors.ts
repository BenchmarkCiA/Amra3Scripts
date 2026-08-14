import type { AppState } from '../state/store';
import type { Category, Challenge, ChallengeCompletion } from '../types';

export function isChallengeScheduledToday(challenge: Challenge, dateISO: string, weekday: number): boolean {
  if (!challenge.active) return false;
  if (challenge.recurrence === 'daily') return true;
  if (challenge.recurrence === 'once') return challenge.dueDate === dateISO;
  if (challenge.recurrence === 'weekly') return challenge.weekday === weekday;
  return false;
}

export interface TodayItem {
  challenge: Challenge;
  completion: ChallengeCompletion | null;
}

// What a child sees today is exactly their active, scheduled challenges —
// no automatic rotation/hiding. A parent who wants to trim a long list uses
// Parent → Challenges to pause/activate individual ones per child, and that
// choice sticks until they change it again (rather than the app silently
// picking a different random subset each day, which a parent has no way to
// see or control).
export function getTodayItemsForChild(state: AppState, childId: string, dateISO: string): TodayItem[] {
  const weekday = new Date(dateISO + 'T00:00:00Z').getUTCDay();
  const scheduled = state.challenges.filter((c) => c.assignedTo.includes(childId) && isChallengeScheduledToday(c, dateISO, weekday));
  return scheduled.map((challenge) => {
    const completion =
      state.completions.find((c) => c.challengeId === challenge.id && c.childId === childId && c.date === dateISO) ?? null;
    return { challenge, completion };
  });
}

export function isDone(completion: ChallengeCompletion | null): boolean {
  if (!completion) return false;
  return completion.status === 'completed' || completion.status === 'approved' || completion.status === 'awaiting_approval';
}

export function getPendingApprovals(state: AppState) {
  return state.completions
    .filter((c) => c.status === 'awaiting_approval')
    .map((completion) => ({
      completion,
      challenge: state.challenges.find((c) => c.id === completion.challengeId) ?? null,
      child: state.children.find((c) => c.id === completion.childId) ?? null,
    }))
    .filter((x) => x.challenge && x.child);
}

export function getPendingRedemptions(state: AppState) {
  return state.redemptions
    .filter((r) => r.status === 'pending')
    .map((redemption) => ({ redemption, child: state.children.find((c) => c.id === redemption.childId) ?? null }))
    .filter((x) => x.child);
}

export interface MonthlyStats {
  totalCompleted: number;
  byCategory: Partial<Record<Category, number>>;
  starsEarned: number;
  xpEarned: number;
  quizzesTaken: number;
  avgQuizAccuracyPct: number | null;
}

const COUNTED_STATUSES = new Set<ChallengeCompletion['status']>(['completed', 'approved']);

// yearMonth like "2026-08". Counts completions whose *date* falls in that
// month, regardless of when they were later approved.
export function getMonthlyStats(state: AppState, childId: string, yearMonth: string): MonthlyStats {
  const completions = state.completions.filter(
    (c) => c.childId === childId && c.date.startsWith(yearMonth) && COUNTED_STATUSES.has(c.status),
  );

  const byCategory: Partial<Record<Category, number>> = {};
  let starsEarned = 0;
  let xpEarned = 0;
  let quizzesTaken = 0;
  let accuracySum = 0;

  for (const completion of completions) {
    const challenge = state.challenges.find((c) => c.id === completion.challengeId);
    if (challenge) byCategory[challenge.category] = (byCategory[challenge.category] ?? 0) + 1;
    starsEarned += completion.starsEarned;
    xpEarned += completion.xpEarned;
    if (completion.score && completion.score.total > 0) {
      quizzesTaken += 1;
      accuracySum += (completion.score.correct / completion.score.total) * 100;
    }
  }

  return {
    totalCompleted: completions.length,
    byCategory,
    starsEarned,
    xpEarned,
    quizzesTaken,
    avgQuizAccuracyPct: quizzesTaken > 0 ? Math.round(accuracySum / quizzesTaken) : null,
  };
}

export function availableMonths(state: AppState): string[] {
  const set = new Set<string>();
  for (const c of state.completions) set.add(c.date.slice(0, 7));
  set.add(new Date().toISOString().slice(0, 7)); // always include the current month
  return Array.from(set).sort().reverse();
}
