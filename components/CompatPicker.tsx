"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SAMPLE_LOGINS } from "@/lib/github/samples";

const inputClass =
  "font-mono h-14 w-full rounded-[14px] border-[1.5px] border-line bg-surface/70 pl-[34px] pr-5 text-[16px] font-medium text-ink outline-none backdrop-blur-[4px] transition focus:border-brand focus:bg-surface focus:shadow-[0_0_0_4px_rgba(255,70,85,.14),0_0_42px_rgba(255,70,85,.18)]";

// Two username fields -> push to /vs/a/b. Used on the /vs landing and the
// "NEW PAIR" flow so you can start over from any page.
export default function CompatPicker({ initial }: { initial?: string[] }) {
  const router = useRouter();
  const [a, setA] = useState(initial?.[0] ?? "");
  const [b, setB] = useState(initial?.[1] ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const loginA = a.trim().replace(/^@/, "");
    const loginB = b.trim().replace(/^@/, "");
    if (!loginA || !loginB) return;
    router.push(`/vs/${encodeURIComponent(loginA)}/${encodeURIComponent(loginB)}`);
  };

  const field = (
    value: string,
    setValue: (v: string) => void,
    label: string,
    placeholder: string
  ) => (
    <div className="relative min-w-[190px] flex-1">
      <span className="font-mono pointer-events-none absolute left-[18px] top-1/2 -translate-y-1/2 text-[17px] font-semibold text-brand/70">
        @
      </span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-label={label}
        className={inputClass}
      />
    </div>
  );

  return (
    <div>
      <form
        onSubmit={submit}
        className="mx-auto flex w-full max-w-[560px] flex-wrap items-center justify-center gap-[10px]"
      >
        {field(a, setA, "First GitHub username", "username one")}
        <span className="font-display text-[20px] leading-none text-brand">×</span>
        {field(b, setB, "Second GitHub username", "username two")}
        <button
          type="submit"
          className="font-display gt-flame group flex h-14 items-center gap-2 rounded-[14px] px-7 text-[20px] tracking-[.06em] text-white"
        >
          CHECK
          <ArrowRight
            size={19}
            strokeWidth={2.6}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </form>

      <div className="mt-[14px] flex flex-wrap items-center justify-center gap-x-[6px] gap-y-[6px] text-[13px] text-ink-mute">
        <span>try</span>
        {SAMPLE_LOGINS.slice(0, 2).map((login, i) => (
          <span key={login}>
            {i > 0 && <span className="mx-[2px]">·</span>}
            <button
              type="button"
              className="cursor-pointer font-mono text-ink-soft underline decoration-brand/40 underline-offset-[3px] transition hover:text-brand"
              onClick={() => {
                setA(SAMPLE_LOGINS[0]);
                setB(login === SAMPLE_LOGINS[0] ? SAMPLE_LOGINS[1] : login);
              }}
            >
              {login}
            </button>
          </span>
        ))}
        <span>…or any two usernames</span>
      </div>
    </div>
  );
}
