// Dating-app/dev puns — rotate on the loading screen and the match overlay.
// Wording lives in the i18n dicts so the jokes read in the viewer's language.
import { dicts } from "@/lib/i18n/dicts";
import type { Locale } from "@/lib/i18n/locale";

export const punAt = (i: number, locale: Locale = "en"): string => {
  const puns = dicts[locale].puns;
  return puns[Math.abs(i) % puns.length];
};
