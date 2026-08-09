// Dating-app/dev puns — rotate on the loading screen and the match overlay.
const PUNS = [
  "their CI runs green when they see you",
  "zero merge conflicts so far, and we've checked",
  "they starred your profile before you even liked them",
  "you have so much in common — mostly merge requests",
  "your commit messages finally have a recipient",
  "the algorithm ships, ships, ships",
  "one of you is definitely the repo owner here",
  "their contribution graph looks like a heartbeat already",
  "no forks, no drama — just a clean merge",
  "they linted your profile and it passed",
  "your bio had them at 'git pull --rebase'",
  "somewhere, a README just said 'made with love'",
];

export const punAt = (i: number) => PUNS[Math.abs(i) % PUNS.length];
