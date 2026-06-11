# Audit accessibilité & performance — 11 juin 2026

Réalisé en préproduction locale (serveur dev no-store, endpoints de production).
Correctifs appliqués le jour même ; les chiffres ci-dessous sont **post-correctifs**.

## Lighthouse (mobile, page d'accueil)

| Catégorie | Score |
|---|---:|
| Performance | **98** |
| Accessibilité | **100** |
| Bonnes pratiques | **100** |
| SEO | **100** |

Métriques : LCP 2,1 s · TBT 0 ms · CLS 0,037 · FCP 1,7 s.

Note bfcache : le cache retour/avant est bloqué (1) par le `no-store` du serveur de dev —
artefact local, absent sur GitHub Pages — et (2) par le `no-store` des endpoints radio,
**choix assumé** du doc d'architecture (données live jamais mises en cache). Sans incidence :
les pollers se resynchronisent au retour de visibilité.

## axe-core 4.10 (WCAG 2.1 A + AA)

| Page / route | Violations |
|---|---|
| Accueil (clair) | 0 |
| Accueil (sombre) | 0 |
| Grille (avec show réel surligné) | 0 |
| Actualités | 0 |
| Voix | 0 |
| À propos | 0 |
| history.html (48 605 lignes chargées) | 0 |

## Contrastes — correctifs appliqués (calcul WCAG)

| Token (thème clair) | Avant | Après | Ratio obtenu |
|---|---|---|---|
| `--muted` (texte secondaire, nav) | `#7c7361` (4,05:1 ✗) | `#6d644f` | 5,06:1 sur surface ✓ |
| `--warn` (états d'erreur) | `#9a6a10` (3,73:1 ✗) | `#8a5e0c` | 4,92:1 ✓ |
| Badges pleins (texte clair sur vermillon) | `--accent` (3,71:1 ✗) | nouveau token `--accent-fill #c23a13` | 4,64:1 ✓ |
| Description du créneau surligné | `--muted` sur fond teinté (4,15:1 ✗) | `--ink-soft` | ≥7:1 ✓ |

Le thème sombre passait déjà intégralement (muted 5,0:1, badges 5,06:1, warn 7,8:1).
L'accent vif `#d8491f` est conservé pour les usages non textuels (points, filets, soulignés —
seuil 3:1 ✓).

## Performance — poids réels de la première vue (accueil)

| Poste | Mesuré | Budget CDC § 21 |
|---|---:|---:|
| HTML | 8 Ko | < 60 Ko ✓ |
| CSS | 17,5 Ko | < 80 Ko ✓ |
| JS initial (actualités exclues : import dynamique) | ~90 Ko | < 150 Ko ✓ |
| Logo | **40,5 Ko** (était 404 Ko — réduit ×10) | < 250 Ko ✓ |
| Première vue totale hors flux | **~150 Ko** (était ~500 Ko) | < 1 Mo ✓ |

Optimisation appliquée : `logo.png` 1080×1080 (404 Ko) affiché en 40 px → dérivé
`logo-320.jpg` (40,5 Ko) sur toutes les pages ; l'original reste dans le dépôt pour
les usages futurs (og-image…). Le CSV (6,3 Mo) reste différé et unique, jamais périodique.

## Clavier et lecteurs d'écran

- Onglets jours/années : pattern ARIA tablist complet (rôles, `aria-selected`, tabindex
  tournant, flèches/Home/End) — porté de l'ancien site qui l'avait, restauré dans le nouveau.
- Player utilisable au clavier (bouton nommé, états `aria-pressed`), volume avec label.
- Zones `aria-live` ciblées (ticker), écriture DOM seulement au changement.
- `prefers-reduced-motion` : ticker, pulsation du point antenne et points de chargement figés.
- À re-vérifier sur appareils réels : VoiceOver iOS/macOS (checklist T1.4).
