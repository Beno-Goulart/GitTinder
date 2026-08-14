import type { Metadata } from "next";
import Link from "next/link";
import Background from "@/components/Background";
import { dicts } from "@/lib/i18n/dicts";
import { getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: dicts[await getLocale()].meta.notFoundTitle, robots: { index: false } };
}

export default async function NotFound() {
  const ui = dicts[await getLocale()].ui;
  return (
    <div className="relative min-h-screen overflow-x-hidden text-ink">
      <Background />

      <main className="relative z-[2] mx-auto flex min-h-screen max-w-[600px] flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-1 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot.png"
            alt={ui.mascotAlt}
            width={110}
            height={110}
            draggable={false}
            aria-hidden
            style={{ filter: "drop-shadow(0 6px 16px rgba(255,70,85,.3))" }}
          />
        </div>

        <p className="font-display text-[12px] font-bold tracking-[.3em] text-brand">{ui.swipedLeft}</p>

        <h1 className="font-display mt-2 text-[clamp(72px,16vw,140px)] font-black leading-[.84]">
          {ui.noMatch}
        </h1>

        <p className="font-mono mt-2 text-[13px] font-medium tracking-[.55em] text-ink-faint">
          4 · 0 · 4
        </p>

        <p className="mt-5 max-w-[430px] text-[15.5px] leading-[1.55] text-ink-soft">
          {ui.notFoundParagraph}
        </p>

        <div className="mt-8 flex flex-col items-center gap-[14px]">
          <Link
            href="/"
            className="font-display gt-flame inline-flex h-[46px] items-center rounded-xl px-7 text-[16px] tracking-[.06em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {ui.findAMatch}
          </Link>
          <Link
            href="/"
            className="rounded text-[13.5px] font-medium text-ink-faint underline-offset-4 transition hover:text-brand hover:underline focus-visible:text-brand focus-visible:underline focus-visible:outline-none"
          >
            {ui.matchADeveloper}
          </Link>
        </div>
      </main>
    </div>
  );
}
