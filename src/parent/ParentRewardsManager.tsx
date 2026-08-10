import { useState } from 'react';
import { useStore } from '../state/store';
import { makeId } from '../lib/id';

export function ParentRewardsManager() {
  const { state, dispatch } = useStore();
  const [name, setName] = useState('');
  const [cost, setCost] = useState(50);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({ type: 'ADD_REWARD', reward: { id: makeId('rwd'), name: name.trim(), cost, active: true } });
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
        <div key={reward.id} className="reward-card">
          <div>
            <div className="reward-name">{reward.name}</div>
            <div className="reward-cost">{reward.cost} stars</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
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
      ))}
    </>
  );
}
