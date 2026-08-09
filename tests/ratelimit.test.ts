import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// These tests pin the pure, request-independent pieces of lib/rateLimit: IP
// extraction and the in-memory fixed window. The Redis path is a thin INCR+EXPIRE
// wrapper, and checkScoutRateLimit itself needs a Next request scope to be worth
// testing, so the window arithmetic is what gets pinned here.

// The module imports "server-only" + next/headers, which vitest can't resolve;
// stub server-only (matching scout.test.ts) and alias the headers import to
// something inert so the module loads.
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

import { ALLOWED_PER_WINDOW, allowFromMemory, clientIp, WINDOW_SECONDS } from "@/lib/rateLimit";

describe("clientIp", () => {
  it("takes the first x-forwarded-for hop", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" });
    expect(clientIp(h)).toBe("203.0.113.9");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    expect(clientIp(new Headers({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
  });

  it("prefers x-forwarded-for over x-real-ip when both are present", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.9", "x-real-ip": "198.51.100.4" });
    expect(clientIp(h)).toBe("203.0.113.9");
  });

  it("falls back to 'unknown' with no proxy headers", () => {
    expect(clientIp(new Headers())).toBe("unknown");
  });
});

describe("allowFromMemory fixed window", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1_700_000_000_000); // fixed epoch — window arithmetic is deterministic
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to the limit, then blocks with a Retry-After", () => {
    for (let i = 0; i < ALLOWED_PER_WINDOW; i++) {
      expect(allowFromMemory("limit-ip")).toEqual({ allowed: true, retryAfterSeconds: 0 });
    }
    const blocked = allowFromMemory("limit-ip");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(WINDOW_SECONDS);
  });

  it("counts IPs independently", () => {
    for (let i = 0; i < ALLOWED_PER_WINDOW; i++) allowFromMemory("a");
    expect(allowFromMemory("a").allowed).toBe(false);
    expect(allowFromMemory("b").allowed).toBe(true);
  });

  it("resets after the window rolls over", () => {
    for (let i = 0; i < ALLOWED_PER_WINDOW; i++) allowFromMemory("reset-ip");
    expect(allowFromMemory("reset-ip").allowed).toBe(false);

    vi.setSystemTime(1_700_000_000_000 + (WINDOW_SECONDS + 1) * 1000);
    expect(allowFromMemory("reset-ip").allowed).toBe(true);
  });
});
