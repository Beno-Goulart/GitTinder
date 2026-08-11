import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { appBaseUrl, oauthAuthorizeUrl, oauthConfig } from "@/lib/github/oauth";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "gt_oauth_state";

// Start the OAuth dance: set a CSRF `state` cookie, then bounce to GitHub.
// Unconfigured deploys never render the login button, but the route still
// guards itself in case someone hits the URL directly.
export async function GET() {
  if (!oauthConfig()) return redirect("/");
  const state = randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: appBaseUrl().startsWith("https://"),
    path: "/",
    maxAge: 10 * 60,
  });
  return redirect(oauthAuthorizeUrl(state));
}
