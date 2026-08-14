import type { Category, Language } from '../types';

// Quiz *question text* wasn't covered by the challenge-level title/description
// translation (src/lib/i18n.ts) — so a Hebrew-mode child would see a Hebrew
// title/category tag on a card whose actual question ("How many apples?",
// "What is the perimeter of...") stayed English. There are hundreds of these
// across algorithmically-generated pools (Sam/Alex math, Mia's visual math,
// Picture Puzzle), so a per-string translation map (the approach used for
// challenge titles) doesn't scale — instead this recognizes the small set of
// *templates* every question was generated from and reconstructs the Hebrew
// phrasing with the original numbers/words substituted in. Anything that
// doesn't match a known template (e.g. a parent-typed custom quiz question)
// falls back to the original English text unchanged rather than breaking.

const NOUN_HE: Record<string, string> = {
  apples: 'תפוחים',
  oranges: 'תפוזים',
  balloons: 'בלונים',
  stars: 'כוכבים',
  bunnies: 'ארנבונים',
  cars: 'מכוניות',
  gifts: 'מתנות',
  lollipops: 'סוכריות',
  fish: 'דגים',
  butterflies: 'פרפרים',
  suns: 'שמשות',
  tree: 'עץ',
  trees: 'עצים',
  clouds: 'עננים',
  flowers: 'פרחים',
};

const SHAPE_HE: Record<string, string> = {
  circle: 'עיגול',
  triangle: 'משולש',
  square: 'ריבוע',
  star: 'כוכב',
  rectangle: 'מלבן',
};

const COLOR_HE: Record<string, string> = {
  RED: 'האדום',
  BLUE: 'הכחול',
  GREEN: 'הירוק',
  YELLOW: 'הצהוב',
  PURPLE: 'הסגול',
  ORANGE: 'הכתום',
};

const SHAPE_NAME_HE: Record<string, string> = {
  circle: 'העיגול',
  square: 'הריבוע',
  star: 'הכוכב',
  heart: 'הלב',
};

type Rule = { re: RegExp; build: (m: RegExpMatchArray) => string };

const RULES: Rule[] = [
  // "🍎 🍎 🍎 \nHow many apples?"
  {
    re: /^(.*)\nHow many (\w+)\?$/,
    build: (m) => `${m[1]}\nכמה ${NOUN_HE[m[2]] ?? m[2]} יש?`,
  },
  // "🎈🎈🎈🎈🎈\nYou eat 2. How many are left?"
  {
    re: /^(.*)\nYou eat (\d+)\. How many are left\?$/,
    build: (m) => `${m[1]}\nאכלתם ${m[2]}. כמה נשארו?`,
  },
  // "3    7\nWhich number is bigger?" / "...smaller?"
  {
    re: /^(.*)\nWhich number is (bigger|smaller)\?$/,
    build: (m) => `${m[1]}\nאיזה מספר ${m[2] === 'bigger' ? 'גדול' : 'קטן'} יותר?`,
  },
  // "Which shape is a circle?" etc.
  {
    re: /^Which shape is an? (\w+)\?$/,
    build: (m) => `איזו צורה היא ${SHAPE_HE[m[1]] ?? m[1]}?`,
  },
  { re: /^Which one is NOT round\?$/, build: () => 'איזה אחד הוא לא עגול?' },
  // "Which one is the RED circle?" / "...BLUE square?" / "...GREEN star?" / "...PURPLE heart?"
  {
    re: /^Which one is the (RED|BLUE|GREEN|YELLOW|PURPLE|ORANGE) (circle|square|star|heart)\?$/,
    build: (m) => `איזה מהם ${SHAPE_NAME_HE[m[2]] ?? m[2]} ${COLOR_HE[m[1]] ?? m[1]}?`,
  },
  // "We have 2 suns. We need 3. How many more?"
  {
    re: /^We have (\d+) (\w+)\. We need (\d+)\. How many more\?$/,
    build: (m) => `יש לנו ${m[1]} ${NOUN_HE[m[2]] ?? m[2]}. צריך ${m[3]}. כמה עוד?`,
  },
  // "Half of 150 is?"
  {
    re: /^Half of (\d+) is\?$/,
    build: (m) => `כמה זה חצי מ-${m[1]}?`,
  },
  // "What is 20% of 160?"
  {
    re: /^What is (\d+)% of (\d+)\?$/,
    build: (m) => `כמה זה ${m[1]}% מ-${m[2]}?`,
  },
  // "Solve: 2x + 20 = 26. x = ?" / "Solve: 5x - 17 = 32. x = ?"
  {
    re: /^Solve: (\d+)x ([+-]) (\d+) = (-?\d+)\. x = \?$/,
    build: (m) => `פתרו: ${m[1]}x ${m[2] === '+' ? '+' : '-'} ${m[3]} = ${m[4]}. x = ?`,
  },
  // "What is 18^2?"
  {
    re: /^What is (\d+)\^2\?$/,
    build: (m) => `כמה זה ${m[1]} בריבוע?`,
  },
  // "What is the square root of 4?"
  {
    re: /^What is the square root of (\d+)\?$/,
    build: (m) => `מה השורש הריבועי של ${m[1]}?`,
  },
  // "What is 3/4 as a percentage?"
  {
    re: /^What is (\d+)\/(\d+) as a percentage\?$/,
    build: (m) => `כמה זה ${m[1]}/${m[2]} באחוזים?`,
  },
  // "What is the perimeter of a 3x12 rectangle?"
  {
    re: /^What is the perimeter of a (\d+)x(\d+) rectangle\?$/,
    build: (m) => `מה היקף המלבן שגודלו ${m[1]}x${m[2]}?`,
  },
];

export function translateQuizQuestion(lang: Language, category: Category, question: string): string {
  if (lang === 'en' || category === 'english') return question;
  for (const rule of RULES) {
    const m = question.match(rule.re);
    if (m) return rule.build(m);
  }
  return question;
}
