"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { Heart, X } from "lucide-react";
import type { CardProfile } from "@/lib/dating/types";
import DatingCard from "./DatingCard";

// A single draggable card in the swipe deck. Drag right = like, left = nope;
// release beyond the threshold settles the swipe and calls onDecision. The
// like/nope buttons below trigger the same settle through the imperative handle.

const THRESHOLD = 96;

export interface DeckCardHandle {
  swipe: (like: boolean) => void;
}

interface CardProps {
  profile: CardProfile;
  onDecision: (like: boolean) => void;
  onOpen: (login: string) => void;
}

const DeckCard = forwardRef<DeckCardHandle, CardProps>(function DeckCard(
  { profile, onDecision, onOpen },
  ref,
) {
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const settled = useRef(false);

  const offset = drag ? drag.x : 0;
  const tilt = Math.max(-14, Math.min(14, offset / 22));
  const like = offset > 40;

  const settle = (like: boolean) => {
    if (settled.current) return;
    settled.current = true;
    dragging.current = false;
    setDrag({ x: like ? 900 : -900, y: 0 });
    window.setTimeout(() => onDecision(like), 320);
  };

  useImperativeHandle(ref, () => ({
    swipe: (like: boolean) => settle(like),
  }));

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (settled.current) return;
    dragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (drag && Math.abs(drag.x) > THRESHOLD) {
      settle(drag.x > 0);
    } else {
      setDrag(null);
    }
  };

  return (
    <div
      className="absolute inset-0"
      style={{
        // Fixed z-index above the stack echoes: with a large deck, `20 - index`
        // goes negative and the card paints behind the (z-auto) echo tiles —
        // they show as a white wash over the card and swallow the pointer drag.
        zIndex: 10,
        transform: drag ? `translate(${drag.x}px, ${drag.y * 0.35}px) rotate(${tilt}deg)` : "none",
        transition: drag ? "none" : "transform .35s cubic-bezier(.2,.8,.2,1)",
        pointerEvents: drag ? "none" : "auto",
        touchAction: "none",
      }}
    >
      {drag && Math.abs(offset) > 18 && (
        <div
          className={`pointer-events-none absolute left-4 top-5 z-30 rounded-xl border-4 px-3 py-1 font-display text-2xl tracking-widest ${
            like ? "border-[#34d87b] text-[#34d87b] rotate-[-12deg]" : "border-[#fb5c66] text-[#fb5c66] rotate-[12deg]"
          }`}
          style={{ animation: "gt-pop .16s cubic-bezier(.16,1,.3,1) both" }}
        >
          {like ? "LIKE" : "NOPE"}
        </div>
      )}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => onOpen(profile.login)}
        className="h-full cursor-grab active:cursor-grabbing"
      >
        <DatingCard profile={profile} />
      </div>
    </div>
  );
});

// The swipe deck: like / nope the profiles you've scouted. Positioned under the
// report's radar — a reminder the profile is swipeable, not just a stat sheet.
export default function SwipeDeck({
  profiles,
  onOpen,
  onSwipe,
}: {
  profiles: CardProfile[];
  onOpen: (login: string) => void;
  onSwipe?: (login: string, like: boolean) => void;
}) {
  const [queue, setQueue] = useState(profiles);
  const [verdicts, setVerdicts] = useState<{ login: string; like: boolean }[]>([]);
  const topRef = useRef<DeckCardHandle | null>(null);

  if (queue.length === 0) {
    return (
      <div className="rounded-[18px] border border-line bg-surface/60 p-6 text-center text-[14px] text-ink-mute">
        {verdicts.length > 0 ? (
          <>
            You rated {verdicts.length} {verdicts.length === 1 ? "profile" : "profiles"}{" "}
            — {verdicts.filter((v) => v.like).length} like
            {verdicts.filter((v) => v.like).length === 1 ? "" : "s"}.
            <div className="mt-2">
              <button
                type="button"
                onClick={() => {
                  setQueue(profiles);
                  setVerdicts([]);
                }}
                className="font-display cursor-pointer text-[13px] tracking-[.16em] text-brand hover:text-brand-deep"
              >
                SHUFFLE AGAIN
              </button>
            </div>
          </>
        ) : (
          "No profiles in the deck yet."
        )}
      </div>
    );
  }

  const top = queue[queue.length - 1];

  return (
    <div className="relative w-full">
      <div className="relative mx-auto aspect-[5/7] w-[min(340px,72vw)]">
        {/* stack echo — next cards peeking behind the top one */}
        {queue.slice(-4, -1).map((p, i) => (
          <div
            key={p.login}
            className="pointer-events-none absolute inset-0 rounded-[10cqw] border border-line bg-surface/40"
            style={{
              transform: `scale(${1 - (i + 1) * 0.035}) translateY(${(i + 1) * 10}px)`,
              opacity: 0.4 - i * 0.1,
              zIndex: 1,
            }}
            aria-hidden
          />
        ))}
        {queue.length > 1 && (
          <div className="font-display absolute right-2 top-2 z-30 rounded-full bg-black/40 px-3 py-1 text-[12px] tracking-widest text-white/80">
            {queue.length} LEFT
          </div>
        )}
        <DeckCard
          ref={topRef}
          key={top.login}
          profile={top}
          onDecision={(like) => {
            setVerdicts((v) => [...v, { login: top.login, like }]);
            setQueue((q) => q.slice(0, -1));
            onSwipe?.(top.login, like);
          }}
          onOpen={onOpen}
        />
      </div>

      {/* action row — nope / like */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => topRef.current?.swipe(false)}
          aria-label="Nope"
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#fb5c66]/70 text-[#fb5c66] transition hover:scale-110 hover:bg-[#fb5c66]/10 active:scale-95"
        >
          <X size={26} strokeWidth={2.6} />
        </button>
        <button
          type="button"
          onClick={() => topRef.current?.swipe(true)}
          aria-label="Like"
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#34d87b]/70 text-[#34d87b] transition hover:scale-110 hover:bg-[#34d87b]/10 active:scale-95"
        >
          <Heart size={26} strokeWidth={2.6} className="fill-[#34d87b]" />
        </button>
      </div>
      <style>{`@keyframes gt-pop{0%{transform:scale(.6);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
