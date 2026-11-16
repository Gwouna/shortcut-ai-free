# SHORTCUT AI — version 6.0

SHORTCUT AI est un outil généraliste de création de clips courts à partir de vidéos importées : podcasts, interviews, sport, gaming, vlogs, humour, tutoriels et autres contenus. GTA n’est qu’un exemple de vidéo possible, pas une spécialisation de l’application.

## Fonctionnalités V6.0
- Analyse locale des images : activité/mouvement, changements d’image, détails et exposition.
- Analyse locale de l’intensité sonore pour pondérer les passages proposés.
- Profils de classement généralistes : automatique, discussion/podcast, action/sport/gaming, narration/vlog/tutoriel, humour/réactions.
- Transcription optionnelle des paroles avec Whisper Tiny dans le navigateur, avec segments horodatés sélectionnables. Le modèle est téléchargé au premier lancement (environ 75 Mo selon les fichiers servis).
- Jusqu’à cinq fenêtres de clips proposées, puis sélection, prévisualisation et export vertical 9:16.
- Lecteur YouTube intégré pour repérer des timestamps ; il ne télécharge pas les vidéos.

## Installation GitHub Pages
Remplacer à la racine du dépôt : `index.html`, `styles.css`, `app.js`, `README.md` et `version.json`, puis committer les changements. Le bouton « Mettre à jour » vérifie `version.json` et recharge si une version plus récente est publiée.

## Limites honnêtes
L’analyse visuelle et sonore détecte des signaux pouvant correspondre à des passages intéressants, mais ne comprend pas encore le sens des scènes, ne reconnaît pas de façon fiable les actions ou émotions et ne prédit pas la viralité. Whisper transcrit la parole, mais ne juge pas automatiquement si une phrase est drôle ou importante. Les performances dépendent du navigateur, du processeur et de la mémoire. Le recadrage vertical reste centré, sans suivi automatique des visages/personnages. L’export dépend des capacités du navigateur. Le fichier vidéo est traité localement par l’application ; le téléchargement initial du modèle Whisper nécessite Internet.
