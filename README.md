# SHORTCUT AI — V1.9

SHORTCUT AI est un outil généraliste de création de clips courts à partir de vidéos importées : podcasts, interviews, sport, gaming, vlogs, humour, tutoriels et autres contenus.

## Nouveautés V1.9
- Le classement peut intégrer la transcription Whisper, si elle a été lancée avant l'analyse.
- Les fenêtres sont évaluées à partir des signaux visuels, de l'intensité audio et d'indices linguistiques simples.
- Détection indicative des changements de plans à partir des différences entre images ; le nombre de coupures estimées apparaît dans les résultats.
- Recadrage vertical dynamique pour les vidéos paysage : le centre suit doucement la zone de mouvement dominante. Il s'agit d'un suivi visuel heuristique, pas d'une reconnaissance de personne ou de visage.
- Les cinq meilleurs passages restent proposés et peuvent être exportés en série au format vertical 9:16.
- Les vidéos importées sont traitées localement dans le navigateur.

## Utilisation conseillée
1. Importer le fichier vidéo original.
2. Choisir le profil et la durée des clips.
3. Pour enrichir le classement avec les paroles, cliquer sur « Transcrire avec l'IA » et attendre la fin.
4. Cliquer sur « Analyser et trouver les meilleurs moments ».
5. Vérifier les passages proposés, puis créer les Shorts et télécharger les fichiers.

## Limites importantes
- Les indices linguistiques sont heuristiques : ils ne constituent pas une compréhension complète du sens, de l'humour, de l'émotion ou du contexte.
- La détection de scènes repose sur les différences visuelles entre images et peut manquer ou confondre certaines coupures.
- Le recadrage dynamique suit des zones de mouvement ; il ne garantit pas de garder une personne précise dans le cadre. Les vidéos avec peu de mouvement restent cadrées près du centre.
- Whisper Tiny peut mal reconnaître certains mots, accents, noms propres ou langues.
- L'export dépend des capacités du navigateur et de l'appareil. Sur iPhone, garder l'application ouverte pendant la création ; le traitement de plusieurs clips peut être lent.
- Le lecteur YouTube intégré sert à lire et repérer des timestamps : le lien YouTube seul ne permet pas d'extraire la vidéo. Pour analyser et exporter un contenu, importer un fichier source que l'utilisateur est autorisé à utiliser.
- Le modèle Whisper est téléchargé au premier usage (connexion Internet requise). Aucun serveur ni API payante n'est utilisé pour l'analyse et l'export des fichiers importés.

## Installation GitHub Pages
Remplacer à la racine du dépôt : `index.html`, `styles.css`, `app.js`, `README.md` et `version.json`, puis committer les changements. Le bouton « Mettre à jour » vérifie `version.json` et recharge si une version plus récente est publiée.

## Numérotation des versions
La version publique affichée est V1.9. Le champ `version` de `version.json` conserve temporairement un numéro technique croissant (`8.1`) pour que les installations V1.9 déjà publiées détectent cette mise à jour. La prochaine version publique V1.9 utilisera le numéro technique `8.2`.
