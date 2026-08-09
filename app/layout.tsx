import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
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

const TITLE = "GitTinder — your GitHub, on a date";
const DESCRIPTION =
  "Enter a GitHub username and get a Tinder-style dating profile rated 0–99 — match score, tier, bio and passions, scored from real GitHub stats.";

export const metadata: Metadata = {
  metadataBase: new URL("https://gittinder.com"),
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
    url: "https://gittinder.com",
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
  themeColor: "#f6f1e7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} ${dinCond.variable} ${dinBold.variable} ${dinMedium.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
