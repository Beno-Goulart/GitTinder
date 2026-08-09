import type { Metadata } from "next";
import Link from "next/link";
import Background from "@/components/Background";

export const metadata: Metadata = {
  title: "404 · No match — GitTinder",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-ink">
      <Background />

      <main className="relative z-[2] mx-auto flex min-h-screen max-w-[600px] flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-1 flex items-center justify-center">
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none" aria-hidden style={{ filter: "drop-shadow(0 6px 16px rgba(255,61,127,.35))" }}>
            <rect width="110" height="110" rx="26" fill="#1d1527" stroke="#ff3d7f" strokeOpacity="0.4" />
            <path d="M55 34 C38 20 16 26 20 48 C23 66 40 76 55 88 C70 76 87 66 90 48 C94 26 72 20 55 34 Z" fill="none" stroke="#ff3d7f" strokeWidth="5" strokeLinecap="round" />
            <line x1="30" y1="64" x2="80" y2="64" stroke="#ff3d7f" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>

        <p className="font-display text-[12px] font-bold tracking-[.3em] text-brand">SWIPED LEFT</p>

        <h1 className="font-display mt-2 text-[clamp(72px,16vw,140px)] font-black leading-[.84]">
          NO MATCH
        </h1>

        <p className="font-mono mt-2 text-[13px] font-medium tracking-[.55em] text-ink-faint">
          4 · 0 · 4
        </p>

        <p className="mt-5 max-w-[430px] text-[15.5px] leading-[1.55] text-ink-soft">
          This profile swiped left on the URL — there&rsquo;s no route here.
        </p>

        <div className="mt-8 flex flex-col items-center gap-[14px]">
          <Link
            href="/"
            className="font-display gt-flame inline-flex h-[46px] items-center rounded-xl px-7 text-[16px] tracking-[.06em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            FIND A MATCH
          </Link>
          <Link
            href="/"
            className="rounded text-[13.5px] font-medium text-ink-faint underline-offset-4 transition hover:text-brand hover:underline focus-visible:text-brand focus-visible:underline focus-visible:outline-none"
          >
            Match a developer &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}
