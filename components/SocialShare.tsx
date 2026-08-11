"use client";

// X / LinkedIn share buttons — the sharing half of the "spread the verdict"
// loop. They open the network's share composer with the card link (score
// embedded in the share text) pre-filled, so a scout becomes a challenge.

const X_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
  </svg>
);

const LINKEDIN_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
  </svg>
);

interface Props {
  path: string;
  title: string;
  text: string;
  className?: string;
}

export default function SocialShare({ path, title, text, className }: Props) {
  const absoluteUrl = () => new URL(path, window.location.href).href;

  const shareX = () => {
    const url = absoluteUrl();
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const shareLinkedIn = () => {
    const url = absoluteUrl();
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const base =
    "font-display inline-flex items-center gap-2 rounded-[12px] border border-line bg-surface/60 px-5 py-3 text-[13px] tracking-[.1em] text-ink-soft transition hover:border-ink/30 hover:text-brand";

  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className ?? ""}`}>
      <button type="button" onClick={shareX} className={base} title={title}>
        {X_ICON}
        SHARE ON X
      </button>
      <button type="button" onClick={shareLinkedIn} className={base} title={title}>
        {LINKEDIN_ICON}
        SHARE ON LINKEDIN
      </button>
    </div>
  );
}
