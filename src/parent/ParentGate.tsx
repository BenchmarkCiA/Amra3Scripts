import { useState } from 'react';
import { useStore } from '../state/store';
import { StarField } from '../components/StarField';

interface Props {
  onUnlock: () => void;
  onBack: () => void;
}

export function ParentGate({ onUnlock, onBack }: Props) {
  const { state } = useStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin === state.parentPin) {
      onUnlock();
    } else {
      setError(true);
    }
  }

  return (
    <div className="app-shell theme-parent">
      <div className="app-frame">
        <StarField />
        <div className="pin-shell" style={{ position: 'relative', zIndex: 1 }}>
          <div className="picker-title">Parent Mode</div>
          <div className="picker-subtitle">Enter the parent PIN to manage challenges, rewards and approvals.</div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <input
              className="form-input pin-input"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              autoFocus
            />
            {error && <div className="feedback-msg wrong">Wrong PIN — try again.</div>}
            <button className="btn btn-primary" type="submit" style={{ maxWidth: 200 }}>
              Unlock
            </button>
          </form>
          <button className="parent-link" onClick={onBack}>
            ← Back
          </button>
          <div className="empty-state" style={{ padding: 0, marginTop: 8 }}>Default PIN: 1234 (change it in Settings)</div>
        </div>
      </div>
    </div>
  );
}
