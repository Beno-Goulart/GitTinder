import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { SITE_URL } from "@/lib/site";
import { I18nProvider } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

// Display — ultra-condensed all-caps for the Tinder impact.
const display = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
});

// UI / body — clean and legible at small sizes.
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// The "@handle" / dev signal.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

// Card fonts (DINPro suite) — used by the dating card and the Satori PNGs.
const dinCond = localFont({ src: "./fonts/DINPro-Cond.otf", variable: "--font-din-cond", display: "swap" });
const dinBold = localFont({ src: "./fonts/DINPro-CondBold.otf", variable: "--font-din-bold", display: "swap" });
const dinMedium = localFont({ src: "./fonts/DINPro-CondMedium.otf", variable: "--font-din-medium", display: "swap" });

// Root metadata stays the EN default (the per-route generateMetadata overrides
// it for every real page, in the viewer's locale); these are the fallbacks.
const TITLE = "GitTinder — your GitHub, on a date";
const DESCRIPTION =
  "Enter a GitHub username and get a Tinder-style dating profile rated 0–99 — match score, tier, bio and passions, scored from real GitHub stats.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "GitHub dating profile",
    "rate my GitHub",
    "GitHub stats",
    "developer dating card",
    "GitHub match",
    "Tinder for developers",
    "GitTinder",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "GitTinder",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f1e7" },
    { media: "(prefers-color-scheme: dark)", color: "#131017" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable} ${dinCond.variable} ${dinBold.variable} ${dinMedium.variable} antialiased`}
    >
      <body>
        {/* theme bootstrap — apply the saved/preferred theme before first paint
            so the page never flashes the wrong mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("gittinder-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
