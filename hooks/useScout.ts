"use client";

import { useState } from "react";
import type { DatingProfile } from "@/lib/dating/types";

const TTL = 3 * 60 * 60 * 1000;
const cacheKey = (login: string) => `gittinder:profile:${login.toLowerCase()}`;

function readCache(login: string): DatingProfile | null {
  try {
    const hit = JSON.parse(localStorage.getItem(cacheKey(login)) ?? "null");
    return hit && Date.now() - hit.t < TTL ? (hit.card as DatingProfile) : null;
  } catch {
    return null;
  }
}

// Re-persist a profile under its login (used when the card is rated on the
// profile page, so the rating survives within the TTL).
export function writeCardCache(profile: DatingProfile): void {
  try {
    localStorage.setItem(cacheKey(profile.login), JSON.stringify({ t: Date.now(), card: profile }));
  } catch {
    /* quota / private mode */
  }
}

export function useScout() {
  const [profile, setProfile] = useState<DatingProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scout = async (name: string): Promise<boolean> => {
    if (loading) return false;
    const login = name.trim().replace(/^@/, "");

    const cached = readCache(login);
    if (cached) {
      setProfile(cached);
      setError(null);
      return true;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/card/${encodeURIComponent(login)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't match that profile.");
      setProfile(data as DatingProfile);
      writeCardCache(data as DatingProfile);
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, scout };
}
