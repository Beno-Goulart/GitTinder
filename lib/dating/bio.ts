import { dicts, fmt } from "@/lib/i18n/dicts";
import type { Dictionary } from "@/lib/i18n/dicts";
import { fmtNum } from "@/lib/i18n/locale";
import type { Locale } from "@/lib/i18n/locale";
import type { OnlineState, Signals, Tag, TraitKey } from "./types";

// The dating copy layer: turns raw GitHub numbers into profile lines, passion
// tags and a "looking for" hook. Every line is anchored to a real number (the
// reason strings carry it) so nothing is invented — the humor is in the framing.
// All wording lives in the i18n dictionaries; each builder takes the locale's
// dict so the same numbers read in the viewer's language.
//
// Each line has several phrasings; a stable hash of the login picks one, so a
// given account always reads the same lines (the profile is cached and rendered
// into cards and OG images), while different accounts tell the story differently.

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

const dictFor = (locale: Locale): Dictionary => dicts[locale];
const num = (n: number, locale: Locale) => fmtNum(n, locale);

// --- Bio lines ---------------------------------------------------------------
// Each returns a { line, reason } pair; the reason powers the report explainer.

interface BioLine {
  line: string;
  reason: string;
}

const fromGroup = (
  dict: Dictionary,
  key: keyof Dictionary["copy"]["bio"],
  seed: number,
  salt: number,
  params: Record<string, string | number> = {},
): BioLine => {
  const group = dict.copy.bio[key];
  return { line: oneOf(seed, salt, group.lines), reason: fmt(group.reason, params) };
};

const firstLine = (s: Signals, seed: number, locale: Locale): BioLine => {
  const stars = num(s.total_stars_owned, locale);
  const dict = dictFor(locale);
  if (s.total_stars_owned >= 5000) return fromGroup(dict, "starsHigh", seed, 0, { n: stars });
  if (s.total_stars_owned >= 200) return fromGroup(dict, "starsMid", seed, 1, { n: stars });
  return fromGroup(dict, "starsLow", seed, 2, { n: stars });
};

const commitLine = (s: Signals, seed: number, locale: Locale): BioLine =>
  fromGroup(dictFor(locale), "commit", seed, 3, { n: num(s.recent_commits, locale) });

const communityLine = (s: Signals, seed: number, locale: Locale): BioLine | null => {
  if (s.prs_to_others >= 20)
    return fromGroup(dictFor(locale), "communityPrs", seed, 4, { n: num(s.prs_to_others, locale) });
  if (s.reviews >= 20)
    return fromGroup(dictFor(locale), "communityReviews", seed, 5, { n: num(s.reviews, locale) });
  if (s.issues_closed >= 10)
    return fromGroup(dictFor(locale), "communityIssues", seed, 6, { n: num(s.issues_closed, locale) });
  return null;
};

const languageLine = (s: Signals, seed: number, locale: Locale): BioLine | null => {
  if (s.languages >= 6)
    return fromGroup(dictFor(locale), "languagesPoly", seed, 7, { n: num(s.languages, locale) });
  if (s.topLanguage)
    return fromGroup(dictFor(locale), "languagesTop", seed, 8, { lang: s.topLanguage });
  return null;
};

const loyaltyLine = (s: Signals, seed: number, locale: Locale): BioLine | null => {
  if (s.active_years >= 6)
    return fromGroup(dictFor(locale), "loyalty", seed, 9, { n: num(s.active_years, locale) });
  return null;
};

const energyLine = (s: Signals, seed: number, locale: Locale): BioLine | null => {
  if (s.recent_spike) return fromGroup(dictFor(locale), "energySpike", seed, 10);
  if (s.active_days_recent >= 200)
    return fromGroup(dictFor(locale), "energyConsistent", seed, 11, {
      n: num(s.active_days_recent, locale),
    });
  return null;
};

export function buildBio(s: Signals, locale: Locale = "en"): { bio: string[]; reasons: string[] } {
  const seed = profileSeed(s.login);
  const lines: BioLine[] = [
    firstLine(s, seed, locale),
    commitLine(s, seed, locale),
  ];
  for (const make of [communityLine, languageLine, loyaltyLine, energyLine]) {
    const extra = make(s, seed, locale);
    if (extra) lines.push(extra);
  }
  // The classic closer: merge requests and conflicts. Always last.
  lines.push(fromGroup(dictFor(locale), "closer", seed, 12));
  return { bio: lines.map((l) => l.line), reasons: lines.map((l) => l.reason) };
}

// --- Passion tags ------------------------------------------------------------

export function buildTags(s: Signals, locale: Locale = "en"): Tag[] {
  const dict = dictFor(locale);
  const tags: Tag[] = [];
  const push = (key: keyof Dictionary["copy"]["tags"], icon: string, params: Record<string, string | number> = {}) =>
    tags.push({ label: dict.copy.tags[key].label, icon, reason: fmt(dict.copy.tags[key].reason, params) });

  push(
    "openSource",
    "github",
    { year: String(Math.max(2026 - Math.floor(s.account_age_years), 2008)) },
  );

  if (s.prs_to_others >= 5)
    push("mergeRequests", "git-pull-request", { n: num(s.prs_to_others, locale) });
  if (s.reviews >= 5) push("codeReview", "message-square", { n: num(s.reviews, locale) });
  if (s.issues_closed >= 5) push("issueResolver", "check-check", { n: num(s.issues_closed, locale) });
  if (s.languages >= 5) push("polyglot", "languages", { n: num(s.languages, locale) });
  if (s.total_stars_owned >= 500)
    push("starMagnet", "star", { n: num(s.total_stars_owned, locale) });
  if (s.followers >= 500) push("inDemand", "users", { n: num(s.followers, locale) });
  if (s.public_repos >= 10) push("maintainer", "folder-git-2", { n: num(s.public_repos, locale) });
  if (s.active_years >= 5) push("longTerm", "heart-handshake", { n: num(s.active_years, locale) });
  if (s.recent_spike) push("trending", "trending-up");
  if (s.active_days_recent >= 200)
    push("weekendWarrior", "flame", { n: num(s.active_days_recent, locale) });
  if (s.total_contributions_lifetime <= 50 && s.total_stars_owned < 50)
    push("lowKey", "moon");

  // Always at least a couple of tags.
  if (tags.length < 2) push("coffeeDriven", "coffee");
  return tags.slice(0, 6);
}

// --- Looking for -------------------------------------------------------------

export function lookingFor(s: Signals, topTrait: TraitKey, locale: Locale = "en"): string {
  const seed = profileSeed(s.login);
  const dict = dictFor(locale);
  if (s.prs_to_others >= 10) return oneOf(seed, 13, dict.copy.lookingFor.prEnthusiast);
  if (s.active_days_recent <= 10 && s.account_age_years >= 3)
    return oneOf(seed, 14, dict.copy.lookingFor.patient);
  return oneOf(seed, 15, dict.copy.lookingFor[topTrait]);
}

// --- Presence ----------------------------------------------------------------

export function onlineState(s: Signals): OnlineState {
  if (s.recent_spike) return "online";
  if (s.active_days_recent >= 30) return "online";
  if (s.active_days_recent >= 5) return "away";
  return "offline";
}
