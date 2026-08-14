import { after } from "next/server";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Background from "@/components/Background";
import { type GithubError } from "@/lib/github/client";
import { checkScoutRateLimit, RATE_LIMIT_ERROR } from "@/lib/rateLimit";
import { loadProfile } from "@/lib/scout";
import { recordScout } from "@/lib/analytics";
import { dicts, fmt } from "@/lib/i18n/dicts";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/locale";
import type { DatingProfile } from "@/lib/dating/types";
import ProfileRoute from "./ProfileRoute";

export const dynamic = "force-dynamic"; // per-user, token-gated, always fresh

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const meta = dicts[await getLocale()].meta;
  // Budget check runs before the scout; memoised per request, so the Page below
  // shares this single check (and increment) instead of double-counting.
  if (!(await checkScoutRateLimit()).allowed) {
    return { title: fmt(meta.profileShortTitle, { login: username }), robots: { index: false } };
  }
  const res = await loadProfile(username, await getLocale());
  if ("profile" in res) {
    const p = res.profile;
    return {
      title: fmt(meta.profileTitle, { name: p.name || p.login, age: p.age, match: p.match }),
      description: fmt(meta.profileDescription, {
        name: p.name || p.login,
        match: p.match,
        tier: p.tierLabel,
        vibe: p.vibe,
      }),
      alternates: { canonical: `/${p.login}` },
      twitter: { card: "summary_large_image" },
      // og:image comes from the file-convention opengraph-image.tsx — the portrait
      // card, identical to the /<login>.png embed (SHARE THE CARD).
    };
  }
  // Not a real profile — keep these soft-404s out of the index.
  return { title: fmt(meta.profileShortTitle, { login: username }), robots: { index: false } };
}

function NotScouted({ username, error, locale }: { username: string; error: GithubError; locale: Locale }) {
  const rateLimited = error.type === "ratelimit";
  const noSuchUser = error.type === "notfound" || error.type === "invalid";
  const ui = dicts[locale].ui;
  const heading = rateLimited ? ui.tooManySwipes : noSuchUser ? ui.noProfileFound : ui.matchingInterrupted;
  const message = rateLimited
    ? fmt(ui.rateLimitMessage, { username })
    : error.type === "notfound"
      ? fmt(ui.noUserMessage, { username })
      : error.type === "invalid"
        ? fmt(ui.invalidUserMessage, { username })
        : error.message;
  return (
    <main className="relative z-[2] mx-auto flex min-h-screen max-w-[560px] flex-col items-center justify-center px-6 text-center">
      <Image
        src="/logo.png"
        alt="GitTinder"
        width={1162}
        height={1354}
        priority
        className="h-11 w-auto"
      />
      <h1 className="font-display mt-3 text-[clamp(30px,6vw,48px)] font-black leading-[.95]">{heading}</h1>
      <p className="mt-3 text-[15.5px] leading-[1.5] text-ink-soft">{message}</p>
      <Link
        href="/"
        className="font-display gt-flame mt-7 inline-flex h-[46px] items-center rounded-xl px-6 text-[16px] tracking-[.06em] text-white"
      >
        {ui.matchSomeoneElse}
      </Link>
    </main>
  );
}

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const locale = await getLocale();
  if (!(await checkScoutRateLimit()).allowed) {
    return (
      <div className="relative min-h-screen overflow-x-hidden text-ink">
        <Background />
        <NotScouted username={username} error={RATE_LIMIT_ERROR} locale={locale} />
      </div>
    );
  }
  const res = await loadProfile(username, locale);
  if ("profile" in res) {
    const profile = res.profile as DatingProfile;
    after(() => recordScout()); // analytics, flushed after the response (serverless-safe)
    return (
      <div className="relative min-h-screen overflow-x-hidden text-ink">
        <Background />
        <ProfileRoute profile={profile} />
      </div>
    );
  }
  return (
    <div className="relative min-h-screen overflow-x-hidden text-ink">
      <Background />
      <NotScouted username={username} error={(res as { error: GithubError }).error} locale={locale} />
    </div>
  );
}
