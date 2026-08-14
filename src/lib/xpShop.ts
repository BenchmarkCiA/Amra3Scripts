import type { AppState } from '../state/store';
import type { Child, ChildEgg, DigitalItem, EggDef } from '../types';

function itemsByFamily(state: AppState, familyId: string): DigitalItem[] {
  return state.characterItems
    .filter((i) => i.familyId === familyId && i.active)
    .sort((a, b) => a.stageOrder - b.stageOrder);
}

export function ownedFamilyIds(state: AppState, childId: string): Set<string> {
  const ownedItemIds = new Set(state.childUnlocks.filter((u) => u.childId === childId).map((u) => u.itemId));
  const families = new Set<string>();
  for (const item of state.characterItems) {
    if (item.stageOrder === 0 && ownedItemIds.has(item.id)) families.add(item.familyId);
  }
  return families;
}

// The highest stage a child has "grown into" within an owned family — this is
// derived, not stored: since XP only ever goes up, once a stage's threshold
// is crossed it stays crossed, so no separate unlock record is needed.
export function currentStageForFamily(state: AppState, child: Child, familyId: string): DigitalItem | null {
  const stages = itemsByFamily(state, familyId);
  if (stages.length === 0) return null;
  let current = stages[0];
  for (const stage of stages) {
    if (child.xp >= stage.xpRequirement) current = stage;
  }
  return current;
}

export function isAgeEligible(item: { minAge: number; maxAge: number }, child: Child): boolean {
  return child.age >= item.minAge && child.age <= item.maxAge;
}

export function isItemUnlockable(state: AppState, child: Child, item: DigitalItem): boolean {
  if (!item.active || item.unlockType !== 'xp' || item.stageOrder !== 0) return false;
  if (!isAgeEligible(item, child)) return false;
  if (child.xp < item.xpRequirement) return false;
  return !ownedFamilyIds(state, child.id).has(item.familyId);
}

export function shopCharacters(state: AppState, child: Child): DigitalItem[] {
  return state.characterItems.filter(
    (i) => i.active && i.stageOrder === 0 && i.unlockType === 'xp' && isAgeEligible(i, child),
  );
}

export function eggGateReached(state: AppState, child: Child): boolean {
  return child.xp >= state.scoringConfig.eggUnlockThreshold;
}

export function activeChildEgg(state: AppState, childId: string): ChildEgg | undefined {
  return state.childEggs.find((e) => e.childId === childId && e.status === 'selected');
}

export function hatchedEggsForChild(state: AppState, childId: string): ChildEgg[] {
  return state.childEggs.filter((e) => e.childId === childId && e.status === 'hatched');
}

export function eggsAvailableToChoose(state: AppState, child: Child): EggDef[] {
  const owned = ownedFamilyIds(state, child.id);
  return state.eggDefs.filter((e) => e.active && isAgeEligible(e, child) && !owned.has(e.familyId));
}

export function eggProgress(child: Child, childEgg: ChildEgg): { current: number; required: number; pct: number } {
  const current = Math.max(0, Math.min(childEgg.requiredXp, child.xp - childEgg.startingXp));
  const pct = childEgg.requiredXp > 0 ? Math.round((current / childEgg.requiredXp) * 100) : 100;
  return { current, required: childEgg.requiredXp, pct };
}

export function isEggReadyToHatch(child: Child, childEgg: ChildEgg): boolean {
  return childEgg.status === 'selected' && child.xp - childEgg.startingXp >= childEgg.requiredXp;
}
