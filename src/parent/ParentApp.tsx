import { useState } from 'react';
import { StarField } from '../components/StarField';
import { ParentDashboard } from './ParentDashboard';
import { ParentChallengeForm } from './ParentChallengeForm';
import { ParentChallengeList } from './ParentChallengeList';
import { ParentRewardsManager } from './ParentRewardsManager';
import { ParentSettings } from './ParentSettings';
import { ParentStats } from './ParentStats';
import { useStore } from '../state/store';
import { t } from '../lib/i18n';

type ParentScreen = 'dashboard' | 'new-challenge' | 'challenges' | 'rewards' | 'stats' | 'settings';

const TAB_KEYS = [
  { key: 'dashboard' as const, labelKey: 'dashboard' as const },
  { key: 'new-challenge' as const, labelKey: 'addChallenge' as const },
  { key: 'challenges' as const, labelKey: 'allChallenges' as const },
  { key: 'rewards' as const, labelKey: 'rewards' as const },
  { key: 'stats' as const, labelKey: 'stats' as const },
  { key: 'settings' as const, labelKey: 'settings' as const },
];

interface Props {
  onBack: () => void;
}

export function ParentApp({ onBack }: Props) {
  const { state } = useStore();
  const lang = state.language;
  const [screen, setScreen] = useState<ParentScreen>('dashboard');

  return (
    <div className="app-shell theme-parent">
      <div className="app-frame">
        <StarField />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button className="back-btn" style={{ marginInlineStart: 20, marginTop: 12 }} onClick={onBack}>
            ← {t(lang, 'exitParentMode')}
          </button>
        </div>
        <div className="top-bar" style={{ paddingBottom: 0 }}>
          <div className="logo-badge-group">
            <div className="logo-badge" />
            <div className="app-name">{t(lang, 'parentMode')}</div>
          </div>
        </div>
        <div className="parent-nav">
          {TAB_KEYS.map((tab) => (
            <button
              key={tab.key}
              className={`parent-tab${screen === tab.key ? ' active' : ''}`}
              onClick={() => setScreen(tab.key)}
            >
              {t(lang, tab.labelKey)}
            </button>
          ))}
        </div>
        <div className="screen-content" style={{ paddingBottom: 40 }}>
          {screen === 'dashboard' && <ParentDashboard />}
          {screen === 'new-challenge' && <ParentChallengeForm onCreated={() => setScreen('challenges')} />}
          {screen === 'challenges' && <ParentChallengeList />}
          {screen === 'rewards' && <ParentRewardsManager />}
          {screen === 'stats' && <ParentStats />}
          {screen === 'settings' && <ParentSettings />}
        </div>
      </div>
    </div>
  );
}
