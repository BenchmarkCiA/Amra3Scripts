import { useState } from 'react';
import type { ChallengeCompletion } from '../types';
import { useStore } from '../state/store';
import { getTodayItemsForChild, getPendingApprovals, getPendingRedemptions, isDone } from '../lib/selectors';
import { CATEGORY_LABEL } from '../lib/scoring';
import { todayISO } from '../lib/id';

function QuizAnswerDetails({ completion }: { completion: ChallengeCompletion }) {
  const [open, setOpen] = useState(false);
  const details = completion.score?.details;
  if (!details || details.length === 0) return null;

  return (
    <div style={{ marginTop: 6 }}>
      <button type="button" className="link" onClick={() => setOpen((o) => !o)}>
        {open ? 'Hide answers' : 'See answers'}
      </button>
      {open && (
        <div className="card" style={{ marginTop: 8, padding: 12 }}>
          {details.map((d, i) => (
            <div key={i} className="approval-row" style={{ padding: '6px 0' }}>
              <div style={{ flex: 1 }}>
                <div className="quest-title" style={{ fontSize: 12.5 }}>
                  {d.correct ? '✅' : '❌'} {d.question}
                </div>
                {!d.correct && (
                  <div className="quest-reward" style={{ color: 'var(--error)' }}>
                    Correct answer: {d.correctAnswer}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdjustBalanceCard() {
  const { state, dispatch } = useStore();
  const [childId, setChildId] = useState(state.children[0]?.id ?? '');
  const [stars, setStars] = useState(0);
  const [xp, setXp] = useState(0);
  const [reason, setReason] = useState('');
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!childId || (stars === 0 && xp === 0)) return;
    dispatch({ type: 'ADJUST_STARS', childId, amount: stars, xpAmount: xp, reason: reason.trim() || 'Manual adjustment' });
    setStars(0);
    setXp(0);
    setReason('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="card child-summary-card">
      <div className="section-title" style={{ marginBottom: 8 }}>
        Adjust Stars / XP
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Child</label>
          <select className="form-select" value={childId} onChange={(e) => setChildId(e.target.value)}>
            {state.children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Stars (+/-)</label>
            <input className="form-input" type="number" value={stars} onChange={(e) => setStars(Number(e.target.value))} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">XP (+/-)</label>
            <input className="form-input" type="number" value={xp} onChange={(e) => setXp(Number(e.target.value))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Reason (optional)</label>
          <input className="form-input" placeholder="e.g. extra help around the house" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <button className="btn btn-accent" type="submit">
          {saved ? 'Applied!' : 'Apply'}
        </button>
      </form>
      <div className="empty-state" style={{ padding: 0, marginTop: 10, textAlign: 'start' }}>
        Use negative numbers to correct a mistake. Every change is recorded in that child's transaction history.
      </div>
    </div>
  );
}

export function ParentDashboard() {
  const { state, dispatch } = useStore();
  const date = todayISO();
  const approvals = getPendingApprovals(state);
  const redemptions = getPendingRedemptions(state);

  function handleUndo(completionId: string, title: string) {
    if (confirm(`Reset "${title}"? Any Stars/XP already awarded for it will be taken back, and the quest becomes available again.`)) {
      dispatch({ type: 'UNDO_COMPLETION', completionId });
    }
  }

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
                {completion.note && (
                  <div className="reward-preview" style={{ marginTop: 6 }}>
                    "{completion.note}"
                  </div>
                )}
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
              <div key={challenge.id} className="approval-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <div className="quest-title">
                    {CATEGORY_LABEL[challenge.category]} — {challenge.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="quest-reward">
                      {completion
                        ? completion.status === 'awaiting_approval'
                          ? 'Waiting for approval'
                          : completion.status === 'rejected'
                            ? 'Rejected'
                            : completion.score
                              ? `${completion.score.correct}/${completion.score.total} · +${completion.starsEarned} ⭐`
                              : `Done · +${completion.starsEarned} ⭐`
                        : 'Not started'}
                    </div>
                    {completion && (
                      <button className="small-btn btn-secondary" onClick={() => handleUndo(completion.id, challenge.title)}>
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                {completion?.note && <div className="reward-preview" style={{ marginTop: 6 }}>"{completion.note}"</div>}
                {completion && <QuizAnswerDetails completion={completion} />}
              </div>
            ))}
          </div>
        );
      })}

      <div className="card child-summary-card">
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

      <AdjustBalanceCard />
    </>
  );
}
