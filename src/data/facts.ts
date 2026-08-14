import type { Language } from '../types';

export interface FactSubject {
  id: string;
  label: string;
  labelHe: string;
  emoji: string;
  facts: string[];
  factsHe: string[]; // same length/order as facts, so index i is the same fact in both languages
}

// Medium-length facts (2-4 sentences) — long enough to teach something real,
// short enough for a daily 30-second moment. A parent sees whichever one the
// child got (stored on the completion note) so they can ask about it later.
export const factSubjects: FactSubject[] = [
  {
    id: 'space',
    label: 'Space',
    labelHe: 'חלל',
    emoji: '🚀',
    facts: [
      'Black holes are regions of space where gravity is so strong that not even light can escape. Scientists can\'t see them directly, but they can detect black holes by watching how nearby stars and gas swirl around an invisible point.',
      'A day on Venus is longer than its year. Venus spins so slowly that it takes about 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.',
      'Saturn is not the only planet with rings — Jupiter, Uranus, and Neptune have them too, but Saturn\'s are the biggest and brightest, made of billions of chunks of ice and rock.',
      'If you could drive a car straight up into space at highway speed, you\'d reach the edge of space in about an hour. That\'s how close space actually is!',
    ],
    factsHe: [
      'חורים שחורים הם אזורים בחלל שבהם הכבידה כל כך חזקה שאפילו אור לא יכול לברוח מהם. מדענים לא יכולים לראות אותם ישירות, אבל הם מזהים חורים שחורים לפי האופן שבו כוכבים וגזים סמוכים מסתחררים סביב נקודה בלתי נראית.',
      'יום בכוכב הלכת נוגה ארוך יותר מהשנה שלו. נוגה מסתובב סביב עצמו כל כך לאט שלוקח לו כ-243 ימי כדור ארץ להשלים סיבוב אחד, אבל רק 225 ימים כדי להקיף את השמש.',
      'שבתאי הוא לא כוכב הלכת היחיד עם טבעות — גם לצדק, לאורנוס ולנפטון יש טבעות, אבל הטבעות של שבתאי הן הגדולות והבהירות ביותר, ועשויות מיליארדי גושי קרח וסלע.',
      'אילו יכולתם לנסוע ברכב ישר לתוך החלל במהירות של כביש מהיר, הייתם מגיעים לקצה החלל תוך כשעה. זה כמה שהחלל בעצם קרוב אלינו!',
    ],
  },
  {
    id: 'sports',
    label: 'Sports',
    labelHe: 'ספורט',
    emoji: '⚽',
    facts: [
      'The fastest recorded serve in tennis history flew at over 260 km/h (163 mph) — faster than cars are allowed to drive on most highways.',
      'A marathon is 42.195 kilometers long because of the 1908 London Olympics: the race started at Windsor Castle and finished in front of the royal box, and that exact distance just stuck.',
      'In basketball, the hoop has been exactly 10 feet (3.05 meters) high since the game was invented in 1891 — the inventor just happened to nail the peach baskets to a 10-foot railing.',
      'Table tennis balls can leave the paddle at speeds over 110 km/h during a fast rally, even though the ball itself weighs less than a ping-pong-sized cotton ball.',
    ],
    factsHe: [
      'ההגשה המהירה ביותר שנמדדה אי פעם בטניס טסה במהירות של מעל 260 קמ"ש — מהר יותר ממה שמותר לרכבים לנסוע ברוב הכבישים המהירים.',
      'אורכו של מרתון הוא 42.195 קילומטר בזכות אולימפיאדת לונדון של 1908: המרוץ התחיל בטירת וינדזור והסתיים מול תא המלוכה, והמרחק המדויק הזה פשוט נשאר.',
      'בכדורסל, גובה הסל הוא בדיוק 10 רגל (3.05 מטר) מאז שהמשחק הומצא ב-1891 — הממציא פשוט מסמר את סלי האפרסקים על מעקה בגובה 10 רגל.',
      'כדורי טניס שולחן יכולים לעוף מהמחבט במהירות של מעל 110 קמ"ש בזמן חילופי מכות מהירים, למרות שהכדור עצמו שוקל פחות מכדור צמר גפן קטן.',
    ],
  },
  {
    id: 'science',
    label: 'Science',
    labelHe: 'מדע',
    emoji: '🔬',
    facts: [
      'Water is one of the only substances on Earth that gets less dense when it freezes, which is why ice floats instead of sinking — and why lakes freeze from the top down, letting fish survive underneath.',
      'Your body makes about 25 million new cells every second, replacing old or damaged ones. Most of the cells in your body today weren\'t there a few years ago.',
      'Lightning is about five times hotter than the surface of the Sun for a tiny fraction of a second, which is why it instantly heats the air around it and creates the sound we hear as thunder.',
      'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are thousands of years old and still perfectly safe to eat.',
    ],
    factsHe: [
      'מים הם אחד החומרים היחידים בכדור הארץ שנעשים פחות צפופים כשהם קופאים, ולכן קרח צף במקום לשקוע — ולכן אגמים קופאים מלמעלה למטה, מה שמאפשר לדגים לשרוד מתחת לקרח.',
      'הגוף שלכם מייצר כ-25 מיליון תאים חדשים בכל שנייה, שמחליפים תאים ישנים או פגומים. רוב התאים בגוף שלכם היום לא היו שם לפני כמה שנים.',
      'ברק חם פי חמישה מפני השמש למשך שבריר שנייה זעיר, ולכן הוא מחמם באופן מיידי את האוויר סביבו ויוצר את הרעם שאנחנו שומעים.',
      'דבש לעולם לא מתקלקל. ארכיאולוגים מצאו סירי דבש בקברי מצרים העתיקה בני אלפי שנים שעדיין בטוחים לגמרי לאכילה.',
    ],
  },
  {
    id: 'animals',
    label: 'Animals',
    labelHe: 'בעלי חיים',
    emoji: '🐾',
    facts: [
      'Octopuses have three hearts and blue blood. Two hearts pump blood to the gills, and the third pumps it to the rest of the body — and that third heart actually stops beating when the octopus swims.',
      'A group of flamingos is called a "flamboyance," and the pink color of their feathers actually comes from the shrimp and algae they eat, not from their own bodies.',
      'Elephants can recognize themselves in a mirror, remember other elephants for decades, and have even been seen appearing to mourn members of their herd who have died.',
      'A shrimp can snap its claw so fast that it creates a bubble hot enough to briefly glow, almost as hot as the surface of the Sun, all to stun its prey.',
    ],
    factsHe: [
      'לתמנונים יש שלושה לבבות ודם כחול. שני לבבות שואבים דם לזימים, והשלישי שואב אותו לשאר הגוף — והלב השלישי הזה בעצם מפסיק לפעום כשהתמנון שוחה.',
      'קבוצת פלמינגו נקראת "להקת זוהר", והצבע הוורוד של הנוצות שלהם מגיע בעצם מהשרימפס והאצות שהם אוכלים, לא מהגוף שלהם עצמו.',
      'פילים מסוגלים לזהות את עצמם במראה, זוכרים פילים אחרים במשך עשרות שנים, ואף נצפו כשהם נראים כמתאבלים על בני עדר שמתו.',
      'שרימפס יכול לסגור את הצבת שלו כל כך מהר שהוא יוצר בועה חמה שמאירה לרגע קט, כמעט חמה כמו פני השמש, והכול כדי להמם את הטרף שלו.',
    ],
  },
  {
    id: 'nature',
    label: 'Nature',
    labelHe: 'טבע',
    emoji: '🌿',
    facts: [
      'The tallest trees on Earth, coast redwoods, can grow over 100 meters tall — taller than a 30-story building — and some living redwoods are more than 2,000 years old.',
      'Bananas are naturally slightly radioactive because they contain potassium, and a small amount of that potassium is a radioactive form. It\'s completely harmless — you\'d need to eat millions of bananas at once for it to matter.',
      'A single bolt of lightning during a storm can help fertilize plants: it turns nitrogen in the air into a form that rain washes into the soil, feeding trees and grass.',
      'Some mushrooms are actually part of enormous underground organisms. One honey fungus in Oregon covers nearly 10 square kilometers underground, making it one of the largest living things on Earth.',
    ],
    factsHe: [
      'העצים הגבוהים ביותר בכדור הארץ, רדווד החוף, יכולים לגדול לגובה של מעל 100 מטר — גבוה יותר מבניין בן 30 קומות — וחלק מהרדווד החי הם בני יותר מ-2,000 שנה.',
      'בננות הן במידה קלה רדיואקטיביות באופן טבעי כי הן מכילות אשלגן, וכמות קטנה מהאשלגן הזה היא בצורה רדיואקטיבית. זה לגמרי לא מזיק — הייתם צריכים לאכול מיליוני בננות בבת אחת כדי שזה יהיה משמעותי.',
      'ברק בודד במהלך סופה יכול לעזור לדשן צמחים: הוא הופך חנקן שבאוויר לצורה שהגשם שוטף לתוך הקרקע, ומזין עצים ועשב.',
      'חלק מהפטריות הן למעשה חלק מיצורים ענקיים תת-קרקעיים. פטריית דבש אחת באורגון מכסה כמעט 10 קילומטרים רבועים מתחת לאדמה, מה שהופך אותה לאחד היצורים החיים הגדולים בכדור הארץ.',
    ],
  },
  {
    id: 'history',
    label: 'History',
    labelHe: 'היסטוריה',
    emoji: '🏛️',
    facts: [
      'The Great Pyramid of Giza was the tallest human-made structure in the world for almost 3,800 years, until England\'s Lincoln Cathedral was finished in 1311.',
      'Ancient Romans used urine to clean and whiten their clothes because the ammonia in it acted like a natural bleach and stain remover.',
      'The first working telephone call and the invention of email happened only about 100 years apart — technology that felt "ancient" to your grandparents is often newer than you\'d guess.',
      'Cleopatra lived closer in time to the invention of the iPhone than to the building of the Great Pyramid of Giza — that\'s how far back Egyptian history really goes.',
    ],
    factsHe: [
      'הפירמידה הגדולה בגיזה הייתה המבנה הגבוה ביותר שבנה אדם בעולם במשך כמעט 3,800 שנה, עד שקתדרלת לינקולן באנגליה הושלמה בשנת 1311.',
      'הרומאים הקדמונים השתמשו בשתן כדי לנקות ולהלבין את הבגדים שלהם, כי האמוניה שבו פעלה כמו מלבין וכתם-מסיר טבעי.',
      'שיחת הטלפון הפעילה הראשונה והמצאת הדואר האלקטרוני התרחשו במרחק של כ-100 שנה בלבד זו מזו — טכנולוגיה שהרגישה "עתיקה" לסבים שלכם היא לרוב חדשה יותר משהייתם מנחשים.',
      'קלאופטרה חיה קרובה בזמן להמצאת האייפון יותר מאשר לבניית הפירמידה הגדולה בגיזה — כל כך רחוק ההיסטוריה המצרית באמת מגיעה.',
    ],
  },
];

export function randomFact(subjectId: string, lang: Language): { subjectLabel: string; fact: string } {
  const subject = factSubjects.find((s) => s.id === subjectId) ?? factSubjects[0];
  const idx = Math.floor(Math.random() * subject.facts.length);
  if (lang === 'he') return { subjectLabel: subject.labelHe, fact: subject.factsHe[idx] ?? subject.facts[idx] };
  return { subjectLabel: subject.label, fact: subject.facts[idx] };
}
