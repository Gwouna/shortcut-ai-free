# SHORTCUT AI — version 7.0

SHORTCUT AI est un outil généraliste de création de clips courts à partir de vidéos que l'utilisateur importe : podcasts, interviews, sport, gaming, vlogs, humour, tutoriels et autres contenus.

## Nouveautés V7.0
- Conserve l'analyse locale d'activité visuelle et d'intensité sonore de V6.0.
- Conserve la transcription Whisper Tiny en option dans le navigateur.
- Après l'analyse, les cinq meilleurs passages sont proposés.
- Nouveau bouton de génération en série : crée automatiquement un fichier vidéo vertical 9:16 pour chacun des passages proposés.
- Chaque clip est proposé dans une liste de téléchargements séparés, pour une meilleure compatibilité mobile.
- Export local via Canvas et MediaRecorder, sans serveur payant ni abonnement.
- Bouton de mise à jour et version 7.0.

## Utilisation
1. Importer le fichier vidéo original.
2. Choisir le profil de contenu et la durée souhaitée.
3. Lancer « Analyser et trouver les meilleurs moments ».
4. Cliquer sur « Créer automatiquement les meilleurs Shorts ».
5. Attendre la fin du traitement, puis télécharger les clips un par un.

## Limites importantes
- L'analyse locale classe des fenêtres à partir de signaux visuels (mouvement, changements d'image, détails, exposition) et de l'intensité audio. Elle ne comprend pas encore réellement le sens des scènes, ne détecte pas avec certitude les événements marquants et ne prédit pas la viralité.
- Whisper transcrit les paroles mais ne juge pas automatiquement si une phrase est drôle, importante ou virale.
- Le cadrage 9:16 est centré, sans suivi automatique du visage ou du sujet.
- L'export dépend des capacités du navigateur et de l'appareil. Sur iPhone, garder l'application ouverte pendant la création ; le traitement de plusieurs clips peut être lent.
- Les clips sont créés à partir d'un fichier vidéo importé. Le lecteur YouTube intégré sert uniquement à lire et repérer des timestamps : le lien YouTube seul ne permet pas d'extraire la vidéo ni de la monter. Pour analyser un contenu YouTube, importer un fichier source que l'utilisateur est autorisé à utiliser.
- Le modèle Whisper est téléchargé au premier usage (connexion Internet requise). Aucun serveur ni API payante n'est utilisé pour l'analyse et l'export des fichiers importés.

## Installation GitHub Pages
Remplacer à la racine du dépôt : `index.html`, `styles.css`, `app.js`, `README.md` et `version.json`, puis committer les changements. Le bouton « Mettre à jour » vérifie `version.json` et recharge si une version plus récente est publiée.
