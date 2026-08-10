import { useStore } from '../state/store';
import { StarField } from '../components/StarField';

interface Props {
  onPickChild: (childId: string) => void;
  onParent: () => void;
}

export function ProfilePicker({ onPickChild, onParent }: Props) {
  const { state } = useStore();

  return (
    <div className="app-shell theme-parent">
      <div className="app-frame">
        <StarField />
        <div className="picker-shell">
          <div className="picker-title">Family Quest</div>
          <div className="picker-subtitle">Whose turn is it? Tap your name to start today's quests.</div>
          {state.children.map((child) => (
            <button key={child.id} className="picker-card" onClick={() => onPickChild(child.id)}>
              <div className="avatar-circle" style={{ background: child.accentColor }}>
                {child.name[0]}
              </div>
              <div>
                <div className="picker-name">{child.name}</div>
                <div className="picker-age">Age {child.age}</div>
              </div>
            </button>
          ))}
          <button className="parent-link" onClick={onParent}>
            Parent mode
          </button>
        </div>
      </div>
    </div>
  );
}
