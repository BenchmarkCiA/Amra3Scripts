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
  | 'creative';

export type ChallengeKind = 'quiz' | 'draw' | 'selfreport' | 'discovery';

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

export interface ChallengeCompletion {
  id: string;
  challengeId: string;
  childId: string;
  date: string; // YYYY-MM-DD, the day this instance belongs to
  status: CompletionStatus;
  starsEarned: number;
  xpEarned: number;
  score?: { correct: number; total: number };
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
}
