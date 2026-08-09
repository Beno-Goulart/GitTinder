"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { HeartHandshake } from "lucide-react";
import { SAMPLE_LOGINS } from "@/lib/github/samples";

interface Props {
  loading: boolean;
  error: string | null;
  scoutCount: number | null;
  onScout: (name: string) => void;
}

const exampleClass =
  "cursor-pointer font-mono text-ink-soft underline decoration-[#ff3d7f]/40 underline-offset-[3px] transition hover:text-[#ff6fb2]";

export default function ScoutForm({ loading, error, scoutCount, onScout }: Props) {
  const [name, setName] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onScout(name);
  };

  return (
    <div className="min-w-0 flex-1">
      {/* the brand face — a beating heart where the mascot used to be */}
      <div className="mb-3 flex items-center gap-3 max-[860px]:justify-center">
        <HeartHandshake size={30} strokeWidth={2} className="text-[#ff3d7f]" />
        <span className="font-display text-[17px] tracking-[.1em] text-ink-soft">
          GITTINDER
        </span>
      </div>

      <div className="mb-[18px] inline-flex items-center gap-[9px] rounded-[8px] border border-white/[0.08] bg-white/[0.025] px-[12px] py-[6px] max-[860px]:mx-auto">
        <span className="font-mono text-[10.5px] font-semibold tracking-[.18em] text-ink-soft">
          GITHUB
        </span>
        <span className="font-display mt-[1px] text-[15px] leading-none text-[#ff3d7f]">×</span>
        <span className="font-display text-[15px] leading-none tracking-[.06em] text-ink">
          TINDER
        </span>
      </div>

      <h1 className="font-display m-0 mb-3 text-[clamp(52px,7vw,100px)] leading-[.82] tracking-[.005em]">
        FIND YOUR&nbsp;<span className="text-[#ff3d7f]">MATCH</span>.
      </h1>
      <p className="mb-[26px] max-w-[440px] text-[clamp(15px,1.7vw,18px)] font-medium leading-[1.5] text-ink-dim max-[860px]:mx-auto">
        One GitHub username. One dating profile. Rated 0–99, complete with a bio,
        passions and a tier — is it a match?
      </p>

      <form
        onSubmit={submit}
        className="m-0 flex max-w-[460px] flex-wrap gap-[10px] max-[860px]:mx-auto"
      >
        <div className="relative min-w-[200px] flex-1">
          <span className="font-mono pointer-events-none absolute left-[18px] top-1/2 -translate-y-1/2 text-[17px] font-semibold text-[#ff3d7f]/70">
            @
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="github username"
            autoComplete="off"
            spellCheck={false}
            aria-label="GitHub username"
            className="font-mono h-14 w-full rounded-[14px] border-[1.5px] border-line bg-surface/70 pl-[34px] pr-5 text-[16px] font-medium text-white outline-none backdrop-blur-[4px] transition focus:border-[#ff3d7f] focus:bg-surface focus:shadow-[0_0_0_4px_rgba(255,61,127,.16),0_0_42px_rgba(255,61,127,.24)]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="font-display group flex h-14 items-center gap-2 rounded-[14px] bg-gradient-to-b from-[#ff5c93] to-[#ff3d7f] px-7 text-[20px] tracking-[.06em] text-white shadow-[0_0_0_1px_rgba(255,61,127,.4),0_10px_30px_rgba(255,61,127,.3)] transition hover:from-[#ff77a6] hover:to-[#ff3d7f] disabled:cursor-wait disabled:opacity-75"
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

      {error && (
        <div
          role="alert"
          className="mt-[13px] max-w-[460px] rounded-[10px] border border-[#f85149]/30 bg-[#f85149]/10 px-[13px] py-[10px] text-[13.5px] font-medium text-[#ff9d96]"
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
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff3d7f] opacity-60" />
              <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-[#ff3d7f]" />
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
