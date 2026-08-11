import type { Child } from '../types';
import { useStore } from '../state/store';
import { getTodayItemsForChild, isDone } from '../lib/selectors';
import { CATEGORY_COLOR, computeReward } from '../lib/scoring';
import { categoryLabel, t } from '../lib/i18n';
import { todayISO } from '../lib/id';

interface Props {
  child: Child;
  onOpenTask: (challengeId: string) => void;
}

export function KidQuests({ child, onOpenTask }: Props) {
  const { state } = useStore();
  const lang = state.language;
  const items = getTodayItemsForChild(state, child.id, todayISO());
  const doneCount = items.filter((i) => isDone(i.completion)).length;

  return (
    <>
      <div className="screen-header">{t(lang, 'yourQuests')}</div>
      <div className="screen-subheader">
        {doneCount} {t(lang, 'of')} {items.length} {t(lang, 'doneToday')}
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
                <div className="quest-title">{challenge.title}</div>
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
