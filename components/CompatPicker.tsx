"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import UserSearchInput, { type UserSearchInputHandle } from "./UserSearchInput";
import { SAMPLE_LOGINS } from "@/lib/github/samples";
import { useDict } from "@/lib/i18n/client";

// Two username-or-name fields -> push to /vs/a/b. Used on the /vs landing and
// the "NEW PAIR" flow so you can start over from any page. Each field does the
// same debounced by-name search as the home form (UserSearchInput); picking a
// suggestion fills the field with the login, and submit resolves any typed
// name via the field's latest search round.
export default function CompatPicker({ initial }: { initial?: string[] }) {
  const router = useRouter();
  const dict = useDict();
  const [a, setA] = useState(initial?.[0] ?? "");
  const [b, setB] = useState(initial?.[1] ?? "");
  const aRef = useRef<UserSearchInputHandle>(null);
  const bRef = useRef<UserSearchInputHandle>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const loginA = aRef.current?.resolve(a) ?? a.trim().replace(/^@/, "");
    const loginB = bRef.current?.resolve(b) ?? b.trim().replace(/^@/, "");
    if (!loginA || !loginB) return;
    router.push(`/vs/${encodeURIComponent(loginA)}/${encodeURIComponent(loginB)}`);
  };

  return (
    <div>
      <form
        onSubmit={submit}
        className="mx-auto flex w-full max-w-[560px] flex-wrap items-center justify-center gap-[10px]"
      >
        <UserSearchInput ref={aRef} value={a} onValueChange={setA} label={dict.ui.firstUsername} placeholder={dict.ui.usernameOne} />
        <span className="font-display text-[20px] leading-none text-brand">×</span>
        <UserSearchInput ref={bRef} value={b} onValueChange={setB} label={dict.ui.secondUsername} placeholder={dict.ui.usernameTwo} />
        <button
          type="submit"
          className="font-display gt-flame group flex h-14 items-center gap-2 rounded-[14px] px-7 text-[20px] tracking-[.06em] text-white"
        >
          {dict.ui.check}
          <ArrowRight
            size={19}
            strokeWidth={2.6}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </form>

      <div className="mt-[14px] flex flex-wrap items-center justify-center gap-x-[6px] gap-y-[6px] text-[13px] text-ink-mute">
        <span>{dict.ui.try}</span>
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
        <span>{dict.ui.orAnyTwo}</span>
      </div>
    </div>
  );
}
