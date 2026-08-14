"use client";

import { useEffect, useState } from "react";
import { useDict, useLocale } from "@/lib/i18n/client";
import { punAt } from "@/lib/puns";

// Full-screen loading state shown while the profile is scouted. The mascot
// pulses; a dating-git pun rotates every ~1.8s.
export default function LoadingScreen({ login }: { login?: string }) {
  const [tick, setTick] = useState(0);
  const locale = useLocale();
  const dict = useDict();

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="relative z-[2] flex h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 -m-8 rounded-full bg-brand/20 blur-2xl" />
        <img
          src="/mascot.png"
          alt={dict.ui.mascotAlt}
          width={120}
          height={120}
          draggable={false}
          className="animate-heartbeat relative"
        />
      </div>

      <div className="font-display mt-8 text-[clamp(30px,5vw,52px)] leading-none tracking-[.02em] text-ink">
        {dict.ui.matchingTitle}{" "}
        {login && <span className="font-mono align-middle text-[0.5em] text-brand">@{login}</span>}
      </div>

      {/* rotating pun line */}
      <p
        key={tick}
        className="animate-pun-in mt-3 h-6 text-[15px] font-medium text-ink-soft"
        aria-live="polite"
      >
        {punAt(tick, locale)}
      </p>

      {/* indeterminate progress sliver */}
      <div className="mt-7 h-[3px] w-[min(260px,70vw)] overflow-hidden rounded-full bg-ink/[0.08]">
        <div
          className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-brand to-transparent"
          style={{ animation: "gt-load 1.3s ease-in-out infinite" }}
        />
      </div>

      <style>{`@keyframes gt-load{0%{transform:translateX(-120%)}100%{transform:translateX(360%)}}`}</style>
    </main>
  );
}
