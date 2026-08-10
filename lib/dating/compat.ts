import { TRAITS, TRAIT_LABELS } from "./constants";
import type { CompatTier, DatingProfile, TraitKey } from "./types";

// Pair chemistry — "are these two profiles a match?" The six-traits radar, the
// shared languages and each profile's standalone match score combine into one
// 0–99 chemistry score with its own tier ("match made in merge" → "swipe left").
// Pure and framework-agnostic so the same numbers drive the /vs page, its OG
// image and the unit tests.

export const COMPAT_TIERS: {
  min: number;
  tier: CompatTier;
  label: string;
  accent: string;
  verdict: string;
}[] = [
  {
    min: 90,
    tier: "merge",
    label: "MATCH MADE IN MERGE",
    accent: "#d4932e",
    verdict: "Merge the branches and rewrite the README — this one ships.",
  },
  {
    min: 78,
    tier: "sparks",
    label: "SPARKS FLYING",
    accent: "#ff4655",
    verdict: "Definite chemistry. Expect a pull request before the check clears.",
  },
  {
    min: 64,
    tier: "vibes",
    label: "GOOD VIBES",
    accent: "#25a86f",
    verdict: "Good energy and good signal — worth a coffee date and a pair commit.",
  },
  {
    min: 48,
    tier: "coffee",
    label: "COFFEE DATE",
    accent: "#e8922a",
    verdict: "A maybe. Low-stakes merge to test the waters.",
  },
  {
    min: 34,
    tier: "complicated",
    label: "IT'S COMPLICATED",
    accent: "#e24f93",
    verdict: "Conflicting dependencies — resolving this could take a while.",
  },
  {
    min: 0,
    tier: "nope",
    label: "SWIPE LEFT",
    accent: "#e5484d",
    verdict: "Rebase or reset — the branches just don't agree.",
  },
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

export function computeChemistry(a: DatingProfile, b: DatingProfile): Chemistry {
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

  const leftLead = topTrait(a);
  const rightLead = topTrait(b);

  const langLine = sharedLanguages.length
    ? `Both speak ${sharedLanguages.join(" & ")}${sharedLanguages.length > 1 ? " — a shared mother tongue." : "."}`
    : "No languages in common — opposites attract (or don't).";

  const compLine =
    leftLead === rightLead
      ? `@${a.login} and @${b.login} both lead on ${TRAIT_LABELS[leftLead]} — same lane, could be a race or a relay.`
      : `@${a.login} leads on ${TRAIT_LABELS[leftLead]}, @${b.login} on ${TRAIT_LABELS[rightLead]} — different corners of the radar.`;

  const charmLine = `On paper: ${charm}% average match (${a.match}% × ${b.match}%).`;

  return {
    score,
    tier: tier.tier,
    tierLabel: tier.label,
    accent: tier.accent,
    verdict: tier.verdict,
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
