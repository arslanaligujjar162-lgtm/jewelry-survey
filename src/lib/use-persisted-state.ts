"use client";

import { useEffect, useState } from "react";

// Keeps a piece of client state in sync with localStorage under `key`, so a
// calculator reopened later comes back exactly as it was left. Falls back to
// in-memory state only (no persistence, no throw) when storage is unavailable
// — private browsing, blocked site data, etc.
//
// `hydrated` (state, not a ref) is what keeps the save effect from firing
// with the still-default `value` on the same mount flush as the load effect:
// both effects run on mount regardless of dependency arrays, and a ref flip
// wouldn't re-run the save effect in time to see it — only a dependency
// change does, so hydration has to be state.
export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      // storage unavailable or corrupt — start fresh
    } finally {
      setHydrated(true);
    }
    // Only load once, on mount, keyed by the storage key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable — ignore
    }
  }, [key, value, hydrated]);

  return [value, setValue] as const;
}
