import type { Child } from '../types';

function DragonMascot() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" style={{ animation: 'bob 3s ease-in-out infinite' }}>
      <circle cx="48" cy="50" r="38" fill="#df66b8" />
      <circle cx="30" cy="34" r="6" fill="#df66b8" />
      <circle cx="66" cy="34" r="6" fill="#df66b8" />
      <circle cx="36" cy="46" r="9" fill="#fff" />
      <circle cx="60" cy="46" r="9" fill="#fff" />
      <circle cx="37" cy="47" r="4" fill="#241a2e" />
      <circle cx="61" cy="47" r="4" fill="#241a2e" />
      <circle cx="26" cy="58" r="5" fill="#f4a0d0" opacity="0.7" />
      <circle cx="70" cy="58" r="5" fill="#f4a0d0" opacity="0.7" />
      <path d="M36 64 Q48 74 60 64" stroke="#241a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function OwlMascot() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" style={{ animation: 'bob 3s ease-in-out infinite' }}>
      <ellipse cx="48" cy="52" rx="34" ry="32" fill="#2f9c86" />
      <circle cx="24" cy="30" r="7" fill="#2f9c86" />
      <circle cx="72" cy="30" r="7" fill="#2f9c86" />
      <circle cx="34" cy="48" r="11" fill="#fff" />
      <circle cx="62" cy="48" r="11" fill="#fff" />
      <circle cx="34" cy="48" r="5" fill="#241a2e" />
      <circle cx="62" cy="48" r="5" fill="#241a2e" />
      <path d="M48 56 L42 66 L54 66 Z" fill="#f4c14f" />
      <circle cx="24" cy="60" r="4" fill="#8fe0cf" opacity="0.7" />
      <circle cx="72" cy="60" r="4" fill="#8fe0cf" opacity="0.7" />
    </svg>
  );
}

function IconBadges() {
  return (
    <div className="badge-row">
      <div className="icon-badge" style={{ animation: 'bob 2.6s ease-in-out infinite' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2c3 3 4 7 4 10 0 3-2 5-4 6-2-1-4-3-4-6 0-3 1-7 4-10Z" fill="#fff" />
          <circle cx="12" cy="11" r="1.6" fill="#4650b0" />
        </svg>
      </div>
      <div className="icon-badge" style={{ animation: 'bob 3.2s ease-in-out infinite' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="12" width="16" height="5" rx="2" fill="#fff" />
          <circle cx="8" cy="18" r="2" fill="#fff" />
          <circle cx="16" cy="18" r="2" fill="#fff" />
        </svg>
      </div>
      <div className="icon-badge" style={{ animation: 'bob 3.6s ease-in-out infinite' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" fill="#fff" />
          <path d="M12 8l2 3-2 3-2-3 2-3Z" fill="#4650b0" />
        </svg>
      </div>
    </div>
  );
}

interface Props {
  child: Child;
}

export function Mascot({ child }: Props) {
  if (child.avatarTheme === 'mia') {
    return (
      <div className="mascot-area">
        <DragonMascot />
        <div className="mascot-caption">Let's go on a quest, {child.name}!</div>
      </div>
    );
  }
  if (child.avatarTheme === 'sam') {
    return (
      <div className="mascot-area">
        <OwlMascot />
        <div className="mascot-caption">Hoot! Time for a quest, {child.name}!</div>
      </div>
    );
  }
  return (
    <div className="mascot-area">
      <IconBadges />
      <div className="mascot-caption">Ready for today's quests, {child.name}?</div>
    </div>
  );
}
