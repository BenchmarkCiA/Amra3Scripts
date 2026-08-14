import type { DigitalItem, EggDef } from '../types';

// MVP content sizing follows the spec's own guidance: ~10-15 characters,
// ~5-6 eggs, 2-3 growth stages for a handful of them — not a full item
// economy. All characters keep happy/friendly expressions (here: emoji).

// Regular characters — unlock permanently once a child's lifetime XP crosses
// xpRequirement. Single stage (stageOrder 0), no growth.
export const characterItems: DigitalItem[] = [
  // Age-neutral / broad appeal
  { id: 'astronaut', key: 'astronaut', name: 'Astronaut', nameHe: 'אסטרונאוט', emoji: '🧑‍🚀', familyId: 'astronaut', stageOrder: 0, xpRequirement: 0, minAge: 4, maxAge: 99, unlockType: 'xp', active: true },
  { id: 'robot', key: 'robot', name: 'Robot', nameHe: 'רובוט', emoji: '🤖', familyId: 'robot', stageOrder: 0, xpRequirement: 800, minAge: 4, maxAge: 99, unlockType: 'xp', active: true },
  { id: 'pirate', key: 'pirate', name: 'Pirate', nameHe: 'שודד ים', emoji: '🏴‍☠️', familyId: 'pirate', stageOrder: 0, xpRequirement: 500, minAge: 4, maxAge: 99, unlockType: 'xp', active: true },
  { id: 'wizard', key: 'wizard', name: 'Wizard', nameHe: 'קוסם', emoji: '🧙', familyId: 'wizard', stageOrder: 0, xpRequirement: 1200, minAge: 4, maxAge: 99, unlockType: 'xp', active: true },
  { id: 'fox', key: 'fox', name: 'Fox', nameHe: 'שועל', emoji: '🦊', familyId: 'fox', stageOrder: 0, xpRequirement: 300, minAge: 3, maxAge: 99, unlockType: 'xp', active: true },
  { id: 'panda', key: 'panda', name: 'Panda', nameHe: 'פנדה', emoji: '🐼', familyId: 'panda', stageOrder: 0, xpRequirement: 600, minAge: 3, maxAge: 99, unlockType: 'xp', active: true },
  { id: 'alien', key: 'alien', name: 'Space Explorer', nameHe: 'חוקר חלל', emoji: '👽', familyId: 'alien', stageOrder: 0, xpRequirement: 1800, minAge: 6, maxAge: 99, unlockType: 'xp', active: true },
  // Age-5 leaning
  { id: 'fairy', key: 'fairy', name: 'Fairy', nameHe: 'פיה', emoji: '🧚', familyId: 'fairy', stageOrder: 0, xpRequirement: 400, minAge: 3, maxAge: 9, unlockType: 'xp', active: true },
  { id: 'kitten', key: 'kitten', name: 'Kitten', nameHe: 'גורת חתולים', emoji: '🐱', familyId: 'kitten', stageOrder: 0, xpRequirement: 200, minAge: 3, maxAge: 9, unlockType: 'xp', active: true },
  { id: 'bunny', key: 'bunny', name: 'Bunny', nameHe: 'ארנבון', emoji: '🐰', familyId: 'bunny', stageOrder: 0, xpRequirement: 150, minAge: 3, maxAge: 9, unlockType: 'xp', active: true },

  // Egg-exclusive families — stage 0 can ONLY be obtained by hatching the
  // matching egg (unlockType 'egg'), never shown as directly XP-purchasable.
  // Later stages are plain lifetime-XP thresholds, same mechanism as above.
  { id: 'dragon-baby', key: 'dragon-baby', name: 'Baby Dragon', nameHe: 'דרקון תינוק', emoji: '🥚🐲', familyId: 'dragon', stageOrder: 0, xpRequirement: 0, minAge: 4, maxAge: 99, unlockType: 'egg', active: true },
  { id: 'dragon-young', key: 'dragon-young', name: 'Young Dragon', nameHe: 'דרקון צעיר', emoji: '🐉', familyId: 'dragon', stageOrder: 1, xpRequirement: 4000, minAge: 4, maxAge: 99, unlockType: 'xp', active: true },
  { id: 'dragon-full', key: 'dragon-full', name: 'Dragon', nameHe: 'דרקון', emoji: '🐉✨', familyId: 'dragon', stageOrder: 2, xpRequirement: 9000, minAge: 4, maxAge: 99, unlockType: 'xp', active: true },

  { id: 'unicorn-baby', key: 'unicorn-baby', name: 'Baby Unicorn', nameHe: 'חד־קרן תינוק', emoji: '🥚🦄', familyId: 'unicorn', stageOrder: 0, xpRequirement: 0, minAge: 3, maxAge: 9, unlockType: 'egg', active: true },
  { id: 'unicorn-rainbow', key: 'unicorn-rainbow', name: 'Rainbow Unicorn', nameHe: 'חד־קרן קשת', emoji: '🦄🌈', familyId: 'unicorn', stageOrder: 1, xpRequirement: 3200, minAge: 3, maxAge: 9, unlockType: 'xp', active: true },

  { id: 'puppy-baby', key: 'puppy-baby', name: 'Puppy', nameHe: 'גור כלבים', emoji: '🥚🐶', familyId: 'puppy', stageOrder: 0, xpRequirement: 0, minAge: 3, maxAge: 99, unlockType: 'egg', active: true },
  { id: 'puppy-grown', key: 'puppy-grown', name: 'Good Boy', nameHe: 'כלב טוב', emoji: '🐕', familyId: 'puppy', stageOrder: 1, xpRequirement: 2800, minAge: 3, maxAge: 99, unlockType: 'xp', active: true },

  { id: 'dino-baby', key: 'dino-baby', name: 'Baby Dino', nameHe: 'דינוזאור תינוק', emoji: '🥚🦕', familyId: 'dino', stageOrder: 0, xpRequirement: 0, minAge: 4, maxAge: 99, unlockType: 'egg', active: true },
  { id: 'dino-grown', key: 'dino-grown', name: 'Dino', nameHe: 'דינוזאור', emoji: '🦖', familyId: 'dino', stageOrder: 1, xpRequirement: 4500, minAge: 4, maxAge: 99, unlockType: 'xp', active: true },

  { id: 'robot-buddy', key: 'robot-buddy', name: 'Robo-Buddy', nameHe: 'רובוט חבר', emoji: '🥚🤖', familyId: 'robot-buddy', stageOrder: 0, xpRequirement: 0, minAge: 6, maxAge: 99, unlockType: 'egg', active: true },
];

export const eggDefs: EggDef[] = [
  { id: 'egg-dragon', key: 'dragon-egg', name: 'Dragon Egg', nameHe: 'ביצת דרקון', emoji: '🥚', familyId: 'dragon', requiredXp: 1500, minAge: 4, maxAge: 99, active: true },
  { id: 'egg-unicorn', key: 'rainbow-egg', name: 'Rainbow Egg', nameHe: 'ביצת קשת', emoji: '🥚', familyId: 'unicorn', requiredXp: 1200, minAge: 3, maxAge: 9, active: true },
  { id: 'egg-puppy', key: 'puppy-egg', name: 'Puppy Egg', nameHe: 'ביצת כלבלב', emoji: '🥚', familyId: 'puppy', requiredXp: 1000, minAge: 3, maxAge: 99, active: true },
  { id: 'egg-dino', key: 'dino-egg', name: 'Dino Egg', nameHe: 'ביצת דינוזאור', emoji: '🥚', familyId: 'dino', requiredXp: 1800, minAge: 4, maxAge: 99, active: true },
  { id: 'egg-robot', key: 'space-egg', name: 'Space Egg', nameHe: 'ביצת חלל', emoji: '🥚', familyId: 'robot-buddy', requiredXp: 900, minAge: 6, maxAge: 99, active: true },
];

// Each kid starts with one free, already-unlocked character so "My Character"
// is never empty on day one — keyed by the local default child id.
export const starterFamilyByChildId: Record<string, string> = {
  mia: 'bunny',
  sam: 'fox',
  alex: 'astronaut',
};
