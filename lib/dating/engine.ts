import {
  CORE_TRAITS,
  HEIGHT,
  K,
  MATCH_WEIGHTS,
  TIER_ACCENT,
  TRAITS,
  VERIFIED,
  tierFor,
} from "./constants";
import { buildBio, buildTags, lookingFor, onlineState, profileSeed } from "./bio";
import { dicts, fmt } from "@/lib/i18n/dicts";
import type { Dictionary } from "@/lib/i18n/dicts";
import type { Locale } from "@/lib/i18n/locale";
import type { DatingProfile, Metric, Signals, Tier, TraitKey, TraitShape, Traits, Vibe } from "./types";

const Lg = (x: number) => Math.log10(Math.max(0, x) + 1);
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
const vals = (t: TraitShape) => TRAITS.map((k) => t[k]);
const oneOf = (seed: number, salt: number, variants: string[]): string =>
  variants[(seed + salt) % variants.length];

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
// "the catch". Each archetype has a few phrasings picked from the profile seed,
// so the same account always reads the same blurb. All wording comes from the
// locale dictionary (tokens interpolated before the seed-pick, so each phrasing
// stays complete in the viewer's language).
const VIBES = (dict: Dictionary): Record<Vibe, { name: string; blurb: (s: Signals) => string }> => {
  const v = dict.copy.vibes;
  return {
    influencer: {
      name: v.influencer.name,
      blurb: (s) => oneOf(profileSeed(s.login), 20, v.influencer.blurbs),
    },
    butterfly: {
      name: v.butterfly.name,
      blurb: (s) =>
        oneOf(profileSeed(s.login), 21, v.butterfly.blurbs.map((b) => fmt(b, { prs: s.prs_to_others, reviews: s.reviews }))),
    },
    polyglot: {
      name: v.polyglot.name,
      blurb: (s) =>
        oneOf(profileSeed(s.login), 22, v.polyglot.blurbs.map((b) => fmt(b, { languages: s.languages }))),
    },
    longhauler: {
      name: v.longhauler.name,
      blurb: (s) =>
        oneOf(profileSeed(s.login), 23, v.longhauler.blurbs.map((b) => fmt(b, { years: s.active_years }))),
    },
    reviewer: {
      name: v.reviewer.name,
      blurb: (s) =>
        oneOf(profileSeed(s.login), 24, v.reviewer.blurbs.map((b) => fmt(b, { reviews: s.reviews }))),
    },
    warrior: {
      name: v.warrior.name,
      blurb: (s) =>
        oneOf(profileSeed(s.login), 25, v.warrior.blurbs.map((b) => fmt(b, { days: s.active_days_recent }))),
    },
    catch: {
      name: v.catch.name,
      blurb: () => oneOf(profileSeed("__catch__"), 26, v.catch.blurbs),
    },
  };
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

function buildMetrics(s: Signals, dict: Dictionary): Metric[] {
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
  const units = dict.copy.metrics.units;
  return [
    m(dict.copy.metrics.followers, s.followers),
    m(dict.copy.metrics.stars, s.total_stars_owned, units.stars),
    m(dict.copy.metrics.commitsThisYear, s.recent_commits, units.commits),
    m(dict.copy.metrics.pullRequests, s.prs_to_others, units.prs),
    m(dict.copy.metrics.reviews, s.reviews),
    m(dict.copy.metrics.languages, s.languages),
  ];
}

// One trait's plain-English report reason, per locale (report tooltips).
const traitReasons = (dict: Dictionary) =>
  TRAITS.reduce(
    (acc, k) => {
      acc[k] = dict.traits[k].desc;
      return acc;
    },
    {} as Record<TraitKey, string>,
  );

export function buildProfile(
  s: Signals,
  opts: { now?: number; locale?: Locale } = {},
): DatingProfile {
  const locale = opts.locale ?? "en";
  const now = opts.now ?? Date.now();
  const dict = dicts[locale];
  const traits = spike(applyTension(zscore(rawTraits(s))), center(s));
  const base = TRAITS.reduce((sum, k) => sum + traits[k] * MATCH_WEIGHTS[k], 0);
  const L = legacyScore(s);
  const match = clamp(Math.round(base + K.legacy.bonusMax * L), 1, 99);
  const { tier } = tierFor(match);
  const vibes = VIBES(dict);

  const { bio } = buildBio(s, locale);
  const tags = buildTags(s, locale);
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
    tierLabel: dict.tiers[tier],
    vibe: vibes[vibe].name,
    vibeBlurb: vibes[vibe].blurb(s),
    bio,
    lookingFor: lookingFor(s, topTrait, locale),
    tags,
    stats: traits,
    topTrait,
    interests,
    topLanguage: s.topLanguage ?? interests[0] ?? null,
    online: onlineState(s),
    verified: s.followers >= VERIFIED.minFollowers || s.total_stars_owned >= VERIFIED.minStars,
    metrics: buildMetrics(s, dict),
    ...(s.years ? { years: s.years } : null),
    report: { reasons: traitReasons(dict) },
  };
}

// Accent colour helper — the single source the UI and card share.
export function tierAccent(tier: Tier): string {
  return TIER_ACCENT[tier];
}
