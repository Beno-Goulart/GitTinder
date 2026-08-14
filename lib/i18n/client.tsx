"use client";

import { createContext, useContext } from "react";
import { dicts } from "./dicts";
import type { Dictionary } from "./dicts";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "./locale";
import type { Locale } from "./locale";

// Client-side locale access. The server layout resolves the effective locale
// (cookie > Accept-Language) and seeds it here once; anything interactive that
// needs translated strings reads it through useLocale()/useDict(). The switcher
// writes the cookie and hard-reloads so server-rendered content (metadata, html
// lang, generated profiles) and the client agree on one language.

const I18nContext = createContext<Locale | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <I18nContext.Provider value={locale}>{children}</I18nContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(I18nContext) ?? "en";
}

export function useDict(): Dictionary {
  return dicts[useLocale()];
}

// Persist the choice and reload. Lives outside the component so the mutation
// stays out of render scope (react-hooks/immutability).
function writeLocaleCookie(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}`;
  window.location.reload();
}

// EN / PT pill — writes the gt-locale cookie and reloads (the switch is server
// rendered, so a full round-trip is the only way to keep everything in sync).
export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const set = (next: Locale) => {
    if (next === locale) return;
    writeLocaleCookie(next);
  };
  const pill = (l: Locale) => (
    <button
      type="button"
      onClick={() => set(l)}
      aria-pressed={locale === l}
      className={`font-mono text-[11px] font-semibold tracking-[.08em] transition ${
        locale === l
          ? "text-brand"
          : "text-ink-faint hover:text-ink-soft"
      }`}
    >
      {l.toUpperCase()}
    </button>
  );
  return (
    <div
      className={`inline-flex h-[30px] shrink-0 items-center gap-[2px] rounded-full border border-line bg-surface/60 px-[9px] ${className}`}
      role="group"
      aria-label={useDict().ui.language}
    >
      {pill("en")}
      <span className="text-[10px] text-ink-faint" aria-hidden>
        /
      </span>
      {pill("pt")}
    </div>
  );
}
