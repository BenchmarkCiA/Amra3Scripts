import { useState } from 'react';
import type { Reward } from '../types';
import { useStore } from '../state/store';
import { makeId } from '../lib/id';

function RewardRow({ reward }: { reward: Reward }) {
  const { dispatch } = useStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(reward.name);
  const [cost, setCost] = useState(reward.cost);

  function handleSave() {
    if (!name.trim() || cost <= 0) return;
    dispatch({ type: 'UPDATE_REWARD', reward: { ...reward, name: name.trim(), cost } });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="reward-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
        <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="form-input" type="number" min={1} value={cost} onChange={(e) => setCost(Number(e.target.value))} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="small-btn btn-accent" onClick={handleSave}>
            Save
          </button>
          <button
            className="small-btn btn-secondary"
            onClick={() => {
              setName(reward.name);
              setCost(reward.cost);
              setEditing(false);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reward-card">
      <div>
        <div className="reward-name">{reward.name}</div>
        <div className="reward-cost">{reward.cost} stars</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="small-btn btn-secondary" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button
          className="small-btn btn-secondary"
          onClick={() => dispatch({ type: 'UPDATE_REWARD', reward: { ...reward, active: !reward.active } })}
        >
          {reward.active ? 'Disable' : 'Enable'}
        </button>
        <button className="small-btn btn-danger" onClick={() => dispatch({ type: 'DELETE_REWARD', rewardId: reward.id })}>
          Delete
        </button>
      </div>
    </div>
  );
}

export function ParentRewardsManager() {
  const { state, dispatch } = useStore();
  const [name, setName] = useState('');
  const [cost, setCost] = useState(50);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({ type: 'ADD_REWARD', reward: { id: makeId(), name: name.trim(), cost, active: true } });
    setName('');
    setCost(50);
  }

  return (
    <>
      <div className="screen-header">Reward Shop</div>
      <div className="screen-subheader">Manage the real-world rewards kids can redeem Stars for.</div>

      <form onSubmit={handleAdd} className="card" style={{ marginBottom: 16 }}>
        <div className="form-group">
          <label className="form-label">Reward name</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ice cream treat" required />
        </div>
        <div className="form-group">
          <label className="form-label">Cost (Stars)</label>
          <input
            className="form-input"
            type="number"
            min={1}
            value={cost}
            onChange={(e) => setCost(Number(e.target.value))}
          />
        </div>
        <button className="btn btn-primary" type="submit">
          Add Reward
        </button>
      </form>

      {state.rewards.map((reward) => (
        <RewardRow key={reward.id} reward={reward} />
      ))}
    </>
  );
}
