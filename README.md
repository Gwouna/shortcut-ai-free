# SHORTCUT AI — version 8.0

SHORTCUT AI est un outil généraliste de création de clips courts à partir de vidéos importées : podcasts, interviews, sport, gaming, vlogs, humour, tutoriels et autres contenus.

## Nouveautés V8.0
- Le classement peut désormais intégrer la transcription Whisper, si elle a été lancée avant l'analyse.
- Les fenêtres sont évaluées à partir des signaux visuels, de l'intensité audio et d'indices linguistiques simples (expressions de réaction, ponctuation expressive, densité de parole).
- Le profil Podcast / interview donne davantage de poids aux indices de transcription ; le profil Humour / réactions leur donne également un poids renforcé.
- Les cinq meilleurs passages sont toujours proposés et peuvent être exportés en série au format vertical 9:16.
- Le traitement des vidéos importées reste local dans le navigateur.

## Utilisation conseillée
1. Importer le fichier vidéo original.
2. Choisir le profil et la durée des clips.
3. Pour enrichir le classement avec les paroles : cliquer sur « Transcrire avec l'IA » et attendre la fin.
4. Cliquer sur « Analyser et trouver les meilleurs moments ».
5. Vérifier les passages proposés, puis créer les Shorts et télécharger les fichiers.

## Limites importantes
- Les indices linguistiques sont heuristiques : ils ne constituent pas une compréhension complète du sens, de l'humour, de l'émotion ou du contexte. Une phrase contenant un mot expressif n'est pas nécessairement un bon clip.
- Sans transcription préalable, le classement repose sur les signaux visuels et audio, comme en V7.0.
- Whisper Tiny peut mal reconnaître certains mots, accents, noms propres ou langues ; la qualité du classement dépend de la transcription.
- Le cadrage 9:16 est centré, sans suivi automatique du visage ou du sujet.
- L'export dépend des capacités du navigateur et de l'appareil. Sur iPhone, garder l'application ouverte pendant la création ; le traitement de plusieurs clips peut être lent.
- Le lecteur YouTube intégré sert à lire et repérer des timestamps : le lien YouTube seul ne permet pas d'extraire la vidéo. Pour analyser et exporter un contenu, importer un fichier source que l'utilisateur est autorisé à utiliser.
- Le modèle Whisper est téléchargé au premier usage (connexion Internet requise). Aucun serveur ni API payante n'est utilisé pour l'analyse et l'export des fichiers importés.

## Installation GitHub Pages
Remplacer à la racine du dépôt : `index.html`, `styles.css`, `app.js`, `README.md` et `version.json`, puis committer les changements. Le bouton « Mettre à jour » vérifie `version.json` et recharge si une version plus récente est publiée.
