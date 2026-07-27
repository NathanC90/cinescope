// Watchlist persisted to localStorage, shared across components via useSyncExternalStore
// so every consumer re-renders on change without a context provider.
import { useSyncExternalStore, useCallback } from "react";
import type { Movie } from "../types";

const KEY = "cinescope:watchlist";

let cache: Movie[] = load();
const listeners = new Set<() => void>();

function load(): Movie[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Movie[]) : [];
  } catch {
    return []; // corrupt or unavailable storage shouldn't break the app
  }
}

function commit(next: Movie[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode / quota — keep working in memory for this session.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Read-only snapshot of the saved list. */
export function useWatchlist() {
  const items = useSyncExternalStore(
    subscribe,
    () => cache,
    () => cache as Movie[], // server snapshot (no SSR here, but required by the API)
  );

  const toggle = useCallback((movie: Movie) => {
    commit(
      cache.some((m) => m.id === movie.id)
        ? cache.filter((m) => m.id !== movie.id)
        : [...cache, movie],
    );
  }, []);

  const has = useCallback((id: number) => items.some((m) => m.id === id), [items]);

  return { items, toggle, has };
}
