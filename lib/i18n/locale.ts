// Supported locales for the PT/EN interface. EN stays the default so the site
// reads the same for anyone who never opts into Portuguese.
export const LOCALES = ["en", "pt"] as const;
export type Locale = (typeof LOCALES)[number];

// Where the reader's choice is persisted. Written by the LocaleSwitcher (client)
// and read server-side on every request so pages + metadata render in the same
// language. No URL prefix — pretty /<username> and /vs/<a>/<b> links stay stable.
export const LOCALE_COOKIE = "gt-locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1y

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

// First-touch detection: the strongest Accept-Language tag. Only pt is mapped
// (everything else falls back to EN) — a deliberate, predictable default.
export function detectLocale(acceptLanguage?: string | null): Locale {
  const tag = (acceptLanguage ?? "").split(",")[0]?.trim().toLowerCase() ?? "";
  if (tag.startsWith("pt")) return "pt";
  return DEFAULT_LOCALE;
}

// Locale-aware number formatting ("1,234" en / "1.234" pt-BR).
export function fmtNum(n: number, locale: Locale = DEFAULT_LOCALE): string {
  return n.toLocaleString(locale === "pt" ? "pt-BR" : "en-US");
}
