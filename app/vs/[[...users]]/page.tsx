import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Background from "@/components/Background";
import GitHubLink from "@/components/GitHubLink";
import CompatPicker from "@/components/CompatPicker";
import CompatView from "@/components/CompatView";
import { computeChemistry } from "@/lib/dating/compat";
import { type GithubError } from "@/lib/github/client";
import { checkScoutRateLimit, RATE_LIMIT_ERROR } from "@/lib/rateLimit";
import { loadProfile } from "@/lib/scout";
import { dicts, fmt } from "@/lib/i18n/dicts";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/locale";
import type { DatingProfile } from "@/lib/dating/types";

export const dynamic = "force-dynamic"; // pair reports are live scouts, never cached

const normalize = (u: string) => u.trim().replace(/^@/, "");

export async function generateMetadata({ params }: { params: Promise<{ users?: string[] }> }): Promise<Metadata> {
  const users = ((await params).users ?? []).filter(Boolean).map(normalize).slice(0, 2);
  const meta = dicts[await getLocale()].meta;
  if (users.length === 2) {
    return {
      title: fmt(meta.vsPairTitle, { a: users[0], b: users[1] }),
      description: fmt(meta.vsPairDescription, { a: users[0], b: users[1] }),
      alternates: { canonical: `/vs/${users[0]}/${users[1]}` },
      twitter: { card: "summary_large_image" },
    };
  }
  return { title: meta.vsTitle, robots: { index: false } };
}

function NotScouted({
  which,
  login,
  error,
  locale,
}: {
  which: "first" | "second";
  login: string;
  error: GithubError;
  locale: Locale;
}) {
  const rateLimited = error.type === "ratelimit";
  const noSuchUser = error.type === "notfound" || error.type === "invalid";
  const ui = dicts[locale].ui;
  const heading = rateLimited ? ui.tooManySwipes : noSuchUser ? ui.noProfileFound : ui.matchingInterrupted;
  const whichWord = which === "first" ? ui.whichFirst : ui.whichSecond;
  const message = rateLimited
    ? fmt(ui.rateLimitMessageVs, { which: whichWord })
    : error.type === "notfound"
      ? fmt(ui.noUserMessageVs, { login, which: whichWord })
      : error.type === "invalid"
        ? fmt(ui.invalidUserMessageVs, { login, which: whichWord })
        : error.message;
  return (
    <main className="relative z-[2] mx-auto flex min-h-screen max-w-[560px] flex-col items-center justify-center px-6 py-16 text-center">
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
      <div className="mt-8 w-full">
        <CompatPicker />
      </div>
      <Link href="/" className="font-display gt-flame mt-6 inline-flex h-[46px] items-center rounded-xl px-6 text-[16px] tracking-[.06em] text-white">
        {ui.home}
      </Link>
    </main>
  );
}

export default async function Page({ params }: { params: Promise<{ users?: string[] }> }) {
  const users = ((await params).users ?? []).filter(Boolean).map(normalize).slice(0, 2);
  const locale = await getLocale();
  const ui = dicts[locale].ui;

  // Landing (0 users) and single-pick (1 user) both show the picker — no pair yet.
  if (users.length < 2) {
    return (
      <div className="relative min-h-screen overflow-x-hidden text-ink">
        <Background />
        <main className="relative z-[2] mx-auto flex min-h-screen max-w-[680px] flex-col items-center justify-center px-6 text-center">
          <div className="absolute right-6 top-6">
            <GitHubLink />
          </div>
          <Image
        src="/logo.png"
        alt="GitTinder"
        width={1162}
        height={1354}
        priority
        className="h-11 w-auto"
      />
          <h1 className="font-display mt-3 text-[clamp(30px,6vw,52px)] font-black leading-[.95]">
            {ui.checkTheChemistry} <span className="gt-flame-text">{ui.checkTheChemistryAccent}</span>
          </h1>
          <p className="mt-3 text-[15.5px] leading-[1.5] text-ink-soft">
            {ui.vsHeroSub}
          </p>
          <div className="mt-8 w-full">
            <CompatPicker initial={users} />
          </div>
        </main>
      </div>
    );
  }

  // Budget check runs before any scout (memoised per request).
  if (!(await checkScoutRateLimit()).allowed) {
    return (
      <div className="relative min-h-screen overflow-x-hidden text-ink">
        <Background />
        <NotScouted which="first" login={users[0]} error={RATE_LIMIT_ERROR} locale={locale} />
      </div>
    );
  }

  const [ra, rb] = await Promise.all([loadProfile(users[0], locale), loadProfile(users[1], locale)]);
  const errorRes = "error" in ra
    ? { which: "first" as const, login: users[0], error: ra.error }
    : "error" in rb
      ? { which: "second" as const, login: users[1], error: rb.error }
      : null;
  if (errorRes) {
    return (
      <div className="relative min-h-screen overflow-x-hidden text-ink">
        <Background />
        <NotScouted {...errorRes} locale={locale} />
      </div>
    );
  }

  const a = (ra as { profile: DatingProfile }).profile;
  const b = (rb as { profile: DatingProfile }).profile;
  const chemistry = computeChemistry(a, b, locale);

  return (
    <div className="relative min-h-screen overflow-x-hidden text-ink">
      <Background />
      <CompatView a={a} b={b} chemistry={chemistry} />
    </div>
  );
}
