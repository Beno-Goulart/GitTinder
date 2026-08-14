import { type GithubError } from "@/lib/github/client";
import { checkScoutRateLimit, RATE_LIMIT_ERROR } from "@/lib/rateLimit";
import { scoutProfile } from "@/lib/scout";
import { detectLocale } from "@/lib/i18n/locale";
import { recordScout } from "@/lib/analytics";
import { after } from "next/server";

// Card JSON is scouted from GitHub (budgeted + rate-limited), so every hit
// that survives the CDN cache is expensive. The profile is baked once and
// stable-ish: short browser max-age, long shared-cache lifetime, and
// stale-while-revalidate so the edge serves instantly while a re-scout runs.
const CACHE_HIT = "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400";
const CACHE_404 = "public, max-age=300, s-maxage=3600";

export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  // Budget check runs before the cache/fetch; a blocked IP gets a 429 + Retry-After
  // instead of spending any GitHub budget.
  const rl = await checkScoutRateLimit();
  if (!rl.allowed) {
    return Response.json(
      { error: RATE_LIMIT_ERROR.message },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSeconds), "Cache-Control": "no-store" },
      },
    );
  }
  // scoutProfile handles the Redis cache and the tokenless sample fallback; here
  // we just record the scout after the response.
  try {
    const profile = await scoutProfile(username, detectLocale(req.headers.get("accept-language")));
    after(() => recordScout());
    return Response.json(profile, { headers: { "Cache-Control": CACHE_HIT } });
  } catch (e) {
    const err = e as GithubError;
    const status =
      err.type === "notfound"
        ? 404
        : err.type === "invalid"
          ? 400
          : err.type === "ratelimit"
            ? 429
            : err.type === "config"
              ? 500
              : 502;
    // 404s are safe to cache hard (a missing user is unlikely to appear in the
    // next hour); everything else stays uncacheable so the error stays fresh.
    const headers =
      status === 404 ? { "Cache-Control": CACHE_404 } : { "Cache-Control": "no-store" };
    return Response.json({ error: err.message ?? "Failed to match that profile." }, { status, headers });
  }
}
