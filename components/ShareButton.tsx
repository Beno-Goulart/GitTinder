"use client";

import { useCallback, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useDict } from "@/lib/i18n/client";

// A share button that prefers the native Web Share sheet and falls back to
// copying the absolute URL to the clipboard (with a brief "COPIED" state).
// `path` is a site-relative route like "/akitaonrails" or "/vs/a/b".

interface Props {
  path: string;
  label?: string;
  title?: string;
  text?: string;
  variant?: "flame" | "ghost";
  className?: string;
}

export default function ShareButton({
  path,
  label,
  title,
  text,
  variant = "ghost",
  className,
}: Props) {
  const dict = useDict();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handle = useCallback(async () => {
    const url = new URL(path, window.location.href).href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // aborted by the user or unsupported — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }, [path, title, text]);

  const Icon = copied ? Check : Share2;
  const base = "font-display inline-flex items-center gap-2 transition";
  const style =
    variant === "flame"
      ? "gt-flame rounded-[12px] px-6 py-3 text-[15px] tracking-[.06em] text-white"
      : "rounded-[12px] border border-line bg-surface/60 px-5 py-3 text-[13px] tracking-[.1em] text-ink-soft hover:border-ink/30 hover:text-brand";

  return (
    <button type="button" onClick={handle} className={`${base} ${style} ${className ?? ""}`}>
      <Icon size={variant === "flame" ? 15 : 14} aria-hidden />
      {copied ? dict.ui.copied : (label ?? dict.ui.share)}
    </button>
  );
}
