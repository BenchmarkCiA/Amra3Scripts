import type { Category, Difficulty, ScoringConfig } from '../types';

// PRD §12 — base Stars/XP per Difficulty (1-5). Stars use the top of each
// range; parents can retune every number from the Settings screen.
export const defaultScoringConfig: ScoringConfig = {
  table: {
    1: { stars: 1, xp: 20 },
    2: { stars: 2, xp: 40 },
    3: { stars: 3, xp: 75 },
    4: { stars: 4, xp: 120 },
    5: { stars: 5, xp: 200 },
  },
  // PRD §9/§45: kindness & helping-others challenges must always score
  // highest. A flat bonus on top of the difficulty table guarantees a
  // kindness/sibling/family challenge always beats a non-helping challenge
  // of the same difficulty, without a parent having to remember to boost it.
  helpingOthersBonusPct: 50,
  minChallengesForStreak: 2,
  monthlyFreezeTokens: 2,
  eggUnlockThreshold: 2000,
};

const HELPING_OTHERS_CATEGORIES: ReadonlySet<Category> = new Set([
  'kindness',
  'sibling',
  'family',
]);

export function isHelpingOthers(category: Category): boolean {
  return HELPING_OTHERS_CATEGORIES.has(category);
}

export interface RewardComputation {
  stars: number;
  xp: number;
  bonusApplied: boolean;
  bonusPct: number;
}

export function computeReward(
  config: ScoringConfig,
  difficulty: Difficulty,
  category: Category,
): RewardComputation {
  const base = config.table[difficulty];
  const bonusApplied = isHelpingOthers(category);
  const multiplier = bonusApplied ? 1 + config.helpingOthersBonusPct / 100 : 1;
  return {
    stars: Math.ceil(base.stars * multiplier),
    xp: Math.ceil(base.xp * multiplier),
    bonusApplied,
    bonusPct: bonusApplied ? config.helpingOthersBonusPct : 0,
  };
}

export const CATEGORY_LABEL: Record<Category, string> = {
  math: 'Math',
  english: 'English',
  knowledge: 'Knowledge',
  discovery: 'Discovery',
  reading: 'Reading',
  physical: 'Movement',
  home: 'Home',
  kindness: 'Kindness',
  sibling: 'Sibling',
  family: 'Family',
  creative: 'Creative',
  memory: 'Memory',
  logic: 'Logic',
  explorer: 'Explorer',
  lifeskills: 'I Can Do It!',
  adventure: 'Daily Adventure',
};

export const CATEGORY_COLOR: Record<Category, string> = {
  math: 'var(--cat-math)',
  english: 'var(--cat-english)',
  knowledge: 'var(--cat-learn)',
  discovery: 'var(--cat-learn)',
  reading: 'var(--cat-reading)',
  physical: 'var(--cat-exercise)',
  home: 'var(--cat-chores)',
  kindness: 'var(--cat-kindness)',
  sibling: 'var(--cat-kindness)',
  family: 'var(--cat-family)',
  creative: 'var(--cat-drawing)',
  memory: 'var(--cat-memory)',
  logic: 'var(--cat-logic)',
  explorer: 'var(--cat-explorer)',
  lifeskills: 'var(--cat-lifeskills)',
  adventure: 'var(--cat-adventure)',
};

// Level curve, age-normalized per PRD §16 REVISION NOTE: each child's XP
// needed per level scales down with age so a 5-year-old's own track moves
// at a comparable pace to her older siblings' tracks, not the same absolute
// XP wall. Age band multiplier is relative to a 13+ "full" curve.
function ageBandMultiplier(age: number): number {
  if (age <= 6) return 0.35;
  if (age <= 9) return 0.55;
  if (age <= 12) return 0.75;
  return 1;
}

const BASE_LEVEL_CURVE = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000];

export function levelForXp(age: number, xp: number): { level: number; xpIntoLevel: number; xpForNextLevel: number } {
  const mult = ageBandMultiplier(age);
  const curve = BASE_LEVEL_CURVE.map((v) => Math.round(v * mult));
  let level = 1;
  for (let i = 1; i < curve.length; i++) {
    if (xp >= curve[i]) level = i + 1;
    else break;
  }
  const idx = level - 1;
  const floor = curve[idx] ?? curve[curve.length - 1];
  const nextRaw = curve[idx + 1];
  const next = nextRaw ?? floor + Math.round(1200 * mult);
  return { level, xpIntoLevel: xp - floor, xpForNextLevel: next - floor };
}
