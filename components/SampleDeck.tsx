"use client";

import { useEffect, useRef, useState } from "react";
import type { DatingProfile } from "@/lib/dating/types";
import DatingCard from "./DatingCard";

// The home showcase: a cover-flow fan of sample dating cards (real GitHub
// accounts, baked once). The hero card sits front and center; the rest fan out
// behind it, rotated gently and overlapping so each neighbour still shows a real
// chunk of content. Hovering a card lifts it up and fans the deck open; clicking
// one scouts the real profile.

const MAX_CARD_W = 196; // desktop: largest card width
const DECK_RATIO = 0.34; // desktop: card width as a share of the deck's width
const COMPACT_MAX_W = 176;
const COMPACT_RATIO = 0.46; // compact (≤860px): bigger hero card, tighter fan

// Fan geometry per distance from the hero card, in card-width units. `x` is how
// far the card slides sideways, `rot` the tilt, `ty` the vertical drop and
// `scale`/`z` keep the hero card dominant.
const TUCKS = {
  wide: {
    0: { x: 0, rot: 0, scale: 1.05, z: 80, ty: 0 },
    1: { x: 0.58, rot: 5, scale: 0.92, z: 66, ty: 12 },
    2: { x: 0.98, rot: 8, scale: 0.86, z: 52, ty: 28 },
    3: { x: 1.32, rot: 10, scale: 0.82, z: 40, ty: 40 },
  },
  compact: {
    0: { x: 0, rot: 0, scale: 1.05, z: 80, ty: 0 },
    1: { x: 0.34, rot: 5, scale: 0.9, z: 66, ty: 8 },
    2: { x: 0.56, rot: 8, scale: 0.84, z: 52, ty: 18 },
    3: { x: 0.72, rot: 10, scale: 0.8, z: 40, ty: 26 },
  },
} as const;

const OPEN_SPREAD = 1.12; // how far neighbours push out while the deck is open

interface Props {
  cards: DatingProfile[];
  onPick: (login: string) => void;
}

export default function SampleDeck({ cards, onPick }: Props) {
  const center = Math.max(0, Math.floor((cards.length - 1) / 2));
  const [hover, setHover] = useState<number | null>(null);
  const [cardW, setCardW] = useState<number>(190);
  const [compact, setCompact] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 860px)").matches,
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const applyCompact = () => setCompact(mq.matches);
    applyCompact();
    mq.addEventListener("change", applyCompact);

    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      setCardW(
        compact
          ? Math.min(COMPACT_MAX_W, w * COMPACT_RATIO)
          : Math.min(MAX_CARD_W, w * DECK_RATIO),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      mq.removeEventListener("change", applyCompact);
      ro.disconnect();
    };
  }, [compact]);

  const tucks = compact ? TUCKS.compact : TUCKS.wide;
  const open = hover !== null;

  return (
    <div className="relative flex min-w-0 flex-[1.35] items-center justify-center max-[860px]:w-full">
      {/* backdrop motif — faint ring + %% watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center max-[860px]:hidden"
      >
        <div className="absolute aspect-square w-[min(330px,76%)] rounded-full border border-ink/[0.07]" />
        <div
          className="font-display font-black leading-[.8] text-transparent"
          style={{
            fontSize: "clamp(170px,22vw,300px)",
            WebkitTextStroke: "1.4px rgba(25,21,33,.06)",
          }}
        >
          %%
        </div>
      </div>

      <div
        ref={ref}
        onMouseLeave={() => setHover(null)}
        className="relative w-full"
        style={{ height: cardW * 1.8 }}
      >
        {cards.map((card, i) => {
          const off = i - center;
          const mag = Math.min(Math.abs(off), 3);
          const dir = off < 0 ? -1 : off > 0 ? 1 : 0;
          const t = tucks[mag as keyof typeof tucks];
          const hovered = hover === i;
          const spread = !hovered && open ? OPEN_SPREAD : 1;
          const filter = hovered
            ? "none"
            : open
              ? "saturate(.5) brightness(.85)"
              : mag === 0
                ? "none"
                : "saturate(.8) brightness(.95)";
          return (
            <div
              key={card.login}
              onClick={() => onPick(card.login)}
              onMouseEnter={() => setHover(i)}
              onTouchStart={() => setHover(i)}
              className="absolute left-1/2 top-1/2 cursor-pointer select-none outline-none"
              style={{
                width: cardW,
                transform: `translate(-50%, -50%) translate(${dir * t.x * cardW * spread}px, ${t.ty - (hovered ? 16 : 0)}px) rotate(${dir * t.rot}deg) scale(${t.scale * (hovered ? 1.1 : 1)})`,
                zIndex: hovered ? 90 : t.z,
                transition:
                  "transform 550ms cubic-bezier(.2,.8,.2,1), filter 350ms ease",
                filter,
              }}
            >
              <DatingCard profile={card} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
