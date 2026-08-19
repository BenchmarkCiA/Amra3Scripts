import type { Language } from '../types';
import { t } from '../lib/i18n';
import { useBackgroundMusic } from '../lib/useBackgroundMusic';

export function MusicToggleButton({ lang }: { lang: Language }) {
  const { enabled, toggle } = useBackgroundMusic();

  return (
    <button
      className="music-toggle-btn"
      onClick={toggle}
      aria-label={t(lang, enabled ? 'musicOn' : 'musicOff')}
      title={t(lang, enabled ? 'musicOn' : 'musicOff')}
    >
      {enabled ? '🔊' : '🔇'}
    </button>
  );
}
