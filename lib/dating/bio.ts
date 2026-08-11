import type { OnlineState, Signals, Tag, TraitKey } from "./types";

// The dating copy layer: turns raw GitHub numbers into profile lines, passion
// tags and a "looking for" hook. Every line is anchored to a real number (the
// reason strings carry it) so nothing is invented — the humor is in the framing.
//
// Each line has several phrasings; a stable hash of the login picks one, so a
// given account always reads the same lines (the profile is cached and rendered
// into cards and OG images), while different accounts tell the story differently.

const fmt = (n: number) => n.toLocaleString("en-US");

// FNV-1a — a cheap stable hash used to seed the phrasing choice per login.
export function profileSeed(login: string): number {
  let h = 2166136261;
  for (let i = 0; i < login.length; i++) {
    h ^= login.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const oneOf = (seed: number, salt: number, variants: string[]): string =>
  variants[(seed + salt) % variants.length];

// --- Bio lines ---------------------------------------------------------------
// Each returns a { line, reason } pair; the reason powers the report explainer.

interface BioLine {
  line: string;
  reason: string;
}

const firstLine = (s: Signals, seed: number): BioLine => {
  if (s.total_stars_owned >= 5000)
    return {
      line: oneOf(seed, 0, [
        "My repos are famous. My DMs are not.",
        "The stars are in my corner. Now I'm working on the people.",
        "My repository gets more attention than I do. It's a work in progress.",
      ]),
      reason: `${fmt(s.total_stars_owned)} stars across your repos`,
    };
  if (s.total_stars_owned >= 200)
    return {
      line: oneOf(seed, 1, [
        "I have a couple of popular repos. Trying to be a well-rounded person too.",
        "A few of my repos are doing numbers. I'm not above admitting it.",
        "Somewhere between underrated and 'actually kind of known'. Ask me which.",
      ]),
      reason: `${fmt(s.total_stars_owned)} stars across your repos`,
    };
  return {
    line: oneOf(seed, 2, [
      "Not here for the stars. (Well. Maybe a few.)",
      "Quality over quantity. Mostly over quantity though.",
      "Small star count, big personality. That's the pitch.",
    ]),
    reason: `${fmt(s.total_stars_owned)} stars across your repos`,
  };
};

const commitLine = (s: Signals, seed: number): BioLine => ({
  line: oneOf(seed, 3, [
    "I commit. To the repo. And, reportedly, to the one who replies.",
    "Reliable. Consistent. I push daily — and I'm loyal about it.",
    "I show up every day. Usually to a terminal, sometimes to a person.",
  ]),
  reason: `${fmt(s.recent_commits)} commits this year`,
});

const communityLine = (s: Signals, seed: number): BioLine | null => {
  if (s.prs_to_others >= 20)
    return {
      line: oneOf(seed, 4, [
        "I've opened enough PRs to know how to make the first move.",
        "Making the first move is a skill. I've practiced it in public.",
        "I don't wait around — I open the conversation myself.",
      ]),
      reason: `${fmt(s.prs_to_others)} pull requests opened this year`,
    };
  if (s.reviews >= 20)
    return {
      line: oneOf(seed, 5, [
        "I read your PRs before I read your mind. And I leave helpful comments.",
        "I give thoughtful, line-by-line attention. It's a love language.",
        "Some people read between the lines. I review them.",
      ]),
      reason: `${fmt(s.reviews)} pull requests reviewed this year`,
    };
  if (s.issues_closed >= 10)
    return {
      line: oneOf(seed, 6, [
        "I respond to issues faster than I respond to texts.",
        "I close things. Tickets, tabs, conversations about merge conflicts.",
        "You can count on me — I literally have a closed-items count.",
      ]),
      reason: `${fmt(s.issues_closed)} issues closed this year`,
    };
  return null;
};

const languageLine = (s: Signals, seed: number): BioLine | null => {
  if (s.languages >= 6)
    return {
      line: oneOf(seed, 7, [
        `I speak ${s.languages} languages, fluently-ish.`,
        `${s.languages} languages and counting. I'll learn yours next.`,
        `Fluent in ${s.languages} stacks. Pick your favorite, we'll start there.`,
      ]),
      reason: `${s.languages} languages across your repos`,
    };
  if (s.topLanguage)
    return {
      line: oneOf(seed, 8, [
        `${s.topLanguage} is my love language.`,
        `Ask me about ${s.topLanguage}. I could talk about it for hours.`,
        `Monogamous with ${s.topLanguage}. Emotionally available though.`,
      ]),
      reason: `${s.topLanguage} is your most-used language`,
    };
  return null;
};

const loyaltyLine = (s: Signals, seed: number): BioLine | null => {
  if (s.active_years >= 6)
    return {
      line: oneOf(seed, 9, [
        `${s.active_years} years on GitHub and still shipping — long-term material.`,
        `Over ${s.active_years} years in and haven't left. Loyalty is a feature.`,
        `${s.active_years} years, still committing. I'm built for the long run.`,
      ]),
      reason: `${s.active_years} active years`,
    };
  return null;
};

const energyLine = (s: Signals, seed: number): BioLine | null => {
  if (s.recent_spike)
    return {
      line: oneOf(seed, 10, [
        "Currently in my 'just one more commit' era.",
        "Everything is moving fast right now. It's a good season for me.",
        "I'm on a streak and I intend to keep it that way.",
      ]),
      reason: "your recent activity is spiking hard",
    };
  if (s.active_days_recent >= 200)
    return {
      line: oneOf(seed, 11, [
        "Online a lot. Mostly for the green squares, but also for you.",
        "Consistent is my love language — every single day.",
        "I keep the streak alive. It's basically a relationship already.",
      ]),
      reason: `${s.active_days_recent} active days this year`,
    };
  return null;
};

export function buildBio(s: Signals): { bio: string[]; reasons: string[] } {
  const seed = profileSeed(s.login);
  const lines: BioLine[] = [
    firstLine(s, seed),
    commitLine(s, seed),
  ];
  for (const make of [communityLine, languageLine, loyaltyLine, energyLine]) {
    const extra = make(s, seed);
    if (extra) lines.push(extra);
  }
  // The classic closer: merge requests and conflicts. Always last.
  lines.push({
    line: oneOf(seed, 12, [
      "Loves merge requests. Hates conflicts.",
      "Will merge fast. Will not rebase your heart.",
      "Looking for a clean merge — no conflicts, no drama.",
    ]),
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

const LOOKING_FOR: Record<TraitKey, string[]> = {
  spark: [
    "Someone who'll star my repos back.",
    "Someone impressed by numbers — I have a few.",
    "A fan of my highlights, not just my forked history.",
  ],
  chat: [
    "A conversation that outlives the merge.",
    "Someone who replies with substance, not just emoji.",
    "A dialogue with fewer than 3 merge conflicts.",
  ],
  style: [
    "A partner who knows more than one stack.",
    "Someone who can switch contexts with me.",
    "A polyglot. Or at least someone open to one.",
  ],
  loyal: [
    "Someone to commit to. Long-term.",
    "A long-term relationship — the LTS kind.",
    "Someone who stays after the initial excitement fades.",
  ],
  care: [
    "Someone who actually reads my README.",
    "Someone who reads the fine print and stays anyway.",
    "A reviewer of my life — kindly, with comments.",
  ],
  energy: [
    "An adventure partner for late-night deploys.",
    "Someone who keeps up with my pace.",
    "A co-author for the next sprint.",
  ],
};

export function lookingFor(s: Signals, topTrait: TraitKey): string {
  const seed = profileSeed(s.login);
  if (s.prs_to_others >= 10)
    return oneOf(seed, 13, [
      "A fellow merge-request enthusiast — the conflict-free kind.",
      "Someone who opens PRs, not just arguments.",
      "A teammate for open source and open hearts.",
    ]);
  if (s.active_days_recent <= 10 && s.account_age_years >= 3)
    return oneOf(seed, 14, [
      "Someone patient. I reply to texts the way I reply to PR comments.",
      "A patient heart — I work in my own timezone.",
      "Someone who doesn't expect same-day responses.",
    ]);
  return oneOf(seed, 15, LOOKING_FOR[topTrait]);
}

// --- Presence ----------------------------------------------------------------

export function onlineState(s: Signals): OnlineState {
  if (s.recent_spike) return "online";
  if (s.active_days_recent >= 30) return "online";
  if (s.active_days_recent >= 5) return "away";
  return "offline";
}
