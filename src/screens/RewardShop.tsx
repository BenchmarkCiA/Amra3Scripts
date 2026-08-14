import { useState } from 'react';
import type { Child } from '../types';
import { useStore } from '../state/store';
import { localizeRewardName, t } from '../lib/i18n';

interface Props {
  child: Child;
}

export function RewardShop({ child }: Props) {
  const { state, dispatch } = useStore();
  const lang = state.language;
  const [toast, setToast] = useState<string | null>(null);

  function handleRedeem(rewardId: string, name: string) {
    dispatch({ type: 'REDEEM_REWARD', childId: child.id, rewardId });
    setToast(`${t(lang, 'redeem')}: ${name}! ${t(lang, 'redeemedWaiting')}`);
    setTimeout(() => setToast(null), 2200);
  }

  const rewards = state.rewards.filter((r) => r.active);

  return (
    <>
      <div className="screen-header">{t(lang, 'rewardShop')}</div>
      <div className="screen-subheader">
        {t(lang, 'youHave')} {child.stars} ⭐ {t(lang, 'stars')}
      </div>

      {rewards.map((reward) => {
        const affordable = child.stars >= reward.cost;
        const name = localizeRewardName(lang, reward.name);
        return (
          <div key={reward.id} className="reward-card">
            <div>
              <div className="reward-name">{name}</div>
              <div className="reward-cost">
                {reward.cost} {t(lang, 'stars')}
              </div>
            </div>
            <button
              className={`redeem-btn ${affordable ? 'active' : 'disabled'}`}
              disabled={!affordable}
              onClick={() => handleRedeem(reward.id, name)}
            >
              {t(lang, 'redeem')}
            </button>
          </div>
        );
      })}
      {rewards.length === 0 && <div className="empty-state">{t(lang, 'noRewardsYet')}</div>}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
