"use client";

/* ------------------------------------------------------------------ */
/*  Grantha Mandir — client store                                      */
/*                                                                     */
/*  A single localStorage-backed provider that carries the personal    */
/*  reading state that never leaves the device: bookmarks, the last    */
/*  article a devotee was reading ("Continue Reading"), and a gentle    */
/*  reading streak. No accounts, no network — purely local devotion.   */
/* ------------------------------------------------------------------ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "hariboll-grantha-v1";

export interface ContinueReading {
  slug: string;
  title: string;
  collectionTitle: string;
  cover?: string;
  progress: number; // 0..1
  updatedAt: number;
}

interface StreakState {
  count: number;
  lastReadDay: string; // YYYY-MM-DD in local time
}

interface GranthaState {
  bookmarks: string[];
  continueReading: ContinueReading | null;
  streak: StreakState;
}

const EMPTY_STATE: GranthaState = {
  bookmarks: [],
  continueReading: null,
  streak: { count: 0, lastReadDay: "" },
};

interface GranthaContextValue extends GranthaState {
  ready: boolean;
  isBookmarked: (slug: string) => boolean;
  toggleBookmark: (slug: string) => void;
  recordReading: (entry: Omit<ContinueReading, "updatedAt">) => void;
  clearContinue: () => void;
}

const GranthaContext = createContext<GranthaContextValue | null>(null);

function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00`).getTime();
  const b = new Date(`${to}T00:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

function readStorage(): GranthaState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<GranthaState>;
    return {
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      continueReading: parsed.continueReading ?? null,
      streak:
        parsed.streak && typeof parsed.streak.count === "number"
          ? parsed.streak
          : { count: 0, lastReadDay: "" },
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function GranthaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GranthaState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage after mount to keep SSR output stable.
  useEffect(() => {
    setState(readStorage());
    setReady(true);
  }, []);

  // Persist and keep multiple tabs in sync.
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private mode / quota — reading state is best-effort only */
    }
  }, [state, ready]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setState(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleBookmark = useCallback((slug: string) => {
    setState((current) => {
      const has = current.bookmarks.includes(slug);
      return {
        ...current,
        bookmarks: has
          ? current.bookmarks.filter((s) => s !== slug)
          : [slug, ...current.bookmarks],
      };
    });
  }, []);

  const recordReading = useCallback(
    (entry: Omit<ContinueReading, "updatedAt">) => {
      setState((current) => {
        const today = dayKey(new Date());
        let streak = current.streak;
        if (streak.lastReadDay !== today) {
          const gap = streak.lastReadDay
            ? daysBetween(streak.lastReadDay, today)
            : Infinity;
          streak = {
            lastReadDay: today,
            count: gap === 1 ? streak.count + 1 : 1,
          };
        }
        return {
          ...current,
          streak,
          continueReading: { ...entry, updatedAt: Date.now() },
        };
      });
    },
    [],
  );

  const clearContinue = useCallback(() => {
    setState((current) => ({ ...current, continueReading: null }));
  }, []);

  const value = useMemo<GranthaContextValue>(
    () => ({
      ...state,
      ready,
      isBookmarked: (slug) => state.bookmarks.includes(slug),
      toggleBookmark,
      recordReading,
      clearContinue,
    }),
    [state, ready, toggleBookmark, recordReading, clearContinue],
  );

  return (
    <GranthaContext.Provider value={value}>{children}</GranthaContext.Provider>
  );
}

export function useGrantha(): GranthaContextValue {
  const ctx = useContext(GranthaContext);
  if (!ctx) {
    // A no-op fallback keeps components renderable outside the provider
    // (e.g. isolated tests) without throwing.
    return {
      ...EMPTY_STATE,
      ready: false,
      isBookmarked: () => false,
      toggleBookmark: () => {},
      recordReading: () => {},
      clearContinue: () => {},
    };
  }
  return ctx;
}
