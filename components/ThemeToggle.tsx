"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

// Light / dark toggle — flips `.dark` on <html>, which re-tints the whole
// design system (all color tokens are CSS variables overridden under `.dark`).
// Reads the live DOM class through useSyncExternalStore (no setState-in-effect,
// and no hydration mismatch: the server snapshot is always light) and notifies
// sibling toggles via a window event so every copy stays in sync.

const THEME_EVENT = "gittinder-theme";

const subscribe = (onChange: () => void) => {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
};

const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => false;

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = !getSnapshot();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("gittinder-theme", next ? "dark" : "light");
    } catch {
      // storage unavailable (private mode) — the class still flips for this tab
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-line bg-surface/60 text-ink-soft transition hover:border-brand hover:text-brand"
    >
      {dark ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />}
    </button>
  );
}
