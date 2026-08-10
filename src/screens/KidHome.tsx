import type { Child } from '../types';
import { useStore } from '../state/store';
import { Mascot } from '../components/Mascot';
import { getTodayItemsForChild, isDone } from '../lib/selectors';
import { CATEGORY_COLOR, computeReward } from '../lib/scoring';
import { todayISO } from '../lib/id';

interface Props {
  child: Child;
  onOpenTask: (challengeId: string) => void;
  onSeeAll: () => void;
}

export function KidHome({ child, onOpenTask, onSeeAll }: Props) {
  const { state } = useStore();
  const items = getTodayItemsForChild(state, child.id, todayISO());

  const affordableRewards = state.rewards.filter((r) => r.active);
  const nextReward = affordableRewards
    .filter((r) => r.cost > child.stars)
    .sort((a, b) => a.cost - b.cost)[0];
  const progressPct = nextReward ? Math.min(100, (child.stars / nextReward.cost) * 100) : 100;

  return (
    <>
      <div className="screen-header">Hey {child.name}</div>
      <div className="screen-subheader">Here's your quest log for today.</div>

      <Mascot child={child} />

      {nextReward && (
        <div className="card progress-card">
          <div className="progress-label-row">
            <span>Next: {nextReward.name}</span>
            <span>
              {child.stars} / {nextReward.cost}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      <div className="section-row">
        <div className="section-title">Today's Quests</div>
        <button className="link" onClick={onSeeAll}>
          See all
        </button>
      </div>
      <div className="quest-list">
        {items.slice(0, 4).map(({ challenge, completion }) => {
          const done = isDone(completion);
          const reward = computeReward(state.scoringConfig, challenge.difficulty, challenge.category);
          return (
            <button
              key={challenge.id}
              className={`quest-row${done ? ' done' : ''}`}
              onClick={() => !done && onOpenTask(challenge.id)}
              disabled={done}
            >
              <span className="quest-dot" style={{ background: CATEGORY_COLOR[challenge.category] }} />
              <div className="quest-info">
                <div className="quest-title">{challenge.title}</div>
                <div className="quest-reward">
                  {completion?.status === 'awaiting_approval'
                    ? 'Waiting for approval'
                    : `+${reward.stars} ⭐ +${reward.xp} XP`}
                </div>
              </div>
              {reward.bonusApplied && !done && <span className="bonus-pill">+{reward.bonusPct}%</span>}
              <span className={`status-circle ${done ? 'done' : 'empty'}`}>{done ? '✓' : ''}</span>
            </button>
          );
        })}
        {items.length === 0 && <div className="empty-state">No quests assigned yet — check back soon!</div>}
      </div>
    </>
  );
}
