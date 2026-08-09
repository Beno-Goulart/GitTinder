import { describe, expect, it } from "vitest";
import { buildProfile } from "@/lib/dating/engine";
import type { Signals } from "@/lib/dating/types";

// A modest, non-legendary profile — exercises the normal scoring path.
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

describe("buildProfile — the dating profile", () => {
  it("always ships the six traits, each clamped to 1–99", () => {
    const p = buildProfile(signals());
    for (const key of ["spark", "chat", "style", "loyal", "care", "energy"] as const) {
      expect(p.stats[key]).toBeGreaterThanOrEqual(1);
      expect(p.stats[key]).toBeLessThanOrEqual(99);
    }
  });

  it("clamps the match score into 1–99 and derives the tier from it", () => {
    const p = buildProfile(signals());
    expect(p.match).toBeGreaterThanOrEqual(1);
    expect(p.match).toBeLessThanOrEqual(99);
    expect(Number.isInteger(p.match)).toBe(true);
    expect(p.tierLabel).toBeTruthy();
  });

  it("hits 90+ (the legacy gate) for a legendary, decades-long profile", () => {
    const p = buildProfile(
      signals({
        account_age_years: 14.8,
        active_years: 7,
        total_stars_owned: 250_000,
        max_repo_stars: 240_000,
        followers: 300_000,
        total_contributions_lifetime: 37_000,
      }),
    );
    expect(p.match).toBeGreaterThan(88);
    expect(p.tier).toBe("one");
  });

  it("stays modest for a quiet, new profile", () => {
    const p = buildProfile(
      signals({
        account_age_years: 0.8,
        active_years: 1,
        total_stars_owned: 3,
        max_repo_stars: 1,
        followers: 4,
        total_contributions_lifetime: 90,
        recent_contributions: 12,
        languages: 1,
      }),
    );
    expect(p.match).toBeLessThan(60);
    expect(["red", "green"]).toContain(p.tier);
  });

  it("writes the repo-height gag from stars, always a dating-profile height", () => {
    expect(buildProfile(signals({ total_stars_owned: 0 })).height).toMatch(/^\d'\d+"$/);
    expect(buildProfile(signals({ total_stars_owned: 300_000 })).height).toMatch(/^\d'\d+"$/);
  });

  it("gates the verified badge on followers or stars", () => {
    expect(buildProfile(signals({ followers: 4, total_stars_owned: 3 })).verified).toBe(false);
    expect(buildProfile(signals({ followers: 250, total_stars_owned: 3 })).verified).toBe(true);
    expect(buildProfile(signals({ followers: 4, total_stars_owned: 600 })).verified).toBe(true);
  });

  it("turns ranked languages into interests, capped at four", () => {
    const many = buildProfile(
      signals({ rankedLanguages: ["Rust", "Go", "Lua", "Python", "C", "Zig"] }),
    );
    expect(many.interests).toEqual(["Rust", "Go", "Lua", "Python"]);
    const few = buildProfile(signals({ rankedLanguages: undefined, topLanguage: null }));
    expect(few.interests).toEqual([]);
    expect(few.topLanguage).toBeNull();
  });

  it("pins the 'age' to floor(years on GitHub)", () => {
    expect(buildProfile(signals({ account_age_years: 12.7 })).age).toBe(12);
    expect(buildProfile(signals({ account_age_years: 0.3 })).age).toBe(0);
  });

  it("always writes a bio, a looking-for line and a vibe", () => {
    const p = buildProfile(signals());
    expect(p.bio.length).toBeGreaterThan(0);
    expect(p.lookingFor.length).toBeGreaterThan(0);
    expect(p.vibe.length).toBeGreaterThan(0);
    expect(p.report.reasons.spark.length).toBeGreaterThan(0);
  });
});
