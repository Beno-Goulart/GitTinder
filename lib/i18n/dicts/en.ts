// English dictionary — the canonical shape for every other locale. Everything a
// surface renders (metadata, UI chrome, generated profile copy, puns) lives here
// as plain serializable data; dynamic strings use {placeholder} tokens resolved
// through `fmt` (lib/i18n/dicts.ts). PT mirrors this shape exactly.

const en = {
  meta: {
    homeTitle: "GitTinder — your GitHub, on a date",
    homeDescription:
      "Enter a GitHub username and get a Tinder-style dating profile rated 0–99 — match score, tier, bio and passions, scored from real GitHub stats.",
    homeKeywords: [
      "GitHub dating profile",
      "rate my GitHub",
      "GitHub stats",
      "developer dating card",
      "GitHub match",
      "Tinder for developers",
      "GitTinder",
    ],
    jsonLdWebsite: "Turn any GitHub profile into a dating profile, rated 0–99.",
    jsonLdApp:
      "Enter a GitHub username and get a Tinder-style dating profile built from real GitHub stats — match score, tier, bio, passions.",
    vsTitle: "Test compatibility · GitTinder",
    vsDescription:
      "Two GitHub usernames. One compatibility score. Check the chemistry between any two developers.",
    vsPairTitle: "@{a} × @{b} — chemistry · GitTinder",
    vsPairDescription: "Are @{a} and @{b} a match? Check their GitTinder chemistry.",
    profileTitle: "{name}, {age} — {match}% match · GitTinder",
    profileDescription: "{name} on GitTinder: {match}% match, {tier}, {vibe}.",
    profileShortTitle: "@{login} · GitTinder",
    notFoundTitle: "404 · No match — GitTinder",
  },

  ui: {
    // Home / scout form
    mascotAlt: "GitTinder mascot",
    heroLine1: "One GitHub username.",
    heroLine2: "One dating",
    heroLine2Accent: "profile.",
    heroSub: "Rated 0–99, complete with a bio, passions and a tier",
    heroAccent: "is it a match?",
    searchPlaceholder: "github username or name",
    searchAria: "GitHub username or name",
    searchingNames: "scouting names…",
    matchMe: "MATCH ME",
    matching: "MATCHING…",
    matchOwnGitHub: "Match your own GitHub",
    surpriseMe: "Surprise me",
    authError: "GitHub sign-in didn't finish — try again.",
    unknown: "unknown",
    try: "try",
    orYourOwn: "· or your own",
    profilesMatched: "profiles matched",

    // Top profiles strip
    topProfiles: "TOP PROFILES",
    match: "MATCH",

    // Footer
    madeWith: "Made with",
    fromGitHubProfiles: "from GitHub profiles ·",
    notRealDatingApp: "not a real dating app — your commits are.",

    // Loading screen
    matchingTitle: "MATCHING",

    // Profile page
    share: "SHARE",
    reposLabel: "{n} repos",
    testCompatibility: "TEST COMPATIBILITY",
    github: "GITHUB ↗",
    theSixTraits: "THE SIX TRAITS",
    about: "ABOUT",
    scoringMetrics: "SCORING METRICS",
    embedTheCard: "EMBED THE CARD",
    memberSince: "Member since",
    spreadTheVerdict: "SPREAD THE",
    spreadTheVerdictAccent: "VERDICT.",
    spreadParagraph:
      "Your card already carries the score — now make sure everyone sees it. Share it, challenge a friend, or find out who you'd match with.",
    challengeAFriend: "CHALLENGE A FRIEND",
    seeWhoMatchesYou: "SEE WHO MATCHES YOU ↓",
    keepSwiping: "KEEP SWIPING",
    reshuffle: "reshuffle",
    verifiedTitle: "Verified by stars, probably",
    noSpark: "@{login} wasn't into it — keep swiping",
    profileShareTitle: "{name} — rated {match} on GitTinder",
    profileShareText: "{name} rated {match} on GitTinder. Is it a match?",

    // Compat page
    newPair: "NEW PAIR ↗",
    chemistry: "CHEMISTRY",
    chemistryReport: "CHEMISTRY REPORT",
    pairMeta: "@{a} × @{b} · {score}% chemistry",
    theOverlay: "THE OVERLAY",
    overlayParagraph:
      "Both shapes on one radar — where they overlap and where they diverge. Hover an axis to compare trait by trait.",
    theChemistry: "THE CHEMISTRY",
    sharedLanguagesMeter: "Shared languages",
    sameCore: "Same core",
    complementaryEdges: "Complementary edges",
    onPaperCharm: "On-paper charm",
    inCommon: "IN COMMON",
    oneSharedLanguage: "One language you both speak:",
    sharedLanguagesIntro: "Languages you both speak:",
    noSharedLanguages:
      "Zero languages in common — every conversation starts from a different directory. Sometimes that's the point.",
    howYouFit: "HOW YOU FIT",
    leadsOn: "leads on {trait}",
    sameLane: "SAME LANE",
    counterweight: "COUNTERWEIGHT",
    challengeHeading: "CHALLENGE A",
    challengeHeadingAccent: "FRIEND.",
    challengeParagraph:
      "Send them this matchup and let them argue with the numbers. It's better when they see it themselves.",
    home: "HOME",
    homeAria: "GitTinder home",
    shareTitle: "@{a} × @{b} — {score}% chemistry on GitTinder",
    shareText: "Are @{a} and @{b} a match? {score}% chemistry on GitTinder.",

    // Swipe deck
    like: "LIKE",
    nope: "NOPE",
    left: "{n} LEFT",
    shuffleAgain: "SHUFFLE AGAIN",
    profileOne: "profile",
    profileMany: "profiles",
    likeOne: "like",
    likeMany: "likes",
    ratedSummary: "You rated {count} {profiles} — {likes} {likesWord}.",
    emptyDeck: "No profiles in the deck yet.",
    nopeAria: "Nope",
    likeAria: "Like",

    // Card share
    shareTheCard: "SHARE THE CARD",
    copied: "COPIED",
    moreShareOptions: "More share options",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    downloadImage: "Download image",
    imageSaved: "Image saved",

    // Social share
    shareOnX: "SHARE ON X",
    shareOnLinkedIn: "SHARE ON LINKEDIN",

    // Embed snippet
    putACardOnIt: "PUT A CARD ON IT",
    copy: "COPY",
    ratedOn: "{name} — rated on GitTinder",

    // Compat picker
    firstUsername: "First GitHub username or name",
    secondUsername: "Second GitHub username or name",
    usernameOne: "username one",
    usernameTwo: "username two",
    check: "CHECK",
    orAnyTwo: "…or any two usernames",

    // Aria / tooltips
    sourceAria: "GitTinder source on GitHub",
    language: "Language",
    toLight: "Switch to light mode",
    toDark: "Switch to dark mode",

    // 404
    swipedLeft: "SWIPED LEFT",
    noMatch: "NO MATCH",
    notFoundParagraph:
      "This profile swiped left on the URL — there's no route here.",
    findAMatch: "FIND A MATCH",
    matchADeveloper: "Match a developer →",

    // Error boundary
    dateWentQuiet: "The date went quiet",
    dateWentQuietParagraph:
      "Something broke mid-match. Try again — if it keeps happening, the algorithm may be down for a moment.",
    tryAgain: "TRY AGAIN",

    // Scout / vs error states
    tooManySwipes: "Too many right swipes",
    noProfileFound: "No profile found",
    matchingInterrupted: "Matching interrupted",
    rateLimitMessage:
      "The algorithm's on a coffee date — GitHub just rate-limited us. Give it a couple minutes, then try @{username} again.",
    rateLimitMessageVs:
      "The algorithm's on a coffee date — GitHub just rate-limited us. Give it a couple minutes, then check {which} again.",
    noUserMessage: "There's no GitHub user named @{username}.",
    invalidUserMessage: "“{username}” isn't a valid GitHub username.",
    noUserMessageVs: "There's no GitHub user named @{login} — that's your {which} pick.",
    invalidUserMessageVs: "“{login}” isn't a valid GitHub username — that's your {which} pick.",
    whichFirst: "first",
    whichSecond: "second",
    matchSomeoneElse: "MATCH SOMEONE ELSE",

    // VS landing
    checkTheChemistry: "CHECK THE",
    checkTheChemistryAccent: "CHEMISTRY.",
    vsHeroSub: "Two GitHub usernames. One compatibility score. Is it a merge or a rebase?",

    // Match overlay
    itsAMatch: "IT'S A MATCH",
    matchAria: "It's a match",
    close: "Close",
    chemistryLabel: "{spark}% chemistry",
    swipedBack: "{name} swiped back. See the full report and decide together.",
    shareTheMatch: "SHARE THE MATCH",
    keepBrowsing: "keep browsing",
  },

  traits: {
    spark: { label: "SPARK", desc: "Instant chemistry — star power across your repos" },
    chat: { label: "CHAT", desc: "Conversation game — PRs opened and followers earned" },
    style: { label: "STYLE", desc: "Fashion sense — how many stacks you switch up" },
    loyal: { label: "LOYAL", desc: "Loyalty — years of consistent contributions" },
    care: { label: "CARE", desc: "Care — reviews and issues you actually tend to" },
    energy: { label: "ENERGY", desc: "Energy — recent activity and staying power" },
  },

  tiers: {
    red: "RED FLAG",
    green: "GREEN FLAG",
    keeper: "KEEPER",
    catch: "A CATCH",
    turner: "HEAD-TURNER",
    one: "THE ONE",
  },

  compat: {
    tiers: {
      merge: {
        label: "MATCH MADE IN MERGE",
        verdict: "Merge the branches and rewrite the README — this one ships.",
      },
      sparks: {
        label: "SPARKS FLYING",
        verdict: "Definite chemistry. Expect a pull request before the check clears.",
      },
      vibes: {
        label: "GOOD VIBES",
        verdict: "Good energy and good signal — worth a coffee date and a pair commit.",
      },
      coffee: {
        label: "COFFEE DATE",
        verdict: "A maybe. Low-stakes merge to test the waters.",
      },
      complicated: {
        label: "IT'S COMPLICATED",
        verdict: "Conflicting dependencies — resolving this could take a while.",
      },
      nope: {
        label: "SWIPE LEFT",
        verdict: "Rebase or reset — the branches just don't agree.",
      },
    },
    notes: {
      sharedOne: "Both speak {langs}.",
      sharedMany: "Both speak {langs} — a shared mother tongue.",
      none: "No languages in common — opposites attract (or don't).",
      sameLane:
        "@{a} and @{b} both lead on {trait} — same lane, could be a race or a relay.",
      differentCorners:
        "@{a} leads on {traitA}, @{b} on {traitB} — different corners of the radar.",
      charm: "On paper: {score}% average match ({a}% × {b}%).",
    },
  },

  og: {
    homeFindYour: "FIND YOUR",
    homeMatch: "MATCH",
    homeSub:
      "One GitHub username. One dating profile. Rated 0–99 — bio, passions and a tier.",
    homeTopMatch: "Highest match so far: {name} at {score}%.",
    getMatched: "Get your GitHub matched, rated 0–99.",
    vsSub: "Two usernames. One score out of 99.",
    cardFallback: "get this profile matched at",
    bothSpeak: "BOTH SPEAK",
    nothingYet: "…nothing yet",
  },

  baked: {
    lines: {
      "My repos are famous. My DMs are not.":
        "My repos are famous. My DMs are not.",
      "I commit. To the repo. And, reportedly, to the one who replies.":
        "I commit. To the repo. And, reportedly, to the one who replies.",
      "I've opened enough PRs to know how to make the first move.":
        "I've opened enough PRs to know how to make the first move.",
      "Currently in my 'just one more commit' era.":
        "Currently in my 'just one more commit' era.",
      "Loves merge requests. Hates conflicts.":
        "Loves merge requests. Hates conflicts.",
      "Not here for the stars. (Well. Maybe a few.)":
        "Not here for the stars. (Well. Maybe a few.)",
    },
    speakN: "I speak {n} languages, fluently-ish.",
    shipYears: "{n} years on GitHub and still shipping — long-term material.",
    loveLanguage: "{lang} is my love language.",
  },

  copy: {
    bio: {
      starsHigh: {
        lines: [
          "My repos are famous. My DMs are not.",
          "The stars are in my corner. Now I'm working on the people.",
          "My repository gets more attention than I do. It's a work in progress.",
        ],
        reason: "{n} stars across your repos",
      },
      starsMid: {
        lines: [
          "I have a couple of popular repos. Trying to be a well-rounded person too.",
          "A few of my repos are doing numbers. I'm not above admitting it.",
          "Somewhere between underrated and 'actually kind of known'. Ask me which.",
        ],
        reason: "{n} stars across your repos",
      },
      starsLow: {
        lines: [
          "Not here for the stars. (Well. Maybe a few.)",
          "Quality over quantity. Mostly over quantity though.",
          "Small star count, big personality. That's the pitch.",
        ],
        reason: "{n} stars across your repos",
      },
      commit: {
        lines: [
          "I commit. To the repo. And, reportedly, to the one who replies.",
          "Reliable. Consistent. I push daily — and I'm loyal about it.",
          "I show up every day. Usually to a terminal, sometimes to a person.",
        ],
        reason: "{n} commits this year",
      },
      communityPrs: {
        lines: [
          "I've opened enough PRs to know how to make the first move.",
          "Making the first move is a skill. I've practiced it in public.",
          "I don't wait around — I open the conversation myself.",
        ],
        reason: "{n} pull requests opened this year",
      },
      communityReviews: {
        lines: [
          "I read your PRs before I read your mind. And I leave helpful comments.",
          "I give thoughtful, line-by-line attention. It's a love language.",
          "Some people read between the lines. I review them.",
        ],
        reason: "{n} pull requests reviewed this year",
      },
      communityIssues: {
        lines: [
          "I respond to issues faster than I respond to texts.",
          "I close things. Tickets, tabs, conversations about merge conflicts.",
          "You can count on me — I literally have a closed-items count.",
        ],
        reason: "{n} issues closed this year",
      },
      languagesPoly: {
        lines: [
          "I speak {n} languages, fluently-ish.",
          "{n} languages and counting. I'll learn yours next.",
          "Fluent in {n} stacks. Pick your favorite, we'll start there.",
        ],
        reason: "{n} languages across your repos",
      },
      languagesTop: {
        lines: [
          "{lang} is my love language.",
          "Ask me about {lang}. I could talk about it for hours.",
          "Monogamous with {lang}. Emotionally available though.",
        ],
        reason: "{lang} is your most-used language",
      },
      loyalty: {
        lines: [
          "{n} years on GitHub and still shipping — long-term material.",
          "Over {n} years in and haven't left. Loyalty is a feature.",
          "{n} years, still committing. I'm built for the long run.",
        ],
        reason: "{n} active years",
      },
      energySpike: {
        lines: [
          "Currently in my 'just one more commit' era.",
          "Everything is moving fast right now. It's a good season for me.",
          "I'm on a streak and I intend to keep it that way.",
        ],
        reason: "your recent activity is spiking hard",
      },
      energyConsistent: {
        lines: [
          "Online a lot. Mostly for the green squares, but also for you.",
          "Consistent is my love language — every single day.",
          "I keep the streak alive. It's basically a relationship already.",
        ],
        reason: "{n} active days this year",
      },
      closer: {
        lines: [
          "Loves merge requests. Hates conflicts.",
          "Will merge fast. Will not rebase your heart.",
          "Looking for a clean merge — no conflicts, no drama.",
        ],
        reason: "universal truth",
      },
    },
    tags: {
      openSource: { label: "Open source", reason: "shipping on GitHub since {year}" },
      mergeRequests: { label: "Merge requests", reason: "{n} PRs to other projects this year" },
      codeReview: { label: "Code review", reason: "{n} pull requests reviewed" },
      issueResolver: { label: "Issue resolver", reason: "{n} issues closed" },
      polyglot: { label: "Polyglot", reason: "{n} languages and counting" },
      starMagnet: { label: "Star magnet", reason: "{n} stars across repos" },
      inDemand: { label: "In-demand", reason: "{n} followers" },
      maintainer: { label: "Maintainer", reason: "{n} public repos" },
      longTerm: { label: "Long-term", reason: "{n} active years" },
      trending: { label: "Trending", reason: "hot streak right now" },
      weekendWarrior: { label: "Weekend warrior", reason: "{n} active days this year" },
      lowKey: { label: "Low-key", reason: "quality over quantity" },
      coffeeDriven: { label: "Coffee-driven", reason: "fueled by caffeine and CI" },
    },
    lookingFor: {
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
      prEnthusiast: [
        "A fellow merge-request enthusiast — the conflict-free kind.",
        "Someone who opens PRs, not just arguments.",
        "A teammate for open source and open hearts.",
      ],
      patient: [
        "Someone patient. I reply to texts the way I reply to PR comments.",
        "A patient heart — I work in my own timezone.",
        "Someone who doesn't expect same-day responses.",
      ],
    },
    vibes: {
      influencer: {
        name: "The Influencer",
        blurbs: [
          "Star power off the charts. Everyone swipes right on a repo with a blue checkmark.",
          "The stars have spoken — and they said yes. A walking highlight reel.",
          "Repos that trend, a name that travels. The algorithm blushes.",
        ],
      },
      butterfly: {
        name: "The Social Butterfly",
        blurbs: [
          "A network machine — {prs} PRs and {reviews} reviews this year, always in the thread.",
          "Threads everywhere — {prs} PRs opened, {reviews} reviews given. Everyone knows them.",
          "The comment section is their living room — {reviews} reviews and {prs} PRs this year.",
        ],
      },
      polyglot: {
        name: "The Polyglot",
        blurbs: [
          "Speaks {languages} languages and will absolutely notice your missing semicolon.",
          "{languages} languages under the belt — the romance ones included, allegedly.",
          "A stack for every occasion — {languages} of them. Never bored, never boring.",
        ],
      },
      longhauler: {
        name: "The Long-Hauler",
        blurbs: [
          "{years} years in and still shipping. Built to last — emotionally available by commit.",
          "{years} years, one account, zero ghosting. This one's in it for keeps.",
          "Marathon legs on a sprint world — {years} active years and counting.",
        ],
      },
      reviewer: {
        name: "The Reviewer",
        blurbs: [
          "Leaves thoughtful reviews and kind comments. A gentleman (of the codebase), {reviews} this year.",
          "Kind in reviews, sharp in code — {reviews} pull requests given the full treatment.",
          "Reads everything carefully and replies with care. {reviews} reviews this year prove it.",
        ],
      },
      warrior: {
        name: "The Weekend Warrior",
        blurbs: [
          "Always up for something — especially something at 2am. {days} days online this year.",
          "Weekends, weekdays, 2am — always somewhere shipping. {days} active days.",
          "That friend who's always around when it's go time. {days} days of it this year.",
        ],
      },
      catch: {
        name: "The Catch",
        blurbs: [
          "Balanced, committed, and almost too good to be true. It's just the algorithm.",
          "Good at everything, humble about most of it. The algorithm knows.",
          "The full package, shipped and tested. Resists all edge cases.",
        ],
      },
    },
    metrics: {
      followers: "Followers",
      stars: "Stars",
      commitsThisYear: "Commits this year",
      pullRequests: "Pull requests",
      reviews: "Reviews",
      languages: "Languages",
      units: { stars: "stars", commits: "commits", prs: "PRs" },
    },
  },

  puns: [
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
  ],
};

export default en;
