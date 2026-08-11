import type { AppState, Action } from '../state/store';
import type {
  Challenge,
  ChallengeCompletion,
  Child,
  Reward,
  RewardRedemption,
  ScoringConfig,
  StreakInfo,
} from '../types';
import { supabase } from './supabaseClient';
import { computeReward } from './scoring';
import { bumpStreak, initialStreak } from './streak';
import { makeId, todayISO } from './id';

function must() {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

// ---- row -> app-model mapping ------------------------------------------

function mapChild(row: any): Child {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    avatarTheme: row.avatar_theme,
    accentColor: row.accent_color,
    readingLevel: row.reading_level,
    stars: row.stars,
    xp: row.xp,
  };
}

function mapChallenge(row: any): Challenge {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    category: row.category,
    kind: row.kind,
    difficulty: row.difficulty,
    requiresApproval: row.requires_approval,
    recurrence: row.recurrence,
    assignedTo: row.assigned_to ?? [],
    createdBy: row.created_by,
    quiz: row.quiz ?? undefined,
    dueDate: row.due_date ?? undefined,
    weekday: row.weekday ?? undefined,
    active: row.active,
    createdAt: row.created_at,
  };
}

function mapCompletion(row: any): ChallengeCompletion {
  return {
    id: row.id,
    challengeId: row.challenge_id,
    childId: row.child_id,
    date: row.date,
    status: row.status,
    starsEarned: row.stars_earned,
    xpEarned: row.xp_earned,
    score: row.score ?? undefined,
    note: row.note ?? undefined,
    completedAt: row.completed_at ?? undefined,
    resolvedAt: row.resolved_at ?? undefined,
  };
}

function mapReward(row: any): Reward {
  return { id: row.id, name: row.name, cost: row.cost, active: row.active };
}

function mapRedemption(row: any): RewardRedemption {
  return {
    id: row.id,
    childId: row.child_id,
    rewardId: row.reward_id,
    rewardName: row.reward_name,
    cost: row.cost,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at ?? undefined,
  };
}

function mapStreak(row: any): StreakInfo {
  return {
    childId: row.child_id,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastCompletedDate: row.last_completed_date,
    freezeTokensAvailable: row.freeze_tokens_available,
    freezeTokensUsed: row.freeze_tokens_used,
  };
}

function mapScoringConfig(row: any): ScoringConfig {
  return {
    table: row.reward_table,
    helpingOthersBonusPct: row.helping_others_bonus_pct,
    minChallengesForStreak: row.min_challenges_for_streak,
    monthlyFreezeTokens: row.monthly_freeze_tokens,
  };
}

// ---- initial load --------------------------------------------------------

export async function fetchAppState(): Promise<AppState | null> {
  const db = must();
  const [children, challenges, completions, starTx, xpTx, rewards, redemptions, streaks, scoringConfig, appSettings] =
    await Promise.all([
      db.from('children').select('*').order('created_at'),
      db.from('challenges').select('*').order('created_at'),
      db.from('challenge_completions').select('*'),
      db.from('star_transactions').select('*').order('created_at'),
      db.from('xp_transactions').select('*').order('created_at'),
      db.from('rewards').select('*'),
      db.from('reward_redemptions').select('*').order('created_at'),
      db.from('streaks').select('*'),
      db.from('scoring_config').select('*').eq('id', 1).maybeSingle(),
      db.from('app_settings').select('*').eq('id', 1).maybeSingle(),
    ]);

  for (const res of [children, challenges, completions, starTx, xpTx, rewards, redemptions, streaks, scoringConfig, appSettings]) {
    if (res.error) throw res.error;
  }

  const streakMap: Record<string, StreakInfo> = {};
  for (const row of streaks.data ?? []) streakMap[row.child_id] = mapStreak(row);

  return {
    children: (children.data ?? []).map(mapChild),
    challenges: (challenges.data ?? []).map(mapChallenge),
    completions: (completions.data ?? []).map(mapCompletion),
    starTx: (starTx.data ?? []).map((r: any) => ({ id: r.id, childId: r.child_id, amount: r.amount, source: r.source, referenceId: r.reference_id, createdAt: r.created_at })),
    xpTx: (xpTx.data ?? []).map((r: any) => ({ id: r.id, childId: r.child_id, amount: r.amount, source: r.source, referenceId: r.reference_id, createdAt: r.created_at })),
    rewards: (rewards.data ?? []).map(mapReward),
    redemptions: (redemptions.data ?? []).map(mapRedemption),
    streaks: streakMap,
    scoringConfig: scoringConfig.data ? mapScoringConfig(scoringConfig.data) : ({} as ScoringConfig),
    parentPin: appSettings.data?.parent_pin ?? '1234',
    language: appSettings.data?.language ?? 'en',
  };
}

// ---- write-through sync ---------------------------------------------------
// Each dispatched action is mirrored to Supabase using the *pre-action*
// state snapshot (prevState) for any lookups (challenge/reward definitions,
// current balances) it needs — mirroring exactly what the local reducer in
// state/store.tsx already computed, so local state and the DB never diverge.

async function creditChildRow(childId: string, stars: number, xp: number, source: string, referenceId: string, prevState: AppState) {
  const db = must();
  const child = prevState.children.find((c) => c.id === childId);
  if (!child) return;
  const ops: PromiseLike<any>[] = [];
  if (stars !== 0 || xp !== 0) {
    ops.push(db.from('children').update({ stars: child.stars + stars, xp: child.xp + xp }).eq('id', childId));
  }
  if (stars !== 0) {
    ops.push(db.from('star_transactions').insert({ child_id: childId, amount: stars, source, reference_id: referenceId }));
  }
  if (xp !== 0) {
    ops.push(db.from('xp_transactions').insert({ child_id: childId, amount: xp, source, reference_id: referenceId }));
  }
  await Promise.all(ops);
}

async function bumpStreakRow(childId: string, date: string, prevState: AppState) {
  const doneToday = prevState.completions.filter(
    (c) => c.childId === childId && c.date === date && (c.status === 'completed' || c.status === 'approved' || c.status === 'awaiting_approval'),
  ).length;
  // +1 because prevState is the snapshot *before* this action's completion was added.
  if (doneToday + 1 < prevState.scoringConfig.minChallengesForStreak) return;
  const current = prevState.streaks[childId] ?? initialStreak(childId, prevState.scoringConfig.monthlyFreezeTokens);
  const next = bumpStreak(current, date);
  if (next.lastCompletedDate === current.lastCompletedDate && next.currentStreak === current.currentStreak) return;
  const db = must();
  await db.from('streaks').upsert({
    child_id: childId,
    current_streak: next.currentStreak,
    longest_streak: next.longestStreak,
    last_completed_date: next.lastCompletedDate,
    freeze_tokens_available: next.freezeTokensAvailable,
    freeze_tokens_used: next.freezeTokensUsed,
  });
}

function challengeRow(challenge: Challenge) {
  return {
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    category: challenge.category,
    kind: challenge.kind,
    difficulty: challenge.difficulty,
    requires_approval: challenge.requiresApproval,
    recurrence: challenge.recurrence,
    assigned_to: challenge.assignedTo,
    created_by: challenge.createdBy,
    quiz: challenge.quiz ?? null,
    due_date: challenge.dueDate ?? null,
    weekday: challenge.weekday ?? null,
    active: challenge.active,
  };
}

export async function syncActionToSupabase(action: Action, prevState: AppState): Promise<void> {
  const db = must();

  switch (action.type) {
    case 'COMPLETE_QUIZ': {
      const challenge = prevState.challenges.find((c) => c.id === action.challengeId);
      if (!challenge) return;
      const date = todayISO();
      const reward = computeReward(prevState.scoringConfig, challenge.difficulty, challenge.category);
      const { error } = await db.from('challenge_completions').insert({
        id: action.completionId ?? makeId(),
        challenge_id: challenge.id,
        child_id: action.childId,
        date,
        status: 'completed',
        stars_earned: reward.stars,
        xp_earned: reward.xp,
        score: { correct: action.correctCount, total: action.totalQuestions },
        completed_at: new Date().toISOString(),
      });
      if (error) throw error;
      await creditChildRow(action.childId, reward.stars, reward.xp, `Challenge: ${challenge.title}`, challenge.id, prevState);
      await bumpStreakRow(action.childId, date, prevState);
      return;
    }
    case 'COMPLETE_TASK': {
      const challenge = prevState.challenges.find((c) => c.id === action.challengeId);
      if (!challenge) return;
      const date = todayISO();
      const reward = computeReward(prevState.scoringConfig, challenge.difficulty, challenge.category);
      const status = challenge.requiresApproval ? 'awaiting_approval' : 'completed';
      const { error } = await db.from('challenge_completions').insert({
        id: action.completionId ?? makeId(),
        challenge_id: challenge.id,
        child_id: action.childId,
        date,
        status,
        stars_earned: reward.stars,
        xp_earned: reward.xp,
        note: action.note ?? null,
        completed_at: new Date().toISOString(),
      });
      if (error) throw error;
      if (status === 'completed') {
        await creditChildRow(action.childId, reward.stars, reward.xp, `Challenge: ${challenge.title}`, challenge.id, prevState);
      }
      await bumpStreakRow(action.childId, date, prevState);
      return;
    }
    case 'RESOLVE_APPROVAL': {
      const completion = prevState.completions.find((c) => c.id === action.completionId);
      if (!completion || completion.status !== 'awaiting_approval') return;
      const status = action.approve ? 'approved' : 'rejected';
      const { error } = await db
        .from('challenge_completions')
        .update({ status, resolved_at: new Date().toISOString() })
        .eq('id', action.completionId);
      if (error) throw error;
      if (action.approve) {
        const challenge = prevState.challenges.find((c) => c.id === completion.challengeId);
        await creditChildRow(completion.childId, completion.starsEarned, completion.xpEarned, `Challenge: ${challenge?.title ?? ''}`, completion.challengeId, prevState);
        await bumpStreakRow(completion.childId, completion.date, prevState);
      }
      return;
    }
    case 'REDEEM_REWARD': {
      const reward = prevState.rewards.find((r) => r.id === action.rewardId);
      const child = prevState.children.find((c) => c.id === action.childId);
      if (!reward || !child || child.stars < reward.cost || !reward.active) return;
      const { error } = await db.from('reward_redemptions').insert({
        id: action.redemptionId ?? makeId(),
        child_id: child.id,
        reward_id: reward.id,
        reward_name: reward.name,
        cost: reward.cost,
        status: 'pending',
      });
      if (error) throw error;
      await db.from('children').update({ stars: child.stars - reward.cost }).eq('id', child.id);
      await db.from('star_transactions').insert({ child_id: child.id, amount: -reward.cost, source: `Reward: ${reward.name}`, reference_id: reward.id });
      return;
    }
    case 'RESOLVE_REDEMPTION': {
      const redemption = prevState.redemptions.find((r) => r.id === action.redemptionId);
      if (!redemption) return;
      const { error } = await db
        .from('reward_redemptions')
        .update({ status: action.status, resolved_at: new Date().toISOString() })
        .eq('id', action.redemptionId);
      if (error) throw error;
      if (action.status === 'rejected' && redemption.status === 'pending') {
        const child = prevState.children.find((c) => c.id === redemption.childId);
        if (child) {
          await db.from('children').update({ stars: child.stars + redemption.cost }).eq('id', child.id);
          await db.from('star_transactions').insert({ child_id: redemption.childId, amount: redemption.cost, source: `Refund: ${redemption.rewardName}`, reference_id: redemption.id });
        }
      }
      return;
    }
    case 'ADD_CHALLENGE': {
      const { error } = await db.from('challenges').insert(challengeRow(action.challenge));
      if (error) throw error;
      return;
    }
    case 'UPDATE_CHALLENGE': {
      const { error } = await db.from('challenges').update(challengeRow(action.challenge)).eq('id', action.challenge.id);
      if (error) throw error;
      return;
    }
    case 'SET_CHALLENGE_ACTIVE': {
      const { error } = await db.from('challenges').update({ active: action.active }).eq('id', action.challengeId);
      if (error) throw error;
      return;
    }
    case 'DELETE_CHALLENGE': {
      const { error } = await db.from('challenges').delete().eq('id', action.challengeId);
      if (error) throw error;
      return;
    }
    case 'ADD_REWARD': {
      const { error } = await db.from('rewards').insert({ id: action.reward.id, name: action.reward.name, cost: action.reward.cost, active: action.reward.active });
      if (error) throw error;
      return;
    }
    case 'UPDATE_REWARD': {
      const { error } = await db
        .from('rewards')
        .update({ name: action.reward.name, cost: action.reward.cost, active: action.reward.active })
        .eq('id', action.reward.id);
      if (error) throw error;
      return;
    }
    case 'DELETE_REWARD': {
      const { error } = await db.from('rewards').delete().eq('id', action.rewardId);
      if (error) throw error;
      return;
    }
    case 'UPDATE_SCORING_CONFIG': {
      const { error } = await db
        .from('scoring_config')
        .update({
          reward_table: action.config.table,
          helping_others_bonus_pct: action.config.helpingOthersBonusPct,
          min_challenges_for_streak: action.config.minChallengesForStreak,
          monthly_freeze_tokens: action.config.monthlyFreezeTokens,
        })
        .eq('id', 1);
      if (error) throw error;
      return;
    }
    case 'SET_PARENT_PIN': {
      const { error } = await db.from('app_settings').update({ parent_pin: action.pin }).eq('id', 1);
      if (error) throw error;
      return;
    }
    case 'SET_LANGUAGE': {
      const { error } = await db.from('app_settings').update({ language: action.language }).eq('id', 1);
      if (error) throw error;
      return;
    }
    case 'UPDATE_CHILD_NAME': {
      const { error } = await db.from('children').update({ name: action.name }).eq('id', action.childId);
      if (error) throw error;
      return;
    }
    case 'ADJUST_STARS': {
      const child = prevState.children.find((c) => c.id === action.childId);
      if (!child) return;
      await db.from('children').update({ stars: child.stars + action.amount }).eq('id', action.childId);
      await db.from('star_transactions').insert({ child_id: action.childId, amount: action.amount, source: action.reason, reference_id: 'manual' });
      return;
    }
    case 'RESET_ALL':
      // Deliberately not synced: resetting is local-only when Supabase is
      // configured, so a parent can't accidentally wipe real family history
      // from a settings-screen button. Wipe/reseed the Supabase project
      // directly (SQL) if that's genuinely what's wanted.
      return;
    case 'HYDRATE':
      return;
    default:
      return;
  }
}
