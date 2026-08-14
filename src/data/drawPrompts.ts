import type { DrawPrompt } from '../types';

// Coordinates are in the 256x180 draw-canvas space (see TaskDetailModal's
// DrawBody). Each guide is a few plain shapes — no image assets — sketching
// part of a picture for the child to complete (PRD Age-5 "Complete the
// Picture" creative challenges).
export const drawPrompts: DrawPrompt[] = [
  {
    text: 'Complete the house! Add 2 more windows.',
    textHe: 'השלימו את הבית! הוסיפו עוד 2 חלונות.',
    guide: [
      { type: 'triangle', x1: 55, y1: 70, x2: 125, y2: 70, x3: 90, y3: 30 },
      { type: 'rect', x: 60, y: 70, w: 60, h: 70 },
      { type: 'rect', x: 80, y: 110, w: 20, h: 30 },
      { type: 'rect', x: 68, y: 85, w: 15, h: 15 },
    ],
  },
  {
    text: 'Draw the other half of the flower.',
    textHe: 'ציירו את החצי השני של הפרח.',
    guide: [
      { type: 'line', x1: 128, y1: 20, x2: 128, y2: 165, dashed: true },
      { type: 'line', x1: 128, y1: 160, x2: 128, y2: 105 },
      { type: 'circle', x: 118, y: 95, r: 12 },
      { type: 'circle', x: 105, y: 108, r: 10 },
      { type: 'circle', x: 112, y: 118, r: 10 },
    ],
  },
  {
    text: 'Draw a sun with 5 rays.',
    textHe: 'ציירו שמש עם 5 קרניים.',
    guide: [{ type: 'circle', x: 40, y: 40, r: 20 }],
  },
  {
    text: 'Add 3 trees next to the house.',
    textHe: 'הוסיפו 3 עצים ליד הבית.',
    guide: [
      { type: 'triangle', x1: 15, y1: 110, x2: 65, y2: 110, x3: 40, y3: 85 },
      { type: 'rect', x: 20, y: 110, w: 40, h: 40 },
      { type: 'rect', x: 35, y: 130, w: 10, h: 20 },
    ],
  },
  {
    text: 'Draw a rainbow over the hill.',
    textHe: 'ציירו קשת בענן מעל הגבעה.',
    guide: [
      { type: 'line', x1: 0, y1: 170, x2: 90, y2: 145 },
      { type: 'line', x1: 90, y1: 145, x2: 166, y2: 145 },
      { type: 'line', x1: 166, y1: 145, x2: 256, y2: 170 },
    ],
  },
  {
    text: 'Give the caterpillar more circles to grow longer.',
    textHe: 'תנו לזחל עוד עיגולים כדי שיגדל.',
    guide: [
      { type: 'circle', x: 35, y: 140, r: 12 },
      { type: 'circle', x: 58, y: 145, r: 10 },
      { type: 'line', x1: 70, y1: 145, x2: 210, y2: 145, dashed: true },
    ],
  },
  {
    text: 'Draw a face for this circle.',
    textHe: 'ציירו פרצוף לעיגול הזה.',
    guide: [{ type: 'circle', x: 128, y: 90, r: 50 }],
  },
  {
    text: 'Draw the missing wheel on this car.',
    textHe: 'ציירו את הגלגל החסר במכונית.',
    guide: [
      { type: 'rect', x: 40, y: 90, w: 140, h: 30 },
      { type: 'rect', x: 60, y: 70, w: 60, h: 20 },
      { type: 'circle', x: 70, y: 125, r: 15 },
    ],
  },
];
