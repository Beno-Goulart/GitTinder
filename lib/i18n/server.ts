import "server-only";
import { cookies, headers } from "next/headers";
import { detectLocale, isLocale, LOCALE_COOKIE } from "./locale";
import type { Locale } from "./locale";

// Server-side locale for the current request: the cookie wins (an explicit
// choice), then Accept-Language as a first-touch default.
export async function getLocale(): Promise<Locale> {
  const cookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;
  return detectLocale((await headers()).get("accept-language"));
}
