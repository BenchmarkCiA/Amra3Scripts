import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import type {
  Challenge,
  ChallengeCompletion,
  Child,
  Language,
  Reward,
  RewardRedemption,
  ScoringConfig,
  StarTransaction,
  StreakInfo,
  XPTransaction,
} from '../types';
import { defaultBadges, defaultChallenges, defaultChildren, defaultRewards } from '../data/defaults';
import { computeReward, defaultScoringConfig } from '../lib/scoring';
import { makeId, todayISO } from '../lib/id';
import { bumpStreak, initialStreak } from '../lib/streak';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { fetchAppState, syncActionToSupabase } from '../lib/supabaseSync';

const STORAGE_KEY = 'family-quest-state-v1';
const DEFAULT_PARENT_PIN = '1234';

export interface AppState {
  children: Child[];
  challenges: Challenge[];
  completions: ChallengeCompletion[];
  starTx: StarTransaction[];
  xpTx: XPTransaction[];
  rewards: Reward[];
  redemptions: RewardRedemption[];
  streaks: Record<string, StreakInfo>;
  scoringConfig: ScoringConfig;
  parentPin: string;
  language: Language;
}

function buildInitialState(): AppState {
  const streaks: Record<string, StreakInfo> = {};
  for (const c of defaultChildren) streaks[c.id] = initialStreak(c.id, defaultScoringConfig.monthlyFreezeTokens);
  return {
    children: defaultChildren,
    challenges: defaultChallenges,
    completions: [],
    starTx: [],
    xpTx: [],
    rewards: defaultRewards,
    redemptions: [],
    streaks,
    scoringConfig: defaultScoringConfig,
    parentPin: DEFAULT_PARENT_PIN,
    language: 'en',
  };
}

function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialState();
    const parsed = JSON.parse(raw) as AppState;
    // Guard against a corrupted / pre-migration blob.
    if (!parsed.children || !parsed.scoringConfig) return buildInitialState();
    return { ...parsed, language: parsed.language ?? 'en' };
  } catch {
    return buildInitialState();
  }
}

export type Action =
  | { type: 'COMPLETE_QUIZ'; childId: string; challengeId: string; correctCount: number; totalQuestions: number; completionId?: string }
  | { type: 'COMPLETE_TASK'; childId: string; challengeId: string; note?: string; completionId?: string } // draw / selfreport / discovery
  | { type: 'RESOLVE_APPROVAL'; completionId: string; approve: boolean }
  | { type: 'REDEEM_REWARD'; childId: string; rewardId: string; redemptionId?: string }
  | { type: 'RESOLVE_REDEMPTION'; redemptionId: string; status: 'approved' | 'rejected' | 'delivered' }
  | { type: 'ADD_CHALLENGE'; challenge: Challenge }
  | { type: 'UPDATE_CHALLENGE'; challenge: Challenge }
  | { type: 'SET_CHALLENGE_ACTIVE'; challengeId: string; active: boolean }
  | { type: 'DELETE_CHALLENGE'; challengeId: string }
  | { type: 'ADD_REWARD'; reward: Reward }
  | { type: 'UPDATE_REWARD'; reward: Reward }
  | { type: 'DELETE_REWARD'; rewardId: string }
  | { type: 'UPDATE_SCORING_CONFIG'; config: ScoringConfig }
  | { type: 'SET_PARENT_PIN'; pin: string }
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'UPDATE_CHILD_NAME'; childId: string; name: string }
  | { type: 'ADJUST_STARS'; childId: string; amount: number; reason: string }
  | { type: 'RESET_ALL' }
  | { type: 'HYDRATE'; state: AppState };

function creditChild(
  state: AppState,
  childId: string,
  stars: number,
  xp: number,
  source: string,
  referenceId: string,
): Pick<AppState, 'children' | 'starTx' | 'xpTx'> {
  const children = state.children.map((c) => (c.id === childId ? { ...c, stars: c.stars + stars, xp: c.xp + xp } : c));
  const starTx: StarTransaction[] = stars !== 0
    ? [...state.starTx, { id: makeId(), childId, amount: stars, source, referenceId, createdAt: new Date().toISOString() }]
    : state.starTx;
  const xpTx: XPTransaction[] = xp !== 0
    ? [...state.xpTx, { id: makeId(), childId, amount: xp, source, referenceId, createdAt: new Date().toISOString() }]
    : state.xpTx;
  return { children, starTx, xpTx };
}

function maybeBumpStreak(state: AppState, childId: string, date: string): Record<string, StreakInfo> {
  const doneToday = state.completions.filter(
    (c) => c.childId === childId && c.date === date && (c.status === 'completed' || c.status === 'approved' || c.status === 'awaiting_approval'),
  ).length;
  if (doneToday < state.scoringConfig.minChallengesForStreak) return state.streaks;
  const current = state.streaks[childId] ?? initialStreak(childId, state.scoringConfig.monthlyFreezeTokens);
  return { ...state.streaks, [childId]: bumpStreak(current, date) };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'COMPLETE_QUIZ': {
      const challenge = state.challenges.find((c) => c.id === action.challengeId);
      if (!challenge) return state;
      const date = todayISO();
      const reward = computeReward(state.scoringConfig, challenge.difficulty, challenge.category);
      const completion: ChallengeCompletion = {
        id: action.completionId ?? makeId(),
        challengeId: challenge.id,
        childId: action.childId,
        date,
        status: 'completed',
        starsEarned: reward.stars,
        xpEarned: reward.xp,
        score: { correct: action.correctCount, total: action.totalQuestions },
        completedAt: new Date().toISOString(),
      };
      const credited = creditChild(state, action.childId, reward.stars, reward.xp, `Challenge: ${challenge.title}`, challenge.id);
      const next: AppState = { ...state, ...credited, completions: [...state.completions, completion] };
      next.streaks = maybeBumpStreak(next, action.childId, date);
      return next;
    }
    case 'COMPLETE_TASK': {
      const challenge = state.challenges.find((c) => c.id === action.challengeId);
      if (!challenge) return state;
      const date = todayISO();
      const reward = computeReward(state.scoringConfig, challenge.difficulty, challenge.category);
      if (challenge.requiresApproval) {
        const completion: ChallengeCompletion = {
          id: action.completionId ?? makeId(),
          challengeId: challenge.id,
          childId: action.childId,
          date,
          status: 'awaiting_approval',
          starsEarned: reward.stars,
          xpEarned: reward.xp,
          note: action.note,
          completedAt: new Date().toISOString(),
        };
        return { ...state, completions: [...state.completions, completion] };
      }
      const completion: ChallengeCompletion = {
        id: action.completionId ?? makeId(),
        challengeId: challenge.id,
        childId: action.childId,
        date,
        status: 'completed',
        starsEarned: reward.stars,
        xpEarned: reward.xp,
        note: action.note,
        completedAt: new Date().toISOString(),
      };
      const credited = creditChild(state, action.childId, reward.stars, reward.xp, `Challenge: ${challenge.title}`, challenge.id);
      const next: AppState = { ...state, ...credited, completions: [...state.completions, completion] };
      next.streaks = maybeBumpStreak(next, action.childId, date);
      return next;
    }
    case 'RESOLVE_APPROVAL': {
      const completion = state.completions.find((c) => c.id === action.completionId);
      if (!completion || completion.status !== 'awaiting_approval') return state;
      const challenge = state.challenges.find((c) => c.id === completion.challengeId);
      const status = action.approve ? 'approved' : 'rejected';
      const completions = state.completions.map((c) =>
        c.id === action.completionId ? { ...c, status: status as ChallengeCompletion['status'], resolvedAt: new Date().toISOString() } : c,
      );
      if (!action.approve) {
        return { ...state, completions };
      }
      const credited = creditChild(
        state,
        completion.childId,
        completion.starsEarned,
        completion.xpEarned,
        `Challenge: ${challenge?.title ?? ''}`,
        completion.challengeId,
      );
      const next: AppState = { ...state, ...credited, completions };
      next.streaks = maybeBumpStreak(next, completion.childId, completion.date);
      return next;
    }
    case 'REDEEM_REWARD': {
      const reward = state.rewards.find((r) => r.id === action.rewardId);
      const child = state.children.find((c) => c.id === action.childId);
      if (!reward || !child || child.stars < reward.cost || !reward.active) return state;
      const children = state.children.map((c) => (c.id === child.id ? { ...c, stars: c.stars - reward.cost } : c));
      const starTx: StarTransaction[] = [
        ...state.starTx,
        { id: makeId(), childId: child.id, amount: -reward.cost, source: `Reward: ${reward.name}`, referenceId: reward.id, createdAt: new Date().toISOString() },
      ];
      const redemption: RewardRedemption = {
        id: action.redemptionId ?? makeId(),
        childId: child.id,
        rewardId: reward.id,
        rewardName: reward.name,
        cost: reward.cost,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      return { ...state, children, starTx, redemptions: [...state.redemptions, redemption] };
    }
    case 'RESOLVE_REDEMPTION': {
      const redemption = state.redemptions.find((r) => r.id === action.redemptionId);
      if (!redemption) return state;
      if (action.status === 'rejected' && redemption.status === 'pending') {
        // refund
        const children = state.children.map((c) => (c.id === redemption.childId ? { ...c, stars: c.stars + redemption.cost } : c));
        const starTx: StarTransaction[] = [
          ...state.starTx,
          { id: makeId(), childId: redemption.childId, amount: redemption.cost, source: `Refund: ${redemption.rewardName}`, referenceId: redemption.id, createdAt: new Date().toISOString() },
        ];
        const redemptions = state.redemptions.map((r) => (r.id === redemption.id ? { ...r, status: 'rejected' as const, resolvedAt: new Date().toISOString() } : r));
        return { ...state, children, starTx, redemptions };
      }
      const redemptions = state.redemptions.map((r) => (r.id === redemption.id ? { ...r, status: action.status, resolvedAt: new Date().toISOString() } : r));
      return { ...state, redemptions };
    }
    case 'ADD_CHALLENGE':
      return { ...state, challenges: [...state.challenges, action.challenge] };
    case 'UPDATE_CHALLENGE':
      return { ...state, challenges: state.challenges.map((c) => (c.id === action.challenge.id ? action.challenge : c)) };
    case 'SET_CHALLENGE_ACTIVE':
      return { ...state, challenges: state.challenges.map((c) => (c.id === action.challengeId ? { ...c, active: action.active } : c)) };
    case 'DELETE_CHALLENGE':
      return { ...state, challenges: state.challenges.filter((c) => c.id !== action.challengeId) };
    case 'ADD_REWARD':
      return { ...state, rewards: [...state.rewards, action.reward] };
    case 'UPDATE_REWARD':
      return { ...state, rewards: state.rewards.map((r) => (r.id === action.reward.id ? action.reward : r)) };
    case 'DELETE_REWARD':
      return { ...state, rewards: state.rewards.filter((r) => r.id !== action.rewardId) };
    case 'UPDATE_SCORING_CONFIG':
      return { ...state, scoringConfig: action.config };
    case 'SET_PARENT_PIN':
      return { ...state, parentPin: action.pin };
    case 'SET_LANGUAGE':
      return { ...state, language: action.language };
    case 'UPDATE_CHILD_NAME':
      return { ...state, children: state.children.map((c) => (c.id === action.childId ? { ...c, name: action.name } : c)) };
    case 'ADJUST_STARS': {
      const credited = creditChild(state, action.childId, action.amount, 0, action.reason, 'manual');
      return { ...state, ...credited };
    }
    case 'RESET_ALL':
      return buildInitialState();
    case 'HYDRATE':
      return action.state;
    default:
      return state;
  }
}

interface StoreContextValue {
  state: AppState;
  dispatch: (action: Action) => void;
  loading: boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, reactDispatch] = useReducer(reducer, undefined, () => (isSupabaseConfigured ? buildInitialState() : loadInitialState()));
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    fetchAppState()
      .then((remote) => {
        if (!cancelled && remote) reactDispatch({ type: 'HYDRATE', state: remote });
      })
      .catch((err) => console.error('Failed to load Family Quest data from Supabase', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // localStorage remains the persistence layer only when Supabase isn't
    // configured (offline/demo mode) — otherwise Supabase is the source of
    // truth and we don't want a stale local copy shadowing it.
    if (isSupabaseConfigured) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const dispatch = useCallback((action: Action) => {
    let finalAction = action;
    if (action.type === 'COMPLETE_QUIZ' && !action.completionId) finalAction = { ...action, completionId: makeId() };
    if (action.type === 'COMPLETE_TASK' && !action.completionId) finalAction = { ...action, completionId: makeId() };
    if (action.type === 'REDEEM_REWARD' && !action.redemptionId) finalAction = { ...action, redemptionId: makeId() };
    reactDispatch(finalAction);
    if (isSupabaseConfigured) {
      syncActionToSupabase(finalAction, stateRef.current).catch((err) => console.error('Supabase sync failed', err));
    }
  }, []);

  const value = useMemo(() => ({ state, dispatch, loading }), [state, loading, dispatch]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export { defaultBadges };
