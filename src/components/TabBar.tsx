import type { Language } from '../types';
import { t } from '../lib/i18n';

export type KidScreen = 'home' | 'rewards' | 'shop' | 'streaks';

const TAB_KEYS = [
  { key: 'home' as const, labelKey: 'tabHome' as const },
  { key: 'rewards' as const, labelKey: 'tabRewards' as const },
  { key: 'shop' as const, labelKey: 'tabShop' as const },
  { key: 'streaks' as const, labelKey: 'tabStreaks' as const },
];

interface Props {
  active: KidScreen;
  onChange: (screen: KidScreen) => void;
  lang: Language;
}

export function TabBar({ active, onChange, lang }: Props) {
  return (
    <div className="tab-bar">
      {TAB_KEYS.map((tab) => (
        <button
          key={tab.key}
          className={`tab-item${active === tab.key ? ' active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          <span className="tab-dot" />
          {t(lang, tab.labelKey)}
        </button>
      ))}
    </div>
  );
}
