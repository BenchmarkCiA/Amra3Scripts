import { useCallback, useEffect, useState } from 'react';
import { backgroundMusic } from './backgroundMusic';

const STORAGE_KEY = 'familyquest.musicEnabled';

function readStoredPreference(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

// Device-level preference (not synced to Supabase — it's an audio setting
// for whoever is holding the device right now, not family data).
export function useBackgroundMusic() {
  const [enabled, setEnabled] = useState(readStoredPreference);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // ignore
    }

    if (!enabled) {
      backgroundMusic.stop();
      return;
    }

    backgroundMusic.start();
    // Browsers block audio until a user gesture happens on the page, so if
    // the very first start() call was silently blocked, retry on the next tap.
    const retryStart = () => backgroundMusic.start();
    document.addEventListener('pointerdown', retryStart);
    document.addEventListener('keydown', retryStart);
    return () => {
      document.removeEventListener('pointerdown', retryStart);
      document.removeEventListener('keydown', retryStart);
    };
  }, [enabled]);

  const toggle = useCallback(() => setEnabled((e) => !e), []);
  return { enabled, toggle };
}
