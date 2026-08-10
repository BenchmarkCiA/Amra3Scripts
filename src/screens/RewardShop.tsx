import { useState } from 'react';
import type { Child } from '../types';
import { useStore } from '../state/store';

interface Props {
  child: Child;
}

export function RewardShop({ child }: Props) {
  const { state, dispatch } = useStore();
  const [toast, setToast] = useState<string | null>(null);

  function handleRedeem(rewardId: string, name: string) {
    dispatch({ type: 'REDEEM_REWARD', childId: child.id, rewardId });
    setToast(`Redeemed: ${name}! Waiting for parent approval.`);
    setTimeout(() => setToast(null), 2200);
  }

  const rewards = state.rewards.filter((r) => r.active);

  return (
    <>
      <div className="screen-header">Reward Shop</div>
      <div className="screen-subheader">You have {child.stars} ⭐ stars</div>

      {rewards.map((reward) => {
        const affordable = child.stars >= reward.cost;
        return (
          <div key={reward.id} className="reward-card">
            <div>
              <div className="reward-name">{reward.name}</div>
              <div className="reward-cost">{reward.cost} stars</div>
            </div>
            <button
              className={`redeem-btn ${affordable ? 'active' : 'disabled'}`}
              disabled={!affordable}
              onClick={() => handleRedeem(reward.id, reward.name)}
            >
              Redeem
            </button>
          </div>
        );
      })}
      {rewards.length === 0 && <div className="empty-state">No rewards yet — ask a parent to add some!</div>}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
