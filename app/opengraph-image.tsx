import { ImageResponse } from "next/og";
import { loadCardFonts } from "@/lib/og/card";
import { mascotDataUri } from "@/lib/og/mascot";
import { sampleProfiles } from "@/lib/github/samples";
import { getLocale } from "@/lib/i18n/server";
import { dicts, fmt } from "@/lib/i18n/dicts";

// Branded preview for the home page / bare gittinder.com links. Next wires this
// as the default og:image + twitter:image automatically (metadataBase is absolute).
export const runtime = "nodejs";
export const alt = "GitTinder — your GitHub, on a date";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT = "#ff4655";

export default async function Image() {
  const locale = await getLocale();
  const dict = dicts[locale];
  const fonts = await loadCardFonts();
  const top = [...sampleProfiles(locale)].sort((a, b) => b.match - a.match)[0];
  const mascot = mascotDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: "#f6f1e7",
          backgroundImage:
            "radial-gradient(900px 520px at 22% -12%, rgba(255,70,85,0.18), transparent 60%), radial-gradient(720px 520px at 105% 120%, rgba(255,122,69,0.14), transparent 60%)",
          color: "#191521",
          fontFamily: "DINPro",
          padding: 72,
          justifyContent: "center",
        }}
      >
        {mascot && (
          <img
            src={mascot}
            alt=""
            width={240}
            height={240}
            style={{ position: "absolute", right: 64, top: 56, opacity: 0.9 }}
          />
        )}
        <div style={{ display: "flex", color: ACCENT, fontSize: 24, fontWeight: 700, letterSpacing: 5 }}>
          GITHUB × TINDER
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 26 }}>
          <div style={{ display: "flex", fontSize: 118, fontWeight: 800, lineHeight: 0.92 }}>{dict.og.homeFindYour}</div>
          <div style={{ display: "flex", fontSize: 118, fontWeight: 800, lineHeight: 0.92 }}>
            <span>{dict.og.homeMatch}</span>
            <span style={{ color: ACCENT }}>.</span>
          </div>
          <div style={{ display: "flex", fontSize: 33, color: "#5d5468", marginTop: 26, maxWidth: 720, lineHeight: 1.3 }}>
            {dict.og.homeSub}
            {top ? ` ${fmt(dict.og.homeTopMatch, { name: top.name || top.login, score: top.match })}` : ""}
          </div>
        </div>

        <div style={{ position: "absolute", right: 72, bottom: 30, display: "flex", fontSize: 26, color: "#948a9c" }}>
          gittinder.com
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
