import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Pins the token-pool decisions: env parsing (GITHUB_TOKENS over GITHUB_TOKEN),
// deterministic + even hash-sharding, health/bench records from rate-limit
// headers, and failover picking the healthiest non-benched token. All against
// fake tokens and an in-memory Redis — no real credentials anywhere.
vi.mock("server-only", () => ({}));

const store = new Map<string, string>();
vi.mock("@/lib/redis", () => ({
  redis: {
    get: async (k: string) => store.get(k) ?? null,
    set: async (k: string, v: string) => {
      store.set(k, v);
    },
  },
}));

import { benchToken, hashLogin, pickFailover, pickToken, recordTokenHealth, tokenPool } from "@/lib/github/tokens";

const flush = () => new Promise<void>((r) => setTimeout(r, 0)); // settle fire-and-forget writes
const key = (idx: number) => `gittinder:ghtoken:v1:${idx}`;
const nowSec = () => Math.floor(Date.now() / 1000);
const seed = (idx: number, remaining: number, reset: number) =>
  store.set(key(idx), JSON.stringify({ remaining, reset }));

beforeEach(() => {
  store.clear();
  vi.stubEnv("GITHUB_TOKENS", "tokA, tokB,tokC ,tokD");
  vi.stubEnv("GITHUB_TOKEN", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("tokenPool", () => {
  it("parses GITHUB_TOKENS with trimming, indexed in order", () => {
    expect(tokenPool()).toEqual([
      { token: "tokA", idx: 0 },
      { token: "tokB", idx: 1 },
      { token: "tokC", idx: 2 },
      { token: "tokD", idx: 3 },
    ]);
  });

  it("falls back to GITHUB_TOKEN as a pool of one", () => {
    vi.stubEnv("GITHUB_TOKENS", "");
    vi.stubEnv("GITHUB_TOKEN", "solo");
    expect(tokenPool()).toEqual([{ token: "solo", idx: 0 }]);
  });

  it("prefers GITHUB_TOKENS when both are set", () => {
    vi.stubEnv("GITHUB_TOKEN", "solo");
    expect(tokenPool()).toHaveLength(4);
  });

  it("is empty when no token env is set", () => {
    vi.stubEnv("GITHUB_TOKENS", "");
    vi.stubEnv("GITHUB_TOKEN", "");
    expect(tokenPool()).toEqual([]);
  });
});

describe("pickToken (hash-shard)", () => {
  it("is deterministic and case-insensitive", () => {
    expect(pickToken("Torvalds")).toEqual(pickToken("torvalds"));
    expect(pickToken("torvalds")).toEqual(pickToken("torvalds"));
  });

  it("spreads distinct logins across the whole pool", () => {
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < 400; i++) counts[hashLogin(`user-${i}`) % 4]++;
    // Even-ish, not perfect: every token gets a meaningful share (≥10%).
    for (const c of counts) expect(c).toBeGreaterThanOrEqual(40);
  });

  it("returns null on an empty pool", () => {
    expect(pickToken("torvalds", [])).toBeNull();
  });
});

describe("recordTokenHealth / benchToken", () => {
  it("stores remaining/reset parsed from rate-limit headers", async () => {
    const reset = nowSec() + 1800;
    recordTokenHealth(2, new Headers({ "x-ratelimit-remaining": "3210", "x-ratelimit-reset": String(reset) }));
    await flush();
    expect(JSON.parse(store.get(key(2))!)).toEqual({ remaining: 3210, reset });
  });

  it("writes nothing when the headers are absent", async () => {
    recordTokenHealth(2, new Headers());
    await flush();
    expect(store.size).toBe(0);
  });

  it("benches with zero remaining until at least the Retry-After horizon", async () => {
    benchToken(1, new Headers({ "retry-after": "300" }));
    await flush();
    const h = JSON.parse(store.get(key(1))!);
    expect(h.remaining).toBe(0);
    expect(h.reset).toBeGreaterThanOrEqual(nowSec() + 299);
  });

  it("benches with a fallback horizon when no headers are usable", async () => {
    benchToken(1, new Headers());
    await flush();
    const h = JSON.parse(store.get(key(1))!);
    expect(h.remaining).toBe(0);
    expect(h.reset).toBeGreaterThanOrEqual(nowSec() + 119);
  });
});

describe("pickFailover", () => {
  it("never returns the excluded token", async () => {
    for (let exclude = 0; exclude < 4; exclude++) {
      const picked = await pickFailover(exclude);
      expect(picked).not.toBeNull();
      expect(picked!.idx).not.toBe(exclude);
    }
  });

  it("treats unknown health as a fresh token (empty Redis still fails over)", async () => {
    const picked = await pickFailover(0);
    expect(picked).toEqual({ token: "tokB", idx: 1 });
  });

  it("picks the healthiest candidate by remaining quota", async () => {
    const reset = nowSec() + 1800;
    seed(1, 1000, reset);
    seed(2, 3000, reset);
    seed(3, 500, reset);
    expect((await pickFailover(0))!.idx).toBe(2);
  });

  it("skips benched tokens (below headroom, reset still ahead)", async () => {
    const reset = nowSec() + 1800;
    seed(1, 0, reset);
    seed(2, 150, reset); // under the 200-point headroom -> benched
    seed(3, 900, reset);
    expect((await pickFailover(0))!.idx).toBe(3);
  });

  it("treats a benched token whose reset has passed as refilled", async () => {
    seed(1, 0, nowSec() - 10); // window over -> fresh again
    seed(2, 3000, nowSec() + 1800);
    seed(3, 0, nowSec() + 1800);
    expect((await pickFailover(0))!.idx).toBe(1);
  });

  it("returns null when every other token is benched", async () => {
    const reset = nowSec() + 1800;
    seed(1, 0, reset);
    seed(2, 10, reset);
    seed(3, 0, reset);
    expect(await pickFailover(0)).toBeNull();
  });

  it("returns null on a single-token pool", async () => {
    vi.stubEnv("GITHUB_TOKENS", "");
    vi.stubEnv("GITHUB_TOKEN", "solo");
    expect(await pickFailover(0)).toBeNull();
  });
});
