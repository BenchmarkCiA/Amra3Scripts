import { useStore } from '../state/store';
import { CATEGORY_COLOR, CATEGORY_LABEL, computeReward } from '../lib/scoring';

export function ParentChallengeList() {
  const { state, dispatch } = useStore();

  const sorted = [...state.challenges].sort((a, b) => (a.createdBy === b.createdBy ? 0 : a.createdBy === 'parent' ? -1 : 1));

  return (
    <>
      <div className="screen-header">All Challenges</div>
      <div className="screen-subheader">{sorted.length} challenge(s) — toggle to pause, or remove ones you created.</div>

      <div className="quest-list">
        {sorted.map((challenge) => {
          const reward = computeReward(state.scoringConfig, challenge.difficulty, challenge.category);
          const assignedNames = challenge.assignedTo
            .map((id) => state.children.find((c) => c.id === id)?.name)
            .filter(Boolean)
            .join(', ');
          return (
            <div key={challenge.id} className="card" style={{ opacity: challenge.active ? 1 : 0.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
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
                    {assignedNames || 'Nobody assigned'} · {challenge.recurrence} · Difficulty {challenge.difficulty} · +{reward.stars} ⭐ +
                    {reward.xp} XP{reward.bonusApplied ? ` (+${reward.bonusPct}%)` : ''}
                    {challenge.requiresApproval ? ' · needs approval' : ''}
                  </div>
                </div>
              </div>
              <div className="btn-row">
                <button
                  className="btn btn-secondary"
                  onClick={() => dispatch({ type: 'SET_CHALLENGE_ACTIVE', challengeId: challenge.id, active: !challenge.active })}
                >
                  {challenge.active ? 'Pause' : 'Activate'}
                </button>
                {challenge.createdBy === 'parent' && (
                  <button className="btn btn-danger" onClick={() => dispatch({ type: 'DELETE_CHALLENGE', challengeId: challenge.id })}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && <div className="empty-state">No challenges yet.</div>}
      </div>
    </>
  );
}
