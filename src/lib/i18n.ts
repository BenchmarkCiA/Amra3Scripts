import type { Category, Language } from '../types';

export function isRTL(lang: Language): boolean {
  return lang === 'he';
}

// UI chrome only — seed challenge/quiz/fact content stays English-authored
// for now (translating educational content accurately is a separate,
// larger effort than RTL/layout support). See README.
const dict = {
  en: {
    appName: 'Family Quest',
    whoseTurn: "Whose turn is it? Tap your name to start today's quests.",
    parentMode: 'Parent mode',
    age: 'Age',
    switchProfile: 'Switch profile',
    hey: 'Hey',
    questLogToday: "Here's your quest log for today.",
    todaysQuests: "Today's Quests",
    seeAll: 'See all',
    yourQuests: 'Your Quests',
    doneToday: 'done today',
    noQuestsYet: 'No quests assigned yet — check back soon!',
    waitingApproval: 'Waiting for approval',
    tabHome: 'Home',
    tabQuests: 'Quests',
    tabRewards: 'Rewards',
    tabStreaks: 'Streaks',
    rewardShop: 'Reward Shop',
    youHave: 'You have',
    stars: 'stars',
    redeem: 'Redeem',
    noRewardsYet: 'No rewards yet — ask a parent to add some!',
    redeemedWaiting: 'Redeemed! Waiting for parent approval.',
    streaksAndBadges: 'Streaks & Badges',
    keepStreakAlive: 'Keep your quest streak alive!',
    dayStreak: 'day streak',
    keepGoing: 'Keep it going!',
    completeToStartStreak: 'quests today to start a streak.',
    freezeTokensLeft: 'freeze token(s) left this month',
    markComplete: 'Mark Complete',
    whatDidYouDo: 'What did you do? (a parent will see this)',
    submitWaitingApproval: 'Submitted — waiting for approval!',
    imDone: "I'm done!",
    clear: 'Clear',
    correct: 'Correct!',
    notQuite: 'Not quite — try again!',
    example: 'Example',
    next: 'Next question',
    questionOf: 'Question',
    of: 'of',
    chooseSubject: 'Choose a subject',
    gotIt: "Got it!",
    parentPinPrompt: 'Enter the parent PIN to manage challenges, rewards and approvals.',
    unlock: 'Unlock',
    wrongPin: 'Wrong PIN — try again.',
    back: 'Back',
    exitParentMode: 'Exit parent mode',
    dashboard: 'Dashboard',
    addChallenge: '+ Add Challenge',
    allChallenges: 'All Challenges',
    rewards: 'Rewards',
    stats: 'Stats',
    settings: 'Settings',
    tabShop: 'Shop',
    xpShopTitle: 'XP Shop',
    yourXp: 'Your XP',
    myCharacter: 'My Character',
    changeCharacter: 'Change Character',
    unlockAt: 'Unlock at',
    unlocked: 'UNLOCKED',
    use: 'Use',
    inUse: 'In use',
    unlockBtn: 'Unlock',
    myEgg: 'My Egg',
    chooseYourEgg: 'Choose your egg!',
    eggAvailable: 'Egg available!',
    hatchingProgress: 'Hatching progress',
    hatchNow: 'Hatch now!',
    eggReady: "Your egg is ready!",
    newCharacter: 'New character!',
    welcomeCompanion: 'Welcome to your new companion!',
    almostThere: 'Almost there!',
    chooseThisEgg: 'Choose this egg',
    hatchingRequirement: 'Hatching requirement',
    yourDragonGrew: 'Your character grew!',
    nextStage: 'Next stage',
    fullyGrown: 'Fully grown!',
    noEggYet: "You haven't chosen an egg yet.",
    keepEarningForEgg: 'Keep earning XP to unlock the egg screen!',
  },
  he: {
    appName: 'משימת המשפחה',
    whoseTurn: 'של מי התור? הקישו על השם שלכם כדי להתחיל את המשימות של היום.',
    parentMode: 'מצב הורה',
    age: 'גיל',
    switchProfile: 'החלפת פרופיל',
    hey: 'היי',
    questLogToday: 'הנה יומן המשימות שלך להיום.',
    todaysQuests: 'המשימות של היום',
    seeAll: 'לכל המשימות',
    yourQuests: 'המשימות שלך',
    doneToday: 'הושלמו היום',
    noQuestsYet: 'עדיין אין משימות — בדקו שוב בקרוב!',
    waitingApproval: 'ממתין לאישור',
    tabHome: 'בית',
    tabQuests: 'משימות',
    tabRewards: 'פרסים',
    tabStreaks: 'רצף',
    rewardShop: 'חנות הפרסים',
    youHave: 'יש לך',
    stars: 'כוכבים',
    redeem: 'לממש',
    noRewardsYet: 'אין עדיין פרסים — בקשו מהורה להוסיף!',
    redeemedWaiting: 'מומש! ממתין לאישור הורה.',
    streaksAndBadges: 'רצף ותגים',
    keepStreakAlive: 'שמרו על רצף המשימות שלכם!',
    dayStreak: 'ימי רצף',
    keepGoing: 'כל הכבוד, המשיכו כך!',
    completeToStartStreak: 'משימות היום כדי להתחיל רצף.',
    freezeTokensLeft: 'אסימוני הקפאה נותרו החודש',
    markComplete: 'סמן כהושלם',
    whatDidYouDo: 'מה עשית? (הורה יראה את זה)',
    submitWaitingApproval: 'נשלח — ממתין לאישור!',
    imDone: 'סיימתי!',
    clear: 'נקה',
    correct: 'נכון!',
    notQuite: 'כמעט — נסו שוב!',
    example: 'דוגמה',
    next: 'שאלה הבאה',
    questionOf: 'שאלה',
    of: 'מתוך',
    chooseSubject: 'בחרו נושא',
    gotIt: 'הבנתי!',
    parentPinPrompt: 'הזינו את קוד ההורה כדי לנהל משימות, פרסים ואישורים.',
    unlock: 'פתיחה',
    wrongPin: 'קוד שגוי — נסו שוב.',
    back: 'חזרה',
    exitParentMode: 'יציאה ממצב הורה',
    dashboard: 'לוח בקרה',
    addChallenge: '+ הוספת משימה',
    allChallenges: 'כל המשימות',
    rewards: 'פרסים',
    stats: 'סטטיסטיקה',
    settings: 'הגדרות',
    tabShop: 'חנות',
    xpShopTitle: 'חנות ה-XP',
    yourXp: 'ה-XP שלך',
    myCharacter: 'הדמות שלי',
    changeCharacter: 'החלפת דמות',
    unlockAt: 'נפתח ב-',
    unlocked: 'נפתח',
    use: 'שימוש',
    inUse: 'בשימוש',
    unlockBtn: 'פתיחה',
    myEgg: 'הביצה שלי',
    chooseYourEgg: 'בחרו את הביצה שלכם!',
    eggAvailable: 'ביצה זמינה!',
    hatchingProgress: 'התקדמות בבקיעה',
    hatchNow: 'לבקוע עכשיו!',
    eggReady: 'הביצה שלכם מוכנה!',
    newCharacter: 'דמות חדשה!',
    welcomeCompanion: 'ברוכים הבאים לחבר החדש שלכם!',
    almostThere: 'כמעט הגעתם!',
    chooseThisEgg: 'לבחור בביצה הזו',
    hatchingRequirement: 'דרישת בקיעה',
    yourDragonGrew: 'הדמות שלכם גדלה!',
    nextStage: 'השלב הבא',
    fullyGrown: 'הגיעה לגודל מלא!',
    noEggYet: 'עדיין לא בחרתם ביצה.',
    keepEarningForEgg: 'המשיכו לצבור XP כדי לפתוח את מסך הביצים!',
  },
} as const;

export type TKey = keyof typeof dict.en;

export function t(lang: Language, key: TKey): string {
  return dict[lang][key] ?? dict.en[key];
}

const categoryLabels: Record<Language, Record<Category, string>> = {
  en: {
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
  },
  he: {
    math: 'חשבון',
    english: 'אנגלית',
    knowledge: 'ידע כללי',
    discovery: 'גילוי',
    reading: 'קריאה',
    physical: 'תנועה',
    home: 'בית',
    kindness: 'טוב לב',
    sibling: 'אחים',
    family: 'משפחה',
    creative: 'יצירה',
  },
};

export function categoryLabel(lang: Language, category: Category): string {
  return categoryLabels[lang][category];
}

// ---- Seed content translation ------------------------------------------
// Challenge/reward/badge *content* (not UI chrome) is still English-authored
// (see README), except for the small set of seed items translated here.
// Rule: a challenge whose subject *is* English (category 'english' — the
// spelling/vocabulary quiz) stays English end-to-end rather than mixing a
// Hebrew title onto English quiz content — translating only half of it reads
// worse than leaving it consistently in one language.

const challengeTitleHe: Record<string, string> = {
  'Counting Fun': 'כיף בספירה',
  'Draw & Doodle': 'ציור וקשקוש',
  'Toy Pickup': 'איסוף צעצועים',
  'Kind Heart': 'לב טוב',
  "Today's Discovery": 'הגילוי של היום',
  'Math Quest': 'משימת חשבון',
  'Room Rescue': 'הצלת החדר',
};

const challengeDescriptionHe: Record<string, string> = {
  'Solve the puzzle! Tap the picture with the right number.': 'פתרו את החידה! הקישו על התמונה עם המספר הנכון.',
  'Draw anything you like!': 'ציירו מה שבא לכם!',
  'Put your toys back in the bin!': 'החזירו את הצעצועים לארגז!',
  'Give someone in your family a big hug today!': 'תנו לבן משפחה חיבוק גדול היום!',
  'Pick a subject and learn a fun fact!': 'בחרו נושא ולמדו עובדה מעניינת!',
  'Solve 10 questions to earn Stars!': 'פתרו 10 שאלות כדי להרוויח כוכבים!',
  'Tidy your room or help with a chore at home.': 'סדרו את החדר או עזרו במטלת בית.',
  "Do something kind for your sibling today — don’t tell them it was a challenge.":
    'עשו משהו נחמד לאח או לאחות שלכם היום — בלי לספר להם שזו הייתה משימה.',
  'Do something kind for someone in your family today.': 'עשו משהו נחמד לבן משפחה היום.',
};

export function localizeChallengeText(
  lang: Language,
  challenge: { title: string; description: string; category: Category },
): { title: string; description: string } {
  if (lang === 'en' || challenge.category === 'english') {
    return { title: challenge.title, description: challenge.description };
  }
  return {
    title: challengeTitleHe[challenge.title] ?? challenge.title,
    description: challengeDescriptionHe[challenge.description] ?? challenge.description,
  };
}

const rewardNameHe: Record<string, string> = {
  '+30 min screen time': '+30 דקות מסך',
  'Ice cream treat': 'קינוח גלידה',
  'Stay up 30 min late': 'להישאר ער 30 דקות נוספות',
  'Pick family movie night': 'לבחור סרט לערב משפחתי',
  'Small toy': 'צעצוע קטן',
  'Family outing': 'טיול משפחתי',
};

export function localizeRewardName(lang: Language, name: string): string {
  if (lang === 'en') return name;
  return rewardNameHe[name] ?? name;
}

const badgeHe: Record<string, { name: string; description: string }> = {
  'first-quest': { name: 'המשימה הראשונה', description: 'השלימו את המשימה הראשונה שלכם.' },
  'quiz-master': { name: 'אלוף החידונים', description: 'השלימו 5 משימות.' },
  'kindness-hero': { name: 'גיבור טוב הלב', description: 'השלימו 20 משימות טוב לב.' },
  'home-hero': { name: 'גיבור הבית', description: 'השלימו 30 משימות בית.' },
  'math-master': { name: 'אלוף החשבון', description: 'השלימו 25 משימות חשבון.' },
  'quest-champion': { name: 'אלוף המשימות', description: 'השלימו 50 משימות בסך הכול.' },
};

export function localizeBadge(lang: Language, badge: { id: string; name: string; description: string }): { name: string; description: string } {
  if (lang === 'en') return { name: badge.name, description: badge.description };
  const tr = badgeHe[badge.id];
  return tr ?? { name: badge.name, description: badge.description };
}

export function localizeItemName(lang: Language, item: { name: string; nameHe: string }): string {
  return lang === 'he' ? item.nameHe : item.name;
}
