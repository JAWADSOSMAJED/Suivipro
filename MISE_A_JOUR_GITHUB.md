# Mise à jour du site GitHub Pages — dépôt `chantierpro`

## Situation

Deux dépôts existent :

- `JAWADSOSMAJED/sitemaster2027` : contient seulement `index.html`, les documents
  et les fichiers racine. Le CSS et les scripts sont absents → le site est cassé.
- **`JAWADSOSMAJED/chantierpro`** : contient uniquement `site-a-publier.zip`
  (le zip préparé depuis `C:\GestionChantierWeb`), et les Pages sont activées.
  Sans `index.html` à la racine, <https://jawadsosmajed.github.io/chantierpro/>
  répond 404.

L’objectif est donc de **déployer le contenu du zip à la racine du dépôt
`chantierpro`**. Les fichiers racine du zip sont identiques à ceux de
`sitemaster2027` ; il faut surtout ajouter `assets/` et `js/`.

## Contenu à publier

```
assets/icon.svg
assets/logo.jpg
assets/styles.css
js/core.js, db.js, security.js, list.js, docs-print.js,
   views-main.js, views-planning.js, views-business.js,
   views-devis.js, views-st.js, views-qualite.js, boot.js
index.html
manifest.webmanifest
netlify.toml
Ouvrir le site.bat
README.md, PUBLIER.md, _worker.js, .nojekyll, _redirects
```

## Publier

### Méthode 1 — script sans Git (recommandée ici)

1. Créer un **Personal Access Token** GitHub :
   <https://github.com/settings/tokens> → *Generate new token (classic)* →
   cocher **repo → contents:write** (ou un *fine-grained token* avec
   *Contents: write* sur `chantierpro`). Copier le token.
2. Dans `C:\GestionChantierWeb`, lancer :

   ```bat
   python publier_site.py
   ```

3. Coller le token quand il est demandé. Le script lit l’arbre du dépôt,
   compare les empreintes Git, et envoie uniquement les fichiers absents ou
   modifiés. Le token n’est jamais affiché ni enregistré.

   Pour cibler l’autre dépôt : `python publier_site.py JAWADSOSMAJED/sitemaster2027`.

### Méthode 2 — depuis le zip déjà uploadé

1. Sur <https://github.com/JAWADSOSMAJED/chantierpro>, télécharger
   `site-a-publier.zip` puis le dézipper.
2. Supprimer le zip du dépôt (optionnel).
3. Uploader **tous les fichiers dézippés à la racine** via *Add file → Upload files*
   (GitHub recrée les dossiers `assets` et `js`).
4. Commiter avec un message du type « Déploiement du site ChantierPro ».

## Vérification après publication

Attendre 1 à 2 minutes, puis ouvrir <https://jawadsosmajed.github.io/chantierpro/>
et faire `Ctrl+F5`. Ces adresses doivent répondre 200 :

- `https://jawadsosmajed.github.io/chantierpro/assets/styles.css`
- `https://jawadsosmajed.github.io/chantierpro/js/core.js`
- `https://jawadsosmajed.github.io/chantierpro/js/boot.js`

Le tableau de bord et la navigation doivent alors s’afficher. Les données
restent dans le navigateur (localStorage) : aucun risque de perte.
