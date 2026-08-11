import { useStore } from '../state/store';
import { StarField } from '../components/StarField';
import { t } from '../lib/i18n';

interface Props {
  onPickChild: (childId: string) => void;
  onParent: () => void;
}

export function ProfilePicker({ onPickChild, onParent }: Props) {
  const { state } = useStore();
  const lang = state.language;

  return (
    <div className="app-shell theme-parent">
      <div className="app-frame">
        <StarField />
        <div className="picker-shell">
          <div className="picker-title">{t(lang, 'appName')}</div>
          <div className="picker-subtitle">{t(lang, 'whoseTurn')}</div>
          {state.children.map((child) => (
            <button key={child.id} className="picker-card" onClick={() => onPickChild(child.id)}>
              <div className="avatar-circle" style={{ background: child.accentColor }}>
                {child.name[0]}
              </div>
              <div>
                <div className="picker-name">{child.name}</div>
                <div className="picker-age">
                  {t(lang, 'age')} {child.age}
                </div>
              </div>
            </button>
          ))}
          <button className="parent-link" onClick={onParent}>
            {t(lang, 'parentMode')}
          </button>
        </div>
      </div>
    </div>
  );
}
