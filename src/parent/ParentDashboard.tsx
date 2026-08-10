import { useStore } from '../state/store';
import { getTodayItemsForChild, getPendingApprovals, getPendingRedemptions, isDone } from '../lib/selectors';
import { CATEGORY_LABEL } from '../lib/scoring';
import { todayISO } from '../lib/id';

export function ParentDashboard() {
  const { state, dispatch } = useStore();
  const date = todayISO();
  const approvals = getPendingApprovals(state);
  const redemptions = getPendingRedemptions(state);

  return (
    <>
      <div className="screen-header">Parent Dashboard</div>
      <div className="screen-subheader">What everyone's been up to today.</div>

      {approvals.length > 0 && (
        <div className="card child-summary-card">
          <div className="section-title" style={{ marginBottom: 8 }}>
            Pending Approvals
          </div>
          {approvals.map(({ completion, challenge, child }) => (
            <div key={completion.id} className="approval-row">
              <div>
                <div className="quest-title">
                  {child!.name} — {challenge!.title}
                </div>
                <div className="quest-reward">
                  {CATEGORY_LABEL[challenge!.category]} · +{completion.starsEarned} ⭐ +{completion.xpEarned} XP
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="small-btn btn-accent"
                  onClick={() => dispatch({ type: 'RESOLVE_APPROVAL', completionId: completion.id, approve: true })}
                >
                  Approve
                </button>
                <button
                  className="small-btn btn-danger"
                  onClick={() => dispatch({ type: 'RESOLVE_APPROVAL', completionId: completion.id, approve: false })}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {redemptions.length > 0 && (
        <div className="card child-summary-card">
          <div className="section-title" style={{ marginBottom: 8 }}>
            Pending Reward Redemptions
          </div>
          {redemptions.map(({ redemption, child }) => (
            <div key={redemption.id} className="approval-row">
              <div>
                <div className="quest-title">
                  {child!.name} — {redemption.rewardName}
                </div>
                <div className="quest-reward">{redemption.cost} ⭐</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="small-btn btn-accent"
                  onClick={() => dispatch({ type: 'RESOLVE_REDEMPTION', redemptionId: redemption.id, status: 'approved' })}
                >
                  Approve
                </button>
                <button
                  className="small-btn btn-danger"
                  onClick={() => dispatch({ type: 'RESOLVE_REDEMPTION', redemptionId: redemption.id, status: 'rejected' })}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {state.children.map((child) => {
        const items = getTodayItemsForChild(state, child.id, date);
        const doneCount = items.filter((i) => isDone(i.completion)).length;
        return (
          <div key={child.id} className="card child-summary-card">
            <div className="child-summary-header">
              <div className="section-title">{child.name} — Today</div>
              <div className="quest-reward">
                {doneCount}/{items.length} done
              </div>
            </div>
            {items.length === 0 && <div className="empty-state" style={{ padding: '10px 0' }}>No quests today.</div>}
            {items.map(({ challenge, completion }) => (
              <div key={challenge.id} className="approval-row">
                <div className="quest-title">
                  {CATEGORY_LABEL[challenge.category]} — {challenge.title}
                </div>
                <div className="quest-reward">
                  {completion
                    ? completion.status === 'awaiting_approval'
                      ? 'Waiting for approval'
                      : completion.status === 'rejected'
                        ? 'Rejected'
                        : `Done · +${completion.starsEarned} ⭐`
                    : 'Not started'}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <div className="card">
        <div className="section-title" style={{ marginBottom: 8 }}>
          Stars & XP balances
        </div>
        {state.children.map((c) => (
          <div key={c.id} className="approval-row">
            <div className="quest-title">{c.name}</div>
            <div className="quest-reward">
              ⭐ {c.stars} · ⚡ {c.xp} XP
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
