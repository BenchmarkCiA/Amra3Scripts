import { useState } from 'react';
import { StoreProvider, useStore } from './state/store';
import { ProfilePicker } from './screens/ProfilePicker';
import { KidApp } from './screens/KidApp';
import { ParentGate } from './parent/ParentGate';
import { ParentApp } from './parent/ParentApp';
import { StarField } from './components/StarField';

type View = { mode: 'picker' } | { mode: 'kid'; childId: string } | { mode: 'parent-gate' } | { mode: 'parent' };

function AppShell() {
  const { loading } = useStore();
  const [view, setView] = useState<View>({ mode: 'picker' });

  if (loading) {
    return (
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
  }

  if (view.mode === 'kid') {
    return <KidApp childId={view.childId} onSwitchProfile={() => setView({ mode: 'picker' })} />;
  }
  if (view.mode === 'parent-gate') {
    return <ParentGate onUnlock={() => setView({ mode: 'parent' })} onBack={() => setView({ mode: 'picker' })} />;
  }
  if (view.mode === 'parent') {
    return <ParentApp onBack={() => setView({ mode: 'picker' })} />;
  }
  return (
    <ProfilePicker
      onPickChild={(childId) => setView({ mode: 'kid', childId })}
      onParent={() => setView({ mode: 'parent-gate' })}
    />
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
