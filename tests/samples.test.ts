import { describe, expect, it } from "vitest";
import { SAMPLE_LOGINS, SAMPLE_PROFILES } from "@/lib/github/samples";

// Locks the showcase invariants: four real accounts, every profile complete and
// in-range, and the fan resolving through the same buildProfile path as live.
describe("showcase samples", () => {
  it("holds exactly the pinned sample logins", () => {
    expect(SAMPLE_LOGINS).toEqual(["torvalds", "ThePrimeagen", "pewdiepie-archdaemon", "t3dotgg"]);
    expect(SAMPLE_PROFILES.map((p) => p.login)).toEqual(SAMPLE_LOGINS);
  });

  it("every sample is a complete, in-range profile", () => {
    for (const p of SAMPLE_PROFILES) {
      expect(p.name).toBeTruthy();
      expect(p.match).toBeGreaterThanOrEqual(1);
      expect(p.match).toBeLessThanOrEqual(99);
      expect(p.tierLabel).toBeTruthy();
      expect(p.bio.length).toBeGreaterThan(0);
      expect(p.lookingFor).toBeTruthy();
      expect(p.vibe).toBeTruthy();
      expect(p.height).toMatch(/^\d'\d+"$/);
      expect(p.stats).toMatchObject({
        spark: expect.any(Number),
        chat: expect.any(Number),
        style: expect.any(Number),
        loyal: expect.any(Number),
        care: expect.any(Number),
        energy: expect.any(Number),
      });
    }
  });

  it("torvalds is the showcase's headline — the legacy 90s gate", () => {
    const torvalds = SAMPLE_PROFILES.find((p) => p.login === "torvalds")!;
    expect(torvalds.match).toBeGreaterThanOrEqual(90);
    expect(torvalds.tier).toBe("one");
    expect(torvalds.topLanguage).toBe("C");
    expect(torvalds.interests).toContain("C");
    expect(torvalds.verified).toBe(true);
  });

  it("a brand-new, low-activity sample reads young — not a lifetime-committed tier", () => {
    const pewdiepie = SAMPLE_PROFILES.find((p) => p.login === "pewdiepie-archdaemon")!;
    expect(pewdiepie.age).toBe(0);
    expect(pewdiepie.tier).not.toBe("one");
    expect(pewdiepie.match).toBeLessThan(SAMPLE_PROFILES.find((p) => p.login === "torvalds")!.match);
  });
});
