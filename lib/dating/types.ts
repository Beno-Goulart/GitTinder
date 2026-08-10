// The six dating traits — the shape every profile is drawn in. Kept small and
// legible so the card (and the radar) read at a glance.
export type TraitKey = "spark" | "chat" | "style" | "loyal" | "care" | "energy";
export type Traits = Record<TraitKey, number>;
export type TraitShape = Record<TraitKey, number>;

// Match tiers, from dating-app verdict to "it's the one".
export type Tier = "red" | "green" | "keeper" | "catch" | "turner" | "one";

// Pair-chemistry tiers, from "merge the branches" to "conflicting dependencies".
export type CompatTier =
  | "merge"
  | "sparks"
  | "vibes"
  | "coffee"
  | "complicated"
  | "nope";

// The archetype ("vibe") read off a profile's trait shape.
export type Vibe =
  | "influencer"
  | "butterfly"
  | "polyglot"
  | "longhauler"
  | "reviewer"
  | "warrior"
  | "catch";

export type OnlineState = "online" | "away" | "offline";

// --- GitHub signals ---------------------------------------------------------
// The raw numbers the scout pulls out of GitHub. Every field is a real number
// from the API; nothing here is estimated.
export interface Signals {
  login: string;
  name: string;
  avatarUrl: string;
  location: string | null;
  followers: number;
  account_age_years: number;
  public_repos: number;
  total_stars_owned: number;
  max_repo_stars: number;
  languages: number; // count of distinct primary languages
  // Primary languages ranked by repo count (desc); rankedLanguages[0] is the
  // most-used. Optional so hand-authored sample Signals stay valid.
  rankedLanguages?: string[];
  topLanguage?: string | null;
  recent_contributions: number;
  active_days_recent: number;
  active_years: number;
  total_contributions_lifetime: number;
  prs_to_others: number;
  reviews: number;
  issues_closed: number;
  recent_commits: number;
  recent_spike: boolean;
  // Per-year history, oldest first. Optional: hand-authored sample Signals and
  // previously serialized data predate it.
  years?: YearBreakdown[];
}

// One calendar year of real contribution activity (from GitHub's per-year
// contributionsCollection windows).
export interface YearBreakdown {
  year: number;
  commits: number;
  prs: number;
  reviews: number;
  issues: number;
  restricted: number; // private contributions (count only)
}

// One passion tag on the profile ("loves merge requests" etc.), with the real
// number that earned it.
export interface Tag {
  label: string;
  icon: string; // lucide icon key, resolved in the UI (keeps lib/ framework-agnostic)
  reason: string; // short, plain why-it-was-given (tooltip)
}

// One real GitHub number surfaced in the report, with a 0-99 normalization.
export interface Metric {
  label: string;
  value: number; // real GitHub count
  unit?: string; // optional noun for the raw value, e.g. "stars"
  score: number; // 0–99 normalization of value
}

// The full dating profile. Everything a card, page or image needs in one shape.
export interface DatingProfile {
  login: string;
  name: string; // display name (Tinder shows a first-name vibe)
  avatarUrl: string;
  location: string | null;
  since: number; // account creation year
  age: number; // "age" — years on GitHub, floored
  height: string; // "6'2\"" — the repo-height gag
  repos: number; // public repos (real)
  match: number; // 0–99 headline "match" score
  tier: Tier;
  tierLabel: string; // display string for the tier pill
  vibe: string; // archetype display name ("The Influencer")
  vibeBlurb: string; // one-liner explaining the vibe
  bio: string[]; // generated bio lines (card shows the first few)
  lookingFor: string; // "looking for" line
  tags: Tag[];
  stats: Traits; // the six dating traits, 1–99
  topTrait: TraitKey;
  interests: string[]; // top languages as "passions"
  topLanguage: string | null;
  online: OnlineState;
  verified: boolean;
  metrics: Metric[];
  // Per-year history behind the numbers, when it was fetched.
  years?: YearBreakdown[];
  // short, plain explanations for each trait (report tooltips)
  report: {
    reasons: Record<TraitKey, string>;
  };
}

// The subset of a DatingProfile a swipeable dating CARD actually paints (the
// deck / home fan / pair cards). Kept lean so dozens of baked profiles ship
// in the client bundle without dragging in the full report payload. A full
// DatingProfile is structurally assignable to it.
export type CardProfile = Pick<
  DatingProfile,
  | "login"
  | "name"
  | "avatarUrl"
  | "location"
  | "repos"
  | "age"
  | "height"
  | "match"
  | "tier"
  | "tierLabel"
  | "verified"
  | "bio"
  | "interests"
>;
