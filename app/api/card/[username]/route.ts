import { type GithubError } from "@/lib/github/client";
import { checkScoutRateLimit, RATE_LIMIT_ERROR } from "@/lib/rateLimit";
import { scoutProfile } from "@/lib/scout";
import { recordScout } from "@/lib/analytics";
import { after } from "next/server";

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
    const profile = await scoutProfile(username);
    after(() => recordScout());
    return Response.json(profile);
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
    return Response.json({ error: err.message ?? "Failed to match that profile." }, { status });
  }
}
