import { ImageResponse } from "next/og";
import { computeChemistry } from "@/lib/dating/compat";
import { languageLogoUrl, logoSlugFor } from "@/lib/github/languages";
import type { DatingProfile } from "@/lib/dating/types";
import { dicts } from "@/lib/i18n/dicts";
import type { Locale } from "@/lib/i18n/locale";
import { loadCardFonts } from "./card";
import { loadCardAssets } from "./renderCard";

// OG share image for a /vs pair — the two avatars facing off around the
// chemistry seal, the tier as the headline. Same fonts and palette as the card.

export const COMPAT_SIZE = { width: 1200, height: 630 };

const EMBED_W = 1200;

function compatTree({
  a,
  b,
  accent,
  tierLabel,
  verdict,
  score,
  sharedLanguages,
  avatarA,
  avatarB,
  logos,
  locale,
}: {
  a: DatingProfile;
  b: DatingProfile;
  accent: string;
  tierLabel: string;
  verdict: string;
  score: number;
  sharedLanguages: string[];
  avatarA: string;
  avatarB: string;
  logos: (string | null)[];
  locale: Locale;
}) {
  const dict = dicts[locale];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        background: "#f6f1e7",
        fontFamily: "DINPro",
        color: "#191521",
        overflow: "hidden",
        padding: "44px 64px 36px",
      }}
    >
      {/* coral glow behind the trio */}
      <div
        style={{
          position: "absolute",
          top: "-6%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "88%",
          height: "74%",
          backgroundImage: `radial-gradient(60% 46% at 50% 40%, ${accent}26, transparent 72%)`,
        }}
      />

      {/* brand line */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 4,
          color: "#ff4655",
        }}
      >
        <span>GITHUB × TINDER</span>
        <span style={{ color: "#a79cb4" }}>{dict.ui.chemistryReport}</span>
      </div>

      {/* the two avatars + the seal */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          marginTop: 30,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 210 }}>
          <img
            alt=""
            src={avatarA}
            style={{ width: 150, height: 150, borderRadius: "50%", objectFit: "cover", border: "4px solid #fffdf8", boxShadow: "0 10px 26px rgba(25,21,33,.14)" }}
          />
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 12 }}>@{a.login}</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 168,
            height: 168,
            borderRadius: "50%",
            background: `radial-gradient(circle at 30% 20%, ${accent}, ${accent})`,
            color: "#ffffff",
            boxShadow: `0 0 60px ${accent}55`,
          }}
        >
          <div style={{ fontFamily: "Bebas", fontSize: 74, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 3, opacity: 0.9 }}>{dict.ui.chemistry}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 210 }}>
          <img
            alt=""
            src={avatarB}
            style={{ width: 150, height: 150, borderRadius: "50%", objectFit: "cover", border: "4px solid #fffdf8", boxShadow: "0 10px 26px rgba(25,21,33,.14)" }}
          />
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 12 }}>@{b.login}</div>
        </div>
      </div>

      {/* tier headline */}
      <div
        style={{
          fontFamily: "Bebas",
          fontSize: 74,
          lineHeight: 1,
          letterSpacing: 1,
          marginTop: 22,
          color: accent,
        }}
      >
        {tierLabel}.
      </div>

      {/* verdict */}
      <div
        style={{
          fontSize: 24,
          color: "#5d5468",
          marginTop: 12,
          maxWidth: 880,
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {verdict}
      </div>

      {/* shared languages */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: "auto",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, color: "#a79cb4" }}>
          {dict.og.bothSpeak}
        </span>
        {sharedLanguages.length ? (
          sharedLanguages.slice(0, 4).map((lang, i) => (
            <div
              key={lang}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 999,
                background: "#fffdf8",
                border: "1px solid #ece4d2",
                fontSize: 17,
                fontWeight: 600,
                color: "#5d5468",
              }}
            >
              {logos[i] && (
                <img alt="" src={logos[i] as string} style={{ width: 18, height: 18, objectFit: "contain" }} />
              )}
              {lang}
            </div>
          ))
        ) : (
          <span style={{ fontSize: 17, fontWeight: 600, color: "#5d5468" }}>{dict.og.nothingYet}</span>
        )}
      </div>
    </div>
  );
}

export async function renderCompatImage(
  a: DatingProfile,
  b: DatingProfile,
  locale: Locale = "en",
): Promise<ImageResponse> {
  const chemistry = computeChemistry(a, b, locale);
  const [assetsA, assetsB] = await Promise.all([
    loadCardAssets(a, EMBED_W),
    loadCardAssets(b, EMBED_W),
  ]);
  const logos = await Promise.all(
    chemistry.sharedLanguages
      .slice(0, 4)
      .map((name) => {
        const slug = logoSlugFor(name);
        return slug ? languageLogoUrl(slug) : null;
      })
      .map(async (url) => {
        if (!url) return null;
        try {
          const res = await fetch(url);
          if (!res.ok) return null;
          const mime = res.headers.get("content-type")?.split(";")[0] || "image/png";
          return `data:${mime};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
        } catch {
          return null;
        }
      }),
  );

  return new ImageResponse(
    compatTree({
      a,
      b,
      accent: chemistry.accent,
      tierLabel: chemistry.tierLabel,
      verdict: chemistry.verdict,
      score: chemistry.score,
      sharedLanguages: chemistry.sharedLanguages,
      avatarA: assetsA.avatar,
      avatarB: assetsB.avatar,
      logos,
      locale,
    }),
    {
      ...COMPAT_SIZE,
      fonts: await loadCardFonts(),
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
    },
  );
}
