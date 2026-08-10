"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Flame,
  Heart,
  Languages,
  RefreshCcw,
  Star,
  User,
  type LucideIcon,
} from "lucide-react";
import type { Chemistry } from "@/lib/dating/compat";
import { TRAIT_DESCRIPTIONS, TRAIT_LABELS } from "@/lib/dating/constants";
import { languageLogoUrl, logoSlugFor } from "@/lib/github/languages";
import type { DatingProfile, TraitKey } from "@/lib/dating/types";
import DatingCard from "./DatingCard";
import ShareButton from "./ShareButton";
import ThemeToggle from "./ThemeToggle";

const TRAIT_ICONS: Record<TraitKey, LucideIcon> = {
  spark: Star,
  chat: Languages,
  style: User,
  loyal: Heart,
  care: Star,
  energy: Flame,
};

const hideOnError: React.ReactEventHandler<HTMLImageElement> = (e) => {
  e.currentTarget.style.display = "none";
};

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface/60 p-[16px]">
      <div className="mb-[8px] flex items-center gap-[9px]">
        <span className="h-[2px] w-[16px] rounded-full" style={{ background: accent }} />
        <h3 className="font-display text-[11px] font-bold tracking-[.22em] text-ink-faint">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Meter({
  label,
  value,
  accent,
  index = 0,
}: {
  label: string;
  value: number;
  accent: string;
  index?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const t = setTimeout(() => setMounted(true), reduced ? 0 : 120 + index * 60);
    return () => clearTimeout(t);
  }, [index]);
  return (
    <div
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(6px)",
        transition: "opacity .5s ease, transform .5s cubic-bezier(.16,1,.3,1)",
      }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-ink-dim">{label}</span>
        <span className="font-display text-[16px] font-bold leading-none tabular-nums" style={{ color: accent }}>
          {value}
        </span>
      </div>
      <div className="mt-[7px] h-[3px] overflow-hidden rounded-full bg-ink/[0.07]">
        <div
          className="h-full rounded-full transition-[width] duration-[900ms] ease-out"
          style={{
            width: mounted ? `${value}%` : "0%",
            background: `linear-gradient(90deg, ${accent}99, ${accent})`,
          }}
        />
      </div>
    </div>
  );
}

// The pair report — two cards facing off, the chemistry seal between them, then
// the breakdown: where the score comes from, what they share, how they fit.
export default function CompatView({
  a,
  b,
  chemistry,
}: {
  a: DatingProfile;
  b: DatingProfile;
  chemistry: Chemistry;
}) {
  const t = chemistry;
  const LeftIcon = TRAIT_ICONS[t.leftLead];
  const RightIcon = TRAIT_ICONS[t.rightLead];

  const leadRow = (p: DatingProfile, lead: TraitKey, Icon: LucideIcon) => (
    <div className="flex items-start gap-[10px]">
      <img
        src={p.avatarUrl}
        onError={hideOnError}
        alt=""
        aria-hidden
        className="mt-[2px] h-[38px] w-[38px] shrink-0 rounded-full border border-line object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[14px] font-semibold text-ink">
            {p.name || p.login}
          </span>
          <span className="font-display text-[15px] font-bold leading-none tabular-nums" style={{ color: t.accent }}>
            {p.stats[lead]}
          </span>
        </div>
        <div className="mt-[2px] flex items-center gap-[6px] text-[12px] text-ink-soft">
          <Icon size={13} style={{ color: t.accent }} aria-hidden />
          leads on {TRAIT_LABELS[lead]}
        </div>
        <p className="mt-[4px] text-[12px] leading-snug text-ink-mute">
          {TRAIT_DESCRIPTIONS[lead]}
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative z-[2] mx-auto w-full max-w-[1180px] px-[clamp(16px,4vw,40px)] pb-16">
      {/* top bar */}
      <div className="flex items-center justify-between py-4">
        <Link href="/" className="font-display text-[13px] tracking-[.16em] text-ink-mute transition hover:text-ink">
          ← GITTINDER
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ShareButton
            path={`/vs/${encodeURIComponent(a.login)}/${encodeURIComponent(b.login)}`}
            label="SHARE"
            title={`@${a.login} × @${b.login} — ${t.score}% chemistry on GitTinder`}
            text={`Are @${a.login} and @${b.login} a match? ${t.score}% chemistry on GitTinder.`}
          />
          <Link
            href="/vs"
            className="font-display rounded-[10px] border border-line bg-surface/60 px-4 py-2 text-[12px] tracking-[.14em] text-ink-soft transition hover:border-brand/60 hover:text-brand"
          >
            NEW PAIR ↗
          </Link>
        </div>
      </div>

      {/* the two cards + the seal */}
      <header className="mt-[clamp(12px,3vw,32px)] flex flex-col items-center">
        <div className="flex items-center justify-center gap-[clamp(6px,2vw,22px)]">
          <a
            href={`/${a.login}`}
            aria-label={`${a.login}'s profile`}
            className="block w-[min(190px,34vw)] shrink-0 rotate-[-5deg] transition duration-500 hover:rotate-0"
          >
            <DatingCard profile={a} />
          </a>

          <div
            className="animate-pop relative z-10 flex flex-col items-center justify-center rounded-full text-white"
            style={{
              width: "clamp(92px,14vw,150px)",
              height: "clamp(92px,14vw,150px)",
              background: `radial-gradient(circle at 30% 20%, ${t.accent}, ${t.accent})`,
              boxShadow: `0 0 46px ${t.accent}66, inset 0 1px 0 rgba(255,255,255,.35)`,
            }}
          >
            <span className="font-display text-[clamp(34px,5vw,56px)] leading-none tabular-nums">
              {t.score}
            </span>
            <span className="font-display text-[clamp(9px,1.2vw,11px)] font-bold tracking-[.24em] opacity-90">
              CHEMISTRY
            </span>
          </div>

          <a
            href={`/${b.login}`}
            aria-label={`${b.login}'s profile`}
            className="block w-[min(190px,34vw)] shrink-0 rotate-[5deg] transition duration-500 hover:rotate-0"
          >
            <DatingCard profile={b} />
          </a>
        </div>

        <div className="font-display mt-8 text-[12px] font-bold tracking-[.3em] text-brand">
          CHEMISTRY REPORT
        </div>
        <h1 className="font-display gt-flame-text mt-2 text-center text-[clamp(40px,7.4vw,84px)] font-black leading-[.88] tracking-[.01em]">
          {t.tierLabel}.
        </h1>
        <p className="mt-4 max-w-[560px] text-center text-[15.5px] leading-[1.5] text-ink-soft">
          {t.verdict}
        </p>
        <p className="font-mono mt-2 text-[13px] tracking-[.08em] text-ink-faint">
          @{a.login} × @{b.login} · {t.score}% chemistry
        </p>
      </header>

      {/* the breakdown */}
      <div className="mt-[clamp(28px,5vw,48px)] grid gap-[16px] md:grid-cols-[1fr_1fr]">
        <Section title="THE CHEMISTRY" accent={t.accent}>
          <div className="flex flex-col gap-[14px] pt-1">
            <Meter label="Shared languages" value={t.sharedScore} accent={t.accent} index={0} />
            <Meter label="Same core" value={t.similarity} accent={t.accent} index={1} />
            <Meter label="Complementary edges" value={t.complementarity} accent={t.accent} index={2} />
            <Meter label="On-paper charm" value={t.charm} accent={t.accent} index={3} />
          </div>
          <ul className="mt-[16px] flex flex-col gap-[10px] border-t border-line pt-[14px]">
            {t.notes.map((note) => (
              <li key={note} className="flex items-start gap-[9px] text-[13px] leading-[1.45] text-ink-soft">
                <span className="mt-[5px] h-[5px] w-[5px] shrink-0 rounded-full" style={{ background: t.accent }} />
                {note}
              </li>
            ))}
          </ul>
        </Section>

        <div className="flex flex-col gap-[16px]">
          <Section title="IN COMMON" accent={t.accent}>
            {t.sharedLanguages.length > 0 ? (
              <>
                <p className="mb-[10px] text-[13px] text-ink-soft">
                  {t.sharedLanguages.length === 1
                    ? "One language you both speak:"
                    : "Languages you both speak:"}
                </p>
                <div className="flex flex-wrap gap-[8px]">
                  {t.sharedLanguages.map((lang) => {
                    const slug = logoSlugFor(lang);
                    return (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-[6px] rounded-full border border-line bg-surface px-[11px] py-[4px] text-[12.5px] font-medium text-ink-soft"
                      >
                        {slug && (
                          <img
                            src={languageLogoUrl(slug)}
                            onError={hideOnError}
                            alt=""
                            aria-hidden
                            className="h-[14px] w-[14px] object-contain"
                          />
                        )}
                        {lang}
                      </span>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-[13px] leading-[1.5] text-ink-soft">
                Zero languages in common — every conversation starts from a
                different directory. Sometimes that&rsquo;s the point.
              </p>
            )}
          </Section>

          <Section title="HOW YOU FIT" accent={t.accent}>
            <div className="flex flex-col gap-[14px] pt-1">
              {leadRow(a, t.leftLead, LeftIcon)}
              <div className="mx-4 flex items-center gap-3">
                <span className="h-[1px] flex-1 bg-line" />
                <span className="font-display text-[11px] font-bold tracking-[.22em] text-ink-faint">
                  {t.leftLead === t.rightLead ? "SAME LANE" : "COUNTERWEIGHT"}
                </span>
                <span className="h-[1px] flex-1 bg-line" />
              </div>
              {leadRow(b, t.rightLead, RightIcon)}
            </div>
          </Section>
        </div>
      </div>

      {/* actions */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link href="/vs" className="font-display gt-flame inline-flex items-center gap-2 rounded-[12px] px-6 py-3 text-[15px] tracking-[.06em] text-white">
          <RefreshCcw size={15} /> NEW PAIR
        </Link>
        <Link
          href="/"
          className="font-display rounded-[12px] border border-line px-5 py-3 text-[13px] tracking-[.1em] text-ink-soft transition hover:border-ink/30 hover:text-ink"
        >
          HOME
        </Link>
      </div>
    </div>
  );
}
