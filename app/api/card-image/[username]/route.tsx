import { ImageResponse } from "next/og";
import { scoutProfile } from "@/lib/scout";
import { checkScoutRateLimit } from "@/lib/rateLimit";
import { mascotDataUri } from "@/lib/og/mascot";
import { renderCardImage, type CardTheme } from "@/lib/og/renderCard";
import { loadCardFonts } from "@/lib/og/card";
import { getLocale } from "@/lib/i18n/server";
import { dicts } from "@/lib/i18n/dicts";
import type { Locale } from "@/lib/i18n/locale";

export const runtime = "nodejs";

const W = 810;
const H = Math.round((W * 7) / 5);

// Embeddable card image: gittinder.com/<user>.png (via the next.config rewrite) -> here.
// The card is rendered on demand to match the in-app DatingCard (lib/og/renderCard)
// and cached hard at the CDN, so there's no object store to keep in sync or pay for.
// ?theme=dark renders the dark-mode palette (the in-app share/download appends it
// when the visitor is in dark mode); the default stays light for OG crawlers, which
// have no theme. A failed scout (no such user), a render error, OR a rate-limited IP
// falls back to a small branded hint — no GitHub budget is spent either way.
export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const locale = await getLocale();
  const theme: CardTheme =
    new URL(req.url).searchParams.get("theme") === "dark" ? "dark" : "light";
  if (!(await checkScoutRateLimit()).allowed) return fallback(username, locale);
  try {
    const profile = await scoutProfile(username, locale);
    return await renderCardImage(profile, theme, locale);
  } catch {
    return fallback(username, locale);
  }
}

async function fallback(username: string, locale: Locale) {
  const dict = dicts[locale];
  const fonts = await loadCardFonts();
  const mascot = mascotDataUri();
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
          background: "#f6f1e7",
          backgroundImage: "radial-gradient(60% 40% at 50% 32%, rgba(255,70,85,0.16), transparent 72%)",
          color: "#191521",
          fontFamily: "DINPro",
          padding: 64,
          textAlign: "center",
        }}
      >
        {mascot && <img src={mascot} alt="" width={120} height={120} style={{ marginBottom: 16, opacity: 0.9 }} />}
        <div style={{ display: "flex", color: "#ff4655", fontSize: 34, fontWeight: 700, letterSpacing: 6 }}>GITTINDER</div>
        <div style={{ display: "flex", fontSize: 56, fontWeight: 700, marginTop: 24 }}>@{username}</div>
        <div style={{ display: "flex", fontSize: 30, color: "#5d5468", marginTop: 22 }}>{dict.og.cardFallback}</div>
        <div style={{ display: "flex", marginTop: 10, fontSize: 32, color: "#ff4655", fontWeight: 700 }}>gittinder.com</div>
      </div>
    ),
    { width: W, height: H, fonts, headers: { "Cache-Control": "public, max-age=300" } },
  );
}
