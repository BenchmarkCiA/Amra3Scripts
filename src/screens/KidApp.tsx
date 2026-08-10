import { useState } from 'react';
import { useStore } from '../state/store';
import { StarField } from '../components/StarField';
import { TopBar } from '../components/TopBar';
import { TabBar, type KidScreen } from '../components/TabBar';
import { KidHome } from './KidHome';
import { KidQuests } from './KidQuests';
import { RewardShop } from './RewardShop';
import { StreaksBadges } from './StreaksBadges';
import { TaskDetailModal } from './TaskDetailModal';

interface Props {
  childId: string;
  onSwitchProfile: () => void;
}

export function KidApp({ childId, onSwitchProfile }: Props) {
  const { state } = useStore();
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
            ← Switch profile
          </button>
        </div>
        <TopBar stars={child.stars} />
        <div className="screen-content">
          {screen === 'home' && (
            <KidHome child={child} onOpenTask={setActiveTaskId} onSeeAll={() => setScreen('quests')} />
          )}
          {screen === 'quests' && <KidQuests child={child} onOpenTask={setActiveTaskId} />}
          {screen === 'rewards' && <RewardShop child={child} />}
          {screen === 'streaks' && <StreaksBadges child={child} />}
        </div>
        <TabBar active={screen} onChange={setScreen} />
      </div>
      {activeChallenge && (
        <TaskDetailModal childId={child.id} challenge={activeChallenge} onClose={() => setActiveTaskId(null)} />
      )}
    </div>
  );
}
