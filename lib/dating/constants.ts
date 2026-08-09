import type { Tier, TraitKey, Traits } from "./types";

export const TRAITS: TraitKey[] = ["spark", "chat", "style", "loyal", "care", "energy"];

// Canonical trait → display abbreviation (single source for any surface that
// labels the six, like the radar).
export const TRAIT_LABELS: Record<TraitKey, string> = {
  spark: "SPARK",
  chat: "CHAT",
  style: "STYLE",
  loyal: "LOYAL",
  care: "CARE",
  energy: "ENERGY",
};

// One-line plain-English explanation per trait, used in report tooltips and the
// "what the six mean" explainer.
export const TRAIT_DESCRIPTIONS: Record<TraitKey, string> = {
  spark: "Instant chemistry — star power across your repos",
  chat: "Conversation game — PRs opened and followers earned",
  style: "Fashion sense — how many stacks you switch up",
  loyal: "Loyalty — years of consistent contributions",
  care: "Care — reviews and issues you actually tend to",
  energy: "Energy — recent activity and staying power",
};

// The "attractive core": the four social/technical traits that share sub-skills
// (a polyglot is usually also chatty, etc.), pulled toward their own group mean
// after the spike. LOYAL/CARE stay free — the archetype explains those.
export const CORE_TRAITS: TraitKey[] = ["spark", "chat", "style", "energy"];

// Scoring constants — tuned so the six land on a comparable scale, and the
// match score caps at 88 (the 90s are a legacy gate earned with years).
export const K = {
  magnitude: { w1: 0.5, w2: 0.4, w3: 0.5, w4: 0.08, b: -2.8, lo: 48, hi: 82 },
  tension: {
    alpha: 0.7,
    pairs: [
      ["spark", "loyal"],
      ["style", "care"],
      ["energy", "loyal"],
    ] as [TraitKey, TraitKey][],
  },
  spike: { base: 8, cohesion: 0.6 },
  legacy: { a: 1.0, b: 0.7, c: 0.3, d: 0.3, e: 0.3, f: 6.0, activeCap: 15, bonusMax: 11 },
  matchCap: 88,
};

// Fixed weights for the headline match score — the social/visual traits carry
// the profile, exactly as a dating app would weight a first impression.
export const MATCH_WEIGHTS: Traits = {
  spark: 0.25,
  chat: 0.2,
  style: 0.15,
  energy: 0.2,
  care: 0.1,
  loyal: 0.1,
};

// Match score → tier. Ordered by minimum score.
export const TIERS: { min: number; tier: Tier; label: string }[] = [
  { min: 0, tier: "red", label: "RED FLAG" },
  { min: 50, tier: "green", label: "GREEN FLAG" },
  { min: 60, tier: "keeper", label: "KEEPER" },
  { min: 70, tier: "catch", label: "A CATCH" },
  { min: 80, tier: "turner", label: "HEAD-TURNER" },
  { min: 90, tier: "one", label: "THE ONE" },
];

export function tierFor(match: number): { tier: Tier; label: string } {
  let out = TIERS[0];
  for (const t of TIERS) if (match >= t.min) out = t;
  return { tier: out.tier, label: out.label };
}

// Accent colour per tier — drives the card's tier pill, glow, radar and the
// whole report tint. Vibrant, Tinder-flavoured.
export const TIER_ACCENT: Record<Tier, string> = {
  red: "#fb5c66",
  green: "#34d87b",
  keeper: "#ffb02e",
  catch: "#ff6fb2",
  turner: "#ff3d7f",
  one: "#ffd166",
};

// The "repo height" gag: total stars (log-scaled) mapped onto a dating-profile
// height. 5'8" floor, 6'7" ceiling. A quiet profile is still average; a
// heavily-starred one is "6'2\" in repos".
export const HEIGHT = { floor: 68, range: 11, scale: 30000 };

// Verified badge: enough followers or stars to look legit on a dating app.
export const VERIFIED = { minFollowers: 100, minStars: 500 };

// How many interests (languages) show on the card.
export const CARD_INTERESTS = 3;
