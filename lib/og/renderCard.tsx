import { ImageResponse } from "next/og";
import { profileTheme, rgba } from "@/lib/dating/theme";
import { languageLogoUrl, logoSlugFor } from "@/lib/github/languages";
import { cardDisplayName } from "@/lib/text";
import type { DatingProfile } from "@/lib/dating/types";
import { loadCardFonts } from "./card";

// Server-side re-creation of the in-app DatingCard (components/DatingCard.tsx),
// used for the embeddable /<user>.png AND the per-profile OG unfurl. Rendered
// with Satori (next/og); the layout IS DatingCard — percentage positions and
// cqw font sizes resolved to px at the chosen width (1cqw = 1% of card width).
// Satori can't do backdrop-filter or -webkit-line-clamp, so chips skip the blur
// and the bio clips via fixed-height overflow.

const EMBED_W = 810; // /<user>.png render width
const cardH = (w: number) => Math.round((w * 7) / 5); // native 5:7 aspect

// Native card dimensions — shared by the /<user>.png route AND the per-profile
// OG image so both render the exact same portrait card.
export const CARD_SIZE = { width: EMBED_W, height: cardH(EMBED_W) }; // 810×1134

const AVATAR_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="320" height="320" fill="%230d0717"/><circle cx="160" cy="132" r="58" fill="%233d3550"/><rect x="70" y="212" width="180" height="140" rx="72" fill="%233d3550"/></svg>',
  );

async function fetchBytes(url: string): Promise<{ buf: Buffer; mime: string } | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return { buf: Buffer.from(await res.arrayBuffer()), mime: res.headers.get("content-type")?.split(";")[0] || "image/png" };
  } catch {
    return null;
  }
}

async function fetchDataUri(url: string): Promise<string | null> {
  const r = await fetchBytes(url);
  return r ? `data:${r.mime};base64,${r.buf.toString("base64")}` : null;
}

async function avatarDataUri(url: string): Promise<string> {
  const r = await fetchBytes(url);
  if (!r) return AVATAR_FALLBACK;
  return `data:${r.mime};base64,${r.buf.toString("base64")}`;
}

// Load the card's image assets (avatar + language logos) at a render width.
export async function loadCardAssets(profile: DatingProfile, w: number) {
  const avW = w;
  const avH = Math.round((w * 62) / 100);
  const logos = await Promise.all(
    profile.interests
      .slice(0, 3)
      .map((name) => {
        const slug = logoSlugFor(name);
        return slug ? languageLogoUrl(slug) : null;
      })
      .map(async (url) => (url ? fetchDataUri(url) : null)),
  );
  return {
    avatar: await avatarDataUri(profile.avatarUrl),
    logos,
    avW,
    avH,
  };
}

export type CardAssets = Awaited<ReturnType<typeof loadCardAssets>>;

// The dating card as a Satori element at width `w` (height derived from aspect).
export function cardTree(profile: DatingProfile, assets: CardAssets, w: number) {
  const H = cardH(w);
  const cqw = (n: number) => (n / 100) * w;
  const t = profileTheme(profile);
  const displayName = cardDisplayName(profile.name || profile.login).toUpperCase();
  const metaBits = [
    profile.height,
    `${profile.repos} repos`,
    ...(profile.location ? [profile.location.split(",")[0].trim()] : []),
  ].join(" · ");
  const at = (left: number, top: number) => ({ position: "absolute" as const, left: `${left}%`, top: `${top}%` });

  return (
    <div style={{ width: w, height: H, display: "flex", position: "relative", background: "#0d0717", fontFamily: "DINPro", overflow: "hidden", borderRadius: cqw(7) }}>
      {/* photo — full-bleed top */}
      <img
        alt=""
        src={assets.avatar}
        width={assets.avW}
        height={assets.avH}
        style={{ position: "absolute", left: 0, top: 0, width: w, height: `${62}%`, objectFit: "cover", objectPosition: "50% 18%" }}
      />

      {/* gradient plate */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: w,
          height: `${72}%`,
          backgroundImage:
            "linear-gradient(to top, #0d0717 0%, rgba(13,7,23,.96) 34%, rgba(13,7,23,.86) 52%, rgba(13,7,23,0) 100%)",
        }}
      />

      {/* match score — top left */}
      <div style={{ ...at(6, 5), display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontFamily: "Bebas", fontSize: cqw(11.5), lineHeight: 1, color: "#ffffff" }}>{profile.match}</div>
        <div style={{ fontFamily: "DINPro", fontWeight: 600, fontSize: cqw(3), letterSpacing: cqw(0.28), color: "#ffffff", opacity: 0.9 }}>
          MATCH
        </div>
      </div>

      {/* tier pill — top right */}
      <div
        style={{
          position: "absolute",
          top: `${6.4}%`,
          right: `${6}%`,
          display: "flex",
          padding: `${cqw(1.1)}px ${cqw(2.6)}px`,
          borderRadius: cqw(4),
          border: `1px solid ${rgba(t.accent, 0.9)}`,
          backgroundColor: rgba(t.accent, 0.22),
          fontFamily: "DINPro",
          fontWeight: 700,
          fontSize: cqw(2.9),
          letterSpacing: cqw(0.2),
          color: "#ffffff",
          whiteSpace: "nowrap",
        }}
      >
        {profile.tierLabel}
      </div>

      {/* name + age */}
      <div style={{ ...at(6.2, 57), display: "flex", alignItems: "center", width: `${88}%` }}>
        <div style={{ display: "flex", alignItems: "baseline", fontFamily: "DINPro", fontWeight: 700, fontSize: cqw(8.8), lineHeight: 1, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
          {displayName}, {profile.age}
        </div>
        {profile.verified && (
          <div style={{ marginLeft: cqw(1.4), color: t.accent, fontSize: cqw(5), lineHeight: 1 }}>✓</div>
        )}
      </div>

      {/* meta row */}
      <div style={{ ...at(6.3, 65.5), width: `${88}%`, fontFamily: "DINPro", fontWeight: 500, fontSize: cqw(3.5), color: "rgba(255,255,255,.92)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {metaBits}
      </div>

      {/* bio — clipped to the three-line zone */}
      <div style={{ ...at(6.3, 69.6), width: `${87.4}%`, height: cqw(16.5), overflow: "hidden", fontFamily: "DINPro", fontSize: cqw(4), lineHeight: 1.34, color: "rgba(255,255,255,.96)" }}>
        {profile.bio.slice(0, 3).join(" ")}
      </div>

      {/* interests — top languages as "passions" */}
      <div style={{ ...at(6.3, 87), display: "flex", gap: cqw(1.6) }}>
        {profile.interests.slice(0, 3).map((lang, i) => (
          <div
            key={lang}
            style={{ display: "flex", alignItems: "center", gap: cqw(1.1), padding: `${cqw(1.1)}px ${cqw(2.4)}px ${cqw(1.1)}px ${cqw(1.6)}px`, borderRadius: cqw(4), backgroundColor: t.chipBg, fontFamily: "DINPro", fontWeight: 600, fontSize: cqw(3), color: "#ffffff", whiteSpace: "nowrap" }}
          >
            {assets.logos[i] && (
              <img alt="" src={assets.logos[i] as string} style={{ width: cqw(3.6), height: cqw(3.6), objectFit: "contain" }} />
            )}
            {lang}
          </div>
        ))}
      </div>

      {/* signature — maker's mark + handle */}
      <div style={{ ...at(6.3, 95), fontFamily: "DINPro", fontWeight: 700, fontSize: cqw(3), letterSpacing: cqw(0.26), color: "#ffffff", opacity: 0.72 }}>
        GITTINDER.COM
      </div>
      <div style={{ position: "absolute", right: `${6}%`, top: `${95}%`, display: "flex", fontFamily: "DINPro", fontWeight: 700, fontSize: cqw(3), letterSpacing: cqw(0.1), color: "#ffffff", opacity: 0.72 }}>
        @{profile.login}
      </div>
    </div>
  );
}

// The standalone embeddable card image: gittinder.com/<user>.png.
export async function renderCardImage(profile: DatingProfile): Promise<ImageResponse> {
  const assets = await loadCardAssets(profile, EMBED_W);
  return new ImageResponse(cardTree(profile, assets, EMBED_W), {
    width: EMBED_W,
    height: cardH(EMBED_W),
    fonts: await loadCardFonts(),
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
