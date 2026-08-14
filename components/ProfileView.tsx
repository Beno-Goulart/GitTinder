"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  Heart,
  Languages,
  MapPin,
  RefreshCcw,
  Star,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import type { DatingProfile, TraitKey, CardProfile } from "@/lib/dating/types";
import { TRAITS } from "@/lib/dating/constants";
import { isMutualMatch } from "@/lib/dating/compat";
import { profileTheme, rgba } from "@/lib/dating/theme";
import { formatCount } from "@/lib/format";
import { languageLogoUrl, logoSlugFor } from "@/lib/github/languages";
import { swipeProfiles } from "@/lib/swipe";
import { useDict, useLocale } from "@/lib/i18n/client";
import { fmt } from "@/lib/i18n/dicts";
import DatingCard from "./DatingCard";
import TraitRadar from "./TraitRadar";
import SwipeDeck from "./SwipeDeck";
import MatchOverlay from "./MatchOverlay";
import ShareButton from "./ShareButton";
import CardShare from "./CardShare";
import EmbedSnippet from "./EmbedSnippet";
import SocialShare from "./SocialShare";
import ThemeToggle from "./ThemeToggle";
import GitHubLink from "./GitHubLink";

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

function Tip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="group/tip relative inline-flex cursor-help items-center">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-max max-w-[220px] -translate-x-1/2 whitespace-normal rounded-lg border border-white/10 bg-[#191521] px-3 py-2 text-left text-[12px] font-normal leading-snug text-[#d5ccdd] shadow-[0_10px_30px_rgba(30,20,10,.35)] group-hover/tip:block"
      >
        {text}
      </span>
    </span>
  );
}

function Section({
  title,
  accent,
  className,
  children,
}: {
  title: string;
  accent: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`min-w-0 rounded-2xl border border-line bg-surface/60 p-[16px] ${className ?? ""}`}>
      <div className="mb-[8px] flex items-center gap-[9px]">
        <span className="h-[2px] w-[16px] rounded-full" style={{ background: accent }} />
        <h3 className="font-display text-[11px] font-bold tracking-[.22em] text-ink-faint">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function MetricBar({ label, value, score, unit, accent, index = 0 }: { label: string; value: number; score: number; unit?: string; accent: string; index?: number }) {
  const fill = Math.max(score, 4);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const t = setTimeout(() => setMounted(true), reduced ? 0 : 120 + index * 55);
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
        <span className="flex items-baseline gap-[6px]">
          <span className="text-[11px] tabular-nums text-ink-mute">
            {formatCount(value)}
            {unit ? ` ${unit}` : ""}
          </span>
          <span className="font-display text-[16px] font-bold leading-none tabular-nums" style={{ color: accent }}>
            {score}
          </span>
        </span>
      </div>
      <div className="mt-[7px] h-[3px] overflow-hidden rounded-full bg-ink/[0.07]">
        <div
          className="h-full rounded-full transition-[width] duration-[900ms] ease-out"
          style={{ width: mounted ? `${fill}%` : "0%", background: `linear-gradient(90deg, ${accent}99, ${accent})` }}
        />
      </div>
    </div>
  );
}

// The dating-profile report: the swipeable card up top, then the "about me"
// the algorithm wrote — radar, traits, bio, passions and the real GitHub
// numbers behind it all.
export default function ProfileView({ profile }: { profile: DatingProfile }) {
  const t = profileTheme(profile);
  const dict = useDict();
  const locale = useLocale();
  // The deck never includes the page owner — matching yourself is not a match.
  const deck = swipeProfiles(locale).filter((p) => p.login !== profile.login);
  const [likedProfile, setLikedProfile] = useState<CardProfile | null>(null);
  const [noSpark, setNoSpark] = useState<CardProfile | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [picked, setPicked] = useState<CardProfile[]>(deck);

  const metaBits = [
    profile.height,
    fmt(dict.ui.reposLabel, { n: profile.repos }),
    ...(profile.location ? [profile.location.split(",")[0].trim()] : []),
  ].join(" · ");

  const shareTitle = fmt(dict.ui.profileShareTitle, { name: profile.name || profile.login, match: profile.match });
  const shareText = fmt(dict.ui.profileShareText, { name: profile.name || profile.login, match: profile.match });

  return (
    <div className="relative z-[2] mx-auto w-full max-w-[1180px] px-[clamp(16px,4vw,40px)] pb-16">
      {/* top bar — brand home link + share */}
      <div className="flex items-center justify-between py-4">
        <Link href="/" aria-label={dict.ui.homeAria} className="transition hover:opacity-80">
          <Image
            src="/logo.png"
            alt="GitTinder"
            width={1162}
            height={1354}
            className="h-10 w-auto"
          />
        </Link>
        <div className="flex items-center gap-2">
          <GitHubLink />
          <ThemeToggle />
          <ShareButton
            path={`/${encodeURIComponent(profile.login)}`}
            label={dict.ui.share}
            title={shareTitle}
            text={shareText}
          />
        </div>
      </div>

      {/* the card + headline */}
      <header className="flex flex-col items-center gap-[clamp(20px,4vw,44px)] md:flex-row md:items-start">
        <div className="w-[min(320px,72vw)] shrink-0">
          <DatingCard profile={profile} />
        </div>

        <div className="min-w-0 flex-1 text-center md:text-left">
          <div
            className="font-display mx-auto inline-flex items-center gap-[10px] rounded-full border px-[18px] py-[8px] md:mx-0"
            style={{ borderColor: rgba(t.accent, 0.5), background: rgba(t.accent, 0.12), boxShadow: `0 0 34px ${t.glow}` }}
          >
            <span className="text-[clamp(30px,5vw,42px)] leading-none tabular-nums" style={{ color: t.accent }}>
              {profile.match}%
            </span>
            <span className="text-[11px] font-bold tracking-[.22em] text-ink-faint">{dict.ui.match}</span>
          </div>

          <h1 className="font-display mt-4 text-[clamp(44px,7vw,72px)] leading-[.9] tracking-[.005em]">
            {profile.name || profile.login}
            {profile.verified && (
              <span className="ml-3 inline-block align-middle text-[0.5em]" style={{ color: t.accent }}>
                ✓
              </span>
            )}
          </h1>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-[10px] gap-y-[6px] md:justify-start">
            <span
              className="font-display inline-flex items-center rounded-[6px] border px-[9px] py-[3px] text-[12px] font-bold leading-none tracking-[.14em]"
              style={{ color: t.accent, borderColor: rgba(t.accent, 0.45), background: rgba(t.accent, 0.14) }}
            >
              {profile.tierLabel}
            </span>
            <span className="text-[13.5px] font-medium text-ink-dim">{profile.vibe}</span>
            <span className="font-mono text-[12.5px] text-ink-faint">{metaBits}</span>
          </div>

          <p className="mx-auto mt-[9px] max-w-[560px] text-[clamp(12.5px,3.2vw,13.5px)] leading-[1.5] text-ink-soft md:mx-0">
            <span className="font-display mr-[7px] text-[11px] font-bold tracking-[.18em]" style={{ color: t.accent }}>
              {profile.tierLabel}
            </span>
            {profile.vibeBlurb}.
          </p>

          <p className="mx-auto mt-4 max-w-[560px] text-[14px] leading-[1.6] text-ink-soft md:mx-0">
            {profile.bio.slice(0, 3).join(" ")}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-[8px] md:justify-start">
            {profile.interests.slice(0, 5).map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center gap-[6px] rounded-full border border-line bg-surface/60 px-[11px] py-[4px] text-[12.5px] font-medium text-ink-soft"
              >
                {logoSlugFor(lang) && (
                  <img
                    src={languageLogoUrl(logoSlugFor(lang)!)}
                    onError={hideOnError}
                    alt=""
                    aria-hidden
                    className="h-[14px] w-[14px] object-contain"
                  />
                )}
                {lang}
              </span>
            ))}
            {profile.location && (
              <span className="inline-flex items-center gap-[5px] text-[12.5px] text-ink-mute">
                <MapPin size={13} aria-hidden />
                {profile.location}
              </span>
            )}
          </div>

          <div className="mx-auto mt-5 flex max-w-[420px] flex-wrap items-center justify-center gap-3 md:mx-0 md:justify-start">
            <Link
              href={`/vs/${encodeURIComponent(profile.login)}`}
              className="font-display gt-flame inline-flex items-center gap-2 rounded-[12px] px-6 py-3 text-[15px] tracking-[.06em] text-white"
            >
              {dict.ui.testCompatibility}
            </Link>
            <CardShare
              path={`/${encodeURIComponent(profile.login)}`}
              login={profile.login}
              title={shareTitle}
              text={shareText}
            />
            <a
              href={`https://github.com/${profile.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display rounded-[12px] border border-line px-5 py-3 text-[13px] tracking-[.1em] text-ink-soft transition hover:border-ink/30 hover:text-brand"
            >
              {dict.ui.github}
            </a>
          </div>
        </div>
      </header>

      {/* the report grid — minmax(0,1fr) lets the tracks shrink below the
          embed snippet's long line (grid tracks default to min-content width) */}
      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-[16px] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* left — the six traits, drawn as a radar */}
        <Section title={dict.ui.theSixTraits} accent={t.accent}>
          <div className="mx-auto max-w-[420px]">
            <TraitRadar traits={profile.stats} accent={t.accent} />
          </div>
          <ul className="mt-4 flex flex-col gap-[11px]">
            {TRAITS.map((key) => {
              const Icon = TRAIT_ICONS[key];
              return (
                <li key={key} className="flex items-start gap-[10px]">
                  <Icon size={16} style={{ color: t.accent }} aria-hidden className="mt-[1px] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <Tip text={dict.traits[key].desc}>
                        <span className="text-[13.5px] font-medium text-ink-soft">
                          {dict.traits[key].label}
                        </span>
                      </Tip>
                      <span className="font-display text-[15px] font-bold tabular-nums" style={{ color: t.accent }}>
                        {profile.stats[key]}
                      </span>
                    </div>
                    <div className="mt-[5px] h-[3px] overflow-hidden rounded-full bg-ink/[0.07]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.max(profile.stats[key], 4)}%`, background: `linear-gradient(90deg, ${t.accent}99, ${t.accent})` }}
                      />
                    </div>
                    <p className="mt-[4px] text-[12px] leading-snug text-ink-mute">
                      {profile.report.reasons[key]}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>

        {/* right column stack */}
        <div className="flex min-w-0 flex-col gap-[16px]">
          <Section title={dict.ui.about} accent={t.accent}>
            <div className="flex flex-col gap-[12px] pt-1">
              <p className="text-[14px] leading-[1.6] text-ink-soft">
                {profile.lookingFor}
              </p>
              <div className="flex flex-wrap gap-[8px]">
                {profile.tags.map((tag) => (
                  <Tip key={tag.label} text={tag.reason}>
                    <span className="inline-flex items-center gap-[6px] rounded-full border border-line bg-surface/60 px-[11px] py-[5px] text-[12.5px] font-medium text-ink-soft">
                      {tag.label}
                    </span>
                  </Tip>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-xl border border-line bg-surface/60 px-[14px] py-[10px]">
                <span className="text-[13px] text-ink-dim">{dict.ui.memberSince}</span>
                <span className="font-display text-[14px] font-bold text-ink-soft">{profile.since}</span>
              </div>
            </div>
          </Section>

          <Section title={dict.ui.scoringMetrics} accent={t.accent} className="w-full">
            <div className="flex flex-col gap-[13px] pt-1">
              {profile.metrics.map((m, i) => (
                <MetricBar key={m.label} label={m.label} value={m.value} score={m.score} unit={m.unit} accent={t.accent} index={i} />
              ))}
            </div>
          </Section>

          <Section title={dict.ui.embedTheCard} accent={t.accent} className="w-full">
            <EmbedSnippet login={profile.login} name={profile.name} />
          </Section>
        </div>
      </div>

      {/* the sharing loop — score is known, now spread the verdict */}
      <section className="mt-14 rounded-2xl border border-line bg-surface/40 p-[clamp(20px,4vw,36px)] text-center">
        <h2 className="font-display text-[clamp(22px,3.4vw,30px)] tracking-[.02em]">
          {dict.ui.spreadTheVerdict} <span className="gt-flame-text">{dict.ui.spreadTheVerdictAccent}</span>
        </h2>
        <p className="mx-auto mt-2 max-w-[480px] text-[14px] leading-[1.5] text-ink-soft">
          {dict.ui.spreadParagraph}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <SocialShare
            path={`/${encodeURIComponent(profile.login)}`}
            title={shareTitle}
            text={shareText}
          />
          <Link
            href={`/vs/${encodeURIComponent(profile.login)}`}
            className="font-display inline-flex items-center gap-2 rounded-[12px] border border-line bg-surface/60 px-5 py-3 text-[13px] tracking-[.1em] text-ink-soft transition hover:border-ink/30 hover:text-brand"
          >
            {dict.ui.challengeAFriend} ↗
          </Link>
          <button
            type="button"
            onClick={() => document.getElementById("keep-swiping")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="font-display inline-flex items-center gap-2 rounded-[12px] border border-line bg-surface/60 px-5 py-3 text-[13px] tracking-[.1em] text-ink-soft transition hover:border-ink/30 hover:text-brand"
          >
            {dict.ui.seeWhoMatchesYou}
          </button>
        </div>
      </section>

      {/* the swipe deck — keep swiping */}
      <div id="keep-swiping" className="mt-16 scroll-mt-6">
        <div className="mb-[18px] flex items-center justify-between">
          <h2 className="font-display text-[clamp(22px,3.4vw,30px)] tracking-[.02em]">
            {dict.ui.keepSwiping}<span className="text-brand">.</span>
          </h2>
          <button
            type="button"
            onClick={() => {
              setLikedProfile(null);
              setPicked([...deck].sort(() => Math.random() - 0.5));
            }}
            className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] font-semibold text-ink-soft transition hover:text-brand"
          >
            <RefreshCcw size={14} /> {dict.ui.reshuffle}
          </button>
        </div>
        <SwipeDeck
          profiles={picked}
          onOpen={(login) => {
            window.location.href = `/${encodeURIComponent(login)}`;
          }}
          onSwipe={(mate, like) => {
            if (!like) return;
            // Match is mutual: it happens only if the swiped profile would swipe
            // back — sparkScore(profile, mate) at or above the threshold.
            if (isMutualMatch(profile, mate)) {
              if (toastTimer.current) clearTimeout(toastTimer.current);
              setNoSpark(null);
              setLikedProfile(mate);
            } else {
              setLikedProfile(null);
              setNoSpark(mate);
              if (toastTimer.current) clearTimeout(toastTimer.current);
              toastTimer.current = setTimeout(() => setNoSpark(null), 2200);
            }
          }}
        />
      </div>

      {/* no-spark toast — liked but not mutual, so no match */}
      {noSpark && (
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[70] flex justify-center px-4">
          <div
            className="flex items-center gap-3 rounded-full border border-[#fb5c66]/35 bg-[#191521]/95 px-5 py-3 text-[13.5px] font-medium text-white/90 shadow-[0_12px_34px_rgba(30,20,10,.4)] backdrop-blur-sm"
            role="status"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#fb5c66] text-[#fb5c66]">
              <X size={14} strokeWidth={3} />
            </span>
            <span>
              <span className="font-semibold text-[#fb5c66]">@{noSpark.login}</span>{" "}
              {fmt(dict.ui.noSpark, { login: noSpark.login }).replace(/^@[^ ]+ /, "")}
            </span>
          </div>
        </div>
      )}

      {likedProfile && (
        <MatchOverlay
          profile={profile}
          mate={likedProfile}
          onClose={() => setLikedProfile(null)}
        />
      )}
    </div>
  );
}
