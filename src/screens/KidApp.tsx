import { useState } from 'react';
import { useStore } from '../state/store';
import { StarField } from '../components/StarField';
import { TopBar } from '../components/TopBar';
import { TabBar, type KidScreen } from '../components/TabBar';
import { KidHome } from './KidHome';
import { RewardShop } from './RewardShop';
import { XpShop } from './XpShop';
import { StreaksBadges } from './StreaksBadges';
import { TaskDetailModal } from './TaskDetailModal';
import { t } from '../lib/i18n';

interface Props {
  childId: string;
  onSwitchProfile: () => void;
}

export function KidApp({ childId, onSwitchProfile }: Props) {
  const { state } = useStore();
  const lang = state.language;
  const child = state.children.find((c) => c.id === childId);
  const [screen, setScreen] = useState<KidScreen>('home');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  if (!child) return null;

  const activeChallenge = activeTaskId ? state.challenges.find((c) => c.id === activeTaskId) ?? null : null;

  return (
    <div className={`app-shell theme-${child.avatarTheme}`}>
      <div className="app-frame">
        <StarField />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button className="back-btn" style={{ marginInlineStart: 20, marginTop: 12 }} onClick={onSwitchProfile}>
            ← {t(lang, 'switchProfile')}
          </button>
        </div>
        <TopBar stars={child.stars} lang={lang} />
        <div className="screen-content">
          {screen === 'home' && <KidHome child={child} onOpenTask={setActiveTaskId} />}
          {screen === 'rewards' && <RewardShop child={child} />}
          {screen === 'shop' && <XpShop child={child} />}
          {screen === 'streaks' && <StreaksBadges child={child} />}
        </div>
        <TabBar active={screen} onChange={setScreen} lang={lang} />
      </div>
      {activeChallenge && (
        <TaskDetailModal childId={child.id} challenge={activeChallenge} onClose={() => setActiveTaskId(null)} />
      )}
    </div>
  );
}
