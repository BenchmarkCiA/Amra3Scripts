import type { Child } from '../types';
import { useStore } from '../state/store';
import { Mascot } from '../components/Mascot';
import { getTodayItemsForChild, isDone } from '../lib/selectors';
import { CATEGORY_COLOR, computeReward } from '../lib/scoring';
import { categoryLabel, localizeChallengeText, localizeRewardName, t } from '../lib/i18n';
import { todayISO } from '../lib/id';

interface Props {
  child: Child;
  onOpenTask: (challengeId: string) => void;
}

export function KidHome({ child, onOpenTask }: Props) {
  const { state } = useStore();
  const lang = state.language;
  const items = getTodayItemsForChild(state, child.id, todayISO());
  const doneCount = items.filter((i) => isDone(i.completion)).length;

  const affordableRewards = state.rewards.filter(
    (r) => r.active && (r.assignedTo.length === 0 || r.assignedTo.includes(child.id)),
  );
  const nextReward = affordableRewards
    .filter((r) => r.cost > child.stars)
    .sort((a, b) => a.cost - b.cost)[0];
  const progressPct = nextReward ? Math.min(100, (child.stars / nextReward.cost) * 100) : 100;

  return (
    <>
      <div className="screen-header">
        {t(lang, 'hey')} {child.name}
      </div>
      <div className="screen-subheader">
        {doneCount} {t(lang, 'of')} {items.length} {t(lang, 'doneToday')}
      </div>

      <Mascot child={child} />

      {nextReward && (
        <div className="card progress-card">
          <div className="progress-label-row">
            <span>{localizeRewardName(lang, nextReward.name)}</span>
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
        <div className="section-title">{t(lang, 'todaysQuests')}</div>
      </div>
      <div className="quest-list">
        {items.map(({ challenge, completion }) => {
          const done = isDone(completion);
          const reward = computeReward(state.scoringConfig, challenge.difficulty, challenge.category);
          return (
            <button
              key={challenge.id}
              className={`quest-row${done ? ' done' : ''}`}
              onClick={() => !done && onOpenTask(challenge.id)}
              disabled={done}
            >
              <span className="quest-tag" style={{ background: CATEGORY_COLOR[challenge.category] }}>
                {categoryLabel(lang, challenge.category).toUpperCase()}
              </span>
              <div className="quest-info">
                <div className="quest-title">{localizeChallengeText(lang, challenge).title}</div>
                <div className="quest-reward">
                  {completion?.status === 'awaiting_approval'
                    ? t(lang, 'waitingApproval')
                    : `+${reward.stars} ⭐ +${reward.xp} XP`}
                </div>
              </div>
              {reward.bonusApplied && !done && <span className="bonus-pill">+{reward.bonusPct}%</span>}
              <span className={`status-circle ${done ? 'done' : 'empty'}`}>{done ? '✓' : ''}</span>
            </button>
          );
        })}
        {items.length === 0 && <div className="empty-state">{t(lang, 'noQuestsYet')}</div>}
      </div>
    </>
  );
}
