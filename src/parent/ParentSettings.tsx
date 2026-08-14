import { useState } from 'react';
import type { Difficulty, Language } from '../types';
import { useStore } from '../state/store';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5];

function KidNamesCard() {
  const { state, dispatch } = useStore();
  const [names, setNames] = useState<Record<string, string>>(() => Object.fromEntries(state.children.map((c) => [c.id, c.name])));
  const [savedId, setSavedId] = useState<string | null>(null);

  function handleSave(childId: string) {
    const name = (names[childId] ?? '').trim();
    if (!name) return;
    dispatch({ type: 'UPDATE_CHILD_NAME', childId, name });
    setSavedId(childId);
    setTimeout(() => setSavedId(null), 1500);
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="section-title" style={{ marginBottom: 10 }}>
        Kids
      </div>
      {state.children.map((child) => (
        <div key={child.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <input
            className="form-input"
            value={names[child.id] ?? ''}
            onChange={(e) => setNames((prev) => ({ ...prev, [child.id]: e.target.value }))}
          />
          <button type="button" className="btn btn-secondary" style={{ width: 'auto', padding: '10px 16px' }} onClick={() => handleSave(child.id)}>
            {savedId === child.id ? 'Saved!' : 'Save'}
          </button>
        </div>
      ))}
    </div>
  );
}

function LanguageCard() {
  const { state, dispatch } = useStore();
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">App language</label>
        <select
          className="form-select"
          value={state.language}
          onChange={(e) => dispatch({ type: 'SET_LANGUAGE', language: e.target.value as Language })}
        >
          <option value="en">English</option>
          <option value="he">עברית (Hebrew)</option>
        </select>
        <div className="empty-state" style={{ padding: 0, marginTop: 8, textAlign: 'start' }}>
          Switches the app's interface to Hebrew with right-to-left layout. Challenge and quiz content stays in English for now.
        </div>
      </div>
    </div>
  );
}

export function ParentSettings() {
  const { state, dispatch } = useStore();
  const [config, setConfig] = useState(state.scoringConfig);
  const [pin, setPin] = useState(state.parentPin);
  const [saved, setSaved] = useState(false);

  function updateTableCell(diff: Difficulty, field: 'stars' | 'xp', value: number) {
    setConfig((prev) => ({ ...prev, table: { ...prev.table, [diff]: { ...prev.table[diff], [field]: value } } }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: 'UPDATE_SCORING_CONFIG', config });
    dispatch({ type: 'SET_PARENT_PIN', pin });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function handleReset() {
    if (confirm('Reset all progress, challenges and rewards to defaults? This cannot be undone.')) {
      dispatch({ type: 'RESET_ALL' });
    }
  }

  return (
    <>
      <div className="screen-header">Settings</div>
      <div className="screen-subheader">Configure scoring, streaks and the parent PIN.</div>

      <KidNamesCard />
      <LanguageCard />

      <form onSubmit={handleSave}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 10 }}>
            Stars & XP by difficulty
          </div>
          {DIFFICULTIES.map((d) => (
            <div key={d} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <div style={{ width: 70, fontWeight: 700, fontSize: 13 }}>Difficulty {d}</div>
              <input
                className="form-input"
                type="number"
                min={0}
                value={config.table[d].stars}
                onChange={(e) => updateTableCell(d, 'stars', Number(e.target.value))}
                style={{ width: 80 }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-muted-50)' }}>stars</span>
              <input
                className="form-input"
                type="number"
                min={0}
                value={config.table[d].xp}
                onChange={(e) => updateTableCell(d, 'xp', Number(e.target.value))}
                style={{ width: 80 }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-muted-50)' }}>XP</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Helping-others bonus (Kindness / Sibling / Family challenges)</label>
            <input
              className="form-input"
              type="number"
              min={0}
              value={config.helpingOthersBonusPct}
              onChange={(e) => setConfig((prev) => ({ ...prev, helpingOthersBonusPct: Number(e.target.value) }))}
            />
            <div className="reward-preview">
              This % is added on top of the difficulty table above for any Kindness, Sibling or Family challenge — keeping
              helping others the highest-scoring category at any given difficulty.
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Minimum challenges/day to keep a streak</label>
            <input
              className="form-input"
              type="number"
              min={1}
              value={config.minChallengesForStreak}
              onChange={(e) => setConfig((prev) => ({ ...prev, minChallengesForStreak: Number(e.target.value) }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Streak freeze tokens per month</label>
            <input
              className="form-input"
              type="number"
              min={0}
              value={config.monthlyFreezeTokens}
              onChange={(e) => setConfig((prev) => ({ ...prev, monthlyFreezeTokens: Number(e.target.value) }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Egg unlock threshold (lifetime XP before the egg screen opens)</label>
            <input
              className="form-input"
              type="number"
              min={0}
              value={config.eggUnlockThreshold}
              onChange={(e) => setConfig((prev) => ({ ...prev, eggUnlockThreshold: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Parent PIN</label>
            <input className="form-input" value={pin} onChange={(e) => setPin(e.target.value)} />
          </div>
        </div>

        <button className="btn btn-primary" type="submit">
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </form>

      <div style={{ marginTop: 24 }}>
        {isSupabaseConfigured ? (
          <div className="empty-state" style={{ padding: 0, textAlign: 'start' }}>
            Data is stored in Supabase, so there's no local "reset to defaults" button — that would only reset what's on
            this device, not the family's real history. Wipe or reseed the Supabase project directly if that's what you want.
          </div>
        ) : (
          <button className="btn btn-danger" onClick={handleReset} type="button">
            Reset all data to defaults
          </button>
        )}
      </div>
    </>
  );
}
