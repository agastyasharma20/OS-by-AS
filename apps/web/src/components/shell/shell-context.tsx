"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ShellState = {
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  collapsed: boolean;
  toggleCollapsed: () => void;
};

const ShellContext = createContext<ShellState | null>(null);
const COLLAPSED_KEY = "osbyas.sidebar.collapsed";

export function ShellProvider({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a per-viewer preference after hydration
      setCollapsed(window.localStorage.getItem(COLLAPSED_KEY) === "1");
    } catch {
      // storage unavailable (private mode); keep default
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKey);
    // Signals that keyboard shortcuts are live (used by end-to-end tests and monitoring).
    document.documentElement.dataset.shellReady = "true";
    return () => {
      window.removeEventListener("keydown", onKey);
      delete document.documentElement.dataset.shellReady;
    };
  }, []);

  const value = useMemo(
    () => ({ paletteOpen, setPaletteOpen, collapsed, toggleCollapsed }),
    [paletteOpen, collapsed, toggleCollapsed],
  );
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell(): ShellState {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside <ShellProvider>");
  return ctx;
}
