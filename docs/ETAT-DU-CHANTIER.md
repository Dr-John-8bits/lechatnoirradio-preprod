# État du chantier — point de reprise

> **À lire en premier pour reprendre le travail sur le futur site Le Chat Noir.**
> Ce document est le point d'entrée : il résume où on en est et pointe vers le détail.
> Tenu à jour à chaque session. Dernière mise à jour : **12 juin 2026**.

## En une phrase

Refonte du site public Le Chat Noir (webradio indépendante) : on fait **évoluer le shell
existant** (player persistant, routage par hash, historique en page séparée), modernisé en
modules ES, nouvelle DA « papier chaud / vermillon riso », sans régression sur l'écoute.

## Où sont les choses

| Quoi | Où |
|---|---|
| Le nouveau site (en cours) | ce dossier (`LCN-Website-Preprod/`) |
| Plan d'action complet + décisions D1–D13 | `../LCN-plan-action-futur-site.md` |
| Cahiers des charges (produit + serveur) | `../LCN-cahier-des-charges-futur-site.md`, `../LCN-architecture-serveur-site-web.md` |
| Ancien site (référence, **ne jamais modifier**) | `../OLD-LCN-Website/` |
| Décisions DA | `../*` mémoire + § « DA » ci-dessous |
| Architecture radio (aide-mémoire) | `docs/ARCHITECTURE-RADIO.md` |
| Comment ajouter une actu / modifier la grille | `docs/MAINTENANCE.md` |
| Audits a11y / perf | `docs/AUDIT-A11Y-PERF.md` |
| Matrice de tests + retours terrain | `docs/TEST-MATRIX.md` |
| Pistes d'amélioration + vision mutualisation contenus | `docs/BACKLOG.md` |
| Évolution serveur (CSV Range) | `docs/SPEC-SERVEUR-HISTORIQUE.md` |
| Checklist de bascule + rollback | `docs/RELEASE-CHECKLIST.md` |

## État d'avancement (12 juin 2026)

- **Lots 0 à 4 (développement) : terminés.** Site complet : accueil, grille (show réel
  surligné via `current-show.json`), historique avec recherche, actualités (chaîne Markdown
  portée), voix, à propos (éditorial complet), + pages annexes direct/maintenance/news-studio/404.
- **Audits passés** : Lighthouse mobile **98 / 100 / 100 / 100**, axe-core **0 violation**
  (7 pages × 2 thèmes), première vue ~150 Ko.
- **Tests** : **52 unitaires** (`npm test`) + **49 e2e** (`npm run test:e2e`), tous verts.
- **Validé sur appareils réels par le propriétaire** : Media Session (imagette du chat +
  titre à l'écran verrouillé iOS/iPadOS/Android), passage DIRECT via BUTT.
- **Préproduction publiée sur GitHub Pages** par le propriétaire (il gère seul Git/Pages).

## Ce qui reste

Côté propriétaire (rien ne le bloque côté code) :
- finir la checklist T1.4 (`docs/TEST-MATRIX.md`) : installation webapp, onglet caché long,
  mode avion, VoiceOver ; re-tester le rechargement pendant écoute + un DIRECT post-correctifs ;
- **observation ≥ 1 semaine** en préprod (traverser un redémarrage 04:10) ;
- **bascule** en production en suivant `docs/RELEASE-CHECKLIST.md` (copier le `CNAME` ce jour-là).

Améliorations (non bloquantes, voir `docs/BACKLOG.md`) :
- affinage DA (réserve du propriétaire : « peut-être un peu trop neutre ») — à faire ensemble
  sur le site fini ;
- og-image dédiée, JSON-LD RadioStation, touche espace play/pause, volume persistant, etc.
- **vision long terme** : mutualiser voix + grille en JSON (comme déjà fait pour les actualités)
  pour qu'une future app partage les contenus — schéma esquissé dans `docs/BACKLOG.md`.
  Le propriétaire développe un outil maison pour la grille. À cadrer **après** la bascule.

## Décisions / faits à ne pas réoublier

- **DA — VALIDÉE le 12/06/2026, palette dérivée du logo** (voir `assets/css/tokens.css`) :
  clair crème lumineux `#f4eee0` + cartes plus claires ; sombre nuit chaude `#14110d`
  (validé tel quel, « particulièrement réussi »). **Deux accents du logo** : azur `#0c84cc`
  (halo) en principal — liens, nav, kickers, « à l'antenne » ; braise `#b5371a` (ombres)
  réservée au DIRECT. **Monospace système pour les données radio**, police système sinon,
  zéro webfont. Réf : Phaune Radio. Écartés : NTS (surchargé), serif littéraire, or/cabaret,
  bleu SaaS plat, et le « noir/or/ivoire » du CDC § 18. Tous les couples texte/fond sont AA.
  Reste : application fine éventuelle (la DA de base est posée et validée).
- **Nom officiel** : « Le Pseudo**cu**mentaire de l'espace » (sans « do »). L'ancienne grille
  portait la coquille.
- **Compteur d'auditeurs** = info backoffice → uniquement sur `direct.html`, **jamais** sur la home.
- **DIRECT** : vérité = `current-show.json` (`is_live`/`kind=live`) ; indice complémentaire =
  préfixe `DIRECT - ` du nowplaying (convention BUTT), évalué sur champs bruts avant split.
- Pastille antenne : ne détecte pas l'arrêt de Liquidsoap si Nginx sert encore les JSON
  (non bloquant ; solution serveur « heartbeat » au backlog).

## Règles non négociables (revue bloquante)

URLs d'endpoints uniquement dans `assets/js/config.js` · pas de `split(',')` sur le CSV ·
pas d'offsets de fuseau manuels (Intl only) · jamais de fetch CSV périodique sur la home ·
jamais recréer l'élément `<audio>` pendant la navigation · jamais déduire le show de l'heure
quand `current-show.json` répond · pas d'autoplay · zéro dépendance runtime · aucun secret.

## Lancer en local

```bash
npm run serve        # http://localhost:48290 (serveur dev no-store)
npm test             # 52 tests unitaires (Node 20+, aucune dépendance)
npm run test:e2e     # 49 tests Playwright (desktop + mobile)
npm run build:news   # régénère news-data.js + news.json + feed.xml depuis content/news/*.md
```

## Pour reprendre

1. Lire ce fichier, puis `../LCN-plan-action-futur-site.md` (§ 8 = état des lots).
2. `npm test && npm run test:e2e` pour confirmer que tout est vert avant de toucher quoi que ce soit.
3. Comparer au besoin avec `../OLD-LCN-Website/` (référence comportementale, jamais modifiée).
