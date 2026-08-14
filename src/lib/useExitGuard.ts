import { useEffect, useState } from 'react';

// The app has no router/history entries of its own, so a phone's back
// button (or back-swipe gesture) normally exits the page outright on the
// very first press — losing any in-progress quest state with no warning.
// This keeps one extra history entry "in reserve": the first back press is
// caught as a popstate event instead of leaving, an in-app confirm dialog
// asks whether to exit, and canceling re-arms the guard for next time.
export function useExitGuard() {
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const pushGuard = () => window.history.pushState({ familyQuestGuard: true }, '', window.location.href);
    pushGuard();

    function handlePopState() {
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
    // Two steps back: one to consume the guard re-armed in handlePopState,
    // one more to actually leave.
    window.history.go(-2);
  }

  function cancelExit() {
    setShowConfirm(false);
  }

  return { showConfirm, confirmExit, cancelExit };
}
