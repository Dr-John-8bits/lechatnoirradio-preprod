(function () {
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

  window.LCNContentData = {
    PRODUCERS: PRODUCERS,
    SHOWS: SHOWS,
    ABOUT_CHIPS: ABOUT_CHIPS,
    CONTRIBUTION_MODES: CONTRIBUTION_MODES,
    SCHEDULE_TIMELINE_DAYS: decorateScheduleDays(SCHEDULE_TIMELINE_DAYS),
  };
})();
