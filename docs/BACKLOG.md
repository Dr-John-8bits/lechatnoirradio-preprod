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

## Mutualisation des contenus éditoriaux (vision exprimée le 12/06/2026)

Objectif : actualités, voix et grille gérés comme des **données**, modifiables par les outils
maison sans toucher au code du site — et consommables un jour par une app dédiée sans
dupliquer les contenus. Les actualités suivent déjà ce modèle ; généraliser en deux temps.

### Étape 1 — un contrat de données unique (faisable dès maintenant, sans risque)

```text
assets/data/news.json      ✅ existe (généré depuis content/news/*.md)
assets/data/voices.json    → à créer : PRODUCERS + SHOWS sortis de content-data.js
assets/data/schedule.json  → à créer : SCHEDULE_TIMELINE_DAYS sorti de content-data.js
                             = format de sortie de l'outil maison grille en cours de dev
```

- Le site continue de lire des modules JS **générés** depuis ces JSON (même chaîne que
  news : `build-*.mjs`, sortie commitée, zéro fetch runtime, zéro risque GitHub Pages).
- L'outil grille maison n'a alors qu'un seul livrable à produire : `schedule.json`
  conforme au schéma (jours → slots `{time, title, desc, highlight?, badge?}` + alias
  de rapprochement antenne). **Figer ce schéma ensemble = le vrai chantier.**
- Une future app lit les trois JSON directement depuis le dépôt (raw GitHub) : contenus
  saisis une fois, consommés partout. Publier = un commit unique de données.

### Étape 2 — si l'app voit le jour : contenus servis par le serveur radio

`stream.lechatnoirradio.fr` expose déjà des JSON publics avec CORS ; il peut héberger
`/content/news.json`, `/content/voices.json`, `/content/schedule.json` (cache raisonnable,
PAS no-store — ce sont des contenus, pas du temps réel). Site et app les **fetchent au
chargement** avec la version commitée en secours intégré : mise à jour de contenu sans
aucun commit, conformité au principe « le serveur publie, les clients consomment ».
Nécessite une entrée dans `SPEC-SERVEUR-HISTORIQUE.md` (locations + cache) le moment venu.

À ne pas faire : brancher l'étape 2 avant la bascule v1 (le CDC § 15.2 impose la prudence
sur la migration des contenus en fetch runtime) ; multiplier les sources de vérité.

## Explicitement écartés

- Analytics / tracking : contraire à la ligne du site (« le site ne trace pas les visiteurs »).
- Player tiers, autoplay, framework : interdits par le cahier des charges.
- Commentaires/réactions : hors philosophie.
