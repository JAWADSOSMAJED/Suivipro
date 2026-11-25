# Publier JawadProjet sur Internet

> ## SITE EN LIGNE (deploiement anonyme Netlify)
>
> - Adresse : <https://aesthetic-bombolone-1e2d01.netlify.app>
> - Mot de passe provisoire : `My-Drop-Site`
> - Deploye le 16/11/2026 a 13:30 UTC - `site_id` `59f1128c-f570-4eb8-97c3-1f2a4fbf813b`
> - **Site hors ligne** : l'adresse ci-dessus renvoie une erreur **503** (deploiement anonyme
>   supprime). Le ZIP du Bureau est en **1.4.7** : connexion par nom d'utilisateur et mot de
>   passe, impression sur tous les onglets, sous-onglets *Stock & fournitures* par famille de
>   materiaux, **bon de livraison et date de livraison** sur chaque article et chaque entree de stock, fiche chantier
>   avec tranche, GH, nombre d'immeubles, type d'immeuble, appartements et magasins, rapport
>   recapitulatif des essais beton, remise a zero des donnees saisies, suppression des derniers mouvements du tableau de bord, planning separe par tranche, raison sociale SOSMAJED (Lot N°31, Lotissement Kamilia, 20000 Casablanca, contact@sosmajed.com). Republier sur un nouveau projet (Cloudflare Pages
>   conseille, voir Option 1).
> - **A reclamer avant 14:30 UTC (15:30 heure locale)**, sinon Netlify supprime le site.
> - Lien de reclamation (usage unique) :
>   <https://app.netlify.com/drop/aesthetic-bombolone-1e2d01#drop_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3OTQ4MzU4MDAsImV4cCI6MTc5NDgzOTQwMCwiaXNzIjoiTmV0bGlmeSIsInNlc3Npb25faWQiOiI3MjRlMGQ3ZS0zZjZmLTQ2YmYtYmFkNS1hYmE1NTA3MjVhMmUifQ.DzrJPMblMDH49ZonjLYjt_Vbar2JuHlhIclki4l3fUA>
> - Commande equivalente : `netlify claim --site 59f1128c-f570-4eb8-97c3-1f2a4fbf813b --token <jeton du lien>`
>
> Apres reclamation (compte Netlify gratuit) :
> 1. Le site reste a la **meme adresse**, donc les donnees `localStorage` deja saisies sont conservees.
> 2. La protection par mot de passe provisoire est retiree ; la protection durable par mot de passe
>    est une option payante chez Netlify. Pour un mot de passe **gratuit et permanent**, utiliser
>    Cloudflare Pages avec le fichier `_worker.js` (option 1 ci-dessous).
> 3. Mises a jour : se connecter, puis glisser le dossier `GestionChantierWeb` sur
>    <https://app.netlify.com/drop>, ou **Deploys > Drag and drop** dans le projet.
>
> Le deploiement a ete fait sans compte via l'API Netlify Drop (`/drop/token`, `/drop`,
> televersement des fichiers puis verification de l'etat `ready`). Script reutilisable :
> `C:\Users\SOSMAJED\AppData\Local\Temp\opencode\deploy_netlify.py`.


JawadProjet est un site **100 % statique** (HTML/CSS/JS) : aucun serveur, aucune base de
données, aucune installation. N'importe quel hébergement de fichiers statiques fonctionne.

> **À lire avant de publier**
> Les données (chantiers, devis, stock…) sont enregistrées dans le **navigateur de chaque
> utilisateur** (`localStorage`). Publier le site ne partage donc **pas** les données entre
> les personnes : chacun a ses propres données sur son appareil. Pour un travail à plusieurs
> sur les mêmes données, il faut une sauvegarde JSON commune (export/import) ou faire évoluer
> l'application vers un stockage partagé (Supabase, Firebase, serveur…).

---

## Option 1 — Cloudflare Pages (gratuit, sans carte bancaire)

C'est l'option gratuite la plus fiable pour un site statique : trafic illimité, HTTPS automatique,
aucune carte bancaire demandée.

1. Créez un compte gratuit sur <https://dash.cloudflare.com/sign-up>.
2. Menu **Workers & Pages** → **Create application** → onglet **Pages** →
   **Upload assets** (envoi direct, sans GitHub).
3. Donnez un nom au projet (ex. `chantierpro`) → **Create project**.
4. Glissez le **dossier** `GestionChantierWeb` (ou le `.zip`
   `JawadProjet-site-web.zip` du Bureau) dans la zone d'envoi.
5. Cliquez sur **Deploy site**.
6. Le site est en ligne sur `https://chantierpro.pages.dev` (le nom choisi).

Mise à jour : **Create new deployment** dans le même projet, renvoyez les fichiers.
L'adresse ne change pas, donc **les données déjà saisies sont conservées**.

## Option 2 — GitHub Pages (gratuit, sans limite de trafic)

1. Créez un compte gratuit sur <https://github.com>.
2. Cliquez sur **+** en haut à droite → **New repository**.
   Nom : `chantierpro` · visibilité **Public** → **Create repository**.
3. Sur la page du dépôt : **Add file → Upload files**.
4. Ouvrez le dossier `GestionChantierWeb` et glissez **tout son contenu**
   (`index.html`, `assets`, `js`, `README.md`, `.nojekyll`, …) dans la page.
   > Ne glissez pas le dossier `GestionChantierWeb` lui-même : `index.html` doit être
   > **à la racine** du dépôt.
5. Cliquez sur **Commit changes**.
6. **Settings → Pages** : *Source* = **Deploy from a branch**,
   *Branch* = **main**, dossier **/ (root)** → **Save**.
7. Attendez 1 à 2 minutes, puis ouvrez :
   `https://votre-compte.github.io/chantierpro/`

Le fichier `.nojekyll` fourni évite que GitHub transforme le site. Mise à jour :
**Add file → Upload files** sur les mêmes noms de fichiers.

## Option 3 — Netlify Drop (gratuit)

1. Utilisez le fichier `JawadProjet-site-web.zip` fourni sur le Bureau.
2. Ouvrez <https://app.netlify.com/drop> et glissez le `.zip` (pas le dossier parent).
3. Vous obtenez une adresse du type `https://mon-chantier.netlify.app`.

**Si le site ne s'affiche pas :** ouvrez directement `https://votre-site.netlify.app/index.html`.
- Si cette page fonctionne → le fichier n'était pas à la racine : renvoyez le `.zip` fourni
  (il contient `index.html` à la racine et un fichier `_redirects`).
- Si elle affiche 404 → l'envoi n'a pas abouti ; vérifiez l'onglet **Deploys**
  (statut **Published**) et renvoyez les fichiers.

## Option 4 — Hébergement classique (OVH, Ionos, cPanel, FTP…)

1. Connectez-vous à votre espace d'hébergement (FTP, File Manager ou cPanel).
2. Envoyez tout le contenu du dossier dans `public_html` (ou `www`).
3. Ouvrez votre nom de domaine : `https://votre-domaine.fr`.

Aucune configuration PHP/MySQL n'est nécessaire.

## Option 5 — Réseau local (bureau / chantier, sans Internet)

Sur le PC qui héberge le site, double-cliquez sur **`Ouvrir le site.bat`**.
Il démarre un petit serveur local et affiche l'adresse (ex. `http://192.168.1.20:8765`).
Les autres appareils du même Wi-Fi ouvrent cette adresse dans leur navigateur.

Avantage : gratuit et immédiat. Limite : le PC doit rester allumé et les données restent
propres à chaque navigateur.

## Utiliser le site sur téléphone

Le site est **responsive** : il s'adapte aux téléphones et tablettes sans réglage
particulier. Une fois publié en HTTPS, il peut être ajouté à l'écran d'accueil :

- **iPhone / iPad (Safari)** : bouton *Partager* → *Sur l'écran d'accueil*.
- **Android (Chrome)** : menu *⋮* → *Installer l'application* (ou *Ajouter à l'écran
  d'accueil*).

Il s'ouvre alors en plein écran, comme une application. Le fichier
`manifest.webmanifest` et l'icône `assets/icon.svg` fournissent le nom, la couleur et
l'icône. Les données restent stockées dans le navigateur du téléphone : pour les
transférer vers un autre appareil, utilisez *Paramètres → Exporter une sauvegarde JSON*
puis *Importer* sur le second appareil.

> En réseau local (Option 5), l'adresse `http://192.168.x.x:8765` fonctionne sur le
> téléphone connecté au même Wi-Fi. L'installation sur l'écran d'accueil est toutefois
> réservée aux adresses **HTTPS**.

---

## Protéger le site par un nom d'utilisateur et un mot de passe

### Verrouillage intégré (gratuit, immédiat)

Dans l'application : **Paramètres → Protection par nom d'utilisateur et mot de passe**.
Saisissez un nom d'utilisateur (3 caractères minimum, sans espace) et un mot de passe
(4 caractères minimum), confirmez, puis **Activer le verrouillage**. Un écran de
connexion sera demandé à chaque nouvelle ouverture du site sur ce navigateur.

L'option **« Demander le mot de passe à chaque modification »** est activée par défaut :
une confirmation est demandée avant chaque enregistrement, suppression, duplication,
validation, import, réinitialisation ou changement de paramètres. Le formulaire en cours
reste ouvert pendant la confirmation et les données ne sont modifiées qu'après validation
du mot de passe. Décochez l'option si vous préférez ne protéger que l'ouverture du site.

- Empreinte SHA-256 salée : le mot de passe n'est jamais stocké en clair.
- Le nom d'utilisateur est mémorisé dans le navigateur ; il n'est pas secret.
- Les identifiants ne sont pas inclus dans les sauvegardes JSON exportées.
- Boutons disponibles : *Verrouiller maintenant*, *Mettre à jour les identifiants*,
  *Désactiver le verrouillage*.
- En cas d'oubli : les données locales du navigateur ne sont plus accessibles.

**Limite** : ce verrouillage protège l'interface, pas les fichiers ni le stockage du
navigateur. Une personne technicienne peut contourner un contrôle exécuté dans le
navigateur. Pour une vraie protection à distance, utilisez la solution de l'hébergeur.

### Protection réelle chez l'hébergeur

| Hébergeur | Solution | Coût |
|---|---|---|
| **Cloudflare Pages** | fichier `_worker.js` fourni + variables `SITE_USER` et `SITE_PASSWORD` (Basic Auth, sans domaine) | gratuit |
| **Cloudflare Pages** | **Cloudflare Access** (code par e-mail, Google, etc.) sur un domaine personnalisé | gratuit jusqu'à 50 utilisateurs |
| **Netlify** | *Password protection* / *Visitor access control* | offre Pro payante |
| **GitHub Pages** | pas de protection native : placez le site derrière Cloudflare Access, ou utilisez un hébergement avec authentification | gratuit via Cloudflare |
| **Serveur classique** | `.htaccess` + Basic Auth ou protection du dossier dans cPanel | inclus |

#### Cloudflare Pages : identifiant et mot de passe pour tout le site (gratuit, sans domaine)

Le projet contient un fichier **`_worker.js`** qui ajoute une demande d'identifiant et de
mot de passe (*Basic Auth*) à **tout le site**, pour tous les visiteurs, y compris sur
l'adresse `*.pages.dev`. Il ne s'active que si vous définissez la variable
`SITE_PASSWORD`.

1. Publiez d'abord le site sur Cloudflare Pages (Option 1 ci-dessus) : `_worker.js` doit
   se trouver **à la racine** du projet, à côté de `index.html` (c'est le cas dans le
   `.zip` fourni).
2. Dans le tableau de bord Cloudflare : **Workers & Pages** → votre projet →
   **Settings** → **Environment variables** → **Add variable**.
3. Nom : `SITE_PASSWORD` — Valeur : le mot de passe de votre choix → **Save**.
   Ajoutez aussi, si vous le souhaitez, `SITE_USER` — Valeur : le nom d'utilisateur
   voulu (par défaut `chantier`).
4. **Deployments** → **Create new deployment** (ou *Retry deployment*) pour appliquer les
   variables. Le worker est pris en compte au déploiement.
5. Ouvrez le site : le navigateur demande **le nom d'utilisateur et le mot de passe**.
   Saisissez `SITE_USER` (ou `chantier` par défaut) et `SITE_PASSWORD`.

Pour **changer** les identifiants : modifiez les variables puis redéployez.
Pour **désactiver** la protection : supprimez `SITE_PASSWORD` et redéployez (le site
redevient public). En cas d'oubli, la même opération débloque l'accès.

> Ces identifiants sont vérifiés côté serveur Cloudflare : ils protègent réellement
> l'accès aux fichiers du site. Ils sont **différents** du verrouillage intégré (qui reste
> utile en local, par exemple sur un PC partagé). Vous pouvez utiliser les deux en même
> temps.

#### Cloudflare Access (plus fin, nécessite un nom de domaine)

Cloudflare Access se configure dans **Zero Trust → Access → Applications → Add an
application → Self-hosted**, avec une règle *Allow* pour les adresses e-mail autorisées.
Un nom de domaine personnel est nécessaire (les adresses `*.pages.dev` ne peuvent pas être
protégées directement par Access).

---

## Règles d'or

| Règle | Pourquoi |
|---|---|
| **Ne changez pas d'adresse** (domaine/sous-domaine) | Changer d'adresse = nouveau `localStorage` = données perdues pour les utilisateurs. |
| **Exportez une sauvegarde JSON** avant chaque mise à jour | *Paramètres → Données & sauvegarde → Exporter*. Restauration via *Importer*. |
| **Ouvrez toujours le site de la même façon** | `file://` et `http://` sont deux stockages différents. |
| **Utilisez HTTPS** | Les hébergeurs ci-dessus le fournissent automatiquement. |
| **Testez après publication** | Créez un chantier, rechargez la page, vérifiez qu'il est toujours là. |

## Mettre à jour le site

1. Exportez une sauvegarde JSON (par prudence).
2. Remplacez les fichiers sur l'hébergeur (même adresse).
3. Si vous modifiez un script, incrémentez son numéro de version dans `index.html`
   (`js/core.js?v=1.2.4` → `?v=1.2.5`) pour éviter le cache du navigateur.
4. Rechargez avec `Ctrl + F5` et vérifiez.

## Besoin de données partagées entre plusieurs utilisateurs ?

Cette version est autonome par navigateur. Pour un usage multi-utilisateurs centralisé,
il faut remplacer `localStorage` par un service en ligne (Supabase, Firebase, Airtable…)
ou un petit serveur avec base de données. C'est une évolution possible du projet.
