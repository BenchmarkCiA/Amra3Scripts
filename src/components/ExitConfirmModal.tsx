import type { Language } from '../types';
import { t } from '../lib/i18n';

interface Props {
  lang: Language;
  onStay: () => void;
  onExit: () => void;
}

export function ExitConfirmModal({ lang, onStay, onExit }: Props) {
  return (
    <div className="modal-backdrop" onClick={onStay}>
      <div className="modal-card" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 40, marginBottom: 4 }}>👋</div>
        <div className="modal-title">{t(lang, 'exitConfirmTitle')}</div>
        <div className="modal-desc">{t(lang, 'exitConfirmBody')}</div>
        <div className="btn-row" style={{ marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onStay}>
            {t(lang, 'exitConfirmStay')}
          </button>
          <button className="btn btn-danger" onClick={onExit}>
            {t(lang, 'exitConfirmLeave')}
          </button>
        </div>
      </div>
    </div>
  );
}
