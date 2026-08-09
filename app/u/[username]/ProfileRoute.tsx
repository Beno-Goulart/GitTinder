"use client";

import ProfileView from "@/components/ProfileView";
import type { DatingProfile } from "@/lib/dating/types";

// Thin seam: a server component can't pass callbacks across the boundary, so the
// profile page renders through this client wrapper (mirrors the original route).
export default function ProfileRoute({ profile }: { profile: DatingProfile }) {
  return <ProfileView profile={profile} />;
}
