import type { Language } from '../types';
import { t } from '../lib/i18n';

interface Props {
  stars: number;
  lang: Language;
}

export function TopBar({ stars, lang }: Props) {
  return (
    <div className="top-bar">
      <div className="logo-badge-group">
        <div className="logo-badge" />
        <div className="app-name">{t(lang, 'appName')}</div>
      </div>
      <div className="coin-pill">
        <span className="coin-dot" />
        {stars}
      </div>
    </div>
  );
}
