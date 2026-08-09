import { ImageResponse } from "next/og";
import { after } from "next/server";
import { scoutProfile } from "@/lib/scout";
import { recordScout } from "@/lib/analytics";
import { renderCardImage, CARD_SIZE } from "@/lib/og/renderCard";
import { loadCardFonts } from "@/lib/og/card";

export const runtime = "nodejs";
export const alt = "GitTinder dating profile";
export const size = CARD_SIZE;
export const contentType = "image/png";

const CACHE = { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" };

// The profile's share preview is the exact portrait card that SHARE THE CARD
// opens (gittinder.com/<user>.png) — one layout, same rendering. A failed scout
// falls back to a simple branded "get matched" unfurl at the same card size.
export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  try {
    const profile = await scoutProfile(username);
    after(() => recordScout()); // count link unfurls; flushed after response
    return await renderCardImage(profile);
  } catch {
    const fonts = await loadCardFonts();
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#f6f1e7",
            backgroundImage: "radial-gradient(60% 40% at 50% 32%, rgba(255,70,85,0.16), transparent 72%)",
            color: "#191521",
            fontFamily: "DINPro",
            textAlign: "center",
            padding: 64,
          }}
        >
          <div style={{ display: "flex", color: "#ff4655", fontSize: 26, fontWeight: 700, letterSpacing: 4 }}>GITHUB × TINDER</div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, marginTop: 20 }}>@{username}</div>
          <div style={{ display: "flex", fontSize: 34, color: "#5d5468", marginTop: 18 }}>Get your GitHub matched, rated 0–99.</div>
          <div style={{ display: "flex", fontSize: 30, color: "#ff4655", fontWeight: 700, marginTop: 26 }}>gittinder.com</div>
        </div>
      ),
      { ...CARD_SIZE, fonts, headers: CACHE },
    );
  }
}
