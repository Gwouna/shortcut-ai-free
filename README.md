# SHORTCUT AI — version 4.0

La V4.0 améliore le classement local des passages vidéo. L’analyse combine plusieurs indices visuels : différences entre images, changements de plans, détails/contraste et exposition. L’utilisateur peut choisir une durée cible de 15, 30, 45 ou 60 secondes et obtenir jusqu’à cinq propositions.

## Installation GitHub Pages
Remplacer les quatre fichiers `index.html`, `styles.css`, `app.js` et `README.md` à la racine du dépôt, et ajouter le nouveau fichier `version.json` à la racine. Conserver le déploiement GitHub Pages actuel.

Le bouton « Mettre à jour » vérifie `version.json` sans cache. Si une version plus récente est publiée, il recharge l’application avec une URL actualisée pour forcer le navigateur à récupérer les nouveaux fichiers. GitHub Pages ne peut pas remplacer silencieusement les fichiers déjà affichés : après cette première installation, le bouton permet de vérifier et d’appliquer les versions futures. La toute première mise à jour doit être chargée une fois depuis Safari si l’icône de l’écran d’accueil conserve une ancienne page.

## Ce que fait réellement la V4.0
- Analyse les images localement dans le navigateur ; aucune vidéo n’est envoyée à un serveur.
- Classe les passages selon des signaux visuels, puis propose jusqu’à cinq fenêtres.
- Permet de choisir une durée cible et de reprendre un passage dans le découpage vertical existant.
- Conserve le lecteur YouTube intégré officiel : il sert à repérer des timestamps, pas à télécharger la vidéo.

## Limites
Cette V4.0 n’est pas encore une IA sémantique : elle ne transcrit pas les paroles, ne comprend pas les actions et ne prédit pas la viralité. Pour cela, il faudra ajouter une transcription audio et un modèle d’analyse du contenu, avec un choix technique entre un modèle exécuté sur l’appareil (lourd sur iPhone) ou un service/API avec backend et éventuels coûts.

L’export dépend des codecs et capacités du navigateur. Le recadrage reste centré (pas encore de suivi de visage).
