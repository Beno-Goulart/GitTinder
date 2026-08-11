"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import type { UserSearchHit } from "@/lib/github/search";

// Same grammar as lib/github/client.ts: alphanumerics + hyphens, 1–39 chars, at
// least one alphanumeric. A username-shaped query skips the debounced search
// (it's already a login); anything else is treated as a name and searched.
const USERNAME_RE = /^(?=.*[a-z\d])[a-z\d-]{1,39}$/i;

const AVATAR_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23e8dfcd"/><circle cx="32" cy="26" r="12" fill="%23cfc4a8"/><rect x="14" y="44" width="36" height="28" rx="14" fill="%23cfc4a8"/></svg>',
  );

const inputClass =
  "font-mono h-14 w-full rounded-[14px] border-[1.5px] border-line bg-surface/70 pl-[34px] pr-5 text-[16px] font-medium text-ink outline-none backdrop-blur-[4px] transition focus:border-brand focus:bg-surface focus:shadow-[0_0_0_4px_rgba(255,70,85,.14),0_0_42px_rgba(255,70,85,.18)]";

export interface UserSearchInputHandle {
  /** Resolve a raw value to a login: usernames pass through as-is, real names
   *  resolve via the last search round (first hit). Null when unresolvable —
   *  the caller keeps the raw value and lets the route 404. */
  resolve: (value: string) => string | null;
}

// Reusable "username or name" field with debounced by-name suggestions. Used by
// the home scout form's sibling flows (compat picker) so name search works
// everywhere. The field is controlled; suggestions resolve into `value` as the
// chosen login.
const UserSearchInput = forwardRef<UserSearchInputHandle, {
  value: string;
  onValueChange: (v: string) => void;
  label: string;
  placeholder: string;
}>(function UserSearchInput({ value, onValueChange, label, placeholder }, ref) {
  const [open, setOpen] = useState(false);
  // Latest search round, tagged with the query it was run for. Render derives
  // "show suggestions" from results.q === current query, so a keystroke that
  // leaves the round stale never shows it — no sync clears needed.
  const [results, setResults] = useState<{ q: string; hits: UserSearchHit[]; searching: boolean }>({
    q: "",
    hits: [],
    searching: false,
  });
  const resultsRef = useRef(results);
  resultsRef.current = results;
  const wrapRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const q = value.trim().replace(/^@/, "");
  const matching = results.q === q && q.length >= 2 && !USERNAME_RE.test(q);

  useImperativeHandle(ref, () => ({
    resolve: (raw: string) => {
      const v = raw.trim().replace(/^@/, "");
      if (!v) return null;
      if (USERNAME_RE.test(v)) return v;
      const round = resultsRef.current;
      return round.q === v && round.hits[0] ? round.hits[0].login : null;
    },
  }));

  // Debounced by-name search: fires only while the input is focused and holds a
  // non-username-shaped query.
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

  const showList = open && (results.searching || (matching && results.hits.length > 0));

  return (
    <div
      ref={wrapRef}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      className="relative min-w-[190px] flex-1"
    >
      <span className="font-mono pointer-events-none absolute left-[18px] top-1/2 -translate-y-1/2 text-[17px] font-semibold text-brand/70">
        @
      </span>
      <input
        value={value}
        onChange={(e) => {
          onValueChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-label={label}
        className={inputClass}
      />
      {showList && (
        <ul
          id={listboxId}
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
                  onValueChange(s.login);
                  setOpen(false);
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
  );
});

export default UserSearchInput;
