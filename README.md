# Jour liturgique

Application web gratuite (PWA) qui affiche le jour du calendrier liturgique catholique :
nom du jour, temps, couleur, degré de la célébration et année des lectures.
Elle s'installe sur Android et iPhone depuis le navigateur, sans store, et fonctionne hors connexion.

Tout est calculé à partir de la date de Pâques : l'application reste juste d'année en année
sans mise à jour.

## Contenu
- Rite romain, usages de la France (Épiphanie le dimanche, Ascension le jeudi, Saint-Sacrement le dimanche).
- Dimanches, temps liturgiques, féries, solennités et fêtes du calendrier romain général,
  avec les règles de préséance et de report.
- Pas de mémoires des saints ni de fêtes propres aux diocèses ou paroisses.
  En cas de doute, l'Ordo du diocèse fait foi.

## Fichiers
- `liturgie.js` : le calcul du calendrier
- `explications.js` : les brèves explications des fêtes et les liens « En savoir plus »
  (Église catholique en France, Nominis, Vatican News, AELF)
- `app.js` : l'affichage et l'export agenda (.ics)
- `sw.js` : le mode hors ligne
- `manifest.webmanifest` et `icons/` : l'installation sur l'écran d'accueil

## Mise en ligne avec GitHub Pages
1. Créer un dépôt public sur GitHub, par exemple `jour-liturgique`.
2. **Add file › Upload files** : déposer tout le contenu de ce dossier (avec le dossier `icons`).
3. **Settings › Pages** : Source « Deploy from a branch », branche `main`, dossier `/ (root)`.
4. L'application est en ligne quelques minutes plus tard à l'adresse
   `https://<nom-utilisateur>.github.io/jour-liturgique/`.

Après une modification, changer `VERSION` dans `sw.js` pour que les téléphones
reçoivent la nouvelle version.
