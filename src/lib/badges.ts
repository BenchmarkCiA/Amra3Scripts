import type { AppState } from '../state/store';
import type { Badge } from '../types';

const QUALIFYING_STATUSES = new Set(['completed', 'approved']);

export function countQualifyingCompletions(state: AppState, childId: string, badge: Badge): number {
  return state.completions.filter((c) => {
    if (c.childId !== childId || !QUALIFYING_STATUSES.has(c.status)) return false;
    if (!badge.category) return true;
    const challenge = state.challenges.find((ch) => ch.id === c.challengeId);
    return challenge?.category === badge.category;
  }).length;
}

export function isBadgeUnlocked(state: AppState, childId: string, badge: Badge): boolean {
  return countQualifyingCompletions(state, childId, badge) >= badge.threshold;
}
