import { useState } from 'react';
import { StarField } from '../components/StarField';
import { ParentDashboard } from './ParentDashboard';
import { ParentChallengeForm } from './ParentChallengeForm';
import { ParentChallengeList } from './ParentChallengeList';
import { ParentRewardsManager } from './ParentRewardsManager';
import { ParentSettings } from './ParentSettings';

type ParentScreen = 'dashboard' | 'new-challenge' | 'challenges' | 'rewards' | 'settings';

const TABS: { key: ParentScreen; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'new-challenge', label: '+ Add Challenge' },
  { key: 'challenges', label: 'All Challenges' },
  { key: 'rewards', label: 'Rewards' },
  { key: 'settings', label: 'Settings' },
];

interface Props {
  onBack: () => void;
}

export function ParentApp({ onBack }: Props) {
  const [screen, setScreen] = useState<ParentScreen>('dashboard');

  return (
    <div className="app-shell theme-parent">
      <div className="app-frame">
        <StarField />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button className="back-btn" style={{ marginInlineStart: 20, marginTop: 12 }} onClick={onBack}>
            ← Exit parent mode
          </button>
        </div>
        <div className="top-bar" style={{ paddingBottom: 0 }}>
          <div className="logo-badge-group">
            <div className="logo-badge" />
            <div className="app-name">Parent Mode</div>
          </div>
        </div>
        <div className="parent-nav">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`parent-tab${screen === tab.key ? ' active' : ''}`}
              onClick={() => setScreen(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="screen-content" style={{ paddingBottom: 40 }}>
          {screen === 'dashboard' && <ParentDashboard />}
          {screen === 'new-challenge' && <ParentChallengeForm onCreated={() => setScreen('challenges')} />}
          {screen === 'challenges' && <ParentChallengeList />}
          {screen === 'rewards' && <ParentRewardsManager />}
          {screen === 'settings' && <ParentSettings />}
        </div>
      </div>
    </div>
  );
}
