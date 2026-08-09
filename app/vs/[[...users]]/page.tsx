import type { Metadata } from "next";
import Link from "next/link";
import Background from "@/components/Background";
import CompatPicker from "@/components/CompatPicker";
import CompatView from "@/components/CompatView";
import { computeChemistry } from "@/lib/dating/compat";
import { type GithubError } from "@/lib/github/client";
import { loadProfile } from "@/lib/scout";
import type { DatingProfile } from "@/lib/dating/types";

export const dynamic = "force-dynamic"; // pair reports are live scouts, never cached

const normalize = (u: string) => u.trim().replace(/^@/, "");

export async function generateMetadata({ params }: { params: Promise<{ users?: string[] }> }): Promise<Metadata> {
  const users = ((await params).users ?? []).filter(Boolean).map(normalize).slice(0, 2);
  if (users.length === 2) {
    return {
      title: `@${users[0]} × @${users[1]} — chemistry · GitTinder`,
      description: `Are @${users[0]} and @${users[1]} a match? Check their GitTinder chemistry.`,
      alternates: { canonical: `/vs/${users[0]}/${users[1]}` },
      twitter: { card: "summary_large_image" },
    };
  }
  return { title: "Test compatibility · GitTinder", robots: { index: false } };
}

function NotScouted({ which, login, error }: { which: "first" | "second"; login: string; error: GithubError }) {
  const rateLimited = error.type === "ratelimit";
  const noSuchUser = error.type === "notfound" || error.type === "invalid";
  const heading = rateLimited ? "Too many right swipes" : noSuchUser ? "No profile found" : "Matching interrupted";
  const message = rateLimited
    ? `The algorithm's on a coffee date — GitHub just rate-limited us. Give it a couple minutes, then check ${which} again.`
    : error.type === "notfound"
      ? `There's no GitHub user named @${login} — that's your ${which} pick.`
      : error.type === "invalid"
        ? `“${login}” isn't a valid GitHub username — that's your ${which} pick.`
        : error.message;
  return (
    <main className="relative z-[2] mx-auto flex min-h-screen max-w-[560px] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="font-display text-[12px] font-bold tracking-[.3em] text-brand">GITTINDER</div>
      <h1 className="font-display mt-3 text-[clamp(30px,6vw,48px)] font-black leading-[.95]">{heading}</h1>
      <p className="mt-3 text-[15.5px] leading-[1.5] text-ink-soft">{message}</p>
      <div className="mt-8 w-full">
        <CompatPicker />
      </div>
      <Link href="/" className="font-display gt-flame mt-6 inline-flex h-[46px] items-center rounded-xl px-6 text-[16px] tracking-[.06em] text-white">
        HOME
      </Link>
    </main>
  );
}

export default async function Page({ params }: { params: Promise<{ users?: string[] }> }) {
  const users = ((await params).users ?? []).filter(Boolean).map(normalize).slice(0, 2);

  // Landing (0 users) and single-pick (1 user) both show the picker — no pair yet.
  if (users.length < 2) {
    return (
      <div className="relative min-h-screen overflow-x-hidden text-ink">
        <Background />
        <main className="relative z-[2] mx-auto flex min-h-screen max-w-[680px] flex-col items-center justify-center px-6 text-center">
          <div className="font-display text-[12px] font-bold tracking-[.3em] text-brand">GITTINDER</div>
          <h1 className="font-display mt-3 text-[clamp(30px,6vw,52px)] font-black leading-[.95]">
            CHECK THE <span className="gt-flame-text">CHEMISTRY</span>.
          </h1>
          <p className="mt-3 text-[15.5px] leading-[1.5] text-ink-soft">
            Two GitHub usernames. One compatibility score. Is it a merge or a rebase?
          </p>
          <div className="mt-8 w-full">
            <CompatPicker initial={users} />
          </div>
        </main>
      </div>
    );
  }

  const [ra, rb] = await Promise.all([loadProfile(users[0]), loadProfile(users[1])]);
  const errorRes = "error" in ra
    ? { which: "first" as const, login: users[0], error: ra.error }
    : "error" in rb
      ? { which: "second" as const, login: users[1], error: rb.error }
      : null;
  if (errorRes) {
    return (
      <div className="relative min-h-screen overflow-x-hidden text-ink">
        <Background />
        <NotScouted {...errorRes} />
      </div>
    );
  }

  const a = (ra as { profile: DatingProfile }).profile;
  const b = (rb as { profile: DatingProfile }).profile;
  const chemistry = computeChemistry(a, b);

  return (
    <div className="relative min-h-screen overflow-x-hidden text-ink">
      <Background />
      <CompatView a={a} b={b} chemistry={chemistry} />
    </div>
  );
}
