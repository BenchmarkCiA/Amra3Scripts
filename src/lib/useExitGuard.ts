import { useEffect, useRef, useState } from 'react';

// The app has no router/history entries of its own, so a phone's back
// button (or back-swipe gesture) normally exits the page outright on the
// very first press — losing any in-progress quest state with no warning.
// This keeps one extra history entry "in reserve": the first back press is
// caught as a popstate event instead of leaving, an in-app confirm dialog
// asks whether to exit, and canceling re-arms the guard for next time.
export function useExitGuard() {
  const [showConfirm, setShowConfirm] = useState(false);
  // Once the user confirms they want to leave, the popstate handler below
  // must stop re-arming the guard — otherwise the back navigation we
  // trigger in confirmExit() immediately re-triggers handlePopState, which
  // re-shows the same dialog and makes "Leave" look like it does nothing.
  const exitingRef = useRef(false);

  useEffect(() => {
    const pushGuard = () => window.history.pushState({ familyQuestGuard: true }, '', window.location.href);
    pushGuard();

    function handlePopState() {
      if (exitingRef.current) return; // already confirmed — let this navigation go through
      // Re-arm immediately, before the user has even answered, so a second
      // rapid back-press while the dialog is open is still caught.
      pushGuard();
      setShowConfirm(true);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function confirmExit() {
    setShowConfirm(false);
    exitingRef.current = true;

    // None of these can be guaranteed to work — a script cannot force-close
    // a tab or an installed PWA for security reasons, and a script-triggered
    // history.back()/go() does not trigger the OS-level "no history left,
    // close the app" handling the way a real hardware back-press does. So
    // try the things that *can* work, then detect whether any of them
    // actually left the page; if not, fall back to blanking the app out
    // instead of silently leaving the child stuck on the same screen.
    let left = false;
    const markLeft = () => {
      left = true;
    };
    window.addEventListener('pagehide', markLeft, { once: true });

    window.close(); // works in some installed/standalone shells
    window.history.back(); // works if there's a real page behind this one

    window.setTimeout(() => {
      window.removeEventListener('pagehide', markLeft);
      if (!left) {
        window.location.href = 'about:blank';
      }
    }, 250);
  }

  function cancelExit() {
    setShowConfirm(false);
  }

  return { showConfirm, confirmExit, cancelExit };
}
