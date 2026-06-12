# Backlog — pistes d'amélioration (hors v1)

Issu de l'audit du 11 juin 2026. Rien ici n'est bloquant pour la bascule.
Le chantier CSV/Range côté serveur est déjà spécifié à part : `SPEC-SERVEUR-HISTORIQUE.md`.

## v1.1 — après bascule (déjà actés au plan)

- **Service worker léger** (D2) : cache des assets statiques + écran hors-ligne sobre.
  Jamais de cache du flux ni des endpoints live (réglé par le doc d'architecture § 18).
- **Activation `tailBytes`** quand la spec serveur Range sera déployée (le code front est prêt).

## Quick wins (1–2 h chacun)

- **Image de partage dédiée** : générer une og-image 1200×630 depuis la photo du chat
  (l'original 1080×1080 est dans le dépôt) — les partages Signal/WhatsApp/Mastodon
  afficheraient une vraie carte au lieu de l'icône.
- **Données structurées JSON-LD** (`RadioStation` + `WebSite`) sur l'accueil — meilleur
  référencement des moteurs et assistants.
- **Raccourci clavier espace** : lecture/pause quand le focus n'est pas dans un champ —
  geste naturel pour une radio.
- **Volume persistant** (`localStorage`) entre deux visites.
- **Presets de recherche historique** : boutons « aujourd'hui / hier » à côté du champ date.
- **Partage natif des actualités** (`navigator.share` si disponible, sinon copie du permalien).
- **`Timing-Allow-Origin` côté Nginx** (à ajouter à la spec serveur) : rendrait les poids des
  endpoints mesurables par les outils de perf — purement diagnostique.
- **Heartbeat antenne (côté serveur)** : quand on coupe Liquidsoap, Nginx continue de servir
  les derniers JSON → la pastille reste « à l'antenne » pour un visiteur qui n'écoute pas
  (constaté en test le 12/06, jugé non bloquant). Signal fiable possible : le timer
  `lcn-listeners-json` (30 s, indépendant de Liquidsoap) pourrait écrire un champ
  `liquidsoapAlive` dans `listeners.json` ; le front basculerait alors la pastille en
  « hors ligne » sur cette vérité plutôt que sur une heuristique fragile d'ancienneté.

## Confort / différenciation (à discuter)

- **Auditeurs visibles sur mobile** : le compteur est masqué < 560 px par sobriété ;
  une variante compacte dans la pastille antenne est possible.
- **Affinage DA** (réserve « peut-être trop neutre ») : pistes concrètes sans casser
  l'épure — texture papier très subtile en fond, le chat du footer qui cligne des yeux
  (1 animation discrète, désactivée en reduced-motion), traitement duotone des portraits
  voix, variante du vermillon par rubrique. À regarder ensemble sur le site fini.
- **View Transitions API** entre rubriques (fondu doux, progressive enhancement).
- **Favicon SVG** avec variante sombre automatique.

## Explicitement écartés

- Analytics / tracking : contraire à la ligne du site (« le site ne trace pas les visiteurs »).
- Player tiers, autoplay, framework : interdits par le cahier des charges.
- Commentaires/réactions : hors philosophie.
