# SHORTCUT AI — version 5.0

La V5.0 ajoute un mode Gaming pour classer les passages de gameplay. Le classement combine des signaux visuels (mouvement, changements d’image, détails) et l’intensité sonore calculée localement. Les profils modifient la pondération pour gameplay/action, réactions, combat/poursuites ou narration.

Une transcription vocale optionnelle utilise Whisper Tiny via Transformers.js dans le navigateur. Le modèle est téléchargé à la première utilisation (environ 75 Mo selon les fichiers servis) puis mis en cache par le navigateur. Le fichier vidéo et l’audio ne sont pas envoyés à un serveur par l’application. La transcription est limitée à 15 minutes par fichier pour limiter la mémoire consommée.

## Installation GitHub Pages
Remplacer à la racine du dépôt : `index.html`, `styles.css`, `app.js`, `README.md` et `version.json`. Puis publier/committer les modifications. Le bouton « Mettre à jour » vérifie `version.json` et recharge si une version plus récente est publiée.

## Ce que fait réellement la V5.0
- Analyse locale des images et de l’intensité audio pour proposer jusqu’à cinq fenêtres de clips.
- Profils de classement Gaming : gameplay GTA/action, réactions, combat/poursuites/explosions, cinématiques/narration.
- Transcription optionnelle de la parole avec Whisper Tiny dans le navigateur, avec segments horodatés sélectionnables.
- Découpage et export vertical 9:16 conservés.

## Limites importantes
L’intensité sonore n’identifie pas à elle seule une explosion, un tir ou un cri. Whisper transcrit la parole mais ne comprend pas automatiquement le contexte du jeu et ne détecte pas toutes les actions. Les résultats dépendent du navigateur, du processeur, de la mémoire et de la qualité audio. Le modèle IA nécessite une connexion Internet au premier téléchargement. Le recadrage vidéo reste centré, sans suivi automatique du personnage. Le lecteur YouTube intégré ne télécharge pas les vidéos.
