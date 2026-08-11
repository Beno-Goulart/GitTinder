import Background from "@/components/Background";
import AppShell from "@/components/AppShell";
import { getScoutCount } from "@/lib/analytics";
import { oauthEnabled } from "@/lib/github/oauth";

// Dynamic so the live scout count is fresh per load.
export const dynamic = "force-dynamic";

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://gittinder.com/#website",
      url: "https://gittinder.com",
      name: "GitTinder",
      description: "Turn any GitHub profile into a dating profile, rated 0–99.",
    },
    {
      "@type": "WebApplication",
      name: "GitTinder",
      url: "https://gittinder.com",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript",
      description:
        "Enter a GitHub username and get a Tinder-style dating profile built from real GitHub stats — match score, tier, bio, passions.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string; reason?: string }>;
}) {
  const [scoutCount, params] = await Promise.all([getScoutCount(), searchParams]);
  const authError = params.auth === "error";
  return (
    <div className="relative min-h-screen overflow-x-hidden text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
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
