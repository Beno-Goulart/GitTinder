import { after } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import Background from "@/components/Background";
import { type GithubError } from "@/lib/github/client";
import { loadProfile } from "@/lib/scout";
import { recordScout } from "@/lib/analytics";
import type { DatingProfile } from "@/lib/dating/types";
import ProfileRoute from "./ProfileRoute";

export const dynamic = "force-dynamic"; // per-user, token-gated, always fresh

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const res = await loadProfile(username);
  if ("profile" in res) {
    return {
      title: `${res.profile.name || res.profile.login}, ${res.profile.age} — ${res.profile.match}% match · GitTinder`,
      description: `${res.profile.name || res.profile.login} on GitTinder: ${res.profile.match}% match, ${res.profile.tierLabel}, ${res.profile.vibe}.`,
      alternates: { canonical: `/${res.profile.login}` },
      twitter: { card: "summary_large_image" },
      // og:image comes from the file-convention opengraph-image.tsx — the portrait
      // card, identical to the /<login>.png embed (SHARE THE CARD).
    };
  }
  // Not a real profile — keep these soft-404s out of the index.
  return { title: `@${username} · GitTinder`, robots: { index: false } };
}

function NotScouted({ username, error }: { username: string; error: GithubError }) {
  const rateLimited = error.type === "ratelimit";
  const noSuchUser = error.type === "notfound" || error.type === "invalid";
  const heading = rateLimited ? "Too many right swipes" : noSuchUser ? "No profile found" : "Matching interrupted";
  const message = rateLimited
    ? `The algorithm's on a coffee date — GitHub just rate-limited us. Give it a couple minutes, then try @${username} again.`
    : error.type === "notfound"
      ? `There's no GitHub user named @${username}.`
      : error.type === "invalid"
        ? `“${username}” isn't a valid GitHub username.`
        : error.message;
  return (
    <main className="relative z-[2] mx-auto flex min-h-screen max-w-[560px] flex-col items-center justify-center px-6 text-center">
      <div className="font-display text-[12px] font-bold tracking-[.3em] text-brand">GITTINDER</div>
      <h1 className="font-display mt-3 text-[clamp(30px,6vw,48px)] font-black leading-[.95]">{heading}</h1>
      <p className="mt-3 text-[15.5px] leading-[1.5] text-ink-soft">{message}</p>
      <Link
        href="/"
        className="font-display gt-flame mt-7 inline-flex h-[46px] items-center rounded-xl px-6 text-[16px] tracking-[.06em] text-white"
      >
        MATCH SOMEONE ELSE
      </Link>
    </main>
  );
}

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const res = await loadProfile(username);
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
      <NotScouted username={username} error={(res as { error: GithubError }).error} />
    </div>
  );
}
