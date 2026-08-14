import type { Dictionary } from "../dicts";

// Portuguese (pt-BR) — mirrors lib/i18n/dicts/en.ts exactly. Brand words that
// read the same in both languages (GITHUB, TINDER, MATCH, CHEMISTRY, repo, PR,
// merge, rebase, commit, push) stay untranslated on purpose.

const pt: Dictionary = {
  meta: {
    homeTitle: "GitTinder — seu GitHub, em um encontro",
    homeDescription:
      "Digite um nome de usuário do GitHub e ganhe um perfil de namoro estilo Tinder com nota de 0 a 99 — match, tier, bio e paixões, calculados a partir de estatísticas reais do GitHub.",
    homeKeywords: [
      "perfil de namoro GitHub",
      "avaliar meu GitHub",
      "estatísticas do GitHub",
      "card de namoro para dev",
      "match no GitHub",
      "Tinder para desenvolvedores",
      "GitTinder",
    ],
    jsonLdWebsite: "Transforme qualquer perfil do GitHub em um perfil de namoro, com nota de 0 a 99.",
    jsonLdApp:
      "Digite um nome de usuário do GitHub e ganhe um perfil de namoro estilo Tinder construído a partir de estatísticas reais do GitHub — match, tier, bio e paixões.",
    vsTitle: "Teste de compatibilidade · GitTinder",
    vsDescription:
      "Dois nomes de usuário do GitHub. Uma nota de compatibilidade. Confira a química entre dois desenvolvedores.",
    vsPairTitle: "@{a} × @{b} — química · GitTinder",
    vsPairDescription: "@{a} e @{b} combinam? Confira a química no GitTinder.",
    profileTitle: "{name}, {age} — {match}% match · GitTinder",
    profileDescription: "{name} no GitTinder: {match}% match, {tier}, {vibe}.",
    profileShortTitle: "@{login} · GitTinder",
    notFoundTitle: "404 · Sem match — GitTinder",
  },

  ui: {
    mascotAlt: "Mascote do GitTinder",
    heroLine1: "Um nome de usuário do GitHub.",
    heroLine2: "Um perfil de",
    heroLine2Accent: "namoro.",
    heroSub: "Nota de 0 a 99, com bio, paixões e tier",
    heroAccent: "é um match?",
    searchPlaceholder: "usuário ou nome no github",
    searchAria: "Usuário ou nome no GitHub",
    searchingNames: "procurando nomes…",
    matchMe: "ME DÊ O MATCH",
    matching: "PROCURANDO…",
    matchOwnGitHub: "Avalie o seu próprio GitHub",
    surpriseMe: "Me surpreenda",
    authError: "O login com o GitHub não terminou — tente de novo.",
    unknown: "desconhecido",
    try: "teste",
    orYourOwn: "· ou o seu próprio",
    profilesMatched: "perfis avaliados",

    topProfiles: "PERFIS TOP",
    match: "MATCH",

    madeWith: "Feito com",
    fromGitHubProfiles: "a partir de perfis do GitHub ·",
    notRealDatingApp: "não é um app de namoro de verdade — seus commits são.",

    matchingTitle: "PROCURANDO",

    share: "COMPARTILHAR",
    reposLabel: "{n} repositórios",
    testCompatibility: "TESTE A COMPATIBILIDADE",
    github: "GITHUB ↗",
    theSixTraits: "AS SEIS CARACTERÍSTICAS",
    about: "SOBRE",
    scoringMetrics: "MÉTRICAS DE NOTA",
    embedTheCard: "INCORPORE O CARD",
    memberSince: "Membro desde",
    spreadTheVerdict: "DIVULGUE O",
    spreadTheVerdictAccent: "VEREDITO.",
    spreadParagraph:
      "Seu card já carrega a nota — agora garanta que todo mundo veja. Compartilhe, desafie um amigo ou descubra com quem você teria match.",
    challengeAFriend: "DESAFIE UM AMIGO",
    seeWhoMatchesYou: "VEJA QUEM DÁ MATCH COM VOCÊ ↓",
    keepSwiping: "CONTINUE DESLIZANDO",
    reshuffle: "embaralhar",
    verifiedTitle: "Verificado pelas estrelas, provavelmente",
    noSpark: "@{login} não topou — continue deslizando",
    profileShareTitle: "{name} — nota {match} no GitTinder",
    profileShareText: "{name} recebeu {match} no GitTinder. É um match?",

    newPair: "NOVO PAR ↗",
    chemistry: "QUÍMICA",
    chemistryReport: "RELATÓRIO DE QUÍMICA",
    pairMeta: "@{a} × @{b} · {score}% de química",
    theOverlay: "A SOBREPOSIÇÃO",
    overlayParagraph:
      "Os dois formatos num mesmo radar — onde se sobrepõem e onde divergem. Passe o mouse num eixo para comparar característica por característica.",
    theChemistry: "A QUÍMICA",
    sharedLanguagesMeter: "Linguagens em comum",
    sameCore: "Mesmo núcleo",
    complementaryEdges: "Vantagens complementares",
    onPaperCharm: "Charme no papel",
    inCommon: "EM COMUM",
    oneSharedLanguage: "Uma linguagem que vocês dois falam:",
    sharedLanguagesIntro: "Linguagens que vocês dois falam:",
    noSharedLanguages:
      "Zero linguagens em comum — toda conversa começa num diretório diferente. Às vezes é isso mesmo.",
    howYouFit: "COMO VOCÊS SE ENCAIXAM",
    leadsOn: "manda em {trait}",
    sameLane: "MESMA FAIXA",
    counterweight: "CONTRASTE",
    challengeHeading: "DESAFIE UM",
    challengeHeadingAccent: "AMIGO.",
    challengeParagraph:
      "Manda esse duelo pra ele e deixe discutirem com os números. É melhor quando eles veem por conta própria.",
    home: "INÍCIO",
    homeAria: "GitTinder home",
    shareTitle: "@{a} × @{b} — {score}% de química no GitTinder",
    shareText: "@{a} e @{b} combinam? {score}% de química no GitTinder.",

    like: "CURTI",
    nope: "PASSA",
    left: "FALTAM {n}",
    shuffleAgain: "EMBARALHAR DE NOVO",
    profileOne: "perfil",
    profileMany: "perfis",
    likeOne: "curtida",
    likeMany: "curtidas",
    ratedSummary: "Você avaliou {count} {profiles} — {likes} {likesWord}.",
    emptyDeck: "Ainda não há perfis no baralho.",
    nopeAria: "Passa",
    likeAria: "Curti",

    shareTheCard: "COMPARTILHE O CARD",
    copied: "COPIADO",
    moreShareOptions: "Mais opções de compartilhamento",
    copyLink: "Copiar link",
    linkCopied: "Link copiado",
    downloadImage: "Baixar imagem",
    imageSaved: "Imagem salva",

    shareOnX: "COMPARTILHAR NO X",
    shareOnLinkedIn: "COMPARTILHAR NO LINKEDIN",

    putACardOnIt: "COLOQUE UM CARD",
    copy: "COPIAR",
    ratedOn: "{name} — avaliado no GitTinder",

    firstUsername: "Primeiro usuário ou nome no GitHub",
    secondUsername: "Segundo usuário ou nome no GitHub",
    usernameOne: "usuário um",
    usernameTwo: "usuário dois",
    check: "VERIFICAR",
    orAnyTwo: "…ou quaisquer dois usuários",

    sourceAria: "Código-fonte do GitTinder no GitHub",
    language: "Idioma",
    toLight: "Mudar para o modo claro",
    toDark: "Mudar para o modo escuro",

    swipedLeft: "DEU MATCH NÃO",
    noMatch: "SEM MATCH",
    notFoundParagraph: "Este perfil passou da URL — não existe rota por aqui.",
    findAMatch: "ENCONTRE UM MATCH",
    matchADeveloper: "Avalie um dev →",

    dateWentQuiet: "O encontro esfriou",
    dateWentQuietParagraph:
      "Algo quebrou no meio do match. Tente de novo — se continuar acontecendo, o algoritmo pode estar fora do ar por um momento.",
    tryAgain: "TENTE DE NOVO",

    tooManySwipes: "Swipes demais por minuto",
    noProfileFound: "Nenhum perfil encontrado",
    matchingInterrupted: "Match interrompido",
    rateLimitMessage:
      "O algoritmo saiu pra um café — o GitHub limitou nossas chamadas. Espere alguns minutos e tente @{username} de novo.",
    rateLimitMessageVs:
      "O algoritmo saiu pra um café — o GitHub limitou nossas chamadas. Espere alguns minutos e tente o {which} de novo.",
    noUserMessage: "Não existe usuário do GitHub chamado @{username}.",
    invalidUserMessage: "“{username}” não é um usuário válido do GitHub.",
    noUserMessageVs: "Não existe usuário do GitHub chamado @{login} — é a sua {which} escolha.",
    invalidUserMessageVs: "“{login}” não é um usuário válido do GitHub — é a sua {which} escolha.",
    whichFirst: "primeira",
    whichSecond: "segunda",
    matchSomeoneElse: "DÊ MATCH COM OUTRA PESSOA",

    checkTheChemistry: "CONFIRA A",
    checkTheChemistryAccent: "QUÍMICA.",
    vsHeroSub:
      "Dois usuários do GitHub. Uma nota de compatibilidade. É um merge ou um rebase?",

    itsAMatch: "É UM MATCH",
    matchAria: "É um match",
    close: "Fechar",
    chemistryLabel: "{spark}% de química",
    swipedBack: "{name} deslizou de volta. Veja o relatório completo e decidam juntos.",
    shareTheMatch: "COMPARTILHE O MATCH",
    keepBrowsing: "continuar navegando",
  },

  traits: {
    spark: { label: "FAÍSCA", desc: "Química instantânea — poder de estrela nos seus repositórios" },
    chat: { label: "PAPO", desc: "Jogo de conversa — PRs abertos e seguidores conquistados" },
    style: { label: "ESTILO", desc: "Senso de moda — quantas stacks você troca" },
    loyal: { label: "LEAL", desc: "Lealdade — anos de contribuições consistentes" },
    care: { label: "CUIDA", desc: "Cuidado — reviews e issues que você realmente acompanha" },
    energy: { label: "ENERGIA", desc: "Energia — atividade recente e resistência" },
  },

  tiers: {
    red: "BANDEIRA VERMELHA",
    green: "BANDEIRA VERDE",
    keeper: "PRA GUARDAR",
    catch: "UM ACHADO",
    turner: "DE VIRAR CABEÇA",
    one: "O ESCOLHIDO",
  },

  compat: {
    tiers: {
      merge: {
        label: "MATCH FEITO NO MERGE",
        verdict: "Faça o merge dos branches e reescreva o README — esse aqui vai dar certo.",
      },
      sparks: {
        label: "FAÍSCAS NO AR",
        verdict: "Química garantida. Espere um pull request antes de o cheque cair.",
      },
      vibes: {
        label: "BOA VIBE",
        verdict: "Boa energia e bom sinal — vale um café e um commit em dupla.",
      },
      coffee: {
        label: "CAFÉZINHO",
        verdict: "Talvez. Um merge de baixo risco para testar a água.",
      },
      complicated: {
        label: "É COMPLICADO",
        verdict: "Dependências conflitantes — resolver isso pode demorar.",
      },
      nope: {
        label: "PASSA",
        verdict: "Rebase ou reset — os branches não se entendem.",
      },
    },
    notes: {
      sharedOne: "Os dois falam {langs}.",
      sharedMany: "Os dois falam {langs} — uma língua materna em comum.",
      none: "Nenhuma linguagem em comum — opostos se atraem (ou não).",
      sameLane:
        "@{a} e @{b} mandam em {trait} — mesma faixa, pode virar corrida ou revezamento.",
      differentCorners:
        "@{a} manda em {traitA}, @{b} em {traitB} — cantos diferentes do radar.",
      charm: "No papel: {score}% de match médio ({a}% × {b}%).",
    },
  },

  og: {
    homeFindYour: "ENCONTRE SEU",
    homeMatch: "MATCH",
    homeSub:
      "Um nome de usuário do GitHub. Um perfil de namoro. Nota de 0 a 99 — bio, paixões e um tier.",
    homeTopMatch: "Melhor match até agora: {name} com {score}%.",
    getMatched: "Avalie seu GitHub, nota de 0 a 99.",
    vsSub: "Dois usuários. Uma nota de 0 a 99.",
    cardFallback: "avalie este perfil em",
    bothSpeak: "AMBOS FALAM",
    nothingYet: "…ainda nada",
  },

  baked: {
    lines: {
      "My repos are famous. My DMs are not.":
        "Meus repositórios são famosos. Minhas DMs não.",
      "I commit. To the repo. And, reportedly, to the one who replies.":
        "Eu faço commit. No repositório. E, dizem, em quem responder.",
      "I've opened enough PRs to know how to make the first move.":
        "Já abri PRs suficientes para saber como dar o primeiro passo.",
      "Currently in my 'just one more commit' era.":
        "Atualmente na fase 'só mais um commit'.",
      "Loves merge requests. Hates conflicts.":
        "Ama merge requests. Odeia conflitos.",
      "Not here for the stars. (Well. Maybe a few.)":
        "Não estou aqui pelas estrelas. (Bom. Talvez algumas.)",
    },
    speakN: "Falo {n} idiomas, quase fluentemente.",
    shipYears: "{n} anos no GitHub e ainda shipando — material de longo prazo.",
    loveLanguage: "{lang} é a minha linguagem do amor.",
  },

  copy: {
    bio: {
      starsHigh: {
        lines: [
          "Meus repositórios são famosos. Minhas DMs não.",
          "As estrelas estão do meu lado. Agora estou trabalhando nas pessoas.",
          "Meu repositório recebe mais atenção do que eu. É um trabalho em andamento.",
        ],
        reason: "{n} estrelas nos seus repositórios",
      },
      starsMid: {
        lines: [
          "Tenho uns repositórios populares. Estou tentando ser uma pessoa completa também.",
          "Alguns dos meus repositórios estão bombando. Não tenho vergonha de admitir.",
          "Em algum lugar entre subestimado e 'meio conhecido'. Pergunta qual.",
        ],
        reason: "{n} estrelas nos seus repositórios",
      },
      starsLow: {
        lines: [
          "Não estou aqui pelas estrelas. (Bom. Talvez algumas.)",
          "Qualidade em vez de quantidade. Mas geralmente é quantidade mesmo.",
          "Poucas estrelas, muita personalidade. Essa é a proposta.",
        ],
        reason: "{n} estrelas nos seus repositórios",
      },
      commit: {
        lines: [
          "Eu faço commit. No repositório. E, dizem, em quem responder.",
          "Confiável. Constante. Faço push todos os dias — e sou leal nisso.",
          "Apareço todo dia. Geralmente num terminal, às vezes para uma pessoa.",
        ],
        reason: "{n} commits este ano",
      },
      communityPrs: {
        lines: [
          "Já abri PRs suficientes para saber como dar o primeiro passo.",
          "Dar o primeiro passo é uma habilidade. Já treinei em público.",
          "Não fico esperando — eu mesmo abro a conversa.",
        ],
        reason: "{n} pull requests abertos este ano",
      },
      communityReviews: {
        lines: [
          "Leio seus PRs antes de ler sua mente. E deixo comentários úteis.",
          "Dou atenção carinhosa, linha por linha. É uma linguagem do amor.",
          "Alguns leem nas entrelinhas. Eu faço review delas.",
        ],
        reason: "{n} pull requests revisados este ano",
      },
      communityIssues: {
        lines: [
          "Respondo issues mais rápido do que respondo mensagens.",
          "Eu fecho coisas. Tickets, abas, conversas sobre conflitos de merge.",
          "Pode contar comigo — eu tenho literalmente um contador de itens fechados.",
        ],
        reason: "{n} issues fechadas este ano",
      },
      languagesPoly: {
        lines: [
          "Falo {n} idiomas, quase fluentemente.",
          "{n} idiomas e contando. O próximo vou aprender o seu.",
          "Fluente em {n} stacks. Escolha a sua favorita, começamos por aí.",
        ],
        reason: "{n} idiomas nos seus repositórios",
      },
      languagesTop: {
        lines: [
          "{lang} é a minha linguagem do amor.",
          "Me pergunte sobre {lang}. Posso falar por horas.",
          "Monogâmico com {lang}. Mas emocionalmente disponível.",
        ],
        reason: "{lang} é o seu idioma mais usado",
      },
      loyalty: {
        lines: [
          "{n} anos no GitHub e ainda shipando — material de longo prazo.",
          "Mais de {n} anos e não fui embora. Lealdade é uma feature.",
          "{n} anos, ainda commitando. Fui feito pra durar.",
        ],
        reason: "{n} anos ativos",
      },
      energySpike: {
        lines: [
          "Atualmente na fase 'só mais um commit'.",
          "Tudo está andando rápido agora. É uma boa fase pra mim.",
          "Estou numa sequência e pretendo mantê-la.",
        ],
        reason: "sua atividade recente está bombando",
      },
      energyConsistent: {
        lines: [
          "Online pra caramba. Na maioria pela grade verde, mas também por você.",
          "Constância é a minha linguagem do amor — todo santo dia.",
          "Mantenho a sequência viva. Isso já é praticamente um relacionamento.",
        ],
        reason: "{n} dias ativos este ano",
      },
      closer: {
        lines: [
          "Ama merge requests. Odeia conflitos.",
          "Vou dar merge rápido. Não vou fazer rebase no seu coração.",
          "Procurando um merge limpo — sem conflitos, sem drama.",
        ],
        reason: "verdade universal",
      },
    },
    tags: {
      openSource: { label: "Open source", reason: "shipando no GitHub desde {year}" },
      mergeRequests: { label: "Merge requests", reason: "{n} PRs para outros projetos este ano" },
      codeReview: { label: "Code review", reason: "{n} pull requests revisados" },
      issueResolver: { label: "Resolvedor de issues", reason: "{n} issues fechadas" },
      polyglot: { label: "Poliglota", reason: "{n} idiomas e contando" },
      starMagnet: { label: "Ímã de estrelas", reason: "{n} estrelas nos repositórios" },
      inDemand: { label: "Procurado", reason: "{n} seguidores" },
      maintainer: { label: "Mantenedor", reason: "{n} repositórios públicos" },
      longTerm: { label: "Longo prazo", reason: "{n} anos ativos" },
      trending: { label: "Em alta", reason: "em alta agora" },
      weekendWarrior: { label: "Guerreiro de fim de semana", reason: "{n} dias ativos este ano" },
      lowKey: { label: "Na dele", reason: "qualidade em vez de quantidade" },
      coffeeDriven: { label: "Movido a café", reason: "movido a cafeína e CI" },
    },
    lookingFor: {
      spark: [
        "Alguém que dê estrela nos meus repositórios de volta.",
        "Alguém impressionado por números — eu tenho alguns.",
        "Um fã dos meus destaques, não só do meu histórico de forks.",
      ],
      chat: [
        "Uma conversa que sobreviva ao merge.",
        "Alguém que responda com conteúdo, não só com emoji.",
        "Um diálogo com menos de 3 conflitos de merge.",
      ],
      style: [
        "Um parceiro que conheça mais de uma stack.",
        "Alguém que consiga trocar de contexto comigo.",
        "Um poliglota. Ou pelo menos alguém aberto a um.",
      ],
      loyal: [
        "Alguém pra me comprometer. A longo prazo.",
        "Um relacionamento de longo prazo — do tipo LTS.",
        "Alguém que fique depois que a empolgação inicial passar.",
      ],
      care: [
        "Alguém que realmente leia meu README.",
        "Alguém que leia as letras miúdas e fique mesmo assim.",
        "Um revisor da minha vida — gentil, com comentários.",
      ],
      energy: [
        "Um parceiro de aventura para deploys de madrugada.",
        "Alguém que acompanhe meu ritmo.",
        "Um coautor para o próximo sprint.",
      ],
      prEnthusiast: [
        "Um entusiasta de merge requests — do tipo sem conflitos.",
        "Alguém que abra PRs, não só discussões.",
        "Um companheiro para open source e corações abertos.",
      ],
      patient: [
        "Alguém paciente. Respondo mensagens do jeito que respondo comentários em PR.",
        "Um coração paciente — trabalho no meu próprio fuso.",
        "Alguém que não espere respostas no mesmo dia.",
      ],
    },
    vibes: {
      influencer: {
        name: "O Influencer",
        blurbs: [
          "Poder de estrela fora do comum. Todo mundo dá match num repo com o selo azul.",
          "As estrelas falaram — e disseram sim. Um show de melhores momentos ambulante.",
          "Repos que bombam, um nome que viaja. O algoritmo fica corado.",
        ],
      },
      butterfly: {
        name: "A Borboleta Social",
        blurbs: [
          "Uma máquina de network — {prs} PRs e {reviews} reviews este ano, sempre no thread.",
          "Threads em todo lugar — {prs} PRs abertos, {reviews} reviews dados. Todo mundo conhece.",
          "A seção de comentários é a sala de estar deles — {reviews} reviews e {prs} PRs este ano.",
        ],
      },
      polyglot: {
        name: "O Poliglota",
        blurbs: [
          "Fala {languages} idiomas e com certeza vai notar seu ponto e vírgula faltando.",
          "{languages} idiomas na bagagem — os românticos inclusive, dizem.",
          "Uma stack para cada ocasião — {languages} delas. Nunca entediado, nunca entediante.",
        ],
      },
      longhauler: {
        name: "O de Longo Prazo",
        blurbs: [
          "{years} anos dentro e ainda shipando. Feito pra durar — emocionalmente disponível por commit.",
          "{years} anos, uma conta, zero ghosting. Esse tá pra casar.",
          "Pernas de maratona num mundo de sprint — {years} anos ativos e contando.",
        ],
      },
      reviewer: {
        name: "O Revisor",
        blurbs: [
          "Deixa reviews pensados e comentários gentis. Um cavalheiro (do código), {reviews} este ano.",
          "Gentil nos reviews, afiado no código — {reviews} pull requests recebidos com todo cuidado.",
          "Lê tudo com atenção e responde com carinho. {reviews} reviews este ano comprovam.",
        ],
      },
      warrior: {
        name: "O Guerreiro de Fim de Semana",
        blurbs: [
          "Sempre a fim de algo — principalmente algo às 2 da manhã. {days} dias online este ano.",
          "Fins de semana, dias de semana, 2h — sempre shipando em algum lugar. {days} dias ativos.",
          "Aquele amigo que sempre aparece na hora H. {days} dias assim este ano.",
        ],
      },
      catch: {
        name: "O Xodó",
        blurbs: [
          "Equilibrado, comprometido e quase bom demais pra ser verdade. É só o algoritmo.",
          "Bom em tudo, humilde na maioria. O algoritmo sabe.",
          "O pacote completo, pronto e testado. Resiste a qualquer edge case.",
        ],
      },
    },
    metrics: {
      followers: "Seguidores",
      stars: "Estrelas",
      commitsThisYear: "Commits este ano",
      pullRequests: "Pull requests",
      reviews: "Reviews",
      languages: "Idiomas",
      units: { stars: "estrelas", commits: "commits", prs: "PRs" },
    },
  },

  puns: [
    "o CI deles passa em verde quando te veem",
    "zero conflitos de merge até agora, e já conferimos",
    "eles deram estrela no seu perfil antes mesmo de você curtir",
    "vocês têm tanta coisa em comum — principalmente merge requests",
    "suas mensagens de commit finalmente têm um destinatário",
    "o algoritmo shipa, shipa, shipa",
    "um de vocês com certeza é o dono do repo aqui",
    "o gráfico de contribuições deles já parece um batimento cardíaco",
    "sem forks, sem drama — só um merge limpo",
    "eles rodaram lint no seu perfil e passou",
    "sua bio conquistou no 'git pull --rebase'",
    "em algum lugar, um README acabou de dizer 'feito com amor'",
  ],
};

export default pt;
