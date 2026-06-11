# Maintenance du site — Le Chat Noir

## Ajouter une actualité

Deux chemins, au choix :

**A. Studio (dans le navigateur)** — ouvrir `news-studio.html`, rédiger, puis
« Télécharger le fichier » et déposer le `.md` dans `content/news/`.

**B. Ligne de commande** :

```bash
npm run news:new -- --title "Titre de l'actualité"
# édite le fichier créé dans content/news/
```

Puis, dans les deux cas :

```bash
npm run build:news   # régénère news-data.js, news.json et feed.xml
```

et committer le tout (source `.md` + fichiers générés).

Règles : un paragraphe de chapeau, puis le corps ; Markdown simple (liens `[texte](url)`) ;
front matter `title` / `publishedOn` (AAAA-MM-JJ) / `order` (départage d'un même jour).

## Modifier la grille des programmes

Tout vit dans `assets/js/content-data.js` → `SCHEDULE_TIMELINE_DAYS`. Chaque jour a des
`slots` : `time` (« 18h00 » ou « Puis »), `title`, `desc`, options `highlight` / `badge`.

⚠️ Si un nom d'émission côté antenne (Liquidsoap) diffère du titre affiché dans la grille,
ajouter l'alias dans `assets/js/schedule-match.js` → `SHOW_NAME_ALIASES` (en minuscules,
sans accents ni ponctuation), sinon le surlignage « show en cours » ne fonctionnera pas.

## Voix et formats

`assets/js/content-data.js` → `PRODUCERS` (les voix) et `SHOWS` (émissions/formats).
Images dans `assets/media/producers/` et `assets/media/shows/` (webp recommandé).

## Vérifier les endpoints radio

```bash
curl -sS https://stream.lechatnoirradio.fr/nowplaying.json
curl -sS https://stream.lechatnoirradio.fr/current-show.json
curl -sS https://stream.lechatnoirradio.fr/listeners.json
curl -I  https://stream.lechatnoirradio.fr/history/nowplaying.csv
curl -L --max-time 10 -o /dev/null -w '%{http_code}\n' https://stream.lechatnoirradio.fr/stream.mp3
```

## Tester en local

```bash
npm run serve    # http://localhost:48290 (no-store : pas de cache pendant le dev)
npm test         # tests unitaires (Node 20+, aucune dépendance)
```

Pour tester depuis un téléphone : même réseau Wi-Fi, `http://<ip-du-mac>:48290`
(`ipconfig getifaddr en0` donne l'IP).

## Interdits permanents

Voir README — notamment : URLs d'endpoints uniquement dans `config.js`, jamais de fetch CSV
périodique sur la home, jamais déduire le show courant de l'heure quand `current-show.json`
répond, aucun secret dans le dépôt.
