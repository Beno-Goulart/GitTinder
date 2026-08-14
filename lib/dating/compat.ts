import { TRAITS } from "./constants";
import { dicts, fmt } from "@/lib/i18n/dicts";
import type { Locale } from "@/lib/i18n/locale";
import type { CompatTier, DatingProfile, TraitKey } from "./types";

// Pair chemistry — "are these two profiles a match?" The six-traits radar, the
// shared languages and each profile's standalone match score combine into one
// 0–99 chemistry score with its own tier ("match made in merge" → "swipe left").
// Pure and framework-agnostic so the same numbers drive the /vs page, its OG
// image and the unit tests. Labels/verdicts/notes read from the locale dict.

export const COMPAT_TIERS: {
  min: number;
  tier: CompatTier;
  accent: string;
}[] = [
  { min: 90, tier: "merge", accent: "#d4932e" },
  { min: 78, tier: "sparks", accent: "#ff4655" },
  { min: 64, tier: "vibes", accent: "#25a86f" },
  { min: 48, tier: "coffee", accent: "#e8922a" },
  { min: 34, tier: "complicated", accent: "#e24f93" },
  { min: 0, tier: "nope", accent: "#e5484d" },
];

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

// Shared-language overlap (Jaccard on the ranked language lists).
export function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const inter = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size || 1;
  return inter / union;
}

function topTrait(p: DatingProfile): TraitKey {
  return [...TRAITS].sort((x, y) => p.stats[y] - p.stats[x])[0];
}

export interface Chemistry {
  score: number; // 1–99 headline chemistry
  tier: CompatTier;
  tierLabel: string;
  accent: string;
  verdict: string;
  sharedLanguages: string[]; // interests both speak
  sharedScore: number; // 0–100 — shared-language overlap
  similarity: number; // 0–100 — how close their radar shapes are
  complementarity: number; // 0–100 — how well their edges cover different ground
  charm: number; // 0–100 — average standalone match score
  leftLead: TraitKey; // a's standout trait
  rightLead: TraitKey; // b's standout trait
  notes: string[]; // plain-language breakdown lines
}

export function computeChemistry(
  a: DatingProfile,
  b: DatingProfile,
  locale: Locale = "en",
): Chemistry {
  const dict = dicts[locale];
  const sharedLanguages = a.interests.filter((x) => b.interests.includes(x));
  const sharedScore = Math.round(100 * jaccard(a.interests, b.interests));

  // Core similarity — how aligned the two radars are.
  const similarity = Math.round(
    TRAITS.reduce((s, t) => s + (100 - Math.abs(a.stats[t] - b.stats[t])), 0) /
      TRAITS.length,
  );

  // Complementary edges — one person strong where the other is mid covers new
  // ground; stacking the same dimension (or both being weak) scores less.
  let comp = 0;
  for (const t of TRAITS) {
    const hi = Math.max(a.stats[t], b.stats[t]);
    const lo = Math.min(a.stats[t], b.stats[t]);
    if (hi >= 70 && lo < 50) comp += 100;
    else if (hi >= 70) comp += 60;
    else if (lo <= 40) comp += 25;
    else comp += 55;
  }
  const complementarity = Math.round(comp / TRAITS.length);

  // On-paper charm — each profile's standalone match score.
  const charm = Math.round((a.match + b.match) / 2);

  const score = clamp(
    Math.round(
      0.3 * sharedScore + 0.25 * similarity + 0.2 * complementarity + 0.25 * charm,
    ),
    1,
    99,
  );

  const tier =
    COMPAT_TIERS.find((t) => score >= t.min) ?? COMPAT_TIERS[COMPAT_TIERS.length - 1];
  const tierDict = dict.compat.tiers[tier.tier];

  const leftLead = topTrait(a);
  const rightLead = topTrait(b);

  const notes = dict.compat.notes;
  const langLine = sharedLanguages.length
    ? fmt(sharedLanguages.length > 1 ? notes.sharedMany : notes.sharedOne, {
        langs: sharedLanguages.join(" & "),
      })
    : notes.none;

  const traitLabel = (k: TraitKey) => dict.traits[k].label;
  const compLine =
    leftLead === rightLead
      ? fmt(notes.sameLane, { a: `@${a.login}`, b: `@${b.login}`, trait: traitLabel(leftLead) })
      : fmt(notes.differentCorners, {
          a: `@${a.login}`,
          b: `@${b.login}`,
          traitA: traitLabel(leftLead),
          traitB: traitLabel(rightLead),
        });

  const charmLine = fmt(notes.charm, { score: charm, a: a.match, b: b.match });

  return {
    score,
    tier: tier.tier,
    tierLabel: tierDict.label,
    accent: tier.accent,
    verdict: tierDict.verdict,
    sharedLanguages,
    sharedScore,
    similarity,
    complementarity,
    charm,
    leftLead,
    rightLead,
    notes: [langLine, compLine, charmLine],
  };
}

// --- Mutual-match logic (KEEP SWIPING) ------------------------------------
// The full pair report needs both six-trait radars, but the swipe deck ships
// lean baked cards (no stats). `sparkScore` approximates the pair chemistry
// with the fields a card DOES carry — the shared-language overlap and the
// combined on-paper charm — reusing the exact same components (jaccard +
// `charm`) the full formula weighs, so a match and the /vs report agree on
// what "compatible" means. Both DatingProfile and CardProfile fit Sparkable.

export interface Sparkable {
  login: string;
  match: number;
  interests: string[];
}

// Pairs at or above this spark count as mutual — the liked profile "swipes
// back". Tuned so a match needs real overlap or real pull, never a freebie.
export const MATCH_THRESHOLD = 50;

export function sparkScore(you: Sparkable, them: Sparkable): number {
  const sharedScore = Math.round(100 * jaccard(you.interests, them.interests));
  const charm = Math.round((you.match + them.match) / 2);
  return clamp(Math.round(0.5 * sharedScore + 0.5 * charm), 1, 99);
}

export function isMutualMatch(you: Sparkable, them: Sparkable): boolean {
  return sparkScore(you, them) >= MATCH_THRESHOLD;
}
