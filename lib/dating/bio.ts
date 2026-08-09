import type { OnlineState, Signals, Tag, TraitKey } from "./types";

// The dating copy layer: turns raw GitHub numbers into profile lines, passion
// tags and a "looking for" hook. Every line is anchored to a real number (the
// reason strings carry it) so nothing is invented — the humor is in the framing.

const fmt = (n: number) => n.toLocaleString("en-US");

// --- Bio lines ---------------------------------------------------------------
// Each returns a { line, reason } pair; the reason powers the report explainer.

interface BioLine {
  line: string;
  reason: string;
}

const firstLine = (s: Signals): BioLine => {
  if (s.total_stars_owned >= 5000)
    return {
      line: "My repos are famous. My DMs are not.",
      reason: `${fmt(s.total_stars_owned)} stars across your repos`,
    };
  if (s.total_stars_owned >= 200)
    return {
      line: "I have a couple of popular repos. Trying to be a well-rounded person too.",
      reason: `${fmt(s.total_stars_owned)} stars across your repos`,
    };
  return {
    line: "Not here for the stars. (Well. Maybe a few.)",
    reason: `${fmt(s.total_stars_owned)} stars across your repos`,
  };
};

const commitLine = (s: Signals): BioLine => ({
  line: "I commit. To the repo. And, reportedly, to the one who replies.",
  reason: `${fmt(s.recent_commits)} commits this year`,
});

const communityLine = (s: Signals): BioLine | null => {
  if (s.prs_to_others >= 20)
    return {
      line: "I've opened enough PRs to know how to make the first move.",
      reason: `${fmt(s.prs_to_others)} pull requests opened this year`,
    };
  if (s.reviews >= 20)
    return {
      line: "I read your PRs before I read your mind. And I leave helpful comments.",
      reason: `${fmt(s.reviews)} pull requests reviewed this year`,
    };
  if (s.issues_closed >= 10)
    return {
      line: "I respond to issues faster than I respond to texts.",
      reason: `${fmt(s.issues_closed)} issues closed this year`,
    };
  return null;
};

const languageLine = (s: Signals): BioLine | null => {
  if (s.languages >= 6)
    return {
      line: `I speak ${s.languages} languages, fluently-ish.`,
      reason: `${s.languages} languages across your repos`,
    };
  if (s.topLanguage)
    return {
      line: `${s.topLanguage} is my love language.`,
      reason: `${s.topLanguage} is your most-used language`,
    };
  return null;
};

const loyaltyLine = (s: Signals): BioLine | null => {
  if (s.active_years >= 6)
    return {
      line: `${s.active_years} years on GitHub and still shipping — long-term material.`,
      reason: `${s.active_years} active years`,
    };
  return null;
};

const energyLine = (s: Signals): BioLine | null => {
  if (s.recent_spike)
    return {
      line: "Currently in my 'just one more commit' era.",
      reason: "your recent activity is spiking hard",
    };
  if (s.active_days_recent >= 200)
    return {
      line: "Online a lot. Mostly for the green squares, but also for you.",
      reason: `${s.active_days_recent} active days this year`,
    };
  return null;
};

export function buildBio(s: Signals): { bio: string[]; reasons: string[] } {
  const lines: BioLine[] = [
    firstLine(s),
    commitLine(s),
  ];
  for (const make of [communityLine, languageLine, loyaltyLine, energyLine]) {
    const extra = make(s);
    if (extra) lines.push(extra);
  }
  // The classic closer: merge requests and conflicts. Always last.
  lines.push({
    line: "Loves merge requests. Hates conflicts.",
    reason: "universal truth",
  });
  return { bio: lines.map((l) => l.line), reasons: lines.map((l) => l.reason) };
}

// --- Passion tags ------------------------------------------------------------

export function buildTags(s: Signals): Tag[] {
  const tags: Tag[] = [];
  const push = (label: string, icon: string, reason: string) =>
    tags.push({ label, icon, reason });

  push("Open source", "github", `shipping on GitHub since ${Math.max(2026 - Math.floor(s.account_age_years), 2008)}`);

  if (s.prs_to_others >= 5)
    push("Merge requests", "git-pull-request", `${s.prs_to_others} PRs to other projects this year`);
  if (s.reviews >= 5)
    push("Code review", "message-square", `${s.reviews} pull requests reviewed`);
  if (s.issues_closed >= 5)
    push("Issue resolver", "check-check", `${s.issues_closed} issues closed`);
  if (s.languages >= 5)
    push("Polyglot", "languages", `${s.languages} languages and counting`);
  if (s.total_stars_owned >= 500)
    push("Star magnet", "star", `${fmt(s.total_stars_owned)} stars across repos`);
  if (s.followers >= 500)
    push("In-demand", "users", `${fmt(s.followers)} followers`);
  if (s.public_repos >= 10)
    push("Maintainer", "folder-git-2", `${s.public_repos} public repos`);
  if (s.active_years >= 5)
    push("Long-term", "heart-handshake", `${s.active_years} active years`);
  if (s.recent_spike)
    push("Trending", "trending-up", "hot streak right now");
  if (s.active_days_recent >= 200)
    push("Weekend warrior", "flame", `${s.active_days_recent} active days this year`);
  if (s.total_contributions_lifetime <= 50 && s.total_stars_owned < 50)
    push("Low-key", "moon", "quality over quantity");

  // Always at least a couple of tags.
  if (tags.length < 2) push("Coffee-driven", "coffee", "fueled by caffeine and CI");
  return tags.slice(0, 6);
}

// --- Looking for -------------------------------------------------------------

const LOOKING_FOR: Record<TraitKey, string> = {
  spark: "Someone who'll star my repos back.",
  chat: "A conversation that outlives the merge.",
  style: "A partner who knows more than one stack.",
  loyal: "Someone to commit to. Long-term.",
  care: "Someone who actually reads my README.",
  energy: "An adventure partner for late-night deploys.",
};

export function lookingFor(s: Signals, topTrait: TraitKey): string {
  if (s.prs_to_others >= 10)
    return "A fellow merge-request enthusiast — the conflict-free kind.";
  if (s.active_days_recent <= 10 && s.account_age_years >= 3)
    return "Someone patient. I reply to texts the way I reply to PR comments.";
  return LOOKING_FOR[topTrait];
}

// --- Presence ----------------------------------------------------------------

export function onlineState(s: Signals): OnlineState {
  if (s.recent_spike) return "online";
  if (s.active_days_recent >= 30) return "online";
  if (s.active_days_recent >= 5) return "away";
  return "offline";
}
