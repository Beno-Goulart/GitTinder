import { ImageResponse } from "next/og";
import { scoutProfile } from "@/lib/scout";
import { renderCardImage } from "@/lib/og/renderCard";
import { loadCardFonts } from "@/lib/og/card";

export const runtime = "nodejs";

const W = 810;
const H = Math.round((W * 7) / 5);

// Embeddable card image: gittinder.com/<user>.png (via the next.config rewrite) -> here.
// The card is rendered on demand to match the in-app DatingCard (lib/og/renderCard)
// and cached hard at the CDN, so there's no object store to keep in sync or pay for.
// A failed scout (no such user) or a render error falls back to a small branded hint.
export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  try {
    const profile = await scoutProfile(username);
    return await renderCardImage(profile);
  } catch {
    return fallback(username);
  }
}

async function fallback(username: string) {
  const fonts = await loadCardFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0717",
          backgroundImage: "radial-gradient(60% 40% at 50% 32%, rgba(255,61,127,0.18), transparent 72%)",
          color: "#e6edf3",
          fontFamily: "DINPro",
          padding: 64,
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", color: "#ff3d7f", fontSize: 34, fontWeight: 700, letterSpacing: 6 }}>GITTINDER</div>
        <div style={{ display: "flex", fontSize: 56, fontWeight: 700, marginTop: 24 }}>@{username}</div>
        <div style={{ display: "flex", fontSize: 30, color: "#a8b3bd", marginTop: 22 }}>get this profile matched at</div>
        <div style={{ display: "flex", marginTop: 10, fontSize: 32, color: "#ff3d7f", fontWeight: 700 }}>gittinder.com</div>
      </div>
    ),
    { width: W, height: H, fonts, headers: { "Cache-Control": "public, max-age=300" } },
  );
}
