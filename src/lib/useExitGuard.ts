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
    // Exactly one guard entry is ever in play at a time (each back-press +
    // re-arm nets to the same single entry, not two), so one step back
    // consumes it and lets the real navigation — to whatever was open
    // before this app, or the platform's own "close app" handling when
    // there's nothing left — actually happen.
    window.history.back();
    // Best-effort: some installed/standalone PWA shells honor this even
    // though a normal browser tab won't (a script can't close a tab it
    // didn't open) — harmless no-op there.
    window.close();
  }

  function cancelExit() {
    setShowConfirm(false);
  }

  return { showConfirm, confirmExit, cancelExit };
}
