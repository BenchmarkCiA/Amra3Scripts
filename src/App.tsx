import { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './state/store';
import { ProfilePicker } from './screens/ProfilePicker';
import { KidApp } from './screens/KidApp';
import { ParentGate } from './parent/ParentGate';
import { ParentApp } from './parent/ParentApp';
import { StarField } from './components/StarField';
import { ExitConfirmModal } from './components/ExitConfirmModal';
import { MusicToggleButton } from './components/MusicToggleButton';
import { isRTL, t } from './lib/i18n';
import { useExitGuard } from './lib/useExitGuard';

type View = { mode: 'picker' } | { mode: 'kid'; childId: string } | { mode: 'parent-gate' } | { mode: 'parent' };

function AppShell() {
  const { state, loading, loadError, retryLoad, syncError, dismissSyncError } = useStore();
  const [view, setView] = useState<View>({ mode: 'picker' });
  const { showConfirm, confirmExit, cancelExit } = useExitGuard();

  useEffect(() => {
    document.documentElement.lang = state.language;
    document.documentElement.dir = isRTL(state.language) ? 'rtl' : 'ltr';
  }, [state.language]);

  // Before the family's own settings load, pick the language from the device.
  const bootLang = loading || loadError ? (navigator.language?.startsWith('he') ? 'he' : state.language) : state.language;

  let content;
  if (loading || loadError) {
    content = (
      <div className="app-shell theme-parent" dir={isRTL(bootLang) ? 'rtl' : 'ltr'}>
        <div className="app-frame">
          <StarField />
          <div className="picker-shell" style={{ position: 'relative', zIndex: 1 }}>
            <div className="picker-title">Family Quest</div>
            <div className="picker-subtitle">{t(bootLang, loadError ? 'loadFailed' : 'loadingQuests')}</div>
            {loadError && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={retryLoad}>
                {t(bootLang, 'retry')}
              </button>
            )}
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
      {!loading && !loadError && view.mode !== 'kid' && <MusicToggleButton lang={state.language} />}
      {syncError && (
        <div className="toast sync-error-toast" role="alert" onClick={dismissSyncError}>
          ⚠️ {t(state.language, 'syncFailed')}
        </div>
      )}
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
