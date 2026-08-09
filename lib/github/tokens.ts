import "server-only";
import { redis } from "../redis";

// GitHub token pool. The GraphQL rate limit (~5,000 points/hr) is per *account*,
// so GITHUB_TOKENS holds tokens from distinct accounts and multiplies the ceiling
// (4 tokens ≈ 20k/hr). Selection is a stateless hash-shard on the login — every
// serverless instance (and every VPS worker) computes the same choice with zero
// coordination, spreads distinct users evenly, and pins a login to one token so
// it composes with the single-flight dedup in lib/scout.
//
// Redis only enters on the *unhappy* path: each GitHub response's rate-limit
// headers are recorded per token (fire-and-forget), and when a scout's assigned
// token gets rate-limited the caller asks pickFailover for the healthiest other
// token. Mirrors lib/scout's stance — Redis is advisory and best-effort, never
// blocking or failing the hot path. No health data just means "assume healthy".

export interface PoolToken {
  token: string;
  idx: number;
}

interface TokenHealth {
  remaining: number; // GraphQL points left this window (from x-ratelimit-remaining)
  reset: number; // unix seconds when the window refills (from x-ratelimit-reset)
}

const HEALTH_VERSION = "v1";
const keyFor = (idx: number) => `gittinder:ghtoken:${HEALTH_VERSION}:${idx}`;
// A window is 65 min at most (60 min + drift); stale health expires into "unknown".
const HEALTH_TTL_SECONDS = 65 * 60;
// Below this many points a token is benched until its reset — enough headroom
// that in-flight scouts (a handful of points each) don't blow through zero.
const BENCH_REMAINING = 200;
// Bench fallback when a limited response carries no usable reset/Retry-After.
const BENCH_FALLBACK_SECONDS = 120;

// GITHUB_TOKENS (comma-separated, distinct accounts) wins; GITHUB_TOKEN alone
// still works as a pool of one, so existing deploys behave exactly as before.
export function tokenPool(): PoolToken[] {
  const multi = process.env.GITHUB_TOKENS;
  if (multi) {
    const tokens = multi
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tokens.length) return tokens.map((token, idx) => ({ token, idx }));
  }
  const single = process.env.GITHUB_TOKEN;
  return single ? [{ token: single, idx: 0 }] : [];
}

// FNV-1a: tiny, stable, well-spread for short strings. Lowercased so the casing
// GitHub ignores can't shard the same user onto different tokens.
export function hashLogin(login: string): number {
  const s = login.toLowerCase();
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function pickToken(login: string, pool = tokenPool()): PoolToken | null {
  if (!pool.length) return null;
  return pool[hashLogin(login) % pool.length];
}

// Record a token's rate-limit headers after a GitHub response. Fire-and-forget:
// never awaited by the caller, never throws — losing a sample is fine, the next
// response rewrites it.
export function recordTokenHealth(idx: number, headers: Headers): void {
  if (!redis) return;
  const remaining = headers.get("x-ratelimit-remaining");
  const reset = headers.get("x-ratelimit-reset");
  if (remaining === null || reset === null) return;
  const health: TokenHealth = { remaining: Number(remaining), reset: Number(reset) };
  if (!Number.isFinite(health.remaining) || !Number.isFinite(health.reset)) return;
  redis
    .set(keyFor(idx), JSON.stringify(health), "EX", HEALTH_TTL_SECONDS)
    .catch((e) => console.error("[tokens] health write failed:", (e as Error).message));
}

// Force-bench a token that just got rate-limited (403/429), until the later of
// its window reset and any Retry-After (secondary/abuse limits send Retry-After
// while the hourly window still has points). Fire-and-forget like recordTokenHealth.
export function benchToken(idx: number, headers: Headers): void {
  if (!redis) return;
  const nowSec = Math.floor(Date.now() / 1000);
  const retryAfter = Number(headers.get("retry-after") ?? NaN);
  const reset = Number(headers.get("x-ratelimit-reset") ?? NaN);
  const until = Math.max(
    Number.isFinite(retryAfter) ? nowSec + retryAfter : 0,
    Number.isFinite(reset) ? reset : 0,
    nowSec + BENCH_FALLBACK_SECONDS,
  );
  redis
    .set(keyFor(idx), JSON.stringify({ remaining: 0, reset: until } satisfies TokenHealth), "EX", HEALTH_TTL_SECONDS)
    .catch((e) => console.error("[tokens] bench write failed:", (e as Error).message));
}

// The healthiest token that isn't `excludeIdx`: highest known remaining, with
// unknown/expired health treated as a fresh window (full quota). Benched tokens
// (below the headroom threshold, reset still ahead) are skipped; if every other
// token is benched, returns null and the caller propagates the rate-limit error.
// Redis being down/unreadable degrades to "first other token" rather than failing.
export async function pickFailover(excludeIdx: number, pool = tokenPool()): Promise<PoolToken | null> {
  const candidates = pool.filter((t) => t.idx !== excludeIdx);
  if (!candidates.length) return null;
  const client = redis; // narrow once for the closures below
  if (!client) return candidates[0];
  try {
    const raws = await Promise.all(candidates.map((t) => client.get(keyFor(t.idx))));
    const nowSec = Math.floor(Date.now() / 1000);
    let best: PoolToken | null = null;
    let bestRemaining = -1;
    for (let i = 0; i < candidates.length; i++) {
      let remaining = Infinity; // no data → assume healthy
      if (raws[i]) {
        const h = JSON.parse(raws[i] as string) as TokenHealth;
        remaining = nowSec >= h.reset ? Infinity : h.remaining; // past reset → refilled
      }
      if (remaining < BENCH_REMAINING) continue; // benched
      if (remaining > bestRemaining) {
        best = candidates[i];
        bestRemaining = remaining;
      }
    }
    return best;
  } catch (e) {
    console.error("[tokens] failover read failed:", (e as Error).message);
    return candidates[0];
  }
}
