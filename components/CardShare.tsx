"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Download, Link2, Share2 } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

// The "SHARE THE CARD" control — a split button. The main half shares the card
// like before (native Web Share sheet when available, otherwise copy the URL);
// the caret opens the share options: copy the link or download the card image
// (the same PNG the embed uses, gittinder.com/<user>.png). The downloaded image
// follows the current theme — ?theme=dark when the app is in dark mode.

interface Props {
  path: string;
  title?: string;
  text?: string;
  login: string;
  className?: string;
}

export default function CardShare({ path, title, text, login, className }: Props) {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<null | "copied" | "saved">(null);
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dark = useTheme();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const flash = (kind: "copied" | "saved") => {
    setNotice(kind);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 2000);
  };

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    flash("copied");
  };

  const share = async () => {
    const url = new URL(path, window.location.href).href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // aborted or unsupported — fall through to copy
      }
    }
    await copyText(url);
  };

  const copyLink = () => copyText(new URL(path, window.location.href).href);

  const downloadImage = async () => {
    const url = new URL(
      `/${encodeURIComponent(login)}.png${dark ? "?theme=dark" : ""}`,
      window.location.href,
    ).href;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const obj = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = obj;
      a.download = `gittinder-${login}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(obj);
      flash("saved");
      setOpen(false);
    } catch {
      // render failed — keep the menu open and say nothing
    }
  };

  return (
    <div ref={root} className={`relative ${className ?? ""}`}>
      <div className="flex items-stretch rounded-[12px] border border-line bg-surface/60">
        <button
          type="button"
          onClick={share}
          className="font-display inline-flex items-center gap-2 px-5 py-3 text-[13px] tracking-[.1em] text-ink-soft transition hover:text-brand"
        >
          {notice === "copied" ? <Check size={14} className="text-brand" aria-hidden /> : <Share2 size={14} aria-hidden />}
          {notice === "copied" ? "COPIED" : "SHARE THE CARD"}
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="More share options"
          aria-expanded={open}
          className="border-l border-line px-[9px] text-ink-faint transition hover:text-brand"
        >
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
      </div>

      {open && (
        <div
          role="menu"
          className="animate-pop absolute right-0 top-[calc(100%+8px)] z-30 w-[220px] overflow-hidden rounded-[12px] border border-line bg-surface p-1 shadow-[0_16px_40px_rgba(20,10,30,.28)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            className="flex w-full cursor-pointer items-center gap-[10px] rounded-[8px] px-3 py-[9px] text-left text-[13px] font-medium text-ink-dim transition hover:bg-surface-2 hover:text-ink"
          >
            {notice === "copied" ? <Check size={15} className="text-brand" aria-hidden /> : <Link2 size={15} className="text-ink-faint" aria-hidden />}
            {notice === "copied" ? "Link copied" : "Copy link"}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={downloadImage}
            className="flex w-full cursor-pointer items-center gap-[10px] rounded-[8px] px-3 py-[9px] text-left text-[13px] font-medium text-ink-dim transition hover:bg-surface-2 hover:text-ink"
          >
            {notice === "saved" ? <Check size={15} className="text-brand" aria-hidden /> : <Download size={15} className="text-ink-faint" aria-hidden />}
            {notice === "saved" ? "Image saved" : "Download image"}
          </button>
        </div>
      )}
    </div>
  );
}
