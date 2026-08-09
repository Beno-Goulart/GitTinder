import { type GithubError } from "@/lib/github/client";
import { scoutProfile } from "@/lib/scout";
import { recordScout } from "@/lib/analytics";
import { after } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
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
