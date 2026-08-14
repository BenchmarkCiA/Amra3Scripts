export type Category =
  | 'math'
  | 'english'
  | 'knowledge'
  | 'discovery'
  | 'reading'
  | 'physical'
  | 'home'
  | 'kindness'
  | 'sibling'
  | 'family'
  | 'creative'
  | 'memory'
  | 'explorer'
  | 'lifeskills'
  | 'adventure';

export type ChallengeKind = 'quiz' | 'draw' | 'selfreport' | 'discovery' | 'memory';

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type Recurrence = 'once' | 'daily' | 'weekly';

export type Language = 'en' | 'he';

export interface QuizQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
  exampleSentence?: string; // English quizzes: a sentence using the correct word
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: Category;
  kind: ChallengeKind;
  difficulty: Difficulty;
  requiresApproval: boolean;
  recurrence: Recurrence;
  assignedTo: string[]; // child ids
  createdBy: 'system' | 'parent';
  quiz?: QuizQuestion[]; // for kind: 'quiz'
  memorySymbols?: string[]; // for kind: 'memory' — emoji pool; difficulty picks how many pairs
  dueDate?: string; // ISO date, for 'once' challenges
  weekday?: number; // 0-6, for 'weekly' challenges
  active: boolean;
  createdAt: string;
}

export type CompletionStatus =
  | 'in_progress'
  | 'completed'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected';

export interface QuizAnswerDetail {
  question: string;
  correctAnswer: string;
  correct: boolean; // true if answered correctly on the first attempt
}

export interface ChallengeCompletion {
  id: string;
  challengeId: string;
  childId: string;
  date: string; // YYYY-MM-DD, the day this instance belongs to
  status: CompletionStatus;
  starsEarned: number;
  xpEarned: number;
  score?: { correct: number; total: number; details?: QuizAnswerDetail[] };
  note?: string; // what-I-did text (helping-others) or the discovery fact learned
  completedAt?: string;
  resolvedAt?: string;
}

export type ReadingLevel = 'non-reader' | 'emerging' | 'fluent';

export interface Child {
  id: string;
  name: string;
  age: number;
  avatarTheme: 'mia' | 'sam' | 'alex';
  accentColor: string;
  readingLevel: ReadingLevel;
  stars: number;
  xp: number;
  equippedFamily: string | null; // DigitalItem.familyId currently shown as this child's avatar
}

export interface StarTransaction {
  id: string;
  childId: string;
  amount: number;
  source: string;
  referenceId?: string;
  createdAt: string;
}

export interface XPTransaction {
  id: string;
  childId: string;
  amount: number;
  source: string;
  referenceId?: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  active: boolean;
}

export interface RewardRedemption {
  id: string;
  childId: string;
  rewardId: string;
  rewardName: string;
  cost: number;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  createdAt: string;
  resolvedAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category?: Category;
  threshold: number; // count of qualifying completions
}

export interface StreakInfo {
  childId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  freezeTokensAvailable: number;
  freezeTokensUsed: number;
}

export interface ScoringConfig {
  table: Record<Difficulty, { stars: number; xp: number }>;
  helpingOthersBonusPct: number; // applied to kindness/sibling/family categories
  minChallengesForStreak: number;
  monthlyFreezeTokens: number;
  eggUnlockThreshold: number; // lifetime XP needed before the egg-selection screen opens
}

// ---- XP Shop: characters, growth, eggs -------------------------------
// XP is never spent here — "unlock" just permanently records that the child
// has reached the threshold. See README for the full design rationale.

export type UnlockType = 'xp' | 'egg'; // 'egg' items can only be obtained by hatching, never bought directly

export interface DigitalItem {
  id: string;
  key: string; // stable slug, e.g. "astronaut", "dragon-baby"
  name: string;
  nameHe: string;
  emoji: string;
  familyId: string; // groups an item with its growth stages (and itself, if it has none)
  stageOrder: number; // 0 = base stage; higher stages are grown into automatically
  xpRequirement: number; // lifetime XP needed to reach this stage
  minAge: number;
  maxAge: number;
  unlockType: UnlockType;
  active: boolean;
}

export interface ChildUnlock {
  id: string;
  childId: string;
  itemId: string; // always a stageOrder:0 DigitalItem id — later stages are derived, not stored
  unlockedAt: string;
}

export interface EggDef {
  id: string;
  key: string;
  name: string;
  nameHe: string;
  emoji: string;
  familyId: string; // which character family hatches out of this egg
  requiredXp: number; // XP needed after selecting the egg, before it can hatch
  minAge: number;
  maxAge: number;
  active: boolean;
}

export type ChildEggStatus = 'selected' | 'hatched';

export interface ChildEgg {
  id: string;
  childId: string;
  eggId: string;
  selectedAt: string;
  startingXp: number; // lifetime XP snapshot at selection — progress = current XP - this
  requiredXp: number;
  status: ChildEggStatus;
  hatchedAt?: string;
}
