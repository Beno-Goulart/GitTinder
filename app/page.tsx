import type { Metadata } from "next";
import Background from "@/components/Background";
import AppShell from "@/components/AppShell";
import { getScoutCount } from "@/lib/analytics";
import { oauthEnabled } from "@/lib/github/oauth";
import { dicts } from "@/lib/i18n/dicts";
import { getLocale } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/site";

// Dynamic so the live scout count is fresh per load.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const meta = dicts[await getLocale()].meta;
  return {
    title: meta.homeTitle,
    description: meta.homeDescription,
    keywords: meta.homeKeywords,
    alternates: { canonical: "/" },
    openGraph: {
      title: meta.homeTitle,
      description: meta.homeDescription,
      url: SITE_URL,
      siteName: "GitTinder",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.homeTitle,
      description: meta.homeDescription,
    },
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string; reason?: string }>;
}) {
  const [scoutCount, params, locale] = await Promise.all([getScoutCount(), searchParams, getLocale()]);
  const authError = params.auth === "error";
  const meta = dicts[locale].meta;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://gittinder.com/#website",
        url: "https://gittinder.com",
        name: "GitTinder",
        description: meta.jsonLdWebsite,
      },
      {
        "@type": "WebApplication",
        name: "GitTinder",
        url: "https://gittinder.com",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript",
        description: meta.jsonLdApp,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  };
  return (
    <div className="relative min-h-screen overflow-x-hidden text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Background />
      <AppShell
        scoutCount={scoutCount}
        oauthEnabled={oauthEnabled()}
        authError={authError}
        authReason={params.reason}
      />
    </div>
  );
}
