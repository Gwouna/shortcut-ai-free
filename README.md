# SHORTCUT AI — V2.0

SHORTCUT AI est un outil généraliste de création de clips courts à partir de vidéos importées : podcasts, interviews, sport, gaming, vlogs, humour, tutoriels et autres contenus.

## Nouveautés V2.0
- Nouvelle identité visuelle avec un symbole combinant la lettre S, un bouton lecture et une timeline vidéo.
- Nouveau bouton « Créer mes Shorts automatiquement » : transcription locale si disponible, analyse des images et du son, sélection des cinq passages et lancement de leur export.
- Sous-titres incrustés facultatifs (case à cocher) à partir de la transcription Whisper.
- Traitement local dans le navigateur, sans abonnement ni API payante.
- Export vertical 9:16 et prévisualisation/téléchargement de chaque clip.

## Utilisation
1. Importer un fichier vidéo que tu es autorisé à utiliser.
2. Choisir le profil, la durée des clips et activer/désactiver les sous-titres.
3. Cliquer sur « Créer mes Shorts automatiquement ».
4. Garder la page ouverte jusqu'à la fin, puis prévisualiser et télécharger les clips.

## Limites à connaître
- L'analyse combine des indices visuels, l'intensité sonore et des signaux linguistiques issus de Whisper. Ce n'est pas encore une compréhension humaine complète du contexte, de l'humour ou des émotions ; la sélection doit être vérifiée.
- Le modèle Whisper Tiny est téléchargé depuis un CDN au premier usage (environ 75 Mo) et mis en cache par le navigateur. Aucun coût d'API n'est requis.
- Le traitement dépend de la mémoire et des capacités du navigateur. Les longues vidéos peuvent être lentes ; la transcription est limitée à 15 minutes pour préserver la mémoire de l'appareil.
- L'export utilise MediaRecorder et peut produire du WebM selon le navigateur, pas nécessairement du MP4.
- Le lecteur YouTube intégré sert à lire et repérer des timestamps. Un lien YouTube seul ne permet pas d'extraire la vidéo ; importer le fichier source que tu es autorisé à utiliser pour analyser et exporter.

## Mise à jour GitHub Pages
Remplacer à la racine du dépôt : `index.html`, `styles.css`, `app.js`, `README.md`, `version.json` et ajouter `shortcut-logo.png`, puis committer les changements. Le bouton « Mettre à jour » vérifie `version.json`.

Version technique : 9.0. Version affichée : V2.0.
