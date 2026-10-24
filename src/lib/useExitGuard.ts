import { useEffect, useRef, useState } from 'react';

// Screens can claim the phone's back button first (e.g. an open task modal
// closes instead of asking "leaving already?"). Last registered wins.
const backHandlers: Array<() => boolean> = [];

export function useBackHandler(handler: (() => boolean) | null) {
  const ref = useRef(handler);
  ref.current = handler;
  const active = handler !== null;
  useEffect(() => {
    if (!active) return;
    const fn = () => (ref.current ? ref.current() : false);
    backHandlers.push(fn);
    return () => {
      const i = backHandlers.lastIndexOf(fn);
      if (i >= 0) backHandlers.splice(i, 1);
    };
  }, [active]);
}

// The app has no router/history entries of its own, so a phone's back
// button (or back-swipe gesture) would exit the page on the very first press
// — losing in-progress quest state with no warning. One extra history entry
// is kept "in reserve": a back press is caught as a popstate event, offered
// to any registered back handler (e.g. close the open task), and otherwise
// an in-app confirm dialog asks whether to exit.
export function useExitGuard() {
  const [showConfirm, setShowConfirm] = useState(false);
  // Once the user confirms they want to leave, the popstate handler must stop
  // re-arming the guard, otherwise our own back navigation re-opens the dialog.
  const exitingRef = useRef(false);

  useEffect(() => {
    const pushGuard = () => window.history.pushState({ familyQuestGuard: true }, '', window.location.href);
    pushGuard();

    function handlePopState() {
      if (exitingRef.current) return;
      // Re-arm immediately so a second rapid back-press is still caught.
      pushGuard();
      const handler = backHandlers[backHandlers.length - 1];
      if (handler && handler()) return;
      setShowConfirm(true);
    }

    // Coming back to this page from the browser's back/forward cache: the
    // previous "exiting" state is stale, so re-arm the guard.
    function handlePageShow(e: PageTransitionEvent) {
      if (!e.persisted) return;
      exitingRef.current = false;
      pushGuard();
    }

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  function confirmExit() {
    setShowConfirm(false);
    exitingRef.current = true;

    // A page can't close a browser tab or an installed PWA. So: step back past
    // our guard entry *and* the app's own entry to whatever was open before
    // (a search result, a link, the launcher). If nothing starts unloading in
    // time — there was nothing before us — blank the page as a last resort.
    // The wait is generous so a slow previous page isn't cancelled mid-load.
    let left = false;
    const markLeft = () => {
      left = true;
    };
    window.addEventListener('pagehide', markLeft, { once: true });
    window.addEventListener('beforeunload', markLeft, { once: true });

    window.close(); // honoured by some installed/standalone shells
    window.history.go(-2);

    window.setTimeout(() => {
      window.removeEventListener('pagehide', markLeft);
      window.removeEventListener('beforeunload', markLeft);
      if (!left && document.visibilityState === 'visible') {
        window.location.href = 'about:blank';
      }
    }, 1500);
  }

  function cancelExit() {
    setShowConfirm(false);
  }

  return { showConfirm, confirmExit, cancelExit };
}
