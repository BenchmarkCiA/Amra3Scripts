import type { Child } from '../types';
import { useStore, defaultBadges } from '../state/store';
import { isBadgeUnlocked } from '../lib/badges';
import { initialStreak } from '../lib/streak';

interface Props {
  child: Child;
}

export function StreaksBadges({ child }: Props) {
  const { state } = useStore();
  const streak = state.streaks[child.id] ?? initialStreak(child.id, state.scoringConfig.monthlyFreezeTokens);

  return (
    <>
      <div className="screen-header">Streaks & Badges</div>
      <div className="screen-subheader">Keep your quest streak alive!</div>

      <div className="card streak-card">
        <div className="flame-icon">🔥</div>
        <div>
          <div className="streak-count">{streak.currentStreak} day streak</div>
          <div className="streak-sub">
            {streak.currentStreak > 0 ? 'Keep it going!' : `Complete ${state.scoringConfig.minChallengesForStreak} quests today to start a streak.`}
          </div>
          {streak.freezeTokensAvailable > 0 && (
            <div className="streak-sub">❄️ {streak.freezeTokensAvailable} freeze token(s) left this month</div>
          )}
        </div>
      </div>

      <div className="badge-grid">
        {defaultBadges.map((badge) => {
          const unlocked = isBadgeUnlocked(state, child.id, badge);
          return (
            <div key={badge.id} className={`badge-card${unlocked ? '' : ' locked'}`}>
              <div className="badge-icon">⭐</div>
              <div className="badge-name">{badge.name}</div>
              <div className="badge-desc">{badge.description}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
