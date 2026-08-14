import { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './state/store';
import { ProfilePicker } from './screens/ProfilePicker';
import { KidApp } from './screens/KidApp';
import { ParentGate } from './parent/ParentGate';
import { ParentApp } from './parent/ParentApp';
import { StarField } from './components/StarField';
import { ExitConfirmModal } from './components/ExitConfirmModal';
import { isRTL } from './lib/i18n';
import { useExitGuard } from './lib/useExitGuard';

type View = { mode: 'picker' } | { mode: 'kid'; childId: string } | { mode: 'parent-gate' } | { mode: 'parent' };

function AppShell() {
  const { state, loading } = useStore();
  const [view, setView] = useState<View>({ mode: 'picker' });
  const { showConfirm, confirmExit, cancelExit } = useExitGuard();

  useEffect(() => {
    document.documentElement.lang = state.language;
    document.documentElement.dir = isRTL(state.language) ? 'rtl' : 'ltr';
  }, [state.language]);

  let content;
  if (loading) {
    content = (
      <div className="app-shell theme-parent">
        <div className="app-frame">
          <StarField />
          <div className="picker-shell" style={{ position: 'relative', zIndex: 1 }}>
            <div className="picker-title">Family Quest</div>
            <div className="picker-subtitle">Loading your family's quests…</div>
          </div>
        </div>
      </div>
    );
  } else if (view.mode === 'kid') {
    content = <KidApp childId={view.childId} onSwitchProfile={() => setView({ mode: 'picker' })} />;
  } else if (view.mode === 'parent-gate') {
    content = <ParentGate onUnlock={() => setView({ mode: 'parent' })} onBack={() => setView({ mode: 'picker' })} />;
  } else if (view.mode === 'parent') {
    content = <ParentApp onBack={() => setView({ mode: 'picker' })} />;
  } else {
    content = (
      <ProfilePicker
        onPickChild={(childId) => setView({ mode: 'kid', childId })}
        onParent={() => setView({ mode: 'parent-gate' })}
      />
    );
  }

  return (
    <>
      {content}
      {showConfirm && <ExitConfirmModal lang={state.language} onStay={cancelExit} onExit={confirmExit} />}
    </>
  );
}

function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}

export default App;
