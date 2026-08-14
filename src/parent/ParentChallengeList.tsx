import { useState } from 'react';
import { useStore } from '../state/store';
import { CATEGORY_COLOR, CATEGORY_LABEL, computeReward } from '../lib/scoring';

const UNASSIGNED = '__unassigned__';

export function ParentChallengeList() {
  const { state, dispatch } = useStore();
  const [openChild, setOpenChild] = useState<string | null>(state.children[0]?.id ?? null);

  const groups = new Map<string, typeof state.challenges>();
  for (const c of state.children) groups.set(c.id, []);
  groups.set(UNASSIGNED, []);
  for (const challenge of state.challenges) {
    if (challenge.assignedTo.length === 0) {
      groups.get(UNASSIGNED)!.push(challenge);
      continue;
    }
    for (const childId of challenge.assignedTo) {
      if (!groups.has(childId)) groups.set(childId, []);
      groups.get(childId)!.push(challenge);
    }
  }

  return (
    <>
      <div className="screen-header">Manage Quests</div>
      <div className="screen-subheader">
        Turn quests on or off per kid — a paused quest stays off every day until you turn it back on. Nothing is
        deleted, so history is kept.
      </div>

      {state.children.map((child) => {
        const list = (groups.get(child.id) ?? []).sort((a, b) => a.title.localeCompare(b.title));
        const activeCount = list.filter((c) => c.active).length;
        const open = openChild === child.id;
        return (
          <div key={child.id} className="card child-summary-card">
            <button
              type="button"
              onClick={() => setOpenChild(open ? null : child.id)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
            >
              <div className="section-title">{child.name}</div>
              <div className="quest-reward">
                {activeCount}/{list.length} active {open ? '▲' : '▼'}
              </div>
            </button>
            {open && (
              <div style={{ marginTop: 10 }}>
                {list.map((challenge) => {
                  const reward = computeReward(state.scoringConfig, challenge.difficulty, challenge.category);
                  return (
                    <div
                      key={challenge.id}
                      className="approval-row"
                      style={{ opacity: challenge.active ? 1 : 0.5 }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span className="quest-tag" style={{ background: CATEGORY_COLOR[challenge.category] }}>
                          {CATEGORY_LABEL[challenge.category].toUpperCase()}
                        </span>
                        <div className="quest-title" style={{ marginTop: 6 }}>
                          {challenge.title}
                          {challenge.createdBy === 'parent' && (
                            <span className="bonus-pill" style={{ marginInlineStart: 6 }}>
                              Parent-added
                            </span>
                          )}
                        </div>
                        <div className="quest-reward">
                          {challenge.recurrence} · Difficulty {challenge.difficulty} · +{reward.stars} ⭐ +{reward.xp} XP
                          {challenge.requiresApproval ? ' · needs approval' : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                        <label className="checkbox-row" style={{ marginBottom: 0 }}>
                          <input
                            type="checkbox"
                            checked={challenge.active}
                            onChange={() =>
                              dispatch({ type: 'SET_CHALLENGE_ACTIVE', challengeId: challenge.id, active: !challenge.active })
                            }
                          />
                          {challenge.active ? 'On' : 'Off'}
                        </label>
                        {challenge.createdBy === 'parent' && (
                          <button
                            className="small-btn btn-danger"
                            onClick={() => dispatch({ type: 'DELETE_CHALLENGE', challengeId: challenge.id })}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {list.length === 0 && <div className="empty-state">No quests assigned yet — add one from + Add Challenge.</div>}
              </div>
            )}
          </div>
        );
      })}

      {(groups.get(UNASSIGNED) ?? []).length > 0 && (
        <div className="card child-summary-card">
          <div className="section-title" style={{ marginBottom: 8 }}>
            Unassigned
          </div>
          {(groups.get(UNASSIGNED) ?? []).map((challenge) => (
            <div key={challenge.id} className="approval-row">
              <div className="quest-title">{challenge.title}</div>
              {challenge.createdBy === 'parent' && (
                <button className="small-btn btn-danger" onClick={() => dispatch({ type: 'DELETE_CHALLENGE', challengeId: challenge.id })}>
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
