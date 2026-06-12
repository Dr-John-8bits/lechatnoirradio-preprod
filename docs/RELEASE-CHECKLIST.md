# Checklist de release — bascule en production

Le jour J est un déroulé, pas une improvisation. Conditions d'entrée, étapes, vérifications,
rollback. La bascule GitHub est exécutée par le propriétaire du projet.

## Conditions d'entrée (toutes obligatoires)

- [ ] Checklist appareils réels T1.4 entièrement cochée (`TEST-MATRIX.md`)
- [ ] Observation ≥ 1 semaine en préproduction, incluant :
  - [ ] un redémarrage Liquidsoap de 04:10 traversé sans incident côté site
  - [ ] un passage DIRECT réel via BUTT **postérieur aux correctifs du 12/06**
- [ ] `npm test` et `npm run test:e2e` verts sur l'état exact qui part en production
- [ ] Aucun `TODO`/contenu provisoire dans les pages publiques
- [ ] Inventaire des URLs publiques de l'ancien site couvert (plan § 2.2)

## Préparation (la veille ou avant)

- [ ] **Gel de l'ancien site** : tag git (ou archive zip datée) de l'état exactement servi
      en production = artefact de rollback. Noter son emplacement ici : ____________
- [ ] Relire `docs/ARCHITECTURE-RADIO.md` (rien côté serveur ne doit changer ce jour-là)
- [ ] Vérifier les endpoints production (commandes dans `MAINTENANCE.md`) : tous 200
- [ ] `npm run build:news` exécuté si des actualités ont été ajoutées récemment

## Bascule (propriétaire, via GitHub)

1. [ ] Copier le **fichier `CNAME`** (`lechatnoirradio.fr`) de l'ancien dépôt vers le nouveau
       — c'est la seule différence entre préprod et prod côté fichiers
2. [ ] Pousser l'état final sur le dépôt de production (branche servie par GitHub Pages)
3. [ ] Vérifier dans Settings → Pages que le domaine custom est bien rattaché et que
       « Enforce HTTPS » est coché
4. [ ] Attendre la fin du déploiement Pages (~1–2 min)

## Vérifications post-déploiement (sous 30 minutes)

Sur `https://lechatnoirradio.fr` :

- [ ] Accueil : player visible, lecture du direct **sur un mobile réel**
- [ ] Bandeau : show courant + ticker alimentés (les 4 vérités serveur s'affichent)
- [ ] `history.html` : archives chargées, une recherche date+heure fonctionne
- [ ] Routes `#actualites` (avec un permalien d'ancien billet), `#grille`, `#voix`, `#apropos`
- [ ] `feed.xml` accessible et valide ; `direct.html`, `maintenance.html`, `404`
- [ ] Écran verrouillé mobile : chat + titre (Media Session)
- [ ] HTTPS sans avertissement ; `manifest.webmanifest` chargé (installation webapp possible)
- [ ] Aucune erreur console sur l'accueil

## Surveillance

- [ ] **J+1** : re-vérifier après le redémarrage Liquidsoap de 04:10
- [ ] **J+7** : premier DIRECT réel post-bascule observé correct
- [ ] Garder l'artefact de rollback au moins 1 mois

## Rollback (< 15 minutes, zéro intervention serveur)

Déclencheurs : direct illisible sur un appareil de la matrice ; métadonnées absentes > 1 h
sans cause serveur identifiée ; page critique cassée.

1. Re-pousser l'artefact de gel (tag/archive de l'ancien site) sur la branche servie
2. Vérifier le re-déploiement Pages + lecture mobile
3. Consigner la cause dans `TEST-MATRIX.md` avant toute nouvelle tentative
