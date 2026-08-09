import {
  CORE_TRAITS,
  HEIGHT,
  K,
  MATCH_WEIGHTS,
  TIER_ACCENT,
  TRAIT_DESCRIPTIONS,
  TRAITS,
  VERIFIED,
  tierFor,
} from "./constants";
import { buildBio, buildTags, lookingFor, onlineState } from "./bio";
import type { DatingProfile, Metric, Signals, Tier, TraitKey, TraitShape, Traits, Vibe } from "./types";

const Lg = (x: number) => Math.log10(Math.max(0, x) + 1);
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
const vals = (t: TraitShape) => TRAITS.map((k) => t[k]);

// --- §2 — raw trait estimates, tuned so the six land on a comparable scale ---
function rawTraits(s: Signals): Traits {
  const o: Traits = {
    spark: 36 + 13 * Lg(s.total_stars_owned) + 5 * Lg(s.max_repo_stars),
    chat: 40 + 12 * Lg(s.prs_to_others) + 9 * Lg(s.followers),
    // STYLE = genuine range, square-root scaled so breadth has diminishing
    // returns: ~65 at one language, ~80 at ten, ~85 at fifteen.
    style: 58 + 7 * Math.sqrt(s.languages),
    care: 40 + 14 * Lg(s.reviews + s.issues_closed),
    loyal: 40 + 9 * Lg(s.total_contributions_lifetime) + 2.2 * Math.min(s.active_years, 12),
    energy: 36 + 12 * Lg(s.recent_contributions),
  };
  for (const k of TRAITS) o[k] = clamp(Math.round(o[k]), 1, 99);
  return o;
}

// --- §3.1 — magnitude → the gravity-well center the traits sit around --------
function center(s: Signals): number {
  const { w1, w2, w3, w4, b, lo, hi } = K.magnitude;
  const M = sigmoid(
    w1 * Lg(s.total_stars_owned) +
      w2 * Lg(s.followers) +
      w3 * Lg(s.total_contributions_lifetime) +
      w4 * s.account_age_years +
      b,
  );
  return lerp(lo, hi, M);
}

// --- §3.2 — z-score of their own six ------------------------------------------
function zscore(raw: Traits): TraitShape {
  const v = vals(raw);
  const m = mean(v);
  const sd = Math.sqrt(mean(v.map((x) => (x - m) ** 2))) || 1;
  const p = {} as TraitShape;
  TRAITS.forEach((k, i) => (p[k] = (v[i] - m) / sd));
  return p;
}

// --- §3.3 — penalise antagonist pairs so nobody is elite at everything -------
function applyTension(p: TraitShape): TraitShape {
  const out = { ...p };
  for (const [a, b] of K.tension.pairs) {
    const overlap = Math.max(0, Math.min(out[a], out[b]));
    const weaker = out[a] <= out[b] ? a : b;
    out[weaker] -= K.tension.alpha * overlap;
  }
  return out;
}

// --- §3.4 — spike around center; specialists get spikier profiles -------------
function spike(p: TraitShape, c: number): Traits {
  const v = vals(p);
  const lop = clamp((Math.max(...v) - Math.min(...v)) / 4, 0, 1);
  const spread = K.spike.base * (1 + lop);
  const m = mean(v);
  const raw = {} as Traits;
  TRAITS.forEach((k) => (raw[k] = c + spread * (p[k] - m)));
  // §3.5 — the attractive core shares sub-skills: pull them toward their own
  // group mean (preserving order), so the six read as a coherent character.
  const am = mean(CORE_TRAITS.map((k) => raw[k]));
  for (const k of CORE_TRAITS) raw[k] = am + K.spike.cohesion * (raw[k] - am);
  const traits = {} as Traits;
  TRAITS.forEach((k) => (traits[k] = clamp(Math.round(raw[k]), 1, 99)));
  return traits;
}

// --- §4 — the 88→99 range is bought with years and sustained influence -------
function legacyScore(s: Signals): number {
  const { a, b, c, d, e, f, activeCap } = K.legacy;
  const z =
    a * Math.log(s.account_age_years + 1) +
    b * Math.min(s.active_years, activeCap) +
    c * Lg(s.followers) +
    d * Lg(s.total_stars_owned) +
    e * Lg(s.max_repo_stars) -
    f;
  return sigmoid(z);
}

// The vibe ("archetype") is read from the trait shape: a star spike scouts an
// influencer, a review-heavy lean a reviewer; a strong, balanced shape scouts
// "the catch".
const VIBES: Record<Vibe, { name: string; blurb: (s: Signals) => string }> = {
  influencer: {
    name: "The Influencer",
    blurb: () => "Star power off the charts. Everyone swipes right on a repo with a blue checkmark.",
  },
  butterfly: {
    name: "The Social Butterfly",
    blurb: (s) =>
      `A network machine — ${s.prs_to_others} PRs and ${s.reviews} reviews this year, always in the thread.`,
  },
  polyglot: {
    name: "The Polyglot",
    blurb: (s) => `Speaks ${s.languages} languages and will absolutely notice your missing semicolon.`,
  },
  longhauler: {
    name: "The Long-Hauler",
    blurb: (s) => `${s.active_years} years in and still shipping. Built to last — emotionally available by commit.`,
  },
  reviewer: {
    name: "The Reviewer",
    blurb: (s) => `Leaves thoughtful reviews and kind comments. A gentleman (of the codebase), ${s.reviews} this year.`,
  },
  warrior: {
    name: "The Weekend Warrior",
    blurb: (s) => `Always up for something — especially something at 2am. ${s.active_days_recent} days online this year.`,
  },
  catch: {
    name: "The Catch",
    blurb: () => "Balanced, committed, and almost too good to be true. It's just the algorithm.",
  },
};

// Each trait's archetype read — the top trait names the vibe, unless the shape
// is strong and balanced (then it's simply "the catch").
const TRAIT_VIBE: Record<TraitKey, Vibe> = {
  spark: "influencer",
  chat: "butterfly",
  style: "polyglot",
  loyal: "longhauler",
  care: "reviewer",
  energy: "warrior",
};

function vibeFromShape(st: Traits): Vibe {
  const top = [...TRAITS].sort((a, b) => st[b] - st[a]);
  const peak = st[top[0]];
  const second = st[top[1]];
  if (peak - second < 6 && peak >= 70) return "catch";
  return TRAIT_VIBE[top[0]];
}

// Real numbers as a 0-99 score — log10 so every power of ten reads as a step up.
function metricScore(value: number): number {
  return clamp(Math.round(30 * Math.log10(value + 1)), 0, 99);
}

function buildMetrics(s: Signals): Metric[] {
  const m = (
    label: string,
    value: number,
    unit?: string,
  ): Metric => ({
    label,
    value,
    unit,
    score: metricScore(value),
  });
  return [
    m("Followers", s.followers),
    m("Stars", s.total_stars_owned, "stars"),
    m("Commits this year", s.recent_commits, "commits"),
    m("Pull requests", s.prs_to_others, "PRs"),
    m("Reviews", s.reviews),
    m("Languages", s.languages),
  ];
}

export function buildProfile(s: Signals, now = Date.now()): DatingProfile {
  const traits = spike(applyTension(zscore(rawTraits(s))), center(s));
  const base = TRAITS.reduce((sum, k) => sum + traits[k] * MATCH_WEIGHTS[k], 0);
  const L = legacyScore(s);
  const match = clamp(Math.round(base + K.legacy.bonusMax * L), 1, 99);
  const { tier, label } = tierFor(match);

  const { bio } = buildBio(s);
  const tags = buildTags(s);
  const topTrait = [...TRAITS].sort((a, b) => traits[b] - traits[a])[0];
  const vibe = vibeFromShape(traits);
  const age = Math.max(0, Math.floor(s.account_age_years));
  const inches = HEIGHT.floor + Math.round(HEIGHT.range * (1 - Math.exp(-s.total_stars_owned / HEIGHT.scale)));
  const height = `${Math.floor(inches / 12)}'${inches % 12}"`;
  const interests = (s.rankedLanguages ?? []).slice(0, 4);

  return {
    login: s.login,
    name: s.name,
    avatarUrl: s.avatarUrl,
    location: s.location,
    since: now >= 0 ? new Date(now).getUTCFullYear() - age : 2008,
    age,
    height,
    repos: s.public_repos,
    match,
    tier,
    tierLabel: label,
    vibe: VIBES[vibe].name,
    vibeBlurb: VIBES[vibe].blurb(s),
    bio,
    lookingFor: lookingFor(s, topTrait),
    tags,
    stats: traits,
    topTrait,
    interests,
    topLanguage: s.topLanguage ?? interests[0] ?? null,
    online: onlineState(s),
    verified: s.followers >= VERIFIED.minFollowers || s.total_stars_owned >= VERIFIED.minStars,
    metrics: buildMetrics(s),
    ...(s.years ? { years: s.years } : null),
    report: { reasons: TRAIT_DESCRIPTIONS },
  };
}

// Accent colour helper — the single source the UI and card share.
export function tierAccent(tier: Tier): string {
  return TIER_ACCENT[tier];
}
