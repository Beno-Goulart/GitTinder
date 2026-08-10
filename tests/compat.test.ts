import { describe, expect, it } from "vitest";
import { buildProfile } from "@/lib/dating/engine";
import {
  COMPAT_TIERS,
  computeChemistry,
  isMutualMatch,
  jaccard,
  MATCH_THRESHOLD,
  sparkScore,
  type Sparkable,
} from "@/lib/dating/compat";
import type { Signals } from "@/lib/dating/types";

// The pair engine is pure — the /vs page and its OG image run the exact same
// numbers, so these tests pin the formula (and its weird edge cases).

const base: Signals = {
  login: "octocat",
  name: "The Octocat",
  avatarUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
  location: "San Francisco",
  followers: 50,
  account_age_years: 3,
  public_repos: 20,
  total_stars_owned: 100,
  max_repo_stars: 40,
  languages: 5,
  rankedLanguages: ["TypeScript", "Go"],
  topLanguage: "TypeScript",
  recent_contributions: 300,
  active_days_recent: 100,
  active_years: 3,
  total_contributions_lifetime: 1500,
  prs_to_others: 5,
  reviews: 3,
  issues_closed: 4,
  recent_commits: 280,
  recent_spike: false,
};

const signals = (over: Partial<Signals> = {}): Signals => ({ ...base, ...over });
const profile = (over: Partial<Signals> = {}) => buildProfile(signals(over));

const legendary: Signals = {
  ...base,
  account_age_years: 14.8,
  active_years: 7,
  total_stars_owned: 250_000,
  max_repo_stars: 240_000,
  followers: 300_000,
  total_contributions_lifetime: 37_000,
  recent_contributions: 3200,
};

describe("jaccard — shared-language overlap", () => {
  it("is 1 for identical lists and 0 for disjoint lists", () => {
    expect(jaccard(["Rust", "Go"], ["Rust", "Go"])).toBe(1);
    expect(jaccard(["Rust", "Go"], ["Python", "Lua"])).toBe(0);
  });

  it("scales with partial overlap and survives empty lists", () => {
    expect(jaccard(["Rust", "Go", "Lua"], ["Rust", "Python"])).toBeCloseTo(0.25);
    expect(jaccard([], [])).toBe(0);
    expect(jaccard(["Rust"], [])).toBe(0);
  });
});

describe("computeChemistry — the pair score", () => {
  it("returns a deterministic integer score clamped to 1–99", () => {
    const a = profile();
    const b = profile({ login: "another" });
    const c1 = computeChemistry(a, b);
    const c2 = computeChemistry(a, b);
    expect(c1.score).toBeGreaterThanOrEqual(1);
    expect(c1.score).toBeLessThanOrEqual(99);
    expect(Number.isInteger(c1.score)).toBe(true);
    expect(c2).toEqual(c1);
  });

  it("scores an identical legendary pair into the top tier", () => {
    const a = buildProfile(legendary);
    const c = computeChemistry(a, { ...a, login: "clone" });
    expect(c.score).toBeGreaterThanOrEqual(90);
    expect(c.tier).toBe("merge");
    expect(c.tierLabel).toBe("MATCH MADE IN MERGE");
    expect(c.sharedLanguages.length).toBeGreaterThan(0);
  });

  it("scores near-zero shared languages when interests are disjoint", () => {
    const a = profile({ rankedLanguages: ["TypeScript", "Go"] });
    const b = profile({ login: "other", rankedLanguages: ["Python", "Rust"] });
    const c = computeChemistry(a, b);
    expect(c.sharedScore).toBe(0);
    expect(c.sharedLanguages).toEqual([]);
  });

  it("stays modest for a quiet, different pair", () => {
    const quiet = signals({ account_age_years: 0.6, followers: 4, total_stars_owned: 2 });
    const c = computeChemistry(buildProfile(quiet), buildProfile({ ...quiet, rankedLanguages: ["Python", "Rust"] }));
    expect(c.score).toBeLessThan(64);
    expect(["nope", "complicated", "coffee"]).toContain(c.tier);
  });

  it("derives the tier from the score via the ordered tier table", () => {
    const a = buildProfile(legendary);
    const c = computeChemistry(a, { ...a, login: "clone" });
    const row = COMPAT_TIERS.find((t) => c.score >= t.min);
    expect(row?.tier).toBe(c.tier);
    expect(row?.accent).toBe(c.accent);
  });

  it("exposes per-partner standout traits and three breakdown notes", () => {
    const a = profile();
    const b = profile({ login: "other" });
    const c = computeChemistry(a, b);
    expect(a.topTrait).toBe(c.leftLead);
    expect(b.topTrait).toBe(c.rightLead);
    expect(c.notes).toHaveLength(3);
    expect(c.verdict.length).toBeGreaterThan(0);
  });

  it("keeps every report component inside 0–100", () => {
    const c = computeChemistry(profile(), profile({ login: "other" }));
    for (const k of ["sharedScore", "similarity", "complementarity", "charm"] as const) {
      expect(c[k]).toBeGreaterThanOrEqual(0);
      expect(c[k]).toBeLessThanOrEqual(100);
    }
  });
});

describe("sparkScore / isMutualMatch — the deck's mutual-swipe logic", () => {
  const you: Sparkable = { login: "you", match: 70, interests: ["TypeScript", "Go", "Rust"] };

  it("returns a deterministic integer clamped to 1–99", () => {
    const them: Sparkable = { login: "them", match: 60, interests: ["TypeScript", "Python"] };
    const s1 = sparkScore(you, them);
    const s2 = sparkScore(you, them);
    expect(Number.isInteger(s1)).toBe(true);
    expect(s1).toBeGreaterThanOrEqual(1);
    expect(s1).toBeLessThanOrEqual(99);
    expect(s2).toBe(s1);
  });

  it("rewards shared languages and combined pull", () => {
    const overlap = sparkScore(you, { login: "a", match: 70, interests: ["TypeScript", "Go"] });
    const disjoint = sparkScore(you, { login: "b", match: 70, interests: ["Python", "Lua"] });
    expect(overlap).toBeGreaterThan(disjoint);
  });

  it("rewards raw charm even with zero shared languages", () => {
    const bothStrong = sparkScore(you, { login: "a", match: 95, interests: ["Python"] });
    const bothWeak = sparkScore(you, { login: "b", match: 10, interests: ["Python"] });
    expect(bothStrong).toBeGreaterThan(bothWeak);
  });

  it("matches on identical profiles but never below the threshold", () => {
    expect(isMutualMatch(you, { ...you, login: "clone" })).toBe(true);
    const lonely: Sparkable = { login: "lonely", match: 10, interests: ["Cobol"] };
    expect(sparkScore(you, lonely)).toBeLessThan(MATCH_THRESHOLD);
    expect(isMutualMatch(you, lonely)).toBe(false);
  });

  it("is symmetric — the spark doesn't care who swiped first", () => {
    const them: Sparkable = { login: "them", match: 60, interests: ["TypeScript"] };
    expect(sparkScore(you, them)).toBe(sparkScore(them, you));
    expect(isMutualMatch(you, them)).toBe(isMutualMatch(them, you));
  });

  it("agrees with the full chemistry on the shared-languages + charm inputs", () => {
    // The deck's lean approximation and the full /vs engine weight the same
    // two components, so a high-spark pair also lands in a friendly tier.
    const a = profile({ rankedLanguages: ["TypeScript", "Go"] });
    const b = profile({ login: "other", rankedLanguages: ["TypeScript", "Rust"] });
    const c = computeChemistry(a, b);
    const s = sparkScore(a, b);
    expect(s).toBeGreaterThanOrEqual(40);
    expect(s).toBeLessThanOrEqual(c.score + 20);
  });
});
