"use client";

// Footer credit — the GitTinder line, shared by home and profile footers.
export default function FooterCredit() {
  return (
    <div className="relative inline-flex max-w-full items-center justify-center">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[-18px] inset-y-[-6px] rounded-full bg-bg-deep/70 blur-[10px]"
      />
      <div className="relative flex flex-wrap items-center justify-center gap-x-[clamp(3px,1.4vw,6px)] gap-y-[4px] text-[length:clamp(9px,2.7vw,13.5px)] font-semibold leading-none text-ink-soft">
        <span className="text-ink-mute">Made with</span>
        <span className="text-[#ff3d7f]">♥</span>
        <span className="text-ink-mute">from GitHub profiles ·</span>
        <span className="text-ink-dim">not a real dating app — your commits are.</span>
      </div>
    </div>
  );
}
