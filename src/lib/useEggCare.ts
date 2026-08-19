import { useCallback, useEffect, useState } from 'react';

// Light, cosmetic-only daily mini-game: feed + give a drink, once per day
// each, then a little dance. Device-local (localStorage) — this is flavor,
// not family progress data, so it doesn't need to sync to Supabase.
function todayKey(childId: string): string {
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `familyquest.eggcare.${childId}.${date}`;
}

interface CareState {
  fed: boolean;
  watered: boolean;
}

function readCare(key: string): CareState {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as CareState) : { fed: false, watered: false };
  } catch {
    return { fed: false, watered: false };
  }
}

export function useEggCare(childId: string) {
  const key = todayKey(childId);
  const [care, setCare] = useState<CareState>(() => readCare(key));
  const [dancing, setDancing] = useState(false);

  useEffect(() => {
    setCare(readCare(key));
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(care));
    } catch {
      // ignore
    }
  }, [key, care]);

  const triggerDance = useCallback(() => {
    setDancing(true);
    window.setTimeout(() => setDancing(false), 1300);
  }, []);

  const feed = useCallback(() => {
    setCare((c) => (c.fed ? c : { ...c, fed: true }));
    triggerDance();
  }, [triggerDance]);

  const water = useCallback(() => {
    setCare((c) => (c.watered ? c : { ...c, watered: true }));
    triggerDance();
  }, [triggerDance]);

  return { fed: care.fed, watered: care.watered, dancing, feed, water };
}
