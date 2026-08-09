import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redis } from "./redis";

// Per-IP scout budget protecting the GitHub token pool from scripts / scrapers.
// Applied at the ROUTE layer, BEFORE the cache/fetch, so every scout request —
// cached or not — counts against the window. It is deliberately NOT inside
// lib/scout.ts: tests call scoutProfile directly, outside any request scope.
//
// Limits are per IP, fixed-window (INCR + EXPIRE). Best-effort throughout,
// mirroring lib/redis + lib/analytics: with no Redis, or a Redis hiccup, the
// same window is enforced by an in-memory counter (per instance — enough for
// dev, and a graceful degradation in production). Nothing here ever throws, so
// the limit can't take the service down.

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

export const ALLOWED_PER_WINDOW = 20;
export const WINDOW_SECONDS = 10 * 60;
const KEY_PREFIX = "gittinder:rl:";

// Vercel hands the real client IP in x-forwarded-for (first hop) / x-real-ip;
// anything in front may prepend its own hops, so only the first value is trusted.
export function clientIp(h: Headers): string {
  const fwd = h.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = h.get("x-real-ip");
  if (real) {
    const t = real.trim();
    if (t) return t;
  }
  return "unknown";
}

// In-memory window (one per server instance). Bounded: when it grows past a
// threshold we prune the expired buckets before admitting new ones.
const memory = new Map<string, { count: number; resetAt: number }>();

export function allowFromMemory(ip: string): RateLimitDecision {
  const now = Date.now();
  if (memory.size > 1000) {
    for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
  }
  let rec = memory.get(ip);
  if (!rec || rec.resetAt <= now) {
    rec = { count: 0, resetAt: now + WINDOW_SECONDS * 1000 };
    memory.set(ip, rec);
  }
  rec.count++;
  if (rec.count <= ALLOWED_PER_WINDOW) return { allowed: true, retryAfterSeconds: 0 };
  return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((rec.resetAt - now) / 1000)) };
}

// Fixed-window counter in Redis, shared across instances. Seconds until the next
// bucket is the Retry-After for a blocked IP.
async function allowFromRedis(ip: string): Promise<RateLimitDecision> {
  const nowSec = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(nowSec / WINDOW_SECONDS);
  const key = `${KEY_PREFIX}${ip}:${bucket}`;
  const count = await redis!.incr(key);
  if (count === 1) await redis!.expire(key, WINDOW_SECONDS);
  if (count <= ALLOWED_PER_WINDOW) return { allowed: true, retryAfterSeconds: 0 };
  return { allowed: false, retryAfterSeconds: WINDOW_SECONDS - (nowSec % WINDOW_SECONDS) };
}

// Request-memoised so a page's generateMetadata + render share ONE check (and
// one increment) per request — the same pattern loadProfile uses to share one
// scout. Throws the "ratelimit"-typed error pages already know how to render.
export const RATE_LIMIT_ERROR = {
  type: "ratelimit",
  message: "Too many scouts from this IP. Try again in a few minutes.",
} as const;

export const checkScoutRateLimit = cache(async (): Promise<RateLimitDecision> => {
  let ip = "unknown";
  try {
    ip = clientIp(await headers());
  } catch {
    // Outside a request scope (e.g. a library caller or test harness) — fail open.
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (!redis) return allowFromMemory(ip);
  try {
    return await allowFromRedis(ip);
  } catch {
    return allowFromMemory(ip); // Redis hiccup — keep the limit, per instance.
  }
});
