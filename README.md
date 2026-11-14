# SHORTCUT AI — version gratuite, sans serveur

Cette version est une application web statique. Elle ne nécessite ni Render, ni serveur, ni clé API. Les fichiers vidéo restent dans le navigateur de l'utilisateur.

## Déploiement gratuit avec GitHub Pages
1. Ajouter `index.html`, `styles.css` et `app.js` à la racine du dépôt GitHub (au même niveau que `server.js`).
2. Dans le dépôt, ouvrir **Settings → Pages**.
3. Dans **Build and deployment**, choisir **Deploy from a branch**.
4. Choisir la branche `main` et le dossier `/(root)`, puis **Save**.
5. Attendre la publication et ouvrir l'URL GitHub Pages affichée.

## Limites honnêtes du prototype
- Le bouton de suggestion repère des changements visuels simples ; ce n'est pas une IA sémantique.
- L'export est réalisé par `MediaRecorder` dans le navigateur. Le format (MP4 ou WebM), l'audio et les performances dépendent du navigateur et de l'appareil.
- L'export recadre au centre en 9:16. Il n'y a pas encore de suivi automatique du visage ni de sous-titrage automatique.
- Les vidéos ne sont pas téléversées sur un serveur par cette application.

## Import YouTube
- L'application intègre le lecteur officiel YouTube pour lire une vidéo publique et repérer des temps de début/fin.
- Elle ne télécharge pas et n'extrait pas les vidéos YouTube.
- Pour exporter un clip, l'utilisateur doit importer le fichier vidéo original qu'il possède ou est autorisé à utiliser.
- La lecture intégrée dépend des réglages du créateur et de la disponibilité de la vidéo.
