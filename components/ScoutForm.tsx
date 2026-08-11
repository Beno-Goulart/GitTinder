"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Shuffle } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import GitHubLink from "@/components/GitHubLink";
import { SAMPLE_LOGINS } from "@/lib/github/samples";
import { RANDOM_LOGINS } from "@/lib/swipe";
import type { UserSearchHit } from "@/lib/github/search";

interface Props {
  loading: boolean;
  error: string | null;
  scoutCount: number | null;
  oauthEnabled: boolean;
  onScout: (name: string) => void;
}

// Same grammar as lib/github/client.ts: alphanumerics + hyphens, 1–39 chars, at
// least one alphanumeric. A match submits straight to the username route; a
// "name" (spaces etc.) submits via the first search suggestion instead.
const USERNAME_RE = /^(?=.*[a-z\d])[a-z\d-]{1,39}$/i;

const exampleClass =
  "cursor-pointer font-mono text-ink-soft underline decoration-brand/40 underline-offset-[3px] transition hover:text-brand";

const AVATAR_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23e8dfcd"/><circle cx="32" cy="26" r="12" fill="%23cfc4a8"/><rect x="14" y="44" width="36" height="28" rx="14" fill="%23cfc4a8"/></svg>',
  );

const GITHUB_MARK = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.14c0 .3.21.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
);

export default function ScoutForm({ loading, error, scoutCount, oauthEnabled, onScout }: Props) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  // Latest search round, tagged with the query it was run for. Render derives
  // "show suggestions" from results.q === current query, so a keystroke that
  // leaves the round stale never shows it — no sync clears needed in the effect.
  const [results, setResults] = useState<{ q: string; hits: UserSearchHit[]; searching: boolean }>({
    q: "",
    hits: [],
    searching: false,
  });
  const wrapRef = useRef<HTMLDivElement>(null);
  const q = name.trim().replace(/^@/, "");
  const matching = results.q === q && q.length >= 2 && !USERNAME_RE.test(q);

  // Debounced by-name search: fires only while the input is focused and holds a
  // non-username-shaped query (real usernames already navigate on Enter).
  useEffect(() => {
    if (q.length < 2 || USERNAME_RE.test(q)) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setResults((prev) => ({ ...prev, searching: true }));
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { hits?: UserSearchHit[] };
        if (!cancelled) setResults({ q, hits: data.hits ?? [], searching: false });
      } catch {
        if (!cancelled) setResults({ q, hits: [], searching: false });
      }
    }, 260);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q) return;
    if (USERNAME_RE.test(q)) return onScout(q);
    if (results.hits[0]) return onScout(results.hits[0].login);
    onScout(q); // not a username and no suggestion — let the 404 page handle it
  };

  const pick = (login: string) => {
    setOpen(false);
    onScout(login);
  };

  const surprise = () => {
    const login = RANDOM_LOGINS[Math.floor(Math.random() * RANDOM_LOGINS.length)];
    if (login) onScout(login);
  };

  const showList = open && (results.searching || (matching && results.hits.length > 0));

  return (
    <div className="min-w-0 flex-1">
      {/* the brand face — the logo from the README */}
      <div className="mb-3 flex items-center gap-3 max-[860px]:justify-center">
        <Image
          src="/logo.png"
          alt="GitTinder"
          width={1162}
          height={1354}
          priority
          className="h-10 w-auto"
        />
        <GitHubLink />
        <ThemeToggle />
      </div>

      <div className="mb-[18px] inline-flex items-center gap-[9px] rounded-[8px] border border-line bg-surface/60 px-[12px] py-[6px] max-[860px]:mx-auto">
        <span className="font-mono text-[10.5px] font-semibold tracking-[.18em] text-ink-soft">
          GITHUB
        </span>
        <span className="font-display mt-[1px] text-[15px] leading-none text-brand">×</span>
        <span className="font-display text-[15px] leading-none tracking-[.06em] text-ink">
          TINDER
        </span>
      </div>

      <h1 className="font-display m-0 mb-3 text-[clamp(52px,7vw,100px)] leading-[.82] tracking-[.005em]">
        One GitHub username. <br /> One dating <span className="gt-flame-text">profile.</span>
      </h1>
      <p className="mb-[10px] max-w-[440px] text-[clamp(15px,1.7vw,18px)] font-medium leading-[1.5] text-ink-dim max-[860px]:mx-auto">
        Rated 0–99, complete with a bio, passions and a tier
      </p>
      <p className="font-display mb-[26px] text-[clamp(17px,2vw,22px)] font-bold tracking-[.02em] text-brand">
        is it a match?
      </p>

      <form
        onSubmit={submit}
        className="m-0 flex max-w-[460px] flex-wrap gap-[10px] max-[860px]:mx-auto"
      >
        <div
          ref={wrapRef}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
          }}
          className="relative min-w-[200px] flex-1"
        >
          <span className="font-mono pointer-events-none absolute left-[18px] top-1/2 -translate-y-1/2 text-[17px] font-semibold text-brand/70">
            @
          </span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="github username or name"
            autoComplete="off"
            spellCheck={false}
            role="combobox"
            aria-expanded={showList}
            aria-controls="gt-search-listbox"
            aria-autocomplete="list"
            aria-label="GitHub username or name"
            className="font-mono h-14 w-full rounded-[14px] border-[1.5px] border-line bg-surface/70 pl-[34px] pr-5 text-[16px] font-medium text-ink outline-none backdrop-blur-[4px] transition focus:border-brand focus:bg-surface focus:shadow-[0_0_0_4px_rgba(255,70,85,.14),0_0_42px_rgba(255,70,85,.18)]"
          />
          {showList && (
            <ul
              id="gt-search-listbox"
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 animate-pop overflow-hidden rounded-[12px] border border-line bg-panel shadow-[0_18px_50px_rgba(25,21,33,.18)]"
            >
              {results.searching && results.hits.length === 0 && (
                <li className="px-[14px] py-[11px] text-[12.5px] text-ink-mute">
                  scouting names…
                </li>
              )}
              {results.hits.map((s) => (
                <li key={s.login}>
                  <button
                    type="button"
                    role="option"
                    aria-selected
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pick(s.login);
                    }}
                    className="flex w-full items-center gap-[10px] px-[12px] py-[8px] text-left transition hover:bg-surface-2"
                  >
                    <img
                      src={s.avatarUrl ?? AVATAR_FALLBACK}
                      alt=""
                      aria-hidden
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = AVATAR_FALLBACK;
                      }}
                      className="h-[30px] w-[30px] shrink-0 rounded-full border border-line bg-surface-2 object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-semibold leading-tight text-ink">
                        {s.name ?? s.login}
                      </span>
                      <span className="font-mono block truncate text-[11px] text-ink-faint">
                        @{s.login}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="font-display gt-flame group flex h-14 items-center gap-2 rounded-[14px] px-7 text-[20px] tracking-[.06em] text-white disabled:cursor-wait disabled:opacity-75"
        >
          {loading ? "MATCHING…" : "MATCH ME"}
          {!loading && (
            <ArrowRight
              size={19}
              strokeWidth={2.6}
              className="transition-transform group-hover:translate-x-0.5"
            />
          )}
        </button>
      </form>

      <div className="mt-[12px] flex flex-wrap items-center gap-[10px] max-[860px]:justify-center">
        {oauthEnabled && (
          // API route that 302s to GitHub — a Link would prefetch the OAuth
          // dance, so keep it a plain GET anchor.
          // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a
            href="/api/auth/login"
            className="inline-flex h-[40px] items-center gap-[8px] rounded-[12px] border border-line bg-surface/60 px-[14px] text-[12.5px] font-semibold tracking-[.01em] text-ink-soft transition hover:border-brand hover:text-brand"
          >
            {GITHUB_MARK}
            Match your own GitHub
          </a>
        )}
        <button
          type="button"
          onClick={surprise}
          disabled={loading}
          className="inline-flex h-[40px] items-center gap-[8px] rounded-[12px] border border-line bg-surface/60 px-[14px] text-[12.5px] font-semibold tracking-[.01em] text-ink-soft transition hover:border-brand hover:text-brand disabled:cursor-wait disabled:opacity-75"
        >
          <Shuffle size={15} strokeWidth={2.4} />
          Surprise me
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-[13px] max-w-[460px] rounded-[10px] border border-[#d02a35]/30 bg-[#d02a35]/10 px-[13px] py-[10px] text-[13.5px] font-medium text-[#b3262f]"
        >
          {error}
        </div>
      )}

      <div className="mt-[14px] text-[13px] text-ink-mute">
        try{" "}
        {SAMPLE_LOGINS.slice(0, 2).map((login, i) => (
          <span key={login}>
            {i > 0 && " · "}
            <button type="button" onClick={() => onScout(login)} className={exampleClass}>
              {login}
            </button>
          </span>
        ))}{" "}
        · or your own
      </div>

      <div className="mt-[20px] flex flex-wrap items-center gap-x-[14px] gap-y-[10px] max-[860px]:justify-center">
        {scoutCount != null && (
          <span className="inline-flex items-baseline gap-[9px]">
            <span className="relative flex h-[7px] w-[7px] translate-y-[-1px] self-center" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-brand" />
            </span>
            <span className="font-display relative text-[20px] leading-none tabular-nums text-ink">
              {scoutCount.toLocaleString("en-US")}
            </span>
            <span className="text-[12px] text-ink-mute">profiles matched</span>
          </span>
        )}
      </div>
    </div>
  );
}
