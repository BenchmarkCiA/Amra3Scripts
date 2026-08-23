import { useState } from 'react';
import type { Reward } from '../types';
import { useStore, type AppState } from '../state/store';
import { makeId } from '../lib/id';

// Reusable "Assign to" chip row: an empty assignedTo means every child, and
// clicking a specific child's chip switches to restricting the reward to
// just the currently-selected child(ren). Clicking "All" clears back to [].
function AssignToChips({
  state,
  assignedTo,
  onChange,
}: {
  state: AppState;
  assignedTo: string[];
  onChange: (next: string[]) => void;
}) {
  function toggleChild(id: string) {
    onChange(assignedTo.includes(id) ? assignedTo.filter((x) => x !== id) : [...assignedTo, id]);
  }

  return (
    <div className="chip-row">
      <button type="button" className={`chip${assignedTo.length === 0 ? ' selected' : ''}`} onClick={() => onChange([])}>
        All
      </button>
      {state.children.map((child) => (
        <button
          type="button"
          key={child.id}
          className={`chip${assignedTo.includes(child.id) ? ' selected' : ''}`}
          onClick={() => toggleChild(child.id)}
        >
          {child.name}
        </button>
      ))}
    </div>
  );
}

function assignedToLabel(state: AppState, assignedTo: string[]): string {
  if (assignedTo.length === 0) return 'Everyone';
  return assignedTo
    .map((id) => state.children.find((c) => c.id === id)?.name)
    .filter(Boolean)
    .join(', ');
}

function RewardRow({ reward }: { reward: Reward }) {
  const { state, dispatch } = useStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(reward.name);
  const [cost, setCost] = useState(reward.cost);
  const [assignedTo, setAssignedTo] = useState(reward.assignedTo);

  function handleSave() {
    if (!name.trim() || cost <= 0) return;
    dispatch({ type: 'UPDATE_REWARD', reward: { ...reward, name: name.trim(), cost, assignedTo } });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="reward-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
        <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="form-input" type="number" min={1} value={cost} onChange={(e) => setCost(Number(e.target.value))} />
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Available for</label>
          <AssignToChips state={state} assignedTo={assignedTo} onChange={setAssignedTo} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="small-btn btn-accent" onClick={handleSave}>
            Save
          </button>
          <button
            className="small-btn btn-secondary"
            onClick={() => {
              setName(reward.name);
              setCost(reward.cost);
              setAssignedTo(reward.assignedTo);
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
        <div className="quest-reward" style={{ marginTop: 2 }}>For: {assignedToLabel(state, reward.assignedTo)}</div>
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
  const [assignedTo, setAssignedTo] = useState<string[]>([]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({ type: 'ADD_REWARD', reward: { id: makeId(), name: name.trim(), cost, active: true, assignedTo } });
    setName('');
    setCost(50);
    setAssignedTo([]);
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
        <div className="form-group">
          <label className="form-label">Available for</label>
          <AssignToChips state={state} assignedTo={assignedTo} onChange={setAssignedTo} />
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
