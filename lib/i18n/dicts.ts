import en from "./dicts/en";
import pt from "./dicts/pt";
import type { Locale } from "./locale";

// The canonical dictionary shape: whatever EN defines, every locale must match.
export type Dictionary = typeof en;

export const dicts: Record<Locale, Dictionary> = { en, pt };

// Interpolates {token} placeholders in a template string. Unknown tokens are
// left untouched so a missing param never crashes a render.
export function fmt(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) =>
    Object.prototype.hasOwnProperty.call(params, key)
      ? String(params[key])
      : `{${key}}`,
  );
}
