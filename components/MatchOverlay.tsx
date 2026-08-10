"use client";

import { useEffect, useState } from "react";
import { PartyPopper, X } from "lucide-react";
import type { CardProfile, DatingProfile } from "@/lib/dating/types";
import { sparkScore } from "@/lib/dating/compat";
import DatingCard from "./DatingCard";
import { punAt } from "@/lib/puns";

// "It's a match!" — shown when you like someone in the deck and the spark is
// mutual (sparkScore at/above MATCH_THRESHOLD). Two DIFFERENT cards slide in —
// the page owner and the profile that swiped back — plus the pair chemistry
// and a CTA to see the full /vs report.
export default function MatchOverlay({
  profile,
  mate,
  onClose,
}: {
  profile: DatingProfile;
  mate: CardProfile;
  onClose: () => void;
}) {
  const [tick, setTick] = useState(0);
  const spark = sparkScore(profile, mate);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2600);
    document.body.style.overflow = "hidden";
    return () => {
      clearInterval(id);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="It's a match"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-[560px] flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -right-2 -top-10 rounded-full p-2 text-white/70 transition hover:text-white"
        >
          <X size={26} />
        </button>

        {/* two different cards slide in — the owner and the profile that swiped back */}
        <div className="relative flex h-[300px] w-full items-center justify-center">
          <div
            className="absolute w-[180px] animate-pop"
            style={{ animation: "match-slide-left .5s cubic-bezier(.2,.8,.2,1) both", zIndex: 1 }}
          >
            <DatingCard profile={profile} />
          </div>
          <div
            className="absolute w-[180px] animate-pop"
            style={{
              animation: "match-slide-right .5s cubic-bezier(.2,.8,.2,1) both",
              transform: "translateX(58px) rotate(7deg)",
              zIndex: 2,
            }}
          >
            <DatingCard profile={mate} />
          </div>
          <div
            className="relative z-10 flex h-[110px] w-[110px] items-center justify-center rounded-full"
            style={{
              background: "radial-gradient(circle at 30% 20%, #ff7a85, #ff4655)",
              boxShadow: "0 0 60px rgba(255,70,85,.55)",
              transform: "translateY(-8px)",
            }}
          >
            <PartyPopper size={52} strokeWidth={1.8} className="text-white" />
          </div>
        </div>

        <h2 className="gt-flame-text font-display mt-2 text-[clamp(52px,9vw,80px)] leading-[.9] tracking-[.01em]">
          IT&rsquo;S A MATCH
        </h2>

        <p key={tick} className="mt-3 h-6 text-[15px] font-medium text-white/80" aria-live="polite">
          {punAt(tick)}
        </p>

        <p className="mt-4 max-w-[440px] text-[14px] leading-relaxed text-white/60">
          @{profile.login} × @{mate.login} —{" "}
          <span className="font-semibold text-white">{spark}% chemistry</span>.{" "}
          {mate.name || mate.login} swiped back. See the full report and decide
          together.
        </p>

        <a
          href={`/vs/${encodeURIComponent(profile.login)}/${encodeURIComponent(mate.login)}`}
          onClick={onClose}
          className="font-display gt-flame mt-6 inline-flex items-center gap-2 rounded-[14px] px-8 py-3 text-[18px] tracking-[.06em] text-white"
        >
          SHARE THE MATCH
        </a>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 cursor-pointer text-[13px] text-white/50 transition hover:text-white/80"
        >
          keep browsing
        </button>
      </div>

      <style>{`
        @keyframes match-slide-left{0%{transform:translateX(-140px) rotate(-8deg);opacity:0}100%{transform:translateX(-58px) rotate(-7deg);opacity:1}}
        @keyframes match-slide-right{0%{transform:translateX(140px) rotate(8deg);opacity:0}100%{transform:translateX(58px) rotate(7deg);opacity:1}}
        @keyframes match-pop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}
