import { useState } from 'react';
import { useStore } from '../state/store';
import { StarField } from '../components/StarField';
import { t } from '../lib/i18n';

interface Props {
  onUnlock: () => void;
  onBack: () => void;
}

export function ParentGate({ onUnlock, onBack }: Props) {
  const { state } = useStore();
  const lang = state.language;
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
          <div className="picker-title">{t(lang, 'parentMode')}</div>
          <div className="picker-subtitle">{t(lang, 'parentPinPrompt')}</div>
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
            {error && <div className="feedback-msg wrong">{t(lang, 'wrongPin')}</div>}
            <button className="btn btn-primary" type="submit" style={{ maxWidth: 200 }}>
              {t(lang, 'unlock')}
            </button>
          </form>
          <button className="parent-link" onClick={onBack}>
            ← {t(lang, 'back')}
          </button>
          <div className="empty-state" style={{ padding: 0, marginTop: 8 }}>Default PIN: 1234 (change it in Settings)</div>
        </div>
      </div>
    </div>
  );
}
