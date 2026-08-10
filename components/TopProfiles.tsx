"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { BAKED_PROFILES } from "@/lib/swipe";
import { profileTheme } from "@/lib/dating/theme";

// The home "TOP PROFILES" strip — the highest match scores from the baked
// swipe crowd, as tappable mini-cards. Sorted once per render (the deck is
// small), linking straight to each profile.

const TOP_N = 4;

const AVATAR_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="%23e8dfcd"/><circle cx="48" cy="40" r="18" fill="%23cfc4a8"/><rect x="21" y="64" width="54" height="42" rx="22" fill="%23cfc4a8"/></svg>',
  );

export default function TopProfiles() {
  const top = [...BAKED_PROFILES].sort((a, b) => b.match - a.match).slice(0, TOP_N);

  return (
    <section className="relative z-[2] mx-auto w-full max-w-[1180px] px-[clamp(22px,5vw,56px)] pb-[clamp(28px,5vw,52px)]">
      <div className="mb-[14px] flex items-center gap-[9px]">
        <span className="h-[2px] w-[16px] rounded-full bg-brand" />
        <h2 className="font-display text-[11px] font-bold tracking-[.22em] text-ink-faint">
          TOP PROFILES
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-[12px] max-[760px]:grid-cols-2 md:grid-cols-4">
        {top.map((p) => {
          const t = profileTheme(p);
          const frame: CSSProperties = {
            borderColor: `rgba(25,21,33,.08)`,
            boxShadow: `0 2px 10px rgba(70,50,20,.08)`,
          };
          return (
            <Link
              key={p.login}
              href={`/${encodeURIComponent(p.login)}`}
              className="group flex items-center gap-[12px] rounded-2xl border border-line bg-surface/60 p-[12px] transition hover:border-brand/50 hover:bg-surface"
              style={frame}
            >
              <span className="relative block h-[52px] w-[52px] shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2">
                <img
                  src={p.avatarUrl}
                  alt=""
                  aria-hidden
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = AVATAR_FALLBACK;
                  }}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold leading-tight text-ink">
                  {p.name || p.login}
                </span>
                <span className="font-mono mt-[3px] block truncate text-[11px] text-ink-faint">
                  @{p.login}
                </span>
                <span
                  className="font-display mt-[4px] inline-flex items-center gap-[5px] text-[14px] font-bold leading-none tracking-[.04em]"
                  style={{ color: t.accent }}
                >
                  {p.match}% MATCH
                  <span className="text-[10px] font-bold tracking-[.16em] text-ink-mute">
                    {p.tierLabel}
                  </span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
