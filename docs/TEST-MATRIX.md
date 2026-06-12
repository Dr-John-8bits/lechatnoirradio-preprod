# Matrice de tests — futur site Le Chat Noir

> Audits formels du 11/06/2026 : `AUDIT-A11Y-PERF.md` (Lighthouse 98/100/100/100, axe-core
> 0 violation sur les 7 pages/routes, budgets perf tenus, première vue ~150 Ko).
> Pistes d'amélioration : `BACKLOG.md`.

## État initial des endpoints (T0.2 — 11 juin 2026, machine de dev)

| Endpoint | HTTP | CORS `*` | `no-store` | Observations |
|---|---|---|---|---|
| `nowplaying.json` | 200 | ✓ | ✓ | `artist, title, album, year, ts` |
| `current-show.json` | 200 | ✓ | ✓ | `show, kind, is_live, since` |
| `listeners.json` | 200 | ✓ | ✓ | `mount, current, peak, server_listeners, updatedAt` |
| `history/nowplaying.csv` | 200 | ✓ | ✓ | 6,3 Mo / 48 548 lignes ; `Range` → 206 mais préflight CORS sans `Range` |
| `stream.mp3` | 200 | — | — | `audio/mpeg`, icy-br 192 |

Captures archivées dans `tests/unit/fixtures/`.

## Tests unitaires (T1.1)

- 11/06/2026 : **41/41 verts** (`npm test`) — csv (RFC 4180, fixtures réelles + corrompues),
  time (DST mars/octobre, heure ambiguë), radio-api (extracteurs, endcap, stale, erreurs),
  schedule-match (alias réels, doublons, since).

## Vérifications navigateur préproduction (T1.3 — preview locale)

- 11/06/2026 — Chromium (preview) :
  - Desktop clair : bandeau live alimenté par la production (show réel, ticker, badge), bloc
    « Aujourd'hui » avec show réel surligné, derniers passages heure de Paris. Zéro erreur console.
  - Mobile 375 px : lisible, nav repliée sur deux lignes, colonne album/année masquée.
  - Dark mode : variante encre chaude OK.
  - Route `#grille` : onglets jours + grille indicative OK, navigation sans rechargement.
  - **Bug trouvé et corrigé** : poller endormi définitivement si la page se charge onglet caché
    (retour visibilité testé de bout en bout après correction).

## Vérifications Lots 2–3 (11/06/2026 — preview locale Chromium)

- **DIRECT** : badge « direct — on air » validé par les deux chemins — `current-show.json`
  (`is_live`/`kind=live`) et convention BUTT `DIRECT - ` dans nowplaying (bug du portage trouvé
  et corrigé : l'indice est désormais évalué sur les champs bruts, avant le split artiste/titre).
- **Page historique** : 48 603 diffusions chargées et parsées en chunks sans blocage ; recherche
  « 13:03 le 13/05/2026 » → retombe exactement sur l'exemple documenté du doc d'architecture
  (`la souterraine — élématique`). Refresh 20 s sans re-téléchargement CSV (MAJ locale nowplaying).
- **Actualités** : 24 billets portés, filtre par année, permalien RSS `#actualites/<slug>` testé
  (article ciblé + surligné). Module + données (~50 Ko) en import dynamique : non chargés sur la home.
- **Voix / À propos / direct.html / maintenance.html / news-studio.html / 404** : rendus OK.
- Crawl : 11 URLs publiques → toutes 200. Zéro erreur console. 51/51 tests unitaires.
- Serveur de dev `no-store` (`npm run serve`) pour éviter les pièges de cache pendant les tests.

## Suite e2e Playwright (11/06/2026 — `npm run test:e2e`)

**41 tests × 2 viewports (desktop + Pixel 7), tous verts.** Endpoints entièrement mockés
(jamais de dépendance à la production). Couverture :

- bandeau live alimenté, badge DIRECT par les deux chemins (current-show + convention BUTT) ;
- navigation entre rubriques sans recréation de l'élément `<audio>` ;
- home : blocs obligatoires, zéro overflow horizontal, auditeurs sobres (masqués si 0) ;
- grille : ligne « en ce moment » pilotée par current-show ;
- historique : restitution Europe/Paris **vérifiée depuis un fuseau New York**, recherche par
  proximité de créneau, CSV à virgules/guillemets, panne CSV + relance ;
- pannes : tous endpoints 404 / JSON invalide / CSV vide → player toujours utilisable,
  zéro exception non capturée ;
- pages annexes (direct, maintenance, studio, 404), permalien RSS, SEO (canonical/OG/robots/feed).

Corrections issues de cette passe : régression grille (surlignage du show réel restaurée),
parsing CSV gelé en onglet d'arrière-plan (rAF/setTimeout bridés), animation de chargement.

## Media Session — affichage natif macOS / iOS / Android (11/06/2026)

Acquis critique de l'ancien site, vérifié à parité stricte :

- **Audit de portage** : 2 écarts trouvés et corrigés — artwork 180×180 (`apple-touch-icon.png`)
  manquant (replacé en tête de liste, c'est celui que privilégient macOS/iOS) ; champ `album`
  qui envoyait le nom du show au lieu de l'album réel du morceau (comportement ancien rétabli).
- **Vérification en lecture réelle** (Chromium preview, vrai flux de production) :
  `playbackState: playing`, titre/artiste/album du morceau réellement diffusé, 3 artworks
  (180 → apple-touch-icon, 192, 512), badge « à l'antenne · vous écoutez ».
- **Anti-scintillement** : la métadonnée native n'est recréée que si elle change
  (l'ancien site la recréait toutes les 12 s).
- **3 tests e2e permanents** (`media-session.spec.mjs`, flux silencieux simulé) : métadonnées +
  artworks après lecture, badge « vous écoutez », fallback identité radio si métadonnées en panne.

Reste à confirmer sur appareils réels (affichage à l'écran verrouillé) : voir checklist T1.4.

## Webapp installable (11/06/2026)

- Manifest porté (standalone, id/start_url/scope, icônes 180+192+512 dont maskable), lié sur
  index + history + direct. Balises `apple-mobile-web-app-*` restaurées (écart de portage trouvé
  grâce à la question du propriétaire), barre de statut passée de `black-translucent` à `default`
  (adaptée au thème clair papier). Vérifié en navigateur : manifest valide, 4 icônes en 200.
- Test e2e permanent (`pages.spec.mjs` : « webapp installable »).
- À confirmer sur appareils réels : ajout à l'écran d'accueil iOS/Android, Ajouter au Dock macOS
  (lignes ajoutées à la checklist T1.4 ci-dessous).

## Retours terrain T1.4 — validations du propriétaire (12/06/2026)

- ✅ **Lecture iOS / iPadOS / Android + écran verrouillé : imagette du chat + titre affichés** —
  l'acquis Media Session est confirmé sur appareils réels.
- ✅ **Passage DIRECT via BUTT : pastille « direct — on air »** (lisibilité sombre corrigée
  le jour même : fond vermillon profond + texte ivoire, 5,0:1).
- ⚠️ **Radio coupée : la pastille ne change pas** — comportement attendu : Nginx continue de
  servir les derniers JSON, le site n'a aucun signal fiable de mort de Liquidsoap.
  Jugé non bloquant par le propriétaire ; piste serveur consignée au BACKLOG (heartbeat).
- ✏️ **Correction de nommage** : le nom officiel de l'émission est
  « Le Pseudo**cu**mentaire de l'espace » — c'était la grille qui portait la coquille
  (« Pseudodocumentaire »), héritée de l'ancien site. Grille, page voix et alias corrigés ;
  l'ancienne graphie reste tolérée en entrée de rapprochement.

## Retours terrain T1.4 — première passe (12/06/2026, corrigés le jour même)

| Retour | Diagnostic | Correctif |
|---|---|---|
| Passage BUTT : métadonnées en avance sur le son (1×) | Tampons Icecast/navigateur — normal, documenté | `ARCHITECTURE-RADIO.md` § latence |
| Rechargement : son du morceau précédent | Le navigateur ressert son tampon | Connexion neuve à chaque lecture (cache-buster `player.js`) |
| 23h40 : doublon d'émission au lieu du créneau | Liquidsoap émet « Pseudo**cu**mentaire » (sans « do ») → alias manquant | Alias ajouté + test unitaire |
| Fin de journée : pas d'annonce de La Grande Nuit (minuit) | Le bloc « Aujourd'hui » s'arrêtait au dernier créneau du jour | Complément « demain — <jour> » avec les premiers créneaux du lendemain |
| Liens flux direct / RSS coupent l'écoute | Ouverture même onglet | `target="_blank"` partout |
| Compteur d'auditeurs dans le bandeau | Info backoffice (décision propriétaire) | Retiré de la home ; conservé sur `direct.html` |
| Titres longs tronqués (derniers passages, historique) | `ellipsis` | Passage à la ligne (`overflow-wrap`) |
| Page maintenance peu soignée | — | Refonte centrée, player accordé à la DA |
| Studio : champ « ordre » collé à la colonne droite | gouttière trop étroite | Gouttière 40 px |

## Campagne appareils réels (T1.4 — bloquante, à faire par le propriétaire)

| Test | iPhone Safari | iPad Safari | Android Chrome |
|---|---|---|---|
| Lancer le direct | ☐ | ☐ | ☐ |
| Pause / reprise | ☐ | ☐ | ☐ |
| Écran verrouillé : lecture continue | ☐ | ☐ | ☐ |
| Media Session (titre sur écran verrouillé) | ☐ | ☐ | ☐ |
| Mode avion puis reprise réseau | ☐ | ☐ | ☐ |
| Navigation hash sans coupure audio | ☐ | ☐ | ☐ |
| Onglet caché 10 min puis retour | ☐ | ☐ | ☐ |
| Largeur 360 px sans overflow | ☐ | ☐ | ☐ |
| Ajout à l'écran d'accueil : icône chat + nom « Le Chat Noir » | ☐ | ☐ | ☐ |
| Lancement depuis l'icône : plein écran, lecture OK | ☐ | ☐ | ☐ |

Procédure : `npm run serve` puis ouvrir `http://<ip-locale>:48290` depuis l'appareil (même réseau).
