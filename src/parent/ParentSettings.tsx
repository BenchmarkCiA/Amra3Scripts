import { useState } from 'react';
import type { Difficulty } from '../types';
import { useStore } from '../state/store';
import { isSupabaseConfigured } from '../lib/supabaseClient';

const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5];

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
