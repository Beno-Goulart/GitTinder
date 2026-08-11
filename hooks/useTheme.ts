"use client";

import { useSyncExternalStore } from "react";

// Live dark-mode state for client components. Subscribes to the same window
// event ThemeToggle dispatches, so every consumer flips in sync with the
// toggle. The server snapshot is always light, matching what was rendered —
// no hydration mismatch; the first client render corrects itself after mount.

const THEME_EVENT = "gittinder-theme";

const subscribe = (onChange: () => void) => {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
};

const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => false;

export function useTheme(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
