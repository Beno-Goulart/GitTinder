"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Check, Copy } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useDict } from "@/lib/i18n/client";
import { fmt } from "@/lib/i18n/dicts";

// A copyable HTML snippet for embedding a profile's GitTinder card anywhere —
// an <img> pointing at gittinder.com/<user>.png (the Satori-rendered card PNG).
// `origin` is resolved on the client so dev/preview links point at themselves;
// useSyncExternalStore keeps the server snapshot and the first client render
// identical (no hydration mismatch), then swaps in the real origin after mount.
// The snippet honors the visitor's theme: copying it in dark mode emits
// ?theme=dark so the embedded card matches.

interface Props {
  login: string;
  name?: string;
}

const subscribe = () => () => {};
const getServerOrigin = () => "https://gittinder.com";

export default function EmbedSnippet({ login, name }: Props) {
  const dict = useDict();
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(subscribe, () => window.location.origin, getServerOrigin);
  const dark = useTheme();

  const snippet = useMemo(() => {
    const alt = fmt(dict.ui.ratedOn, { name: name || login });
    const theme = dark ? "?theme=dark" : "";
    return `<img src="${origin}/${encodeURIComponent(login)}.png${theme}" alt="${alt}" width="405" height="567" />`;
  }, [login, name, origin, dark, dict]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
    } catch {
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface/70">
      <div className="flex items-center justify-between gap-2 border-b border-line px-[12px] py-[8px]">
        <span className="font-mono text-[10.5px] font-semibold tracking-[.18em] text-ink-faint">
          {dict.ui.putACardOnIt}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex cursor-pointer items-center gap-[6px] text-[11.5px] font-semibold text-ink-soft transition hover:text-brand"
        >
          <span className="inline-flex items-center gap-[6px]">
            {copied ? <Check size={13} className="text-brand" aria-hidden /> : <Copy size={13} aria-hidden />}
            {copied ? dict.ui.copied : dict.ui.copy}
          </span>
        </button>
      </div>
      <pre className="m-0 overflow-x-auto px-[12px] py-[10px] text-[11.5px] leading-[1.5] text-ink-soft">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
