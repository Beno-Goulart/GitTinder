import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  exchangeOauthCode,
  fetchOauthUser,
  type OAuthUser,
} from "@/lib/github/oauth";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "gt_oauth_state";

const fail = (reason: string) => redirect(`/?auth=error&reason=${reason}`);

// GitHub bounces back here with ?code + ?state. Validate the state cookie
// (CSRF), swap the code for a token, read the user's login, and land straight
// on their card — the scout runs on the /<login> page.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const jar = await cookies();
  const expected = jar.get(STATE_COOKIE)?.value;
  jar.delete(STATE_COOKIE);

  if (!code || !state || !expected || state !== expected) {
    console.error(
      `[oauth-callback] state mismatch: got=${state ?? "null"} expected=${expected ? "set" : "missing"}`,
    );
    return fail("state");
  }

  let token: string;
  try {
    token = await exchangeOauthCode(code);
  } catch (err) {
    console.error("[oauth-callback] code exchange failed:", err);
    return fail("exchange");
  }

  let user: OAuthUser;
  try {
    user = await fetchOauthUser(token);
  } catch (err) {
    console.error("[oauth-callback] fetch user failed:", err);
    const status = String((err as Error).message).match(/HTTP (\d+)/)?.[1];
    return fail(status ? `user-${status}` : "user");
  }

  // redirect() throws NEXT_REDIRECT by design — it MUST stay outside any
  // try/catch, or a successful login gets misreported as a failure.
  return redirect(`/${encodeURIComponent(user.login)}`);
}
