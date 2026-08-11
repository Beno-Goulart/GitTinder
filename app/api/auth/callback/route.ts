import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { exchangeOauthCode, fetchOauthUser } from "@/lib/github/oauth";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "gt_oauth_state";

const fail = () => redirect("/?auth=error");

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

  if (!code || !state || !expected || state !== expected) return fail();

  try {
    const token = await exchangeOauthCode(code);
    const user = await fetchOauthUser(token);
    return redirect(`/${encodeURIComponent(user.login)}`);
  } catch {
    return fail();
  }
}
