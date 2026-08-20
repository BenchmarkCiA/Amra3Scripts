import type { Language } from '../types';
import { t } from '../lib/i18n';
import { useBackgroundMusic } from '../lib/useBackgroundMusic';

interface Props {
  lang: Language;
  // 'inline' sits in the top bar's flex flow (e.g. above the coin pill).
  // 'floating' is a fixed-position fallback for screens with no top bar.
  variant?: 'inline' | 'floating';
}

export function MusicToggleButton({ lang, variant = 'floating' }: Props) {
  const { enabled, toggle } = useBackgroundMusic();

  return (
    <button
      className={variant === 'inline' ? 'music-toggle-btn-inline' : 'music-toggle-btn'}
      onClick={toggle}
      aria-label={t(lang, enabled ? 'musicOn' : 'musicOff')}
      title={t(lang, enabled ? 'musicOn' : 'musicOff')}
    >
      {enabled ? '🔊' : '🔇'}
    </button>
  );
}
