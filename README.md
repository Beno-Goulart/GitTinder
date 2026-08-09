<div align="center">

# GitTinder

**your GitHub, on a date** 💘

<sub>GitHub × Tinder — a dating profile for any GitHub account, rated 0–99.</sub>

<br/>

<a href="https://gittinder.com/torvalds"><img src="https://gittinder.com/torvalds.png" width="220" alt="GitTinder card"></a>
<a href="https://gittinder.com/ThePrimeagen"><img src="https://gittinder.com/ThePrimeagen.png" width="220" alt="GitTinder card"></a>
<a href="https://gittinder.com/t3dotgg"><img src="https://gittinder.com/t3dotgg.png" width="220" alt="GitTinder card"></a>

<br/><br/>

</div>

<br/>

## 💘 &nbsp;Find your match

Enter a GitHub username and get a Tinder-style dating profile, read straight from real GitHub stats — no self-reporting, no surveys. A match score, a tier, a generated bio, passions, a vibe and the six traits that explain it all. Is it a match?

| | |
|---|---|
| **`gittinder.com/<username>`** | the full scout report |
| **`gittinder.com/<username>.png`** | your card, as a live image |
| **`gittinder.com/api/card/<username>`** | the raw profile JSON |

The card lives at a URL — drop it in your profile README, your portfolio, anywhere — and it re-matches itself as your stats change:

```md
[![My GitTinder card](https://gittinder.com/YOUR_USERNAME.png)](https://gittinder.com/YOUR_USERNAME)
```

Every profile also unfurls with its exact rating: sharing `gittinder.com/<username>` on Twitter/Slack/Discord renders a landscape 1200×630 OG image with the match score, tier and card.

<br/>

## ⚙️ &nbsp;How the matchmaking works

A scout pulls real numbers from GitHub's GraphQL API (`contributionsCollection` — the only API that returns real commit / PR / review / issue / calendar data) and maps them onto **six dating traits**:

| | Trait | Scouted from |
|:--:|:--|:--|
| **SPARK** | Instant chemistry | Star power across your repos |
| **CHAT** | Conversation game | PRs opened + followers earned |
| **STYLE** | Fashion sense | How many stacks you switch up |
| **LOYAL** | Loyalty | Years of consistent contributions |
| **CARE** | Care | Reviews and issues you actually tend to |
| **ENERGY** | Energy | Recent activity and staying power |

Your **match** (0–99) is the headline — a weighted blend of the six, with the social/visual traits carrying the profile the way a dating app weights a first impression:

```
match = 0.25·SPARK + 0.20·CHAT + 0.20·ENERGY + 0.15·STYLE + 0.10·CARE + 0.10·LOYAL
```

The raw traits cap at **88** — the 90s are a legacy gate, bought with years and sustained influence, so one heroic year won't crown you **THE ONE**. Every match walks out in a tier:

<div align="center">

![RED FLAG](https://img.shields.io/badge/RED_FLAG-0%E2%80%9349-fb5c66?style=flat-square&labelColor=1A1A2E)
![GREEN FLAG](https://img.shields.io/badge/GREEN_FLAG-50%E2%80%9359-34d87b?style=flat-square&labelColor=1A1A2E)
![KEEPER](https://img.shields.io/badge/KEEPER-60%E2%80%9369-ffb02e?style=flat-square&labelColor=1A1A2E)
![A CATCH](https://img.shields.io/badge/A_CATCH-70%E2%80%9379-ff6fb2?style=flat-square&labelColor=1A1A2E)
![HEAD-TURNER](https://img.shields.io/badge/HEAD--TURNER-80%E2%80%9389-ff3d7f?style=flat-square&labelColor=1A1A2E)
![THE ONE](https://img.shields.io/badge/THE_ONE-90%2B-ffd166?style=flat-square&labelColor=1A1A2E)

</div>

### The personality layer

Beyond the score, the algorithm writes a character out of the same numbers — and every line is anchored to a real figure, so nothing is invented (the humor is in the framing):

- **Bio** — generated lines like *"My repos are famous. My DMs are not."* or *"Loves merge requests. Hates conflicts."*
- **Passion tags** — *Open source*, *Merge requests*, *Star magnet*, *In-demand*, *Polyglot*… each with the real number that earned it.
- **A vibe** — the archetype read off your trait shape: **The Influencer**, **The Social Butterfly**, **The Polyglot**, **The Long-Hauler**, **The Reviewer**, **The Weekend Warrior**, or simply **The Catch** when the shape is strong and balanced.
- **The gags** — "age" is your years on GitHub, "height" is your star count mapped to feet (`6'2"` in repos), online/away/offline reads off your contribution calendar, and a ✓ badge means enough followers or stars to look legit.

### The scoring rulebook

The six traits are drawn through a small pipeline: raw estimates from the signals, z-scored against your own shape, tension-penalised (nobody is elite at everything — *spark* fights *loyal*, *style* fights *care*, *energy* fights *loyal*), spiked around a magnitude center, and pulled toward a shared "attractive core" so the six read as one coherent character. The **match** is the weighted blend plus a legacy bonus for years and influence. Your per-year history sits behind the numbers — the lifetime contributions, `active_years` and "member since" all come from real per-year contribution windows.

<br/>

## 🃏 &nbsp;The card

One layout, three surfaces: the live `<DatingCard/>` in the app, the embeddable `/<user>.png` and the OG image are all the same design — photo up top, match score top-left, tier pill top-right, bio and language "interests" over a gradient plate. The PNG is re-created server-side with **Satori** (`next/og`) so it scales 1:1 with the in-app card and caches at the CDN — no object store to keep in sync. A failed scout renders a small branded hint instead of a broken image.

<br/>

## 🚀 &nbsp;Run it yourself

```bash
npm install
npm run dev       # http://localhost:3000
npm run build && npm start   # production
npm run lint      # eslint
npm test          # vitest
```

Environment:

| Variable | Required | Notes |
|---|---|---|
| `GITHUB_TOKEN` | ✓ (or `GITHUB_TOKENS`) | a GitHub token for the GraphQL API (goes from ~60 unauthenticated req/hr to ~5,000) |
| `GITHUB_TOKENS` | (alternative) | a comma-separated pool — each scout is hash-sharded to one token, with a single failover retry on rate limits |
| `REDIS_URL` | ✗ | optional read-through cache (2h TTL). Without it, every scout hits GitHub live |

Tokenless demo: with no token configured, the four baked home-profile samples (`torvalds`, `ThePrimeagen`, `pewdiepie-archdaemon`, `t3dotgg`) still resolve so the app stays explorable.

Cache notes: profiles are cached in Redis (2h TTL, best-effort — a miss or an outage just falls through to a live fetch), and concurrent scouts of the same login collapse onto one in-flight build.

<br/>

<div align="center">

**Built with** Next.js · React · TypeScript · Tailwind · Satori · Redis · sharp

**[gittinder.com](https://gittinder.com)** &nbsp;·&nbsp; is it a match?

</div>
