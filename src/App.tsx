import { useState } from 'react';
import { StoreProvider } from './state/store';
import { ProfilePicker } from './screens/ProfilePicker';
import { KidApp } from './screens/KidApp';
import { ParentGate } from './parent/ParentGate';
import { ParentApp } from './parent/ParentApp';

type View = { mode: 'picker' } | { mode: 'kid'; childId: string } | { mode: 'parent-gate' } | { mode: 'parent' };

function AppShell() {
  const [view, setView] = useState<View>({ mode: 'picker' });

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
