"use client";

import { memo, type CSSProperties, type ReactEventHandler } from "react";
import { ShieldCheck } from "lucide-react";
import type { CardProfile } from "@/lib/dating/types";
import { profileTheme, rgba } from "@/lib/dating/theme";
import { logoSlugFor, languageLogoUrl } from "@/lib/github/languages";
import { cardDisplayName } from "@/lib/text";
import { CARD_CORNER_RADIUS, roundedCardMaskDataUri } from "@/lib/cardMask";
import { useDict } from "@/lib/i18n/client";
import { fmt } from "@/lib/i18n/dicts";

// The live Tinder-style card — photo up top, bio + interests over a paper
// plate at the bottom, the match score in a coral seal top-left, tier pill
// top-right. Positions are percentages of the card; font sizes are cqw
// (1cqw = 1% of card width) so the card scales with its container. The same
// layout is re-created server-side in lib/og/renderCard.tsx (Satori) for the
// shareable PNG.

const AVATAR_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="320" height="320" fill="%23e8dfcd"/><circle cx="160" cy="132" r="58" fill="%23cfc4a8"/><rect x="70" y="212" width="180" height="140" rx="72" fill="%23cfc4a8"/></svg>',
  );

const FONT_DISPLAY = "var(--font-bebas), 'Bebas Neue', sans-serif";
const FONT_COND = "var(--font-din-cond), 'Saira Condensed', sans-serif";
const FONT_BOLD = "var(--font-din-bold), 'Saira Condensed', sans-serif";
const FONT_MEDIUM = "var(--font-din-medium), 'Saira Condensed', sans-serif";

// The card reads the design tokens, so `.dark` re-tints the whole plate: paper
// becomes the plum panel, ink flips to the pale lavender. The photo and the
// coral seal are theme-agnostic on purpose.
const PAPER = "var(--color-panel)";
const INK = "var(--color-ink)";

const CARD_MASK = roundedCardMaskDataUri(810, 1134, Math.round(810 * CARD_CORNER_RADIUS));

// An interest chip's language logo, when the language has one in the catalog.
function interestLogo(name: string): string | null {
  const slug = logoSlugFor(name);
  return slug ? languageLogoUrl(slug) : null;
}

function DatingCard({ profile }: { profile: CardProfile }) {
  const dict = useDict();
  const t = profileTheme(profile);
  const displayName = cardDisplayName(profile.name || profile.login);

  const onAvatarError: ReactEventHandler<HTMLImageElement> = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = AVATAR_FALLBACK;
  };

  const wrap: CSSProperties = {
    containerType: "inline-size",
    position: "relative",
    width: "100%",
    aspectRatio: "5 / 7",
    borderRadius: 0,
    overflow: "hidden",
    background: PAPER,
    border: "1px solid color-mix(in srgb, var(--color-ink) 8%, transparent)",
    filter: `drop-shadow(0 7cqw 12cqw var(--gt-card-shadow)) drop-shadow(0 0 6cqw ${t.glow})`,
    maskImage: `url("${CARD_MASK}")`,
    WebkitMaskImage: `url("${CARD_MASK}")`,
    maskSize: "100% 100%",
    maskRepeat: "no-repeat",
    userSelect: "none",
    WebkitUserSelect: "none",
    WebkitTouchCallout: "none",
  };

  const at = (left: number, top: number): CSSProperties => ({
    position: "absolute",
    left: `${left}%`,
    top: `${top}%`,
  });

  const metaBits = [
    profile.height,
    fmt(dict.ui.reposLabel, { n: profile.repos }),
    ...(profile.location ? [profile.location.split(",")[0].trim()] : []),
  ].join(" · ");

  return (
    <div className="gittinder-card-frame" style={wrap}>
      {/* photo — full-bleed top */}
      <img
        src={profile.avatarUrl}
        onError={onAvatarError}
        onDragStart={(e) => e.preventDefault()}
        draggable={false}
        alt={profile.login}
        crossOrigin="anonymous"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "62%",
          objectFit: "cover",
          objectPosition: "50% 18%",
        }}
      />

      {/* paper plate — the bottom text zone fades to the panel color over the photo */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: "72%",
          background:
            "linear-gradient(to top, var(--color-panel) 0%, color-mix(in srgb, var(--color-panel) 98%, transparent) 34%, color-mix(in srgb, var(--color-panel) 92%, transparent) 52%, transparent 100%)",
        }}
      />

      {/* match score — coral seal, top left */}
      <div
        style={{
          ...at(5, 4.6),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "14.5cqw",
          height: "14.5cqw",
          borderRadius: "50%",
          background: "linear-gradient(180deg, #ff7a85 0%, #ff4655 100%)",
          boxShadow: "0 1.2cqw 3cqw rgba(255,70,85,.4), inset 0 1px 0 rgba(255,255,255,.35)",
        }}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: "7.4cqw", fontWeight: 400, lineHeight: 1, color: "#fff" }}>
          {profile.match}
        </div>
        <div
          style={{
            fontFamily: FONT_MEDIUM,
            fontSize: "2.2cqw",
            fontWeight: 700,
            letterSpacing: ".2em",
            color: "#fff",
            opacity: 0.92,
          }}
        >
          {dict.ui.match}
        </div>
      </div>

      {/* tier pill — top right */}
      <div
        style={{
          position: "absolute",
          top: "6.4%",
          right: "6%",
          display: "flex",
          alignItems: "center",
          alignSelf: "flex-start",
          padding: "1.1cqw 2.6cqw",
          borderRadius: "4cqw",
          border: `1px solid ${rgba(t.accent, 0.65)}`,
          background: "color-mix(in srgb, var(--color-panel) 88%, transparent)",
          backdropFilter: "blur(4px)",
          fontFamily: FONT_MEDIUM,
          fontSize: "2.9cqw",
          fontWeight: 700,
          letterSpacing: ".2em",
          color: t.accent,
          whiteSpace: "nowrap",
        }}
      >
        {dict.tiers[profile.tier]}
      </div>

      {/* name + age */}
      <div style={{ ...at(6.2, 57), display: "flex", alignItems: "center", gap: "1.4cqw", width: "88%" }}>
        <div
          style={{
            fontFamily: FONT_BOLD,
            fontSize: "8.8cqw",
            fontWeight: 700,
            lineHeight: 1,
            color: INK,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {displayName}, {profile.age}
        </div>
        {profile.verified && (
          <span
            title={dict.ui.verifiedTitle}
            style={{ display: "flex", alignItems: "center", flex: "none", color: t.accent }}
          >
            <ShieldCheck size={22} strokeWidth={2.4} />
          </span>
        )}
      </div>

      {/* meta row */}
      <div
        style={{
          ...at(6.3, 65.5),
          width: "88%",
          fontFamily: FONT_MEDIUM,
          fontSize: "3.5cqw",
          fontWeight: 500,
          color: "var(--color-ink-soft)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {metaBits}
      </div>

      {/* bio — up to three lines */}
      <div
        style={{
          ...at(6.3, 69.6),
          width: "87.4%",
          fontFamily: FONT_COND,
          fontSize: "4cqw",
          fontWeight: 400,
          lineHeight: 1.34,
          color: "var(--color-ink-dim)",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          height: "16.5cqw",
        }}
      >
        {profile.bio.slice(0, 3).join(" ")}
      </div>

      {/* interests — top languages as "passions" */}
      <div
        style={{
          ...at(6.3, 87),
          width: "88%",
          display: "flex",
          gap: "1.6cqw",
          flexWrap: "nowrap",
        }}
      >
        {profile.interests.slice(0, 3).map((lang) => {
          const logo = interestLogo(lang);
          return (
            <div
              key={lang}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.1cqw",
                padding: "1.1cqw 2.4cqw 1.1cqw 1.6cqw",
                borderRadius: "4cqw",
                background: "color-mix(in srgb, var(--color-panel) 92%, transparent)",
                border: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)",
                backdropFilter: "blur(4px)",
                fontFamily: FONT_MEDIUM,
                fontSize: "3cqw",
                fontWeight: 600,
                color: "var(--color-ink-soft)",
                whiteSpace: "nowrap",
              }}
            >
              {logo && (
                <img
                  src={logo}
                  crossOrigin="anonymous"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  alt=""
                  style={{ width: "3.6cqw", height: "3.6cqw", objectFit: "contain" }}
                />
              )}
              {lang}
            </div>
          );
        })}
      </div>

      {/* signature — maker's mark (bottom-left) + handle (bottom-right), painted
          only into exported images (see .gittinder-capturing in globals) */}
      <div className="gittinder-signature">
        <div
          style={{
            ...at(6.3, 95),
            fontFamily: FONT_MEDIUM,
            fontSize: "3cqw",
            fontWeight: 700,
            letterSpacing: ".26em",
            lineHeight: 1,
            whiteSpace: "nowrap",
            color: INK,
            opacity: 0.5,
          }}
        >
          GITTINDER.COM
        </div>
        <div
          style={{
            position: "absolute",
            right: "6%",
            top: "95%",
            fontFamily: FONT_MEDIUM,
            fontSize: "3cqw",
            fontWeight: 700,
            letterSpacing: ".1em",
            lineHeight: 1,
            whiteSpace: "nowrap",
            color: INK,
            opacity: 0.5,
          }}
        >
          @{profile.login}
        </div>
        {/* watermark — the mascot mark, bottom-center above the signature */}
        <img
          src="/mascot.png"
          alt=""
          width={64}
          height={64}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          aria-hidden
          style={{
            ...at(50, 91.5),
            width: "6cqw",
            height: "6cqw",
            transform: "translateX(-50%)",
            objectFit: "contain",
            opacity: 0.4,
          }}
        />
      </div>
    </div>
  );
}

export default memo(DatingCard);
