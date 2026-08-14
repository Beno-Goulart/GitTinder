import "server-only";
import { cache } from "react";
import { redis } from "./redis";
import { buildProfile } from "./dating/engine";
import { fetchProfile, type GithubError } from "./github/client";
import { signalsFromPayload } from "./github/signals";
import { sampleProfiles } from "./github/samples";
import { DEFAULT_LOCALE } from "./i18n/locale";
import type { Locale } from "./i18n/locale";
import type { DatingProfile } from "./dating/types";

// Read-through Redis cache for built profiles — the single path every surface
// (the /<user> page, the JSON API, the PNG card) uses to turn a username into a
// DatingProfile. A profile is fetched from GitHub + scored at most once per TTL;
// repeat views, link unfurls and README-embed regenerations are then served from
// Redis instead of each spending a handful of GitHub GraphQL calls. Best-effort
// throughout, mirroring lib/analytics + lib/redis: a missing REDIS_URL, a cache
// miss, an outage or a parse error all fall through to a live fetch — the cache
// only ever changes speed, never behaviour. Only successful builds are stored;
// scout errors (notfound / ratelimit / …) propagate unchanged and are never cached.
// Generated copy is locale-aware, so the cache key carries the locale too.

const CACHE_VERSION = "v2";
const CARD_TTL_SECONDS = 120 * 60; // 2h — GitHub stats move slowly; longer TTL = fewer refetches of hot profiles.

const normalizeLogin = (username: string) => username.trim().replace(/^@/, "").toLowerCase();
const keyFor = (login: string, locale: Locale) =>
  `gittinder:profile:${CACHE_VERSION}:${locale}:${login}`;

async function readCache(login: string, locale: Locale): Promise<DatingProfile | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get(keyFor(login, locale));
    return raw ? (JSON.parse(raw) as DatingProfile) : null;
  } catch (e) {
    console.error("[scout] cache read failed:", (e as Error).message);
    return null;
  }
}

async function writeCache(login: string, locale: Locale, profile: DatingProfile): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(keyFor(login, locale), JSON.stringify(profile), "EX", CARD_TTL_SECONDS);
  } catch (e) {
    console.error("[scout] cache write failed:", (e as Error).message);
  }
}

// Single-flight: concurrent scouts of the same login+locale collapse onto one
// in-flight build, so the hot path never duplicates a GitHub fetch.
const inflight = new Map<string, Promise<DatingProfile>>();

async function buildFresh(
  username: string,
  login: string,
  locale: Locale,
): Promise<DatingProfile> {
  const profile = buildProfile(signalsFromPayload(await fetchProfile(username)), { locale });
  await writeCache(login, locale, profile);
  return profile;
}

// Username -> DatingProfile, Redis-cached per locale. Throws the same GithubError
// as fetchProfile when the scout fails, so callers keep mapping it to a 404 page /
// error status / null OG exactly as before.
export async function scoutProfile(
  username: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<DatingProfile> {
  const login = normalizeLogin(username);

  // Tokenless demo: serve the in-memory sample profiles by login so the home-fan
  // samples resolve (and the app stays explorable) without a GitHub token. They
  // already live in memory, so they bypass Redis entirely. Checks both env vars
  // so a pool-only deploy (GITHUB_TOKENS without GITHUB_TOKEN) scouts for real.
  if (!process.env.GITHUB_TOKEN && !process.env.GITHUB_TOKENS) {
    const sample = sampleProfiles(locale).find((p) => p.login.toLowerCase() === login);
    if (sample) return sample;
  }

  const cached = await readCache(login, locale);
  if (cached) return cached;

  // Coalesce concurrent misses for this login+locale onto one build (see `inflight`).
  const inflightKey = `${locale}:${login}`;
  const existing = inflight.get(inflightKey);
  if (existing) return existing;

  const pending = buildFresh(username, login, locale).finally(() => inflight.delete(inflightKey));
  inflight.set(inflightKey, pending);
  return pending;
}

// Request-memoised profile load that returns the scout error instead of throwing,
// so a route's generateMetadata + Page share one scout per request and render the
// failure state themselves.
export const loadProfile = cache(
  async (
    username: string,
    locale: Locale = DEFAULT_LOCALE,
  ): Promise<{ profile: DatingProfile } | { error: GithubError }> => {
    try {
      return { profile: await scoutProfile(username, locale) };
    } catch (e) {
      return { error: e as GithubError };
    }
  },
);
