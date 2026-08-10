import type { AppState } from '../state/store';
import type { Challenge, ChallengeCompletion } from '../types';

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

export function getTodayItemsForChild(state: AppState, childId: string, dateISO: string): TodayItem[] {
  const weekday = new Date(dateISO + 'T00:00:00Z').getUTCDay();
  const relevant = state.challenges.filter((c) => c.assignedTo.includes(childId) && isChallengeScheduledToday(c, dateISO, weekday));
  return relevant.map((challenge) => {
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
