import { ImageResponse } from "next/og";
import { profileTheme, rgba } from "@/lib/dating/theme";
import { cardDisplayName } from "@/lib/text";
import type { DatingProfile } from "@/lib/dating/types";
import { loadCardFonts } from "./card";
import { cardTree, loadCardAssets } from "./renderCard";

// Landscape social-unfurl image (1200×630): the dating card on the left, the
// match headline on the right. Used by app/u/[username]/opengraph-image.tsx so a
// shared profile link unfurls with its exact rating.

const W = 1200;
const H = 630;
const CARD_W = 348; // card render width on the left

export async function renderProfileOG(profile: DatingProfile): Promise<ImageResponse> {
  const t = profileTheme(profile);
  const assets = await loadCardAssets(profile, CARD_W);
  const name = cardDisplayName(profile.name || profile.login).toUpperCase();
  const metaBits = [
    profile.height,
    `${profile.repos} repos`,
    ...(profile.location ? [profile.location.split(",")[0].trim()] : []),
  ].join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "0 72",
          background: "#0d0717",
          backgroundImage: `radial-gradient(42% 60% at 78% 20%, ${rgba(t.accent, 0.22)}, transparent 70%), radial-gradient(50% 70% at 8% 110%, rgba(255,63,108,.16), transparent 70%)`,
          color: "#ffffff",
          fontFamily: "DINPro",
          overflow: "hidden",
        }}
      >
        <div style={{ flex: "none", borderRadius: 26, overflow: "hidden", boxShadow: `0 30px 60px rgba(0,0,0,.5), 0 0 50px ${t.glow}` }}>
          {cardTree(profile, assets, CARD_W)}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 5, color: t.accent }}>GITTINDER</span>
            <span style={{ fontSize: 13, color: "#8b8499", letterSpacing: 1 }}>· YOUR GITHUB, ON A DATE</span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <div style={{ display: "flex", fontSize: 92, lineHeight: 0.95, fontFamily: "Bebas", color: "#ffffff" }}>{profile.match}%</div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: 4, color: "#8b8499" }}>MATCH</div>
          </div>

          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              marginTop: 14,
              padding: "6px 16px",
              borderRadius: 999,
              border: `1px solid ${rgba(t.accent, 0.9)}`,
              backgroundColor: rgba(t.accent, 0.2),
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 3,
              color: "#ffffff",
            }}
          >
            {profile.tierLabel}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 30 }}>
            <div style={{ display: "flex", alignItems: "baseline", fontSize: 56, fontWeight: 700, lineHeight: 1 }}>{name}, {profile.age}</div>
            {profile.verified && <div style={{ fontSize: 30, color: t.accent }}>✓</div>}
          </div>
          <div style={{ marginTop: 10, fontSize: 20, color: "rgba(255,255,255,.85)" }}>{metaBits}</div>

          <div style={{ display: "flex", marginTop: 16, fontSize: 18, color: "#a89fb8" }}>
            {profile.vibe} — {profile.vibeBlurb}
          </div>

          <div style={{ display: "flex", marginTop: 26, fontSize: 15, letterSpacing: 1, color: "#6f6880" }}>
            gittinder.com/@{profile.login}
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: await loadCardFonts(),
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
    },
  );
}

export const OG_SIZE = { width: W, height: H };
