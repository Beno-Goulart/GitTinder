"use client";

import { memo, type CSSProperties, type ReactEventHandler } from "react";
import { ShieldCheck } from "lucide-react";
import type { DatingProfile } from "@/lib/dating/types";
import { profileTheme, rgba } from "@/lib/dating/theme";
import { logoSlugFor, languageLogoUrl } from "@/lib/github/languages";
import { cardDisplayName } from "@/lib/text";

// The live Tinder-style card — photo up top, bio + interests over a gradient
// plate at the bottom, match score top-left, tier pill top-right. Positions are
// percentages of the card; font sizes are cqw (1cqw = 1% of card width) so the
// card scales with its container. The same layout is re-created server-side in
// lib/og/renderCard.tsx (Satori) for the shareable PNG.

const AVATAR_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="320" height="320" fill="%230d0717"/><circle cx="160" cy="132" r="58" fill="%233d3550"/><rect x="70" y="212" width="180" height="140" rx="72" fill="%233d3550"/></svg>',
  );

const FONT_DISPLAY = "var(--font-bebas), 'Bebas Neue', sans-serif";
const FONT_COND = "var(--font-din-cond), 'Saira Condensed', sans-serif";
const FONT_BOLD = "var(--font-din-bold), 'Saira Condensed', sans-serif";
const FONT_MEDIUM = "var(--font-din-medium), 'Saira Condensed', sans-serif";

// An interest chip's language logo, when the language has one in the catalog.
function interestLogo(name: string): string | null {
  const slug = logoSlugFor(name);
  return slug ? languageLogoUrl(slug) : null;
}

function DatingCard({ profile }: { profile: DatingProfile }) {
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
    borderRadius: "7cqw",
    overflow: "hidden",
    background: "#0d0717",
    filter: `drop-shadow(0 7cqw 10cqw rgba(0,0,0,.5)) drop-shadow(0 0 6cqw ${t.glow})`,
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
    `${profile.repos} repos`,
    ...(profile.location ? [profile.location.split(",")[0].trim()] : []),
  ].join(" · ");

  return (
    <div className="gittinder-card-frame" style={wrap}>
      {/* photo — full-bleed top */}
      <img
        src={profile.avatarUrl}
        onError={onAvatarError}
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

      {/* gradient plate — the bottom text zone */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: "72%",
          background:
            "linear-gradient(to top, #0d0717 0%, rgba(13,7,23,.96) 34%, rgba(13,7,23,.86) 52%, rgba(13,7,23,0) 100%)",
        }}
      />

      {/* match score — top left */}
      <div style={{ ...at(6, 5), display: "flex", flexDirection: "column", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: "11.5cqw", fontWeight: 400, lineHeight: 1, color: "#fff" }}>
          {profile.match}
        </div>
        <div
          style={{
            fontFamily: FONT_MEDIUM,
            fontSize: "3cqw",
            fontWeight: 600,
            letterSpacing: ".28em",
            color: "#fff",
            opacity: 0.9,
          }}
        >
          MATCH
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
          border: `1px solid ${rgba(t.accent, 0.9)}`,
          background: rgba(t.accent, 0.22),
          fontFamily: FONT_MEDIUM,
          fontSize: "2.9cqw",
          fontWeight: 700,
          letterSpacing: ".2em",
          color: "#fff",
          whiteSpace: "nowrap",
        }}
      >
        {profile.tierLabel}
      </div>

      {/* name + age */}
      <div style={{ ...at(6.2, 57), display: "flex", alignItems: "center", gap: "1.4cqw", width: "88%" }}>
        <div
          style={{
            fontFamily: FONT_BOLD,
            fontSize: "8.8cqw",
            fontWeight: 700,
            lineHeight: 1,
            color: "#fff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {displayName}, {profile.age}
        </div>
        {profile.verified && (
          <span
            title="Verified by stars, probably"
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
          color: "rgba(255,255,255,.92)",
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
          color: "rgba(255,255,255,.96)",
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
                background: t.chipBg,
                backdropFilter: "blur(4px)",
                fontFamily: FONT_MEDIUM,
                fontSize: "3cqw",
                fontWeight: 600,
                color: "#fff",
                whiteSpace: "nowrap",
              }}
            >
              {logo && (
                <img
                  src={logo}
                  crossOrigin="anonymous"
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
            color: "#fff",
            opacity: 0.72,
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
            color: "#fff",
            opacity: 0.72,
          }}
        >
          @{profile.login}
        </div>
      </div>
    </div>
  );
}

export default memo(DatingCard);
