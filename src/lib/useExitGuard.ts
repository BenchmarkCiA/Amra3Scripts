import { useEffect, useRef } from 'react';
import type { Language } from '../types';
import { t } from './i18n';

// The app has no router/history entries of its own, so a phone's back
// button (or back-swipe gesture) normally exits the page outright on the
// very first press — losing any in-progress quest state with no warning.
// This keeps one extra history entry "in reserve": the first back press is
// caught as a popstate event instead of leaving, a confirm dialog asks
// whether to exit, and canceling re-arms the guard for next time.
export function useExitGuard(lang: Language) {
  const langRef = useRef(lang);
  langRef.current = lang;

  useEffect(() => {
    const pushGuard = () => window.history.pushState({ familyQuestGuard: true }, '', window.location.href);
    pushGuard();

    function handlePopState() {
      const wantsToExit = window.confirm(t(langRef.current, 'confirmExitApp'));
      if (wantsToExit) {
        window.history.back();
      } else {
        pushGuard();
      }
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
}
