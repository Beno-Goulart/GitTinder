"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ScoutForm from "@/components/ScoutForm";
import SampleDeck from "@/components/SampleDeck";
import LoadingScreen from "@/components/LoadingScreen";
import FooterCredit from "@/components/FooterCredit";
import TopProfiles from "@/components/TopProfiles";
import { SAMPLE_PROFILES } from "@/lib/github/samples";

const AUTH_ERROR = "GitHub sign-in didn't finish — try again.";

export default function AppShell({
  scoutCount,
  oauthEnabled,
  authError,
}: {
  scoutCount: number | null;
  oauthEnabled: boolean;
  authError: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pending, setPending] = useState<string | null>(null);

  // Scouting navigates to the canonical /<username> route. The transition keeps
  // the loading screen up while the profile is fetched and server-rendered.
  const handleScout = (name: string) => {
    const login = name.trim().replace(/^@/, "");
    if (!login) return;
    setPending(login);
    startTransition(() => router.push(`/${encodeURIComponent(login)}`));
  };

  if (isPending && pending) return <LoadingScreen login={pending} />;

  return (
    <main className="relative z-[2] flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-[1180px] flex-1 items-center gap-[clamp(24px,5vw,72px)] px-[clamp(22px,5vw,56px)] max-[1120px]:flex-col max-[1120px]:gap-[34px] max-[1120px]:pb-6 max-[1120px]:pt-[clamp(40px,6vh,56px)] max-[1120px]:text-center">
        <ScoutForm
          loading={isPending}
          error={authError ? AUTH_ERROR : null}
          scoutCount={scoutCount}
          oauthEnabled={oauthEnabled}
          onScout={handleScout}
        />
        <SampleDeck cards={SAMPLE_PROFILES} onPick={handleScout} />
      </div>
      <TopProfiles />
      <footer className="relative z-[2] mt-auto flex flex-none items-center justify-center p-[clamp(12px,2.6vh,24px)]">
        <FooterCredit />
      </footer>
    </main>
  );
}
