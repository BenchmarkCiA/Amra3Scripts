import type { Child } from '../types';
import { useStore, defaultBadges } from '../state/store';
import { isBadgeUnlocked } from '../lib/badges';
import { initialStreak } from '../lib/streak';
import { localizeBadge, t } from '../lib/i18n';

interface Props {
  child: Child;
}

export function StreaksBadges({ child }: Props) {
  const { state } = useStore();
  const lang = state.language;
  const streak = state.streaks[child.id] ?? initialStreak(child.id, state.scoringConfig.monthlyFreezeTokens);

  return (
    <>
      <div className="screen-header">{t(lang, 'streaksAndBadges')}</div>
      <div className="screen-subheader">{t(lang, 'keepStreakAlive')}</div>

      <div className="card streak-card">
        <div className="flame-icon">🔥</div>
        <div>
          <div className="streak-count">
            {streak.currentStreak} {t(lang, 'dayStreak')}
          </div>
          <div className="streak-sub">
            {streak.currentStreak > 0
              ? t(lang, 'keepGoing')
              : `${state.scoringConfig.minChallengesForStreak} ${t(lang, 'completeToStartStreak')}`}
          </div>
          {streak.freezeTokensAvailable > 0 && (
            <div className="streak-sub">
              ❄️ {streak.freezeTokensAvailable} {t(lang, 'freezeTokensLeft')}
            </div>
          )}
        </div>
      </div>

      <div className="badge-grid">
        {defaultBadges.map((badge) => {
          const unlocked = isBadgeUnlocked(state, child.id, badge);
          const localized = localizeBadge(lang, badge);
          return (
            <div key={badge.id} className={`badge-card${unlocked ? '' : ' locked'}`}>
              <div className="badge-icon">⭐</div>
              <div className="badge-name">{localized.name}</div>
              <div className="badge-desc">{localized.description}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
