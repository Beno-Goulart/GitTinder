"use client";

import { useState } from "react";
import type { DatingProfile } from "@/lib/dating/types";
import DatingCard from "./DatingCard";

// The home showcase: a fanned stack of sample dating cards (real GitHub
// accounts, baked once). Hover spreads them, clicking one scouts the real
// profile. The fan (closed / spread) echoes a hand holding dating profiles.

const ANGLE = 7;
const SPREAD_CLOSED = 92;
const SPREAD_OPEN = 128;

interface Props {
  cards: DatingProfile[];
  onPick: (login: string) => void;
}

export default function SampleDeck({ cards, onPick }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const center = (cards.length - 1) / 2;

  return (
    <div className="relative flex min-w-0 flex-[1.12] items-center justify-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center max-[1120px]:hidden"
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
        onMouseLeave={() => {
          setOpen(false);
          setHover(null);
        }}
        className="relative h-[430px] w-[min(640px,98%)] max-[1120px]:flex max-[1120px]:h-auto max-[1120px]:w-full max-[1120px]:flex-col max-[1120px]:items-center max-[1120px]:gap-[22px]"
      >
        {cards.map((card, i) => {
          const off = i - center;
          const hovered = hover === i;
          const rot = open ? 0 : off * ANGLE;
          const tx = (open ? SPREAD_OPEN : SPREAD_CLOSED) * off;
          const ty = hovered ? -36 : open ? -4 : Math.abs(off) * 14;
          const sc = hovered ? 1.05 : 1;
          return (
            <div
              key={card.login}
              onClick={() => onPick(card.login)}
              onMouseEnter={() => {
                setHover(i);
                setOpen(true);
              }}
              onMouseLeave={() => setHover(null)}
              className="absolute left-1/2 top-[18px] w-[220px] origin-bottom cursor-pointer transition-transform duration-[450ms] ease-[cubic-bezier(.2,.8,.2,1)] max-[1120px]:static max-[1120px]:w-[min(260px,66vw)] max-[1120px]:!transform-none max-[1120px]:!z-auto"
              style={{
                transform: `translateX(-50%) translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${sc})`,
                zIndex: hovered ? 60 : 40 - i * 5,
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
