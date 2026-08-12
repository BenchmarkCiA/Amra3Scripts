import { useState } from 'react';
import { useStore } from '../state/store';
import { availableMonths, getMonthlyStats } from '../lib/selectors';
import { CATEGORY_LABEL } from '../lib/scoring';

function formatMonthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function ParentStats() {
  const { state } = useStore();
  const months = availableMonths(state);
  const [month, setMonth] = useState(months[0]);

  return (
    <>
      <div className="screen-header">Monthly Stats</div>
      <div className="screen-subheader">How many quizzes and challenges each kid did this month.</div>

      <div className="form-group">
        <label className="form-label">Month</label>
        <select className="form-select" value={month} onChange={(e) => setMonth(e.target.value)}>
          {months.map((m) => (
            <option key={m} value={m}>
              {formatMonthLabel(m)}
            </option>
          ))}
        </select>
      </div>

      {state.children.map((child) => {
        const stats = getMonthlyStats(state, child.id, month);
        const categories = Object.entries(stats.byCategory) as [keyof typeof CATEGORY_LABEL, number][];
        return (
          <div key={child.id} className="card child-summary-card">
            <div className="child-summary-header">
              <div className="section-title">{child.name}</div>
              <div className="quest-reward">{stats.totalCompleted} completed</div>
            </div>

            <div className="approval-row">
              <div className="quest-title">Stars &amp; XP earned</div>
              <div className="quest-reward">
                ⭐ {stats.starsEarned} · ⚡ {stats.xpEarned} XP
              </div>
            </div>

            <div className="approval-row">
              <div className="quest-title">Quizzes taken</div>
              <div className="quest-reward">
                {stats.quizzesTaken}
                {stats.avgQuizAccuracyPct !== null ? ` · avg ${stats.avgQuizAccuracyPct}% correct` : ''}
              </div>
            </div>

            {categories.length > 0 ? (
              <div style={{ marginTop: 8 }}>
                <div className="quest-reward" style={{ marginBottom: 6 }}>
                  By category
                </div>
                {categories
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, count]) => (
                    <div key={cat} className="approval-row" style={{ padding: '4px 0' }}>
                      <div className="quest-title" style={{ fontSize: 12.5 }}>
                        {CATEGORY_LABEL[cat]}
                      </div>
                      <div className="quest-reward">{count}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '10px 0' }}>Nothing completed this month yet.</div>
            )}
          </div>
        );
      })}
    </>
  );
}
