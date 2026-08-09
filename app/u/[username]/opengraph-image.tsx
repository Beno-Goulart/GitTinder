import { ImageResponse } from "next/og";
import { after } from "next/server";
import { scoutProfile } from "@/lib/scout";
import { recordScout } from "@/lib/analytics";
import { renderProfileOG, OG_SIZE } from "@/lib/og/ogImage";
import { loadCardFonts } from "@/lib/og/card";

export const runtime = "nodejs";
export const alt = "GitTinder dating profile";
export const size = OG_SIZE;
export const contentType = "image/png";

const CACHE = { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" };

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  try {
    const profile = await scoutProfile(username);
    after(() => recordScout()); // count link unfurls; flushed after response
    return await renderProfileOG(profile);
  } catch {
    // Not a real profile -> a simple branded "get matched" unfurl.
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
            background: "#0d0717",
            backgroundImage: "radial-gradient(900px 500px at 50% -10%, rgba(255,61,127,0.16), transparent 60%)",
            color: "#e6edf3",
            fontFamily: "DINPro",
            textAlign: "center",
            padding: 64,
          }}
        >
          <div style={{ display: "flex", color: "#ff3d7f", fontSize: 26, fontWeight: 700, letterSpacing: 4 }}>GITHUB × TINDER</div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, marginTop: 20 }}>@{username}</div>
          <div style={{ display: "flex", fontSize: 34, color: "#a8b3bd", marginTop: 18 }}>Get your GitHub matched, rated 0–99.</div>
          <div style={{ display: "flex", fontSize: 30, color: "#ff3d7f", fontWeight: 700, marginTop: 26 }}>gittinder.com</div>
        </div>
      ),
      { ...size, fonts, headers: CACHE },
    );
  }
}
