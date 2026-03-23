(function () {
  var STREAM_BASE_URL = "https://stream.lechatnoirradio.fr";
  var STREAM_URL = STREAM_BASE_URL + "/stream.mp3";
  var NOW_PLAYING_URL = STREAM_BASE_URL + "/nowplaying.json";
  var HISTORY_CSV_URL = STREAM_BASE_URL + "/history/nowplaying.csv";
  var SITE_URL = "https://lechatnoirradio.fr/";
  var CONTACT_EMAIL = "radio@lechatnoirradio.fr";
  var VOLUME_STORAGE_KEY = "lcn-player-volume";
  var DISPLAY_TIME_ZONE = "Europe/Paris";
  var HISTORY_CACHE_KEY = "lcn-history-preview-v1";
  var HISTORY_CACHE_AT_KEY = "lcn-history-preview-at";
  var HISTORY_CACHE_MAX_ROWS = 240;
  var HISTORY_CACHE_MAX_AGE_MS = 3 * 60 * 1000;

  var ICONS = {
    play:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.4c0-.87.94-1.42 1.7-.98l9.1 5.27a1.12 1.12 0 0 1 0 1.94L9.7 16.84c-.76.44-1.7-.11-1.7-.98z"></path></svg>',
    pause:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5.8A1.8 1.8 0 0 1 8.8 4h.4A1.8 1.8 0 0 1 11 5.8v12.4A1.8 1.8 0 0 1 9.2 20h-.4A1.8 1.8 0 0 1 7 18.2zm6 0A1.8 1.8 0 0 1 14.8 4h.4A1.8 1.8 0 0 1 17 5.8v12.4a1.8 1.8 0 0 1-1.8 1.8h-.4a1.8 1.8 0 0 1-1.8-1.8z"></path></svg>',
    volume:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M4 14h3.4L12 18V6L7.4 10H4z"></path><path d="M16 9.5a3.6 3.6 0 0 1 0 5"></path><path d="M18.8 6.7a7.2 7.2 0 0 1 0 10.6"></path></svg>',
    share:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M15 8a3 3 0 1 0-2.83-4"></path><path d="M6 15a3 3 0 1 0 2.84 4"></path><path d="M18 21a3 3 0 1 0 0-6"></path><path d="m8.59 13.51 6.83-3.02"></path><path d="m8.59 10.49 6.83 3.02"></path></svg>',
    news:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H19v11.5a2.5 2.5 0 0 1-2.5 2.5H7.5A2.5 2.5 0 0 1 5 15.5z"></path><path d="M5 7h10"></path><path d="M8 11h8"></path><path d="M8 14.5h6"></path></svg>',
    schedule:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="3"></rect><path d="M8 3v4"></path><path d="M16 3v4"></path><path d="M4 10h16"></path><path d="M8 14h3"></path></svg>',
    voices:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M12 15a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4z"></path><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v3"></path><path d="M8.5 21h7"></path></svg>',
    about:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="4.5" r="1.3" fill="currentColor" stroke="none"></circle><path d="M12 6.5v13"></path><path d="m8.4 19.5 3.6-6.2 3.6 6.2"></path><path d="M7.1 9.3a6.9 6.9 0 0 1 9.8 0"></path><path d="M4.3 6.6a10.8 10.8 0 0 1 15.4 0"></path></svg>',
    contact:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5z"></path><path d="m7 8 5 4 5-4"></path></svg>',
    external:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M14 5h5v5"></path><path d="M10 14 19 5"></path><path d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"></path></svg>',
    copy:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><rect x="9" y="9" width="10" height="10" rx="2"></rect><path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"></path></svg>',
    close:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m6 6 12 12"></path><path d="m18 6-12 12"></path></svg>',
    arrow:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>',
  };

  var NEWS_ITEMS =
    typeof window !== "undefined" && Array.isArray(window.LCN_NEWS_ITEMS)
      ? window.LCN_NEWS_ITEMS
      : [];

  var PRODUCERS = [
    {
      role: "Production",
      name: "Dr. John",
      image: "assets/media/producers/drjohn.jpg",
      bio: "Explore les zones floues entre réalité sonore, fiction radiophonique et écoute lente.",
    },
    {
      role: "Découverte",
      name: "Julien",
      image: "assets/media/producers/julien.jpg",
      bio: "Traverse la synthèse analogique par l'essai, l'apprentissage et l'expérimentation continue.",
    },
    {
      role: "Chronique",
      name: "Lady Em",
      image: "assets/media/producers/ladyem.webp",
      bio: "Installe sa chronique du vestiaire dans la grille, entre velvet tips et contre-champ élégant.",
    },
    {
      role: "Jingles",
      name: "Les potes",
      image: "assets/media/producers/potes.webp",
      bio: "Prêtent voix, idées et impulsions aux jingles, aux accroches et à la texture collective de la radio.",
    },
  ];

  var SHOWS = [
    {
      meta: "Émission",
      title: "L'Autre Nuit",
      image: "assets/media/shows/lautrenuit.png",
      text: "Lectures sans centre, voix fatiguées et machines hésitantes pour les heures qui dérivent.",
      href: "https://audioblog.arteradio.com/blog/263269/le-chat-noir",
      actionLabelLines: ["Écouter", "le podcast"],
    },
    {
      meta: "Fiction sonore",
      title: "Le Pseudodocumentaire de l'espace",
      image: "assets/media/shows/pseudocumentaire.png",
      text: "Archives déplacées, faux-semblants et dépression verte pour un laboratoire d'anticipation.",
      href: "https://audioblog.arteradio.com/blog/194586/pseudocumentaire-de-l-espace",
      actionLabelLines: ["Écouter", "le podcast"],
    },
    {
      meta: "Émission",
      title: "Console-toi",
      image: "assets/media/shows/consoletoi.png",
      text: "ASMR Atari, stress 8-bit et poésie du samedi matin à micro ouvert.",
      href: "https://audioblog.arteradio.com/blog/263269/le-chat-noir",
      actionLabelLines: ["Écouter", "le podcast"],
    },
    {
      meta: "Captations",
      title: "Home Taping is Killing Music",
      image: "assets/media/shows/hometaping.png",
      text: "Bootlegs, bruit du lieu et mémoire brute de la scène captée sur le vif.",
      href: "https://hometapingiskillingmusic.bandcamp.com/",
      actionLabel: "Ouvrir l'archive sonore",
    },
    {
      meta: "Projet musical",
      title: "When Day Chokes The Night",
      image: "assets/media/shows/wdctn.png",
      text: "Textures ambient, improvisations et paysages liquides toujours actifs dans l'univers de la radio.",
      href: "https://whendaychokesthenight.wordpress.com/",
      actionLabel: "Visiter le site",
    },
  ];

  var ABOUT_CHIPS = [
    "Autogérée",
    "Créations sonores",
    "Écoute lente",
    "Scène locale",
    "Diffusion continue",
    "Auto-hébergée",
  ];

  var CONTRIBUTION_MODES = [
    {
      id: "son",
      label: "Proposer un son",
      kicker: "Contribution",
      title: "Proposer un son ou une émission",
      text: "Un morceau, une émission, un module ou un podcast diffusable. On cherche des propositions claires, diffusables, et accompagnées des bonnes infos.",
      points: [
        "Titre ou nom du projet",
        "Lien d'écoute ou fichier",
        "Infos de droits et nom ou pseudo",
      ],
      subject: "Le Chat Noir - Proposition sonore",
      body:
        "Bonjour,\n\nJe propose ce contenu pour diffusion :\n\n- Titre / Projet :\n- Lien d'écoute / téléchargement :\n- Droits / autorisation :\n- Nom / pseudo :\n\nMerci.",
      cta: "Nous écrire",
    },
    {
      id: "retrait",
      label: "Demander un retrait",
      kicker: "Priorité",
      title: "Demander un retrait",
      text: "Les demandes de retrait sont traitées en priorité, sans friction inutile. Il suffit de nous donner les éléments permettant d'identifier le contenu concerné.",
      points: [
        "Titre ou contenu concerné",
        "Motif de la demande",
        "Lien ou plage horaire si possible",
      ],
      subject: "Le Chat Noir - Demande de retrait",
      body:
        "Bonjour,\n\nJe demande le retrait du contenu suivant :\n\n- Titre / Artiste :\n- Motif :\n- Lien / horaire de diffusion :\n- Contact :\n\nMerci.",
      cta: "Nous écrire",
    },
    {
      id: "contact",
      label: "Autre message",
      kicker: "Contact",
      title: "Nous écrire",
      text: "Pour une question, une correction, un signalement, une idée d'émission ou toute autre prise de contact liée à la radio.",
      points: [
        "Objet du message",
        "Contexte en quelques lignes",
        "Retour attendu",
      ],
      subject: "Le Chat Noir - Contact",
      body: "Bonjour,\n\nObjet :\n\nMessage :\n\nNom / pseudo :\n\nMerci.",
      cta: "Nous écrire",
    },
  ];

  var SCHEDULE_TIMELINE_DAYS = [
    {
      id: "mon",
      shortName: "Lun",
      name: "Lundi",
      summary: "Fragments matinaux, rock de l'aprème et retour de L'Autre Nuit.",
      slots: [
        { time: "00h00", title: "La Grande Nuit", desc: "Paysages sonores étendus, pièces immersives." },
        { time: "07h00", title: "Le Migou", desc: "Réveil café." },
        { time: "Puis", title: "Matinée : Fragments", desc: "Courtes dérives musicales de 10 à 15 minutes.", meta: true },
        { time: "12h00", title: "La table du chat", desc: "Chanson, electro douce, ambient léger." },
        { time: "14h00", title: "L'instinct mode", desc: "Chronique du vestiaire by Lady Em." },
        { time: "Puis", title: "Rock de l'aprème", desc: "On réchauffe le rock'n'roll.", meta: true, highlight: true },
        { time: "23h40", title: "L'Autre Nuit", desc: "Lectures sans centre et machines hésitantes." },
      ],
    },
    {
      id: "tue",
      shortName: "Mar",
      name: "Mardi",
      summary: "Trajectoires longues, noise de l'aprème et pseudodocumentaire tardif.",
      slots: [
        { time: "00h00", title: "La Grande Nuit", desc: "Paysages sonores étendus, pièces immersives." },
        { time: "07h00", title: "Le Migou", desc: "Réveil café." },
        { time: "Puis", title: "Matinée : Trajectoires", desc: "Dérives musicales de 15 à 30 minutes.", meta: true },
        { time: "12h00", title: "La table du chat", desc: "Chanson, electro douce, ambient léger." },
        { time: "14h00", title: "L'instinct mode", desc: "Chronique du vestiaire by Lady Em." },
        { time: "Puis", title: "Noise de l'aprème", desc: "Noise-rock, post-punk et autres secousses.", meta: true, highlight: true },
        { time: "23h40", title: "Le Pseudodocumentaire de l'espace", desc: "Fiction sonore et dépression verte." },
      ],
    },
    {
      id: "wed",
      shortName: "Mer",
      name: "Mercredi",
      summary: "Immersion longue et chats sauvages jusqu'au retour de la nuit.",
      slots: [
        { time: "00h00", title: "La Grande Nuit", desc: "Paysages sonores étendus, pièces immersives." },
        { time: "07h00", title: "Le Migou", desc: "Réveil café." },
        { time: "Puis", title: "Matinée : Immersion", desc: "Longues dérives musicales de 30 à 60 minutes.", meta: true },
        { time: "12h00", title: "La table du chat", desc: "Chanson, electro douce, ambient léger." },
        { time: "14h00", title: "L'instinct mode", desc: "Chronique du vestiaire by Lady Em." },
        { time: "Puis", title: "Les chats sauvages", desc: "Le jour des enfants, c'est musique aléatoire.", meta: true, highlight: true },
        { time: "23h40", title: "L'Autre Nuit", desc: "Lectures sans centre et machines hésitantes." },
      ],
    },
    {
      id: "thu",
      shortName: "Jeu",
      name: "Jeudi",
      summary: "Bandes originales, focus Radio Gadin et fiction tardive.",
      slots: [
        { time: "00h00", title: "La Grande Nuit", desc: "Paysages sonores étendus, pièces immersives." },
        { time: "07h00", title: "Le Migou", desc: "Réveil café." },
        { time: "Puis", title: "Matinée : Immersion", desc: "Longues dérives musicales de 30 à 60 minutes.", meta: true },
        { time: "12h00", title: "La table du chat", desc: "Chanson, electro douce, ambient léger." },
        { time: "14h00", title: "L'instinct mode", desc: "Chronique du vestiaire by Lady Em." },
        { time: "Puis", title: "OST de l'aprème", desc: "Bandes originales, musiques de films, jeux, images mentales.", meta: true, highlight: true },
        { time: "18h00", title: "Radio Gadin", desc: "Focus intégrale Flash Dog Duke Silver." },
        { time: "23h40", title: "Le Pseudodocumentaire de l'espace", desc: "Fiction sonore et dépression verte." },
      ],
    },
    {
      id: "fri",
      shortName: "Ven",
      name: "Vendredi",
      summary: "Fragments, indie de l'aprème et Drive with a Dead Radio.",
      slots: [
        { time: "00h00", title: "La Grande Nuit", desc: "Paysages sonores étendus, pièces immersives." },
        { time: "07h00", title: "Le Migou", desc: "Réveil café." },
        { time: "Puis", title: "Matinée : Fragments", desc: "Courtes dérives musicales de 10 à 15 minutes.", meta: true },
        { time: "12h00", title: "La table du chat", desc: "Chanson, electro douce, ambient léger." },
        { time: "14h00", title: "L'instinct mode", desc: "Chronique du vestiaire by Lady Em." },
        { time: "Puis", title: "Indie de l'aprème", desc: "Indie rock, shoegaze, dream pop et dérivés.", meta: true, highlight: true },
        { time: "18h00", title: "Drive with a Dead Radio", desc: "Focus intégrale Drive With A Dead Girl." },
        { time: "23h40", title: "L'Autre Nuit", desc: "Lectures sans centre et machines hésitantes." },
      ],
    },
    {
      id: "sat",
      shortName: "Sam",
      name: "Samedi",
      summary: "Courée ouverte, Console-toi et focus When Day Chokes a Radio.",
      slots: [
        { time: "00h00", title: "La Grande Nuit", desc: "Paysages sonores étendus, pièces immersives." },
        { time: "07h00", title: "Les chats dans la courée", desc: "Tout ce qui ne rentre pas ailleurs." },
        { time: "10h00", title: "Console-toi", desc: "ASMR de l'Atari et poésie 8-bit.", highlight: true },
        { time: "12h00", title: "La table du chat", desc: "Chanson, electro douce, ambient léger." },
        { time: "14h00", title: "L'instinct mode", desc: "Chronique du vestiaire by Lady Em." },
        { time: "Puis", title: "Les chats dans la courée", desc: "Tout ce qui ne rentre pas ailleurs.", meta: true },
        { time: "18h00", title: "When Day Chokes a Radio", desc: "Focus intégrale When Day Chokes The Night." },
        { time: "23h40", title: "Le Pseudodocumentaire de l'espace", desc: "Fiction sonore, 20 minutes." },
      ],
    },
    {
      id: "sun",
      shortName: "Dim",
      name: "Dimanche",
      summary: "Messe Noire, siestes de l'aprème et retour à L'Autre Nuit.",
      slots: [
        { time: "00h00", title: "La Grande Nuit", desc: "Paysages sonores étendus, pièces immersives." },
        { time: "07h00", title: "Messe Noire", desc: "Rituel. Musiques dures, sombres, expérimentales, radicales.", highlight: true },
        { time: "12h00", title: "La table du chat", desc: "Chanson, electro douce, ambient léger." },
        { time: "14h00", title: "L'instinct mode", desc: "Chronique du vestiaire by Lady Em." },
        { time: "14h05", title: "Les siestes de l'Aprème", desc: "Dream pop, lo-fi hip-hop, formes calmes." },
        { time: "23h40", title: "L'Autre Nuit", desc: "Lectures sans centre et machines hésitantes." },
      ],
    },
  ];

  var SCHEDULE_DAY_ICONS = {
    mon: "fa-solid fa-moon",
    tue: "fa-solid fa-rocket",
    wed: "fa-solid fa-cat",
    thu: "fa-solid fa-film",
    fri: "fa-solid fa-car-side",
    sat: "fa-solid fa-user-astronaut",
    sun: "fa-solid fa-sun",
  };

  var SLOT_DECOR_BY_DAY = {
    thu: {
      "Radio Gadin": { badge: "Focus", kind: "focus-amber" },
    },
    fri: {
      "Drive with a Dead Radio": { badge: "Focus", kind: "focus-danger" },
    },
    sat: {
      "When Day Chokes a Radio": { badge: "Focus", kind: "focus-cyan" },
    },
    sun: {
      "Messe Noire": {
        badge: "Rituel",
        badgeIcon: "fa-solid fa-church",
        kind: "rituel",
      },
    },
  };

  function decorateScheduleDays(days) {
    return (days || []).map(function (day) {
      var dayDecor = SLOT_DECOR_BY_DAY[day.id] || {};
      return Object.assign({}, day, {
        icon: day.icon || SCHEDULE_DAY_ICONS[day.id] || "",
        slots: (day.slots || []).map(function (slot) {
          var extra = dayDecor[slot.title] || {};
          if (slot.title === "La table du chat" && !extra.icon && !slot.icon) {
            extra = Object.assign({ icon: "fa-solid fa-utensils" }, extra);
          }
          return Object.assign({}, slot, extra);
        }),
      });
    });
  }

  SCHEDULE_TIMELINE_DAYS = decorateScheduleDays(SCHEDULE_TIMELINE_DAYS);

  var state = {
    route: getCurrentPageId(),
    currentTrack: {
      artist: "",
      album: "",
      title: "Chargement des métadonnées…",
      year: "",
    },
    historyRows: [],
    historyStatus: "Chargement de l'historique…",
    searchDay: getTodayYmd(),
    searchTime: "",
    historyMode: "latest",
    selectedDayId: getCurrentDayId(),
    volume: loadSavedVolume(),
    isPlaying: false,
    userWantsPlay: false,
    connectionState: "idle",
    reconnectAttempts: 0,
    lastProgressAt: Date.now(),
    lastUserGestureAt: 0,
    reconnectTimer: null,
    stallTimer: null,
    suppressPauseIntent: false,
    manualPausePending: false,
    usingCacheBustSource: false,
    dockVolumeOpen: false,
    heroVolumeOpen: false,
    contactMode: "son",
  };

  var refs = {
    pageRoot: document.getElementById("pageRoot"),
    dockState: document.getElementById("dockState"),
    dockTicker: document.getElementById("dockTicker"),
    dockTickerText: document.getElementById("dockTickerText"),
    dockToggle: document.getElementById("dockToggle"),
    dockVolumeButton: document.getElementById("dockVolumeButton"),
    dockVolumePopover: document.getElementById("dockVolumePopover"),
    dockVolumeRange: document.getElementById("dockVolumeRange"),
    audio: document.getElementById("radioAudio"),
  };

  function icon(name) {
    return ICONS[name] || "";
  }

  function getCurrentPageId() {
    var pageId = asString(document.body && document.body.getAttribute("data-page"));
    var allowed = {
      home: true,
      actualites: true,
      grille: true,
      voix: true,
      apropos: true,
      historique: true,
    };
    return allowed[pageId] ? pageId : "home";
  }

  function asString(value) {
    if (typeof value !== "string") return "";
    return value.trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function faIcon(className, extraClassName) {
    var raw = asString(className);
    if (!raw) return "";
    var classes = raw;
    if (extraClassName) classes += " " + extraClassName;
    return '<i class="' + escapeHtml(classes) + '" aria-hidden="true"></i>';
  }

  function buildProgramBadge(slot) {
    if (!slot || !slot.badge) return "";
    return (
      '<span class="program-badge">' +
      faIcon(slot.badgeIcon, "program-badge-icon") +
      "<span>" +
      escapeHtml(slot.badge) +
      "</span>" +
      "</span>"
    );
  }

  function getProgramItemClasses(baseClass, slot) {
    var classes = [baseClass];
    if (slot && slot.meta) classes.push("is-meta");
    if (slot && slot.highlight) classes.push("is-highlight");
    if (slot && slot.kind) classes.push(slot.kind);
    return classes.join(" ");
  }

  function parseYear(rawValue) {
    var raw = String(rawValue || "");
    var match = raw.match(/(19|20)\d{2}/);
    return match ? match[0] : "";
  }

  function findFirstString(source, keys) {
    if (!source || typeof source !== "object") return "";
    for (var i = 0; i < keys.length; i += 1) {
      var value = asString(source[keys[i]]);
      if (value) return value;
    }
    return "";
  }

  function parseAlbumYearFromTitle(displayTitle) {
    var text = asString(displayTitle);
    if (!text) return { album: "", year: "" };
    var groups = text.match(/\(([^()]*)\)/g);
    if (!groups || !groups.length) return { album: "", year: "" };
    var inside = groups[groups.length - 1].replace(/[()]/g, "").trim();
    if (!inside) return { album: "", year: "" };

    var year = parseYear(inside);
    var album = inside;
    if (year) {
      album = inside
        .replace(year, "")
        .replace(/[,;/-]\s*$/, "")
        .replace(/\s{2,}/g, " ")
        .trim();
    }
    return { album: album, year: year };
  }

  function splitArtistAndTitle(rawValue) {
    var raw = asString(rawValue);
    if (!raw) return { artist: "", title: "" };
    var match = raw.match(/^(.+?)\s+[—-]\s+(.+)$/);
    if (!match) return { artist: "", title: raw };
    return {
      artist: asString(match[1]),
      title: asString(match[2]),
    };
  }

  function buildNowPlayingLabel(meta) {
    var artist = asString(meta && meta.artist);
    var album = asString(meta && meta.album);
    var title = asString(meta && meta.title);
    var parts = [];
    if (artist) parts.push(artist);
    if (album) parts.push(album);
    if (title) parts.push(title);
    return parts.length ? parts.join(" — ") : "Titre indisponible pour l'instant";
  }

  function parseCsvLine(line) {
    var values = [];
    var current = "";
    var inQuotes = false;
    for (var i = 0; i < line.length; i += 1) {
      var char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (char === "," && !inQuotes) {
        values.push(current);
        current = "";
        continue;
      }
      current += char;
    }
    values.push(current);
    return values;
  }

  function parseCsvRows(csvText) {
    var normalized = String(csvText || "")
      .replace(/\r\n?/g, "\n")
      .trim();
    if (!normalized) return [];

    var lines = normalized.split("\n");
    var parsed = [];
    for (var i = 1; i < lines.length; i += 1) {
      var line = lines[i];
      if (!line) continue;
      var cols = parseCsvLine(line);
      parsed.push({
        tsIso: cols[0] || "",
        artist: cols[2] || "",
        title: cols[3] || "",
        album: cols[4] || "",
        year: cols[5] || "",
      });
    }
    return parsed;
  }

  function buildMetaFromCsvRows(rows) {
    if (!rows || !rows.length) return null;
    var sorted = getSortedHistoryRows(rows);
    var row = sorted[0];
    if (!row) return null;
    return {
      artist: asString(row.artist),
      title: asString(row.title),
      album: asString(row.album),
      year: parseYear(row.year),
    };
  }

  function extractNowPlayingMeta(payload) {
    var roots = [];
    if (payload && typeof payload === "object") roots.push(payload);
    if (payload && payload.now_playing && typeof payload.now_playing === "object") roots.push(payload.now_playing);
    if (payload && payload.now_playing && payload.now_playing.song && typeof payload.now_playing.song === "object") {
      roots.push(payload.now_playing.song);
    }
    if (payload && payload.song && typeof payload.song === "object") roots.push(payload.song);
    if (payload && payload.track && typeof payload.track === "object") roots.push(payload.track);

    var artist = "";
    var title = "";
    var album = "";
    var year = "";

    for (var i = 0; i < roots.length; i += 1) {
      var root = roots[i];
      if (!artist) {
        artist = findFirstString(root, [
          "artist",
          "artist_name",
          "creator",
          "author",
          "performer",
          "dj",
          "host",
        ]);
      }
      if (!title) {
        title = findFirstString(root, ["title", "name", "track", "song", "now_playing"]);
      }
      if (!album) {
        album = findFirstString(root, ["album", "release", "record"]);
      }
      if (!year) {
        year = parseYear(findFirstString(root, ["year", "date", "released", "release_year"]));
      }
    }

    if (!title) {
      title = asString(payload && payload.now_playing);
    }

    if (title) {
      var split = splitArtistAndTitle(title);
      if (!artist && split.artist) artist = split.artist;
      title = split.title || title;
    }

    if (title) {
      var parsed = parseAlbumYearFromTitle(title);
      if (!album && parsed.album) album = parsed.album;
      if (!year && parsed.year) year = parsed.year;
    }

    return {
      artist: artist,
      title: title,
      album: album,
      year: year,
    };
  }

  function getTodayYmd() {
    var parts = getDisplayDateParts(new Date());
    if (!parts) return "";
    return parts.year + "-" + parts.month + "-" + parts.day;
  }

  function getCurrentDayId() {
    try {
      var weekday = new Intl.DateTimeFormat("en-US", {
        timeZone: DISPLAY_TIME_ZONE,
        weekday: "short",
      })
        .format(new Date())
        .slice(0, 3)
        .toLowerCase();
      var weekdayMap = {
        sun: "sun",
        mon: "mon",
        tue: "tue",
        wed: "wed",
        thu: "thu",
        fri: "fri",
        sat: "sat",
      };
      return weekdayMap[weekday] || "mon";
    } catch (error) {
      var map = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      return map[new Date().getDay()] || "mon";
    }
  }

  function getScheduleDayById(dayId) {
    return SCHEDULE_TIMELINE_DAYS.find(function (day) {
      return day.id === dayId;
    }) || SCHEDULE_TIMELINE_DAYS[0];
  }

  function getDisplayDateParts(value) {
    var date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    try {
      var parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: DISPLAY_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(date);
      var map = {};
      parts.forEach(function (part) {
        if (part.type !== "literal") map[part.type] = part.value;
      });
      return {
        year: map.year,
        month: map.month,
        day: map.day,
        hour: map.hour,
        minute: map.minute,
      };
    } catch (error) {
      return {
        year: String(date.getFullYear()),
        month: String(date.getMonth() + 1).padStart(2, "0"),
        day: String(date.getDate()).padStart(2, "0"),
        hour: String(date.getHours()).padStart(2, "0"),
        minute: String(date.getMinutes()).padStart(2, "0"),
      };
    }
  }

  function getDisplayMinutes(isoDate) {
    var parts = getDisplayDateParts(isoDate);
    if (!parts) return null;
    return Number(parts.hour) * 60 + Number(parts.minute);
  }

  function normalizeUtcOffset(rawLabel) {
    var match = String(rawLabel || "").match(/(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?/i);
    if (!match) return "";
    return (
      "UTC" +
      match[1] +
      String(match[2] || "0").padStart(2, "0") +
      ":" +
      String(match[3] || "00").padStart(2, "0")
    );
  }

  function getDisplayZoneLabel() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: DISPLAY_TIME_ZONE,
        timeZoneName: "shortOffset",
        hour: "2-digit",
        minute: "2-digit",
      }).formatToParts(new Date());
      var zonePart = parts.find(function (part) {
        return part.type === "timeZoneName";
      });
      var offset = normalizeUtcOffset(zonePart && zonePart.value);
      if (offset) return offset + " · " + DISPLAY_TIME_ZONE;
    } catch (error) {
      return "UTC+01:00 / UTC+02:00 · " + DISPLAY_TIME_ZONE;
    }
    return "UTC+01:00 / UTC+02:00 · " + DISPLAY_TIME_ZONE;
  }

  function formatLocalDate(isoDate) {
    var parts = getDisplayDateParts(isoDate);
    if (!parts) return "--";
    return parts.day + "/" + parts.month + "/" + parts.year;
  }

  function formatLocalTime(isoDate) {
    var parts = getDisplayDateParts(isoDate);
    if (!parts) return "--:--";
    return parts.hour + ":" + parts.minute;
  }

  function isSameLocalDay(isoDate, ymd) {
    var parts = getDisplayDateParts(isoDate);
    if (!parts) return false;
    return parts.year + "-" + parts.month + "-" + parts.day === ymd;
  }

  function getTrackMeta(row) {
    var parts = [];
    var artist = asString(row.artist);
    var album = asString(row.album);
    var year = parseYear(row.year);
    if (artist) parts.push(artist);
    if (album) parts.push(album);
    if (year) parts.push(year);
    return parts.join(" · ");
  }

  function getSortedHistoryRows(rows) {
    return (rows || [])
      .filter(function (row) {
        return row && row.tsIso;
      })
      .slice()
      .sort(function (a, b) {
        return new Date(b.tsIso) - new Date(a.tsIso);
      });
  }

  function loadSavedVolume() {
    try {
      var raw = window.localStorage.getItem(VOLUME_STORAGE_KEY);
      var value = Number(raw);
      if (Number.isFinite(value) && value >= 0 && value <= 1) return value;
    } catch (error) {
      return 0.72;
    }
    return 0.72;
  }

  function saveVolume(value) {
    try {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, String(value));
    } catch (error) {
      return;
    }
  }

  function buildStreamUrl(cacheBust) {
    if (!cacheBust) return STREAM_URL;
    return STREAM_URL + "?t=" + Date.now();
  }

  function isIosDevice() {
    var ua = String((window.navigator && window.navigator.userAgent) || "");
    var platform = String((window.navigator && window.navigator.platform) || "");
    var maxTouchPoints = Number((window.navigator && window.navigator.maxTouchPoints) || 0);
    return /iPad|iPhone|iPod/.test(ua) || (platform === "MacIntel" && maxTouchPoints > 1);
  }

  function prefersNativePlayerControls() {
    var ua = String((window.navigator && window.navigator.userAgent) || "");
    if (!isIosDevice()) return false;
    return /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua);
  }

  function markUserGesture() {
    state.lastUserGestureAt = Date.now();
  }

  function handleAudioToggleInteraction(event) {
    if (event && event.cancelable) {
      event.preventDefault();
    }
    markUserGesture();
    togglePlayback();
  }

  function bindAudioToggleButton(button) {
    if (!button || button.dataset.audioToggleBound === "true") return;
    button.dataset.audioToggleBound = "true";
    button.addEventListener("click", handleAudioToggleInteraction);
  }

  function buildMailtoHref(action) {
    return (
      "mailto:" +
      CONTACT_EMAIL +
      "?subject=" +
      encodeURIComponent(action.subject) +
      "&body=" +
      encodeURIComponent(action.body)
    );
  }

  function getContributionMode(modeId) {
    return (
      CONTRIBUTION_MODES.find(function (mode) {
        return mode.id === modeId;
      }) || CONTRIBUTION_MODES[0]
    );
  }

  function renderShowActionLabel(show) {
    if (show && Array.isArray(show.actionLabelLines) && show.actionLabelLines.length) {
      return (
        '<span class="show-action-label">' +
        show.actionLabelLines
          .map(function (line) {
            return "<span>" + escapeHtml(line) + "</span>";
          })
          .join("") +
        "</span>"
      );
    }
    return "<span>" + escapeHtml(show && show.actionLabel ? show.actionLabel : "") + "</span>";
  }

  function renderHomePage() {
    var today = getScheduleDayById(getCurrentDayId());
    var nativePreferred = prefersNativePlayerControls();
    return (
      '<section class="page hero">' +
      '<div class="surface-panel hero-main">' +
      '<div class="hero-stage">' +
      '<div class="orbital-player">' +
      '<span class="orbital-rim"></span>' +
      '<span class="orbital-rim-alt"></span>' +
      '<span class="orbital-rim-soft"></span>' +
      '<div class="orbital-core"></div>' +
      '<button class="hero-play' +
      (nativePreferred ? " is-native-handoff" : "") +
      '" type="button" aria-label="' +
      escapeHtml(
        nativePreferred
          ? "Utiliser le lecteur audio natif ci-dessous"
          : "Lancer ou mettre en pause le direct"
      ) +
      '" ' +
      (nativePreferred ? 'data-native-player-handoff="true"' : 'data-audio-toggle data-button-kind="hero"') +
      "></button>" +
      "</div>" +
      '<div class="hero-ticker-row">' +
      '<div class="hero-ticker-wrap">' +
      '<div id="heroTicker" class="marquee hero-marquee" aria-live="polite">' +
      '<div class="marquee-track">' +
      '<span id="heroTickerText" class="marquee-content">Chargement des métadonnées…</span>' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="hero-volume-wrap">' +
      '<button id="heroVolumeButton" class="dock-volume-button hero-volume-button" type="button" aria-label="Afficher le réglage du volume" aria-expanded="false" aria-controls="heroVolumePopover">' +
      '<span class="icon-slot" data-icon="volume"></span>' +
      "</button>" +
      '<div id="heroVolumePopover" class="dock-volume-popover hero-volume-popover" hidden>' +
      '<input id="heroVolumeRange" class="dock-volume-range" type="range" min="0" max="100" step="1" value="' +
      Math.round(state.volume * 100) +
      '" aria-label="Régler le volume du direct" />' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="hero-tools">' +
      '<div class="mini-actions">' +
      '<button id="heroShareButton" class="mini-button is-primary" type="button">' +
      faIcon("fa-solid fa-share-nodes", "mini-fa-icon") +
      "<span>Partager</span>" +
      "</button>" +
      '<button id="heroCopyStreamButton" class="mini-button" type="button">' +
      icon("copy") +
      "<span>Copier l'URL</span>" +
      "</button>" +
      '<a class="mini-link" href="' +
      escapeHtml(STREAM_URL) +
      '" target="_blank" rel="noopener">' +
      icon("external") +
      "<span>Ouvrir le flux</span>" +
      "</a>" +
      "</div>" +
      "</div>" +
      '<div class="native-player-shell">' +
      '<div id="nativePlayerHost" class="native-player-host"></div>' +
      (nativePreferred
        ? '<p class="native-player-note">Sur iPhone et iPad avec Chrome ou Firefox, utilise ce lecteur pour le direct.</p>'
        : "") +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="quick-panels">' +
      '<section class="surface-panel">' +
      '<div class="section-heading">' +
      '<p class="section-kicker">Derniers passages</p>' +
      '<h2 class="section-title">Récemment diffusé</h2>' +
      '<p class="section-intro">Les derniers contenus passés à l\'antenne, musique, émission ou autre forme sonore comprise.</p>' +
      "</div>" +
      '<ul id="homeRecentList" class="recent-list"></ul>' +
      '<a class="panel-link" href="historique.html" target="_blank" rel="noopener">' +
      icon("arrow") +
      "<span>Afficher l'historique de diffusion</span>" +
      "</a>" +
      "</section>" +
      '<section class="surface-panel">' +
      '<div class="section-heading">' +
      '<p class="section-kicker">Aujourd\'hui</p>' +
      '<h2 class="section-title section-title-program">' +
      '<span class="section-title-icon">' +
      faIcon(today.icon, "section-fa-icon") +
      "</span>" +
      "<span>Programme du " +
      escapeHtml(today.name.toLowerCase()) +
      "</span>" +
      "</h2>" +
      '<p class="section-intro">' +
      escapeHtml(today.summary) +
      "</p>" +
      "</div>" +
      '<div id="homeTodayFocus" class="recent-list"></div>' +
      '<a class="panel-link" href="grille.html" target="_blank" rel="noopener">' +
      icon("arrow") +
      "<span>Voir la grille complète</span>" +
      "</a>" +
      "</section>" +
      "</div>" +
      "</section>"
    );
  }

  function getSortedNewsItems() {
    return NEWS_ITEMS.slice().sort(function (a, b) {
      var aKey = String(a && a.sortKey ? a.sortKey : "");
      var bKey = String(b && b.sortKey ? b.sortKey : "");
      return bKey.localeCompare(aKey);
    });
  }

  function renderNewsPage() {
    var items = getSortedNewsItems();

    return (
      '<section class="page">' +
      '<header class="page-header surface-panel">' +
      '<p class="eyebrow">Actualités</p>' +
      '<h1 class="page-title">Chronologie de la station</h1>' +
      '<p class="page-subtitle">Naissance du flux, mises en route, bascules techniques, voix nouvelles, lives et accidents : les étapes qui façonnent encore Le Chat Noir.</p>' +
      "</header>" +
      '<section class="news-feed">' +
      (items.length
        ? items.map(function (item) {
            return (
              '<article class="news-card">' +
              '<p class="news-date">' +
              escapeHtml(item.dateLabel || item.date || "") +
              "</p>" +
              '<div class="news-copy">' +
              '<h2 class="news-title">' +
              escapeHtml(item.title) +
              "</h2>" +
              '<p class="news-lead">' +
              escapeHtml(item.lead) +
              "</p>" +
              '<p class="news-body">' +
              escapeHtml(item.body) +
              "</p>" +
              "</div>" +
              "</article>"
            );
          }).join("")
        : '<article class="news-card"><div class="news-copy"><h2 class="news-title">Aucune actualité pour le moment</h2><p class="news-body">Les nouvelles étapes de la station apparaîtront ici.</p></div></article>') +
      "</section>" +
      "</section>"
    );
  }

  function renderSchedulePage() {
    return (
      '<section class="page">' +
      '<header class="page-header surface-panel">' +
      '<p class="eyebrow">Grille des programmes</p>' +
      '<h1 class="page-title">La semaine en clair</h1>' +
      '<p class="page-subtitle">Les nuits, les matinées, les rendez-vous fixes, les focus et les dérives qui donnent son rythme à la radio.</p>' +
      "</header>" +
      '<section class="surface-panel page">' +
      '<div id="scheduleSwitcher" class="day-switcher"></div>' +
      '<div id="schedulePanel"></div>' +
      "</section>" +
      "</section>"
    );
  }

  function renderProducersPage() {
    return (
      '<section class="page">' +
      '<header class="page-header surface-panel">' +
      '<p class="eyebrow">Voix et formats</p>' +
      '<h1 class="page-title">Les voix qui fabriquent la radio</h1>' +
      '<p class="page-subtitle">Production, chroniques, émissions, captations et projets qui donnent une forme au territoire radiophonique du Chat Noir.</p>' +
      "</header>" +
      '<section class="page">' +
      '<div class="section-heading">' +
      '<p class="section-kicker">Voix</p>' +
      '<h2 class="section-title">Présences à l\'antenne</h2>' +
      "</div>" +
      '<div class="producers-grid">' +
      PRODUCERS.map(function (producer) {
        return (
          '<article class="producer-card">' +
          '<div class="producer-photo-wrap">' +
          '<img class="producer-photo" src="' +
          escapeHtml(producer.image) +
          '" alt="' +
          escapeHtml("Portrait de " + producer.name) +
          '" loading="lazy" />' +
          "</div>" +
          "<div>" +
          '<p class="producer-role">' +
          escapeHtml(producer.role) +
          "</p>" +
          '<h3 class="producer-name">' +
          escapeHtml(producer.name) +
          "</h3>" +
          '<p class="producer-bio">' +
          escapeHtml(producer.bio) +
          "</p>" +
          "</div>" +
          "</article>"
        );
      }).join("") +
      "</div>" +
      "</section>" +
      '<section class="page">' +
      '<div class="section-heading">' +
      '<p class="section-kicker">Formats</p>' +
      '<h2 class="section-title">Univers déjà présents dans la radio</h2>' +
      "</div>" +
      '<div class="shows-grid">' +
      SHOWS.map(function (show) {
        return (
          '<article class="show-card">' +
          '<img class="show-cover" src="' +
          escapeHtml(show.image) +
          '" alt="' +
          escapeHtml("Visuel " + show.title) +
          '" loading="lazy" />' +
          '<div class="show-body">' +
          '<p class="show-meta">' +
          escapeHtml(show.meta) +
          "</p>" +
          '<h3 class="show-title">' +
          escapeHtml(show.title) +
          "</h3>" +
          '<p class="card-text">' +
          escapeHtml(show.text) +
          "</p>" +
          '<a class="ghost-button show-action" href="' +
          escapeHtml(show.href) +
          '" target="_blank" rel="noopener">' +
          icon("external") +
          renderShowActionLabel(show) +
          "</a>" +
          "</div>" +
          "</article>"
        );
      }).join("") +
      "</div>" +
      "</section>" +
      "</section>"
    );
  }

  function renderContactPage() {
    var activeMode = getContributionMode(state.contactMode);
    return (
      '<section class="page">' +
      '<section class="surface-panel about-shell">' +
      '<div class="about-layout">' +
      '<div class="about-media" aria-hidden="true">' +
      '<div class="about-totem">' +
      '<div class="about-logo-frame">' +
      '<img class="about-logo" src="assets/media/brand/logo.png" alt="" loading="lazy" />' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="about-content">' +
      '<div class="section-heading">' +
      '<p class="section-kicker">À propos</p>' +
      '<h1 class="page-title about-title">Un laboratoire radiophonique indépendant</h1>' +
      "</div>" +
      '<p class="about-lead about-line">' +
      '<i class="fa-solid fa-tower-broadcast about-fa" aria-hidden="true"></i>' +
      '<span>Le Chat Noir est une webradio artisanale, indépendante et autogérée, dédiée aux créations sonores et musicales.</span>' +
      "</p>" +
      '<div class="about-copy">' +
      '<p class="about-paragraph about-line">' +
      '<i class="fa-solid fa-wave-square about-fa" aria-hidden="true"></i>' +
      '<span>Elle diffuse en continu des créations libres : paysages sonores, field recordings, expérimentations radiophoniques, émissions et musiques de tous horizons, sans cloisonnement rigide.</span>' +
      "</p>" +
      '<p class="about-paragraph about-line">' +
      '<i class="fa-solid fa-sliders about-fa" aria-hidden="true"></i>' +
      '<span>La radio assume une écoute lente entre fiction et réel, et respecte les dynamiques des œuvres sans compression globale imposée à l\'antenne.</span>' +
      "</p>" +
      '<p class="about-paragraph about-line">' +
      '<i class="fa-solid fa-house-signal about-fa" aria-hidden="true"></i>' +
      '<span>Tout est fait maison, hébergé, programmé et maintenu localement. Une radio de proximité cosmique, née dans une courée, tournée vers l\'espace.</span>' +
      "</p>" +
      "</div>" +
      '<div class="about-chip-row">' +
      ABOUT_CHIPS.map(function (chip) {
        return '<span class="about-chip">' + escapeHtml(chip) + "</span>";
      }).join("") +
      "</div>" +
      "</div>" +
      "</div>" +
      "</section>" +
      '<section class="surface-panel contrib-shell">' +
      '<div class="section-heading">' +
      '<p class="section-kicker">Contribution</p>' +
      '<h2 class="section-title">Écrire à la radio</h2>' +
      '<p class="section-intro">Une idée, un son, une correction ou une demande de retrait ? Écris-nous, on te répond rapidement.</p>' +
      "</div>" +
      '<div id="contribSwitcher" class="contrib-switcher" role="tablist" aria-label="Choisir un mode de contribution">' +
      CONTRIBUTION_MODES.map(function (mode) {
        var isActive = mode.id === activeMode.id;
        return (
          '<button class="contrib-step' +
          (isActive ? " is-active" : "") +
          '" type="button" role="tab" aria-selected="' +
          (isActive ? "true" : "false") +
          '" data-contrib-mode="' +
          escapeHtml(mode.id) +
          '">' +
          escapeHtml(mode.label) +
          "</button>"
        );
      }).join("") +
      "</div>" +
      '<article id="contribPanel" class="contrib-panel"></article>' +
      "</section>" +
      '<p class="about-signature">· Le Chat Noir avec Dr. John · mars 2026</p>' +
      "</section>"
    );
  }

  function renderHistoryPage() {
    return (
      '<section class="page">' +
      '<header class="page-header surface-panel">' +
      '<p class="eyebrow">Les archives de la radio</p>' +
      '<h1 class="page-title">Historique de diffusion</h1>' +
      '<p class="page-subtitle">Un titre t\'a échappé pendant l\'écoute ? Les dernières diffusions, en lecture chronologique, avec actualisation automatique et recherche par date et heure.</p>' +
      '<div class="page-meta-row">' +
      '<span class="meta-pill">' +
      '<i class="fa-solid fa-rotate" aria-hidden="true"></i>' +
      "<span>Mise à jour toutes les 20 s</span></span>" +
      '<span class="meta-pill">' +
      '<i class="fa-solid fa-clock" aria-hidden="true"></i>' +
      '<span id="historyTimezonePill">UTC · Europe/Paris</span></span>' +
      "</div>" +
      "</header>" +
      '<section class="history-toolbar">' +
      '<div class="history-toolbar-top">' +
      '<p id="historyModeLabel" class="card-text">Chargement…</p>' +
      "</div>" +
      '<div class="history-form">' +
      '<div class="field-group">' +
      '<label for="historyDayInput">Choisir une date</label>' +
      '<input id="historyDayInput" type="date" value="' +
      escapeHtml(state.searchDay) +
      '" />' +
      "</div>" +
      '<div class="field-group">' +
      '<label for="historyTimeInput">Choisir une heure</label>' +
      '<input id="historyTimeInput" type="time" value="' +
      escapeHtml(state.searchTime) +
      '" />' +
      "</div>" +
      '<div class="history-actions">' +
      '<button id="historySearchButton" class="ghost-button history-search-button" type="button">' +
      icon("schedule") +
      "<span>Rechercher</span>" +
      "</button>" +
      "</div>" +
      "</div>" +
      "</section>" +
      '<section class="surface-panel">' +
      '<ul id="historyList" class="history-list"></ul>' +
      "</section>" +
      "</section>"
    );
  }

  function renderPage() {
    if (!refs.pageRoot) return;
    document.body.classList.toggle("route-home", state.route === "home");
    var html = "";
    if (state.route === "actualites") html = renderNewsPage();
    if (state.route === "grille") html = renderSchedulePage();
    if (state.route === "voix") html = renderProducersPage();
    if (state.route === "apropos") html = renderContactPage();
    if (state.route === "historique") html = renderHistoryPage();
    if (!html) html = renderHomePage();
    refs.pageRoot.innerHTML = html;
    attachNativePlayer();
    fillIconSlots(refs.pageRoot);
    bindPageEvents();
    updateUi();
    window.requestAnimationFrame(function () {
      refreshMarquee(refs.dockTicker);
      refreshMarquee(document.getElementById("heroTicker"));
    });
  }

  function attachNativePlayer() {
    if (state.route !== "home" || !refs.audio) return;
    var host = document.getElementById("nativePlayerHost");
    if (!host) return;
    refs.audio.className = "native-audio-player";
    refs.audio.setAttribute("controls", "controls");
    if (refs.audio.parentNode !== host) {
      host.appendChild(refs.audio);
    }
  }

  function nudgeNativePlayer() {
    var shell = document.querySelector(".native-player-shell");
    var player = document.querySelector(".native-audio-player");
    if (shell) {
      shell.classList.remove("is-highlighted");
      void shell.offsetWidth;
      shell.classList.add("is-highlighted");
      window.setTimeout(function () {
        shell.classList.remove("is-highlighted");
      }, 1400);
    }
    if (player && typeof player.scrollIntoView === "function") {
      player.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function saveHistoryCache(rows) {
    try {
      var previewRows = getSortedHistoryRows(rows).slice(0, HISTORY_CACHE_MAX_ROWS);
      window.localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(previewRows));
      window.localStorage.setItem(HISTORY_CACHE_AT_KEY, String(Date.now()));
    } catch (error) {
      return;
    }
  }

  function loadHistoryCache() {
    try {
      var cachedAt = Number(window.localStorage.getItem(HISTORY_CACHE_AT_KEY) || 0);
      if (!cachedAt || Date.now() - cachedAt > HISTORY_CACHE_MAX_AGE_MS) return null;
      var raw = window.localStorage.getItem(HISTORY_CACHE_KEY);
      if (!raw) return null;
      var rows = JSON.parse(raw);
      if (!Array.isArray(rows) || !rows.length) return null;
      return rows;
    } catch (error) {
      return null;
    }
  }

  function fillIconSlots(scope) {
    var root = scope || document;
    root.querySelectorAll(".icon-slot[data-icon]").forEach(function (node) {
      var name = node.getAttribute("data-icon");
      node.innerHTML = icon(name);
    });
  }

  function renderPlayButtons() {
    var heroOrbital = document.querySelector(".orbital-player");
    if (heroOrbital) {
      heroOrbital.classList.toggle("is-playing", state.isPlaying);
    }
    document.querySelectorAll("[data-audio-toggle]").forEach(function (button) {
      var kind = button.getAttribute("data-button-kind");
      var isPlaying = state.isPlaying;
      var label = isPlaying ? "Mettre en pause le direct" : "Lancer le direct";
      button.setAttribute("aria-label", label);
      button.classList.toggle("is-playing", isPlaying);
      if (kind === "hero") {
        button.innerHTML =
          '<span class="icon-slot">' +
          (isPlaying ? icon("pause") : icon("play")) +
          "</span>";
        return;
      }
      button.innerHTML =
        '<span class="icon-slot">' +
        (isPlaying ? icon("pause") : icon("play")) +
        "</span>";
    });
  }

  function updateRouteLinks() {
    document.querySelectorAll("[data-page-link]").forEach(function (link) {
      var route = link.getAttribute("data-page-link");
      link.classList.toggle("is-active", route === state.route);
    });
  }

  function getConnectionText() {
    if (state.connectionState === "playing") return "En écoute";
    if (state.connectionState === "loading") return "Connexion...";
    if (state.connectionState === "reconnecting") return "Reconnexion...";
    if (state.connectionState === "blocked") return "Appuyez sur lecture";
    return "Appuyez sur lecture";
  }

  function updateStatusText() {
    var text = getConnectionText();
    if (refs.dockState) refs.dockState.textContent = text;
  }

  function syncVolumeInputs() {
    if (refs.audio) refs.audio.volume = state.volume;
    if (refs.dockVolumeRange) refs.dockVolumeRange.value = String(Math.round(state.volume * 100));
    var heroRange = document.getElementById("heroVolumeRange");
    if (heroRange) heroRange.value = String(Math.round(state.volume * 100));
  }

  function updateTrackText() {
    var label = buildNowPlayingLabel(state.currentTrack);
    var dockChanged = false;
    if (refs.dockTickerText && refs.dockTickerText.textContent !== label) {
      refs.dockTickerText.textContent = label;
      dockChanged = true;
    }
    var heroTickerText = document.getElementById("heroTickerText");
    var heroChanged = false;
    if (heroTickerText && heroTickerText.textContent !== label) {
      heroTickerText.textContent = label;
      heroChanged = true;
    }
    if (dockChanged) refreshMarquee(refs.dockTicker);
    if (heroChanged) refreshMarquee(document.getElementById("heroTicker"));
    updateMediaSession();
  }

  function refreshMarquee(root) {
    if (!root) return;
    var track = root.querySelector(".marquee-track");
    var content = root.querySelector(".marquee-content");
    if (!track || !content) return;
    track.classList.remove("is-animated");
    track.style.removeProperty("--marquee-distance");
    track.style.removeProperty("--marquee-duration");
    var ghost = track.querySelector(".marquee-ghost");
    if (ghost) ghost.remove();

    window.requestAnimationFrame(function () {
      var contentWidth = content.scrollWidth;
      var containerWidth = root.clientWidth;
      if (!contentWidth || !containerWidth || contentWidth <= containerWidth - 12) return;
      var clone = content.cloneNode(true);
      clone.classList.remove("marquee-content");
      clone.classList.add("marquee-ghost");
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
      var distance = contentWidth + 32;
      var duration = Math.max(12, distance / 28);
      track.style.setProperty("--marquee-distance", distance + "px");
      track.style.setProperty("--marquee-duration", duration + "s");
      track.classList.add("is-animated");
    });
  }

  function renderHomeRecentList() {
    var root = document.getElementById("homeRecentList");
    if (!root) return;
    var rows = getSortedHistoryRows(state.historyRows).slice(0, 5);
    if (!rows.length) {
      root.innerHTML = '<li class="history-empty">Les derniers titres apparaîtront ici dès que le CSV est chargé.</li>';
      return;
    }
    root.innerHTML = rows
      .map(function (row) {
        var title = asString(row.title) || "(sans titre)";
        var meta = getTrackMeta(row);
        return (
          '<li class="recent-item">' +
          '<span class="recent-time">' +
          escapeHtml(formatLocalTime(row.tsIso)) +
          "</span>" +
          '<strong class="recent-title">' +
          escapeHtml(title) +
          "</strong>" +
          '<span class="recent-meta">' +
          escapeHtml(meta || "Métadonnées partielles") +
          "</span>" +
          "</li>"
        );
      })
      .join("");
  }

  function getHomeTodaySlots(day) {
    var nonMetaSlots = (day && day.slots ? day.slots : []).filter(function (slot) {
      return slot && !slot.meta;
    });
    var picks = [];

    function pushIfNeeded(slot) {
      if (!slot || picks.indexOf(slot) !== -1) return;
      picks.push(slot);
    }

    pushIfNeeded(nonMetaSlots[0]);
    pushIfNeeded(
      nonMetaSlots.find(function (slot) {
        return slot && slot.icon;
      })
    );
    pushIfNeeded(
      (day.slots || []).find(function (slot) {
        return slot && (slot.badge || slot.kind);
      })
    );
    pushIfNeeded(
      (day.slots || []).find(function (slot) {
        return slot && slot.highlight;
      })
    );
    pushIfNeeded(nonMetaSlots[nonMetaSlots.length - 1]);

    for (var i = 0; i < nonMetaSlots.length && picks.length < 4; i += 1) {
      pushIfNeeded(nonMetaSlots[i]);
    }

    return picks.slice(0, 4);
  }

  function renderTodayFocus() {
    var root = document.getElementById("homeTodayFocus");
    if (!root) return;
    var day = getScheduleDayById(getCurrentDayId());
    var rows = getHomeTodaySlots(day);
    root.innerHTML = rows
      .map(function (slot) {
        return (
          '<article class="' +
          getProgramItemClasses("today-focus", slot) +
          '">' +
          '<div class="today-focus-top">' +
          '<span class="today-focus-time' +
          (slot.meta ? " is-meta" : "") +
          '">' +
          escapeHtml(slot.time) +
          "</span>" +
          buildProgramBadge(slot) +
          "</div>" +
          '<div class="today-focus-title-row">' +
          faIcon(slot.icon, "program-icon") +
          '<strong class="today-focus-title">' +
          escapeHtml(slot.title) +
          "</strong>" +
          "</div>" +
          '<p class="today-focus-desc">' +
          escapeHtml(slot.desc) +
          "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderScheduleView() {
    var switcher = document.getElementById("scheduleSwitcher");
    var panel = document.getElementById("schedulePanel");
    if (!switcher || !panel) return;

    switcher.innerHTML = SCHEDULE_TIMELINE_DAYS.map(function (day) {
      var active = day.id === state.selectedDayId ? " is-active" : "";
      return (
        '<button class="day-chip' +
        active +
        '" type="button" data-day="' +
        day.id +
        '">' +
        escapeHtml(day.shortName) +
        "</button>"
      );
    }).join("");

    var dayData = getScheduleDayById(state.selectedDayId);
    panel.innerHTML =
      '<article class="schedule-card">' +
      '<div class="schedule-day-head">' +
      '<div class="schedule-day-copy">' +
      '<div class="schedule-day-title-row">' +
      '<span class="schedule-day-icon">' +
      faIcon(dayData.icon, "schedule-day-fa") +
      "</span>" +
      "<h3>" +
      escapeHtml(dayData.name) +
      "</h3>" +
      "</div>" +
      "<p>" +
      escapeHtml(dayData.summary) +
      "</p>" +
      "</div>" +
      "</div>" +
      '<div class="schedule-list">' +
      dayData.slots
        .map(function (slot) {
          return (
            '<article class="' +
            getProgramItemClasses("schedule-item", slot) +
            '">' +
            '<div class="schedule-item-top">' +
            '<span class="schedule-time' +
            (slot.meta ? " is-meta" : "") +
            '">' +
            escapeHtml(slot.time) +
            "</span>" +
            buildProgramBadge(slot) +
            "</div>" +
            '<div class="schedule-name-row">' +
            faIcon(slot.icon, "program-icon") +
            '<strong class="schedule-name">' +
            escapeHtml(slot.title) +
            "</strong>" +
            "</div>" +
            '<span class="schedule-desc">' +
            escapeHtml(slot.desc) +
            "</span>" +
            "</article>"
          );
        })
        .join("") +
      "</div>" +
      "</article>";
  }

  function getHistoryDisplayRows() {
    var rows = getSortedHistoryRows(state.historyRows);
    if (state.historyMode !== "search") {
      var latestDay = state.searchDay || getTodayYmd();
      return {
        rows: rows
          .filter(function (row) {
            return row.tsIso && isSameLocalDay(row.tsIso, latestDay);
          })
          .slice(0, 20),
        label: "",
      };
    }

    var filtered = rows.filter(function (row) {
      return row.tsIso && isSameLocalDay(row.tsIso, state.searchDay);
    });

    if (state.searchTime) {
      var tokens = state.searchTime.split(":");
      var hour = Number(tokens[0] || 0);
      var minute = Number(tokens[1] || 0);
      var referenceMinutes = hour * 60 + minute;
      filtered.sort(function (a, b) {
        var aMinutes = getDisplayMinutes(a.tsIso);
        var bMinutes = getDisplayMinutes(b.tsIso);
        return Math.abs((aMinutes == null ? 0 : aMinutes) - referenceMinutes) - Math.abs((bMinutes == null ? 0 : bMinutes) - referenceMinutes);
      });
      return {
        rows: filtered.slice(0, 20),
        label: "Recherche ponctuelle : titres les plus proches de " + state.searchTime,
      };
    }

    return {
      rows: filtered.slice(0, 20),
      label: "Recherche ponctuelle : " + state.searchDay,
    };
  }

  function renderHistoryView() {
    var root = document.getElementById("historyList");
    if (!root) return;
    var modeLabel = document.getElementById("historyModeLabel");
    var statusText = document.getElementById("historyStatusText");
    var timezonePill = document.getElementById("historyTimezonePill");
    var dayInput = document.getElementById("historyDayInput");
    var timeInput = document.getElementById("historyTimeInput");

    if (state.historyMode !== "search") {
      state.searchDay = getTodayYmd();
    }
    if (dayInput) dayInput.value = state.searchDay;
    if (timeInput) timeInput.value = state.searchTime;
    if (modeLabel) modeLabel.textContent = getHistoryDisplayRows().label;
    if (statusText) statusText.textContent = state.historyStatus;
    if (timezonePill) timezonePill.textContent = getDisplayZoneLabel();

    var display = getHistoryDisplayRows();
    if (!display.rows.length) {
      root.innerHTML = '<li class="history-empty">Aucun titre trouvé pour cette sélection.</li>';
      return;
    }

    root.innerHTML = display.rows
      .map(function (row) {
        var title = asString(row.title) || "(sans titre)";
        var meta = getTrackMeta(row);
        return (
          '<li class="history-item">' +
          '<div class="history-item-head">' +
          '<span class="history-date history-stamp">' +
          escapeHtml(formatLocalDate(row.tsIso)) +
          "</span>" +
          '<span class="history-time history-stamp">' +
          escapeHtml(formatLocalTime(row.tsIso)) +
          "</span>" +
          "</div>" +
          '<div class="history-item-copy">' +
          '<strong class="history-title">' +
          escapeHtml(title) +
          "</strong>" +
          '<span class="history-meta">' +
          escapeHtml(meta || "Métadonnées partielles") +
          "</span>" +
          "</div>" +
          "</li>"
        );
      })
      .join("");
  }

  function renderContributionView() {
    var switcher = document.getElementById("contribSwitcher");
    var panel = document.getElementById("contribPanel");
    var activeMode = getContributionMode(state.contactMode);
    if (!switcher || !panel) return;

    switcher.querySelectorAll("[data-contrib-mode]").forEach(function (button) {
      var isActive = button.getAttribute("data-contrib-mode") === activeMode.id;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    panel.innerHTML =
      '<p class="contrib-kicker">' +
      escapeHtml(activeMode.kicker) +
      "</p>" +
      '<h3 class="contrib-title">' +
      escapeHtml(activeMode.title) +
      "</h3>" +
      '<p class="contrib-text">' +
      escapeHtml(activeMode.text) +
      "</p>" +
      '<ul class="contact-list contrib-list">' +
      activeMode.points
        .map(function (point) {
          return "<li>" + escapeHtml(point) + "</li>";
        })
        .join("") +
      "</ul>" +
      '<a class="contrib-action" href="' +
      escapeHtml(buildMailtoHref(activeMode)) +
      '">' +
      icon("contact") +
      "<span>" +
      escapeHtml(activeMode.cta) +
      "</span></a>";
  }

  function updateUi() {
    renderPlayButtons();
    fillIconSlots(document);
    updateRouteLinks();
    updateStatusText();
    syncVolumeInputs();
    updateTrackText();
    renderHomeRecentList();
    renderTodayFocus();
    renderScheduleView();
    renderContributionView();
    renderHistoryView();
  }

  function setVolume(nextValue) {
    var normalized = Math.max(0, Math.min(1, nextValue));
    state.volume = normalized;
    saveVolume(normalized);
    syncVolumeInputs();
  }

  function setDockVolumePopover(nextValue, shouldFocus) {
    state.dockVolumeOpen = Boolean(nextValue);
    if (state.dockVolumeOpen) setHeroVolumePopover(false);
    if (refs.dockVolumeButton) {
      refs.dockVolumeButton.setAttribute("aria-expanded", state.dockVolumeOpen ? "true" : "false");
    }
    if (refs.dockVolumePopover) {
      refs.dockVolumePopover.hidden = !state.dockVolumeOpen;
    }
    if (state.dockVolumeOpen && shouldFocus && refs.dockVolumeRange) {
      window.setTimeout(function () {
        if (typeof refs.dockVolumeRange.focus === "function") refs.dockVolumeRange.focus();
      }, 30);
    }
  }

  function setHeroVolumePopover(nextValue, shouldFocus) {
    state.heroVolumeOpen = Boolean(nextValue);
    if (state.heroVolumeOpen) setDockVolumePopover(false);
    var heroButton = document.getElementById("heroVolumeButton");
    var heroPopover = document.getElementById("heroVolumePopover");
    var heroRange = document.getElementById("heroVolumeRange");

    if (heroButton) {
      heroButton.setAttribute("aria-expanded", state.heroVolumeOpen ? "true" : "false");
    }
    if (heroPopover) {
      heroPopover.hidden = !state.heroVolumeOpen;
    }
    if (state.heroVolumeOpen && shouldFocus && heroRange) {
      window.setTimeout(function () {
        if (typeof heroRange.focus === "function") heroRange.focus();
      }, 30);
    }
  }

  function clearReconnectTimer() {
    if (!state.reconnectTimer) return;
    window.clearTimeout(state.reconnectTimer);
    state.reconnectTimer = null;
  }

  function clearStallTimer() {
    if (!state.stallTimer) return;
    window.clearTimeout(state.stallTimer);
    state.stallTimer = null;
  }

  function markAudioProgress() {
    state.lastProgressAt = Date.now();
    state.reconnectAttempts = 0;
    clearReconnectTimer();
    clearStallTimer();
    state.connectionState = "playing";
    updateUi();
  }

  function scheduleStallCheck(reason) {
    if (!state.userWantsPlay) return;
    clearStallTimer();
    state.stallTimer = window.setTimeout(function () {
      if (!state.userWantsPlay) return;
      var blockedForLong = Date.now() - state.lastProgressAt >= 10000;
      var streamLooksStuck = refs.audio.readyState <= 2 || refs.audio.ended || refs.audio.paused;
      if (blockedForLong && streamLooksStuck) {
        scheduleReconnect(reason || "stalled");
      }
    }, 10000);
  }

  function scheduleReconnect(reason, immediate) {
    if (!state.userWantsPlay) return;
    if (state.reconnectTimer) return;
    clearStallTimer();
    state.connectionState = "reconnecting";
    updateUi();

    var delay = 0;
    if (!immediate) {
      var step = Math.min(state.reconnectAttempts, 5);
      delay = Math.min(15000, 1000 * Math.pow(2, step));
      delay += Math.floor(Math.random() * 400);
    }

    state.reconnectTimer = window.setTimeout(function () {
      state.reconnectTimer = null;
      attemptPlayback(true, reason || "reconnect");
    }, delay);
  }

  async function attemptPlayback(cacheBust) {
    state.connectionState = "loading";
    updateUi();
    clearReconnectTimer();
    clearStallTimer();
    state.manualPausePending = false;

    try {
      state.suppressPauseIntent = true;
      refs.audio.pause();
      refs.audio.src = buildStreamUrl(Boolean(cacheBust));
      refs.audio.load();
      state.usingCacheBustSource = Boolean(cacheBust);
    } catch (error) {
      state.suppressPauseIntent = false;
    }

    window.setTimeout(function () {
      state.suppressPauseIntent = false;
    }, 700);

    try {
      var playPromise = refs.audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        await playPromise;
      }
      state.userWantsPlay = true;
      state.connectionState = "playing";
      updateUi();
    } catch (error) {
      state.reconnectAttempts = Math.min(state.reconnectAttempts + 1, 8);
      var blockedByPolicy =
        error &&
        (error.name === "NotAllowedError" || error.name === "SecurityError");
      if (blockedByPolicy) {
        state.userWantsPlay = false;
        state.connectionState = "blocked";
        updateUi();
        return;
      }
      scheduleReconnect("play-failed", false);
    }
  }

  async function requestPlayback() {
    clearReconnectTimer();
    clearStallTimer();
    state.manualPausePending = false;
    state.userWantsPlay = true;

    try {
      if (!refs.audio.currentSrc || refs.audio.networkState === 0) {
        refs.audio.load();
      }
      var playPromise = refs.audio.play();
      state.connectionState = "loading";
      updateUi();
      if (playPromise && typeof playPromise.then === "function") {
        await playPromise;
      }
      state.connectionState = "playing";
      updateUi();
    } catch (error) {
      state.reconnectAttempts = Math.min(state.reconnectAttempts + 1, 8);
      var blockedByPolicy =
        error &&
        (error.name === "NotAllowedError" || error.name === "SecurityError");
      if (blockedByPolicy) {
        state.userWantsPlay = false;
        state.connectionState = "blocked";
        updateUi();
        return;
      }
      scheduleReconnect("play-failed", false);
    }
  }

  function pausePlayback() {
    markUserGesture();
    state.manualPausePending = true;
    state.userWantsPlay = false;
    state.connectionState = "idle";
    clearReconnectTimer();
    clearStallTimer();
    refs.audio.pause();
    updateUi();
  }

  function togglePlayback() {
    if (state.isPlaying || state.userWantsPlay) {
      pausePlayback();
      return;
    }
    requestPlayback();
  }

  function applyCurrentTrack(meta) {
    if (!meta) return;
    state.currentTrack = {
      artist: asString(meta.artist),
      album: asString(meta.album),
      title: asString(meta.title) || "Titre indisponible pour l'instant",
      year: asString(meta.year),
    };
    updateTrackText();
  }

  async function refreshNowPlaying() {
    try {
      var response = await fetch(NOW_PLAYING_URL + "?t=" + Date.now(), {
        cache: "no-store",
      });
      var meta = null;
      if (response.ok) {
        meta = extractNowPlayingMeta(await response.json());
      }
      if ((!meta || (!meta.title && !meta.artist)) && state.historyRows.length) {
        meta = buildMetaFromCsvRows(state.historyRows);
      }
      if (!meta || (!meta.title && !meta.artist)) {
        var csvResponse = await fetch(HISTORY_CSV_URL + "?t=" + Date.now(), {
          cache: "no-store",
        });
        if (csvResponse.ok) {
          meta = buildMetaFromCsvRows(parseCsvRows(await csvResponse.text()));
        }
      }
      applyCurrentTrack(meta || state.currentTrack);
    } catch (error) {
      if (state.historyRows.length) {
        applyCurrentTrack(buildMetaFromCsvRows(state.historyRows) || state.currentTrack);
        return;
      }
      applyCurrentTrack({
        artist: "",
        album: "",
        title: "Titre en cours indisponible pour l'instant",
        year: "",
      });
    }
  }

  async function refreshHistory() {
    try {
      var response = await fetch(HISTORY_CSV_URL + "?t=" + Date.now(), { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      state.historyRows = parseCsvRows(await response.text());
      saveHistoryCache(state.historyRows);
      state.historyStatus = "Source : history/nowplaying.csv • mise à jour active";
      renderHomeRecentList();
      renderHistoryView();
      if (!state.currentTrack.title || /chargement/i.test(state.currentTrack.title)) {
        applyCurrentTrack(buildMetaFromCsvRows(state.historyRows));
      }
    } catch (error) {
      state.historyStatus = "Impossible de charger l'historique pour le moment";
      renderHistoryView();
    }
  }

  function getSharePayload() {
    var title = asString(state.currentTrack.title);
    var artist = asString(state.currentTrack.artist);
    var album = asString(state.currentTrack.album);
    if (!album && title) {
      album = parseAlbumYearFromTitle(title).album;
    }

    var lines = [];
    if (artist) lines.push("Artiste : " + artist);
    if (album) lines.push("Album : " + album);
    if (title) lines.push("Titre : " + title);
    lines.push("Flux : " + STREAM_URL);

    return {
      share: {
        title: "Le Chat Noir — Titre en cours",
        text: lines.join("\n"),
        url: SITE_URL,
      },
      clipboard: "J'écoute Le Chat Noir.\n" + lines.join("\n") + "\nSite : " + SITE_URL,
    };
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "readonly");
    field.style.position = "absolute";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();
    var ok = document.execCommand("copy");
    document.body.removeChild(field);
    if (!ok) throw new Error("copy-failed");
  }

  function flashButtonFeedback(button, nextLabel) {
    if (!button) return;
    var labelNode = button.querySelector("span:last-child");
    if (!labelNode) return;
    var previous = labelNode.textContent;
    labelNode.textContent = nextLabel;
    window.setTimeout(function () {
      labelNode.textContent = previous;
    }, 1600);
  }

  async function shareCurrentTrack(button) {
    var payload = getSharePayload();
    try {
      if (navigator.share) {
        await navigator.share(payload.share);
        flashButtonFeedback(button, "Partagé");
      } else {
        await copyToClipboard(payload.clipboard);
        flashButtonFeedback(button, "Copié");
      }
    } catch (error) {
      if (error && error.name === "AbortError") return;
    }
  }

  async function copyStreamUrl(button) {
    await copyToClipboard(STREAM_URL);
    flashButtonFeedback(button, "Copié");
  }

  function updateMediaSession() {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: asString(state.currentTrack.title) || "Le Chat Noir",
        artist: asString(state.currentTrack.artist) || "Le Chat Noir",
        album: asString(state.currentTrack.album) || "Webradio nocturne",
        artwork: [
          {
            src: SITE_URL + "assets/media/brand/logo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });
      navigator.mediaSession.setActionHandler("play", togglePlayback);
      navigator.mediaSession.setActionHandler("pause", pausePlayback);
    } catch (error) {
      return;
    }
  }

  function bindPageEvents() {
    refs.pageRoot.querySelectorAll("[data-audio-toggle]").forEach(function (button) {
      bindAudioToggleButton(button);
    });

    refs.pageRoot.querySelectorAll("[data-native-player-handoff]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        if (event && event.cancelable) event.preventDefault();
        nudgeNativePlayer();
      });
    });

    var heroShareButton = document.getElementById("heroShareButton");
    if (heroShareButton) {
      heroShareButton.addEventListener("click", function () {
        shareCurrentTrack(heroShareButton);
      });
    }

    var heroCopyStreamButton = document.getElementById("heroCopyStreamButton");
    if (heroCopyStreamButton) {
      heroCopyStreamButton.addEventListener("click", function () {
        copyStreamUrl(heroCopyStreamButton).catch(function () {
          return;
        });
      });
    }

    var heroVolumeRange = document.getElementById("heroVolumeRange");
    var heroVolumeButton = document.getElementById("heroVolumeButton");
    if (heroVolumeButton) {
      heroVolumeButton.addEventListener("click", function () {
        setHeroVolumePopover(!state.heroVolumeOpen, !state.heroVolumeOpen);
      });
    }
    if (heroVolumeRange) {
      heroVolumeRange.addEventListener("input", function () {
        setVolume(Number(heroVolumeRange.value) / 100);
      });
    }

    var scheduleSwitcher = document.getElementById("scheduleSwitcher");
    if (scheduleSwitcher) {
      scheduleSwitcher.addEventListener("click", function (event) {
        var trigger = event.target.closest(".day-chip[data-day]");
        if (!trigger) return;
        state.selectedDayId = trigger.getAttribute("data-day");
        renderScheduleView();
      });
    }

    var contribSwitcher = document.getElementById("contribSwitcher");
    if (contribSwitcher) {
      contribSwitcher.addEventListener("click", function (event) {
        var trigger = event.target.closest(".contrib-step[data-contrib-mode]");
        if (!trigger) return;
        state.contactMode = trigger.getAttribute("data-contrib-mode") || "son";
        renderContributionView();
      });
    }

    var historySearchButton = document.getElementById("historySearchButton");
    var historyDayInput = document.getElementById("historyDayInput");
    var historyTimeInput = document.getElementById("historyTimeInput");

    if (historySearchButton && historyDayInput && historyTimeInput) {
      historySearchButton.addEventListener("click", function () {
        state.searchDay = historyDayInput.value || getTodayYmd();
        state.searchTime = historyTimeInput.value || "";
        state.historyMode =
          state.searchTime || state.searchDay !== getTodayYmd() ? "search" : "latest";
        renderHistoryView();
      });
    }

    if (historyDayInput) {
      historyDayInput.addEventListener("change", function () {
        state.searchDay = historyDayInput.value || getTodayYmd();
        if (!state.searchTime && state.searchDay === getTodayYmd()) {
          state.historyMode = "latest";
        } else {
          state.historyMode = "search";
        }
        renderHistoryView();
      });
    }

    if (historyTimeInput) {
      historyTimeInput.addEventListener("change", function () {
        state.searchTime = historyTimeInput.value || "";
        state.historyMode =
          state.searchTime || state.searchDay !== getTodayYmd() ? "search" : "latest";
        renderHistoryView();
      });
    }
  }

  function bindShellEvents() {
    fillIconSlots(document);
    renderPlayButtons();
    updateRouteLinks();

    bindAudioToggleButton(refs.dockToggle);
    if (refs.dockVolumeButton) {
      refs.dockVolumeButton.addEventListener("click", function () {
        setDockVolumePopover(!state.dockVolumeOpen, !state.dockVolumeOpen);
      });
    }
    if (refs.dockVolumeRange) {
      refs.dockVolumeRange.addEventListener("input", function () {
        setVolume(Number(refs.dockVolumeRange.value) / 100);
      });
    }

    window.addEventListener("resize", function () {
      refreshMarquee(refs.dockTicker);
      refreshMarquee(document.getElementById("heroTicker"));
    });

    document.addEventListener("click", function (event) {
      if (state.dockVolumeOpen) {
        if (!event.target.closest(".dock-volume-wrap")) {
          setDockVolumePopover(false);
        }
      }
      if (state.heroVolumeOpen) {
        if (!event.target.closest(".hero-volume-wrap")) {
          setHeroVolumePopover(false);
        }
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      if (state.dockVolumeOpen) setDockVolumePopover(false);
      if (state.heroVolumeOpen) setHeroVolumePopover(false);
    });
  }

  function bindAudioEvents() {
    if (!refs.audio) return;
    refs.audio.volume = state.volume;

    refs.audio.addEventListener("pointerdown", markUserGesture);
    refs.audio.addEventListener("mousedown", markUserGesture);
    refs.audio.addEventListener("touchstart", markUserGesture, { passive: true });
    refs.audio.addEventListener("keydown", markUserGesture);

    refs.audio.addEventListener("play", function () {
      state.isPlaying = true;
      state.userWantsPlay = true;
      state.manualPausePending = false;
      state.connectionState = "playing";
      updateUi();
    });

    refs.audio.addEventListener("pause", function () {
      state.isPlaying = false;
      if (state.suppressPauseIntent) {
        updateUi();
        return;
      }
      if (state.manualPausePending) {
        state.manualPausePending = false;
        state.userWantsPlay = false;
        state.connectionState = "idle";
        clearReconnectTimer();
        clearStallTimer();
        updateUi();
        return;
      }
      if (refs.audio.ended) {
        updateUi();
        return;
      }
      if (state.userWantsPlay) {
        scheduleStallCheck("paused-unexpected");
      } else {
        state.connectionState = "idle";
      }
      updateUi();
    });

    refs.audio.addEventListener("playing", markAudioProgress);
    refs.audio.addEventListener("timeupdate", markAudioProgress);
    refs.audio.addEventListener("progress", markAudioProgress);
    refs.audio.addEventListener("canplay", markAudioProgress);
    refs.audio.addEventListener("canplaythrough", markAudioProgress);

    refs.audio.addEventListener("waiting", function () {
      scheduleStallCheck("waiting");
    });
    refs.audio.addEventListener("stalled", function () {
      scheduleStallCheck("stalled");
    });
    refs.audio.addEventListener("suspend", function () {
      scheduleStallCheck("suspend");
    });
    refs.audio.addEventListener("ended", function () {
      scheduleReconnect("ended");
    });
    refs.audio.addEventListener("emptied", function () {
      scheduleReconnect("emptied");
    });
    refs.audio.addEventListener("error", function () {
      scheduleReconnect("error");
    });

    window.addEventListener("online", function () {
      if (!state.userWantsPlay) return;
      scheduleReconnect("online", true);
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) return;
      if (!state.userWantsPlay) return;
      if (refs.audio.paused || refs.audio.readyState <= 2) {
        scheduleReconnect("visible", true);
      }
    });
  }

  function initialize() {
    bindShellEvents();
    renderPage();
    updateUi();
    if (state.route === "home") {
      bindAudioEvents();
      setVolume(state.volume);
      refreshHistory();
      refreshNowPlaying();
      window.setInterval(refreshNowPlaying, 12000);
      window.setInterval(refreshHistory, 20000);
      return;
    }
    if (state.route === "historique") {
      var cachedRows = loadHistoryCache();
      if (cachedRows && cachedRows.length) {
        state.historyRows = cachedRows;
        state.historyStatus = "Chargement des dernières diffusions…";
        renderHistoryView();
      }
      refreshHistory();
      window.setInterval(refreshHistory, 20000);
    }
  }

  initialize();
})();
