import { useState } from 'react';
import type { DigitalItem, EggDef } from '../types';
import { useStore } from '../state/store';
import { activeChildEgg, currentStageForFamily, eggProgress, hatchedEggsForChild, ownedFamilyIds } from '../lib/xpShop';

function ItemRow({ item }: { item: DigitalItem }) {
  const { dispatch } = useStore();
  const [xp, setXp] = useState(item.xpRequirement);
  const [minAge, setMinAge] = useState(item.minAge);
  const [maxAge, setMaxAge] = useState(item.maxAge);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    dispatch({ type: 'UPDATE_CHARACTER_ITEM', item: { ...item, xpRequirement: xp, minAge, maxAge } });
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  return (
    <div className="approval-row" style={{ flexWrap: 'wrap', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160 }}>
        <span style={{ fontSize: 22 }}>{item.emoji}</span>
        <div>
          <div className="quest-title">{item.name}</div>
          <div className="quest-reward" style={{ fontSize: 11 }}>
            {item.familyId} · stage {item.stageOrder} · {item.unlockType === 'egg' ? 'egg-only' : 'XP unlock'}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input className="form-input" type="number" style={{ width: 90 }} value={xp} onChange={(e) => setXp(Number(e.target.value))} />
        <span style={{ fontSize: 11 }}>XP</span>
        <input className="form-input" type="number" style={{ width: 60 }} value={minAge} onChange={(e) => setMinAge(Number(e.target.value))} />
        <span style={{ fontSize: 11 }}>–</span>
        <input className="form-input" type="number" style={{ width: 60 }} value={maxAge} onChange={(e) => setMaxAge(Number(e.target.value))} />
        <span style={{ fontSize: 11 }}>age</span>
        <button type="button" className="small-btn btn-secondary" onClick={handleSave}>
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function EggRow({ egg }: { egg: EggDef }) {
  const { dispatch } = useStore();
  const [xp, setXp] = useState(egg.requiredXp);
  const [minAge, setMinAge] = useState(egg.minAge);
  const [maxAge, setMaxAge] = useState(egg.maxAge);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    dispatch({ type: 'UPDATE_EGG_DEF', egg: { ...egg, requiredXp: xp, minAge, maxAge } });
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  return (
    <div className="approval-row" style={{ flexWrap: 'wrap', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160 }}>
        <span style={{ fontSize: 22 }}>{egg.emoji}</span>
        <div>
          <div className="quest-title">{egg.name}</div>
          <div className="quest-reward" style={{ fontSize: 11 }}>→ {egg.familyId}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input className="form-input" type="number" style={{ width: 90 }} value={xp} onChange={(e) => setXp(Number(e.target.value))} />
        <span style={{ fontSize: 11 }}>hatch XP</span>
        <input className="form-input" type="number" style={{ width: 60 }} value={minAge} onChange={(e) => setMinAge(Number(e.target.value))} />
        <span style={{ fontSize: 11 }}>–</span>
        <input className="form-input" type="number" style={{ width: 60 }} value={maxAge} onChange={(e) => setMaxAge(Number(e.target.value))} />
        <span style={{ fontSize: 11 }}>age</span>
        <button type="button" className="small-btn btn-secondary" onClick={handleSave}>
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function ChildProgressCard({ childId }: { childId: string }) {
  const { state, dispatch } = useStore();
  const child = state.children.find((c) => c.id === childId)!;
  const owned = [...ownedFamilyIds(state, child.id)];
  const active = activeChildEgg(state, child.id);
  const hatched = hatchedEggsForChild(state, child.id);

  function handleResetEgg(childEggId: string) {
    if (confirm(`Reset ${child.name}'s current egg? They'll be able to choose a new one.`)) {
      dispatch({ type: 'RESET_EGG', childEggId });
    }
  }

  return (
    <div className="card child-summary-card">
      <div className="section-title" style={{ marginBottom: 8 }}>
        {child.name}
      </div>
      <div className="quest-reward" style={{ marginBottom: 6 }}>
        Equipped: {child.equippedFamily ? currentStageForFamily(state, child, child.equippedFamily)?.name ?? child.equippedFamily : 'none'} · Unlocked
        families: {owned.length}
      </div>
      {active
        ? (() => {
            const egg = state.eggDefs.find((e) => e.id === active.eggId);
            const progress = eggProgress(child, active);
            return (
              <div className="approval-row">
                <div>
                  <div className="quest-title">{egg?.emoji} {egg?.name}</div>
                  <div className="quest-reward">
                    Progress: {progress.current} / {progress.required} XP ({progress.pct}%)
                  </div>
                </div>
                <button className="small-btn btn-danger" onClick={() => handleResetEgg(active.id)}>
                  Reset Egg
                </button>
              </div>
            );
          })()
        : <div className="empty-state" style={{ padding: '6px 0' }}>No egg in progress.</div>}
      {hatched.length > 0 && (
        <div className="quest-reward" style={{ marginTop: 6 }}>
          Hatched: {hatched.map((e) => state.eggDefs.find((d) => d.id === e.eggId)?.name).filter(Boolean).join(', ')}
        </div>
      )}
    </div>
  );
}

export function ParentCharacters() {
  const { state } = useStore();
  const families = [...new Set(state.characterItems.map((i) => i.familyId))];

  return (
    <>
      <div className="screen-header">Characters & Eggs</div>
      <div className="screen-subheader">Tune XP thresholds and age ranges — unlocking is always free, never spends XP.</div>

      {state.children.map((c) => (
        <ChildProgressCard key={c.id} childId={c.id} />
      ))}

      <div className="card child-summary-card">
        <div className="section-title" style={{ marginBottom: 8 }}>
          Eggs
        </div>
        {state.eggDefs.map((egg) => (
          <EggRow key={egg.id} egg={egg} />
        ))}
      </div>

      <div className="card child-summary-card">
        <div className="section-title" style={{ marginBottom: 8 }}>
          Character items ({families.length} families, {state.characterItems.length} stages)
        </div>
        {state.characterItems.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
