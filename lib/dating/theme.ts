import { TIER_ACCENT } from "./constants";
import type { DatingProfile, Tier } from "./types";

// hex (#rgb / #rrggbb) → rgba() string, so a single tier accent hex can drive
// translucent glows/tints without hand-writing each alpha variant.
export function rgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(f, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

// Per-tier visual identity. The card is photo-first (no background art) — the
// tier lives in the accent: the match pill, glow, radar and the whole report
// tint to it.
export interface ProfileTheme {
  accent: string; // tier color — drives pill, glow, radar
  glow: string; // card drop-shadow glow
  chipBg: string; // interest-chip plate over the photo
  ring: string; // tier pill border
}

export function tierTheme(tier: Tier): ProfileTheme {
  const accent = TIER_ACCENT[tier];
  return {
    accent,
    glow: rgba(accent, 0.45),
    chipBg: "rgba(255,255,255,.16)",
    ring: rgba(accent, 0.9),
  };
}

export function profileTheme(p: DatingProfile): ProfileTheme {
  return tierTheme(p.tier);
}
