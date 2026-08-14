import { useState } from 'react';
import type { Child, DigitalItem, EggDef } from '../types';
import { useStore, type AppState } from '../state/store';
import { t, localizeItemName } from '../lib/i18n';
import {
  activeChildEgg,
  currentStageForFamily,
  eggGateReached,
  eggProgress,
  eggsAvailableToChoose,
  hatchedEggsForChild,
  isEggReadyToHatch,
  isItemUnlockable,
  ownedFamilyIds,
  shopCharacters,
} from '../lib/xpShop';

interface Props {
  child: Child;
}

function familyStages(state: AppState, familyId: string): DigitalItem[] {
  return state.characterItems.filter((i) => i.familyId === familyId && i.active).sort((a, b) => a.stageOrder - b.stageOrder);
}

function MyCharacterCard({ child }: { child: Child }) {
  const { state } = useStore();
  const lang = state.language;
  const equipped = child.equippedFamily ? currentStageForFamily(state, child, child.equippedFamily) : null;

  if (!equipped) {
    return (
      <div className="card child-summary-card" style={{ textAlign: 'center' }}>
        <div className="empty-state">{t(lang, 'noEggYet')}</div>
      </div>
    );
  }

  const stages = familyStages(state, child.equippedFamily!);
  const nextStage = stages.find((s) => s.stageOrder === equipped.stageOrder + 1);

  return (
    <div className="card child-summary-card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 56, lineHeight: 1 }}>{equipped.emoji}</div>
      <div className="section-title" style={{ marginTop: 8 }}>
        {localizeItemName(lang, equipped)}
      </div>
      {nextStage ? (
        <div style={{ marginTop: 10 }}>
          <div className="quest-reward">
            {t(lang, 'nextStage')}: {localizeItemName(lang, nextStage)} — ⚡ {Math.min(child.xp, nextStage.xpRequirement)} / {nextStage.xpRequirement}
          </div>
          <div className="progress-track" style={{ marginTop: 6 }}>
            <div
              className="progress-fill"
              style={{ width: `${Math.min(100, Math.round((child.xp / nextStage.xpRequirement) * 100))}%` }}
            />
          </div>
        </div>
      ) : (
        stages.length > 1 && <div className="quest-reward" style={{ marginTop: 6 }}>⭐ {t(lang, 'fullyGrown')}</div>
      )}
    </div>
  );
}

function CharacterTile({ child, item }: { child: Child; item: DigitalItem }) {
  const { state, dispatch } = useStore();
  const lang = state.language;
  const owned = ownedFamilyIds(state, child.id).has(item.familyId);
  const unlockable = !owned && isItemUnlockable(state, child, item);
  const inUse = owned && child.equippedFamily === item.familyId;

  return (
    <div className="card" style={{ padding: 14, textAlign: 'center', opacity: owned || unlockable ? 1 : 0.75 }}>
      <div style={{ fontSize: 36 }}>{owned ? currentStageForFamily(state, child, item.familyId)?.emoji ?? item.emoji : item.emoji}</div>
      <div style={{ fontWeight: 700, marginTop: 6, fontSize: 13.5 }}>{localizeItemName(lang, item)}</div>
      {owned ? (
        <button
          className="small-btn btn-secondary"
          style={{ marginTop: 8, width: '100%' }}
          disabled={inUse}
          onClick={() => dispatch({ type: 'EQUIP_FAMILY', childId: child.id, familyId: item.familyId })}
        >
          {inUse ? `✓ ${t(lang, 'inUse')}` : t(lang, 'use')}
        </button>
      ) : (
        <>
          <div className="quest-reward" style={{ marginTop: 6, fontSize: 11.5 }}>
            {unlockable ? '✨' : '🔒'} {t(lang, 'unlockAt')} ⚡{item.xpRequirement}
          </div>
          <button
            className="small-btn btn-accent"
            style={{ marginTop: 8, width: '100%' }}
            disabled={!unlockable}
            onClick={() => dispatch({ type: 'UNLOCK_ITEM', childId: child.id, itemId: item.id })}
          >
            {t(lang, 'unlockBtn')}
          </button>
        </>
      )}
    </div>
  );
}

function EggSection({ child }: { child: Child }) {
  const { state, dispatch } = useStore();
  const lang = state.language;
  const active = activeChildEgg(state, child.id);
  const hatched = hatchedEggsForChild(state, child.id);

  if (active) {
    const egg = state.eggDefs.find((e) => e.id === active.eggId);
    const progress = eggProgress(child, active);
    const ready = isEggReadyToHatch(child, active);
    if (!egg) return null;
    return (
      <div className="card child-summary-card" style={{ textAlign: 'center' }}>
        <div className="section-title">{t(lang, 'myEgg')}</div>
        <div style={{ fontSize: 44, margin: '8px 0' }}>{egg.emoji}</div>
        <div className="quest-title">{localizeItemName(lang, egg)}</div>
        {ready ? (
          <>
            <div className="feedback-msg right" style={{ marginTop: 8 }}>
              🎉 {t(lang, 'eggReady')}
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: 10 }}
              onClick={() => dispatch({ type: 'HATCH_EGG', childEggId: active.id })}
            >
              {t(lang, 'hatchNow')}
            </button>
          </>
        ) : (
          <>
            <div className="quest-reward" style={{ marginTop: 6 }}>
              {t(lang, 'almostThere')} ⚡ {progress.current} / {progress.required}
            </div>
            <div className="progress-track" style={{ marginTop: 6 }}>
              <div className="progress-fill" style={{ width: `${progress.pct}%` }} />
            </div>
          </>
        )}
      </div>
    );
  }

  if (!eggGateReached(state, child)) {
    return (
      <div className="card child-summary-card" style={{ textAlign: 'center' }}>
        <div className="section-title">{t(lang, 'myEgg')}</div>
        <div className="empty-state">
          {t(lang, 'keepEarningForEgg')} (⚡ {child.xp} / {state.scoringConfig.eggUnlockThreshold})
        </div>
      </div>
    );
  }

  const options = eggsAvailableToChoose(state, child);
  if (options.length === 0) {
    return hatched.length > 0 ? null : (
      <div className="card child-summary-card" style={{ textAlign: 'center' }}>
        <div className="empty-state">{t(lang, 'noEggYet')}</div>
      </div>
    );
  }

  return (
    <div className="card child-summary-card">
      <div className="section-title" style={{ marginBottom: 8, textAlign: 'center' }}>
        🎉 {t(lang, 'eggAvailable')}
      </div>
      <div className="chip-row" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {options.map((egg: EggDef) => (
          <div key={egg.id} className="card" style={{ padding: 12, width: 140, textAlign: 'center' }}>
            <div style={{ fontSize: 32 }}>{egg.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4 }}>{localizeItemName(lang, egg)}</div>
            <div className="quest-reward" style={{ fontSize: 11 }}>
              {t(lang, 'hatchingRequirement')}: ⚡{egg.requiredXp}
            </div>
            <button
              className="small-btn btn-accent"
              style={{ marginTop: 8, width: '100%' }}
              onClick={() => dispatch({ type: 'SELECT_EGG', childId: child.id, eggId: egg.id })}
            >
              {t(lang, 'chooseThisEgg')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function XpShop({ child }: Props) {
  const { state } = useStore();
  const lang = state.language;
  const [tab, setTab] = useState<'character' | 'browse' | 'egg'>('character');
  const characters = shopCharacters(state, child);

  return (
    <>
      <div className="screen-header">{t(lang, 'xpShopTitle')}</div>
      <div className="screen-subheader">
        {t(lang, 'yourXp')}: ⚡ {child.xp}
      </div>

      <div className="parent-nav" style={{ marginBottom: 14 }}>
        <button className={`parent-tab${tab === 'character' ? ' active' : ''}`} onClick={() => setTab('character')}>
          {t(lang, 'myCharacter')}
        </button>
        <button className={`parent-tab${tab === 'browse' ? ' active' : ''}`} onClick={() => setTab('browse')}>
          {t(lang, 'changeCharacter')}
        </button>
        <button className={`parent-tab${tab === 'egg' ? ' active' : ''}`} onClick={() => setTab('egg')}>
          {t(lang, 'myEgg')}
        </button>
      </div>

      {tab === 'character' && <MyCharacterCard child={child} />}

      {tab === 'browse' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {characters.map((item) => (
            <CharacterTile key={item.id} child={child} item={item} />
          ))}
        </div>
      )}

      {tab === 'egg' && <EggSection child={child} />}
    </>
  );
}
