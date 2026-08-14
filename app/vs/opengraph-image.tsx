import { ImageResponse } from "next/og";
import { scoutProfile } from "@/lib/scout";
import { checkScoutRateLimit } from "@/lib/rateLimit";
import { mascotDataUri } from "@/lib/og/mascot";
import { renderCompatImage, COMPAT_SIZE } from "@/lib/og/renderCompat";
import { getLocale } from "@/lib/i18n/server";
import { dicts } from "@/lib/i18n/dicts";
import type { Locale } from "@/lib/i18n/locale";

export const runtime = "nodejs";
export const alt = "GitTinder pair chemistry report";
export const size = COMPAT_SIZE;
export const contentType = "image/png";

const normalize = (u: string) => u.trim().replace(/^@/, "");

// OG unfurl for a /vs/a/b report — the file convention lives on /vs (a catch-all
// segment can't hold an image sibling), but Next still hands it the captured
// { users } params for nested URLs. If a pair is missing, a scout fails, or the
// IP is rate-limited, fall back to the same branded "get matched" placeholder as
// the per-profile image.
export default async function Image({ params }: { params: Promise<{ users?: string[] } | undefined> }) {
  const users = ((await params)?.users ?? []).filter(Boolean).map(normalize).slice(0, 2);
  const locale = await getLocale();
  if (users.length < 2) return fallback(locale);
  if (!(await checkScoutRateLimit()).allowed) return fallback(locale);
  try {
    const [a, b] = await Promise.all([scoutProfile(users[0], locale), scoutProfile(users[1], locale)]);
    return await renderCompatImage(a, b, locale);
  } catch {
    return fallback(locale);
  }
}

function fallback(locale: Locale) {
  const dict = dicts[locale];
  const mascot = mascotDataUri();
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
        {mascot && <img src={mascot} alt="" width={120} height={120} style={{ marginBottom: 16, opacity: 0.9 }} />}
        <div style={{ display: "flex", color: "#ff4655", fontSize: 26, fontWeight: 700, letterSpacing: 4 }}>GITHUB × TINDER</div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, marginTop: 20 }}>{dict.ui.checkTheChemistry}</div>
        <div style={{ display: "flex", fontSize: 34, color: "#5d5468", marginTop: 18 }}>{dict.og.vsSub}</div>
        <div style={{ display: "flex", fontSize: 30, color: "#ff4655", fontWeight: 700, marginTop: 26 }}>gittinder.com/vs</div>
      </div>
    ),
    { ...COMPAT_SIZE },
  );
}
