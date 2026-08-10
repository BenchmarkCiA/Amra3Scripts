export type KidScreen = 'home' | 'quests' | 'rewards' | 'streaks';

const TABS: { key: KidScreen; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'quests', label: 'Quests' },
  { key: 'rewards', label: 'Rewards' },
  { key: 'streaks', label: 'Streaks' },
];

interface Props {
  active: KidScreen;
  onChange: (screen: KidScreen) => void;
}

export function TabBar({ active, onChange }: Props) {
  return (
    <div className="tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`tab-item${active === tab.key ? ' active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          <span className="tab-dot" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
