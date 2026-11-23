# ChantierPro — Gestion de chantier BTP

Application web autonome (HTML/CSS/JavaScript) pour piloter un chantier au quotidien :
avancement, planning, personnel, fournisseurs, stock, devis, bons de commande,
sous-traitants, décomptes clients et documentation.

Toutes les données sont enregistrées **dans le navigateur** (localStorage). Aucun serveur,
aucune base de données et aucune installation ne sont nécessaires. Une sauvegarde JSON
permet d'archiver ou de transférer les données vers un autre poste.

À la première ouverture, l'application démarre **vide** : vous saisissez uniquement vos
propres chantiers et données. Pour découvrir un jeu d'exemple, ouvrez *Paramètres →
Recharger la démonstration* (ou ajoutez `?demo=1` à l'adresse du site).

---

## Ouvrir le site

### 1. Ouverture directe (le plus simple)

Double-cliquez sur **`index.html`**. Le site s'ouvre dans votre navigateur habituel.

### 2. Avec un serveur local (recommandé pour un usage régulier)

Double-cliquez sur **`Ouvrir le site.bat`** : un petit serveur local démarre sur le port 8765
et la page s'ouvre à l'adresse <http://localhost:8765>.

> Le fichier `.bat` utilise Python s'il est installé. Sinon, il ouvre directement `index.html`.
> Pour arrêter le serveur, fermez la fenêtre de commande minimisée « ChantierPro ».

Vous pouvez aussi lancer manuellement, depuis le dossier du site :

```bat
python -m http.server 8765
```

puis ouvrir <http://localhost:8765>.

> **Important :** les données sont liées à l'adresse utilisée. Une base ouverte via
> `file://` et une base ouverte via `http://localhost:8765` sont **deux bases distinctes**.
> Choisissez une méthode d'ouverture et conservez-la. En cas de changement, utilisez
> l'export JSON puis l'import.

---

## Modules disponibles

| Module | Ce que vous pouvez faire |
| --- | --- |
| **Tableau de bord** | KPI de l'activité, chantiers en cours, alertes stock/planning, prochaines échéances |
| **Chantiers** | Créer, modifier, supprimer un chantier ; **tranche** et **GH**, **programme** (nombre d'immeubles, type d'immeuble, nombre d'appartements et de magasins) ; fiche détaillée avec budget, avancement, devis, achats, décomptes et documents |
| **Planning** | **Un planning distinct par tranche** (T1, T2…), chacun avec son Gantt, son bouton « Imprimer la tranche » et son bouton « Nouvelle tâche » ; filtres par statut ; tranche renseignée automatiquement depuis le chantier |
| **Avancement** | Lots pondérés modifiables en direct (curseur ou saisie), avancement global recalculé, journal de suivi |
| **Personnel** | Annuaire complet des contacts : fonction, catégorie, téléphones et email cliquables, adresse, chantier d'affectation, statut, contrat, date d'embauche, contact d'urgence et notes |
| **Fournisseurs** | Carnet d'adresses complet (contacts, coordonnées, spécialités, notes) |
| **Stock & fournitures** | Articles classés par **sous-onglets de matériaux** (Ciment, Tout-venant, Briques, Treillis soudé, Sable…), **bon de livraison et date de livraison**, seuils d'alerte, valeur du stock, entrées/sorties, historique des mouvements |
| **Bons de commande** | Création avec lignes et totaux automatiques, duplication, impression, statuts de livraison |
| **Devis** | Chiffrage avec remise, TVA et totaux en direct, duplication, impression, création d'un bon de commande depuis un devis |
| **Décomptes clients** | Situations de travaux, avancement par ligne, retenue de garantie, TVA, net à payer, impression |
| **Sous-traitants** | Fiches partenaires, suivi de l'assurance décennale, marchés sous-traités |
| **Situations ST** | Cumulé, période, retenue, TVA et net à payer calculés automatiquement ; validation et paiement |
| **Essais béton** | Prélèvements avec **heure de coulage**, type de béton et ouvrage, **numéros de série des éprouvettes**, centrale, laboratoire, volume, température, résistance cible, résultats à **7 et 28 jours**, conformité automatique, échéances et **rapport récapitulatif imprimable** |
| **Documentation** | Contrats, plans, PV, assurances, factures ; classement par **sous-onglets** (Bureau d'étude, Topographe, Laboratoire, Divers, Maître d'ouvrage), version, expiration, lien ou pièce jointe, aperçu |
| **Paramètres** | Logo de l'entreprise, identité, TVA et retenue par défaut, mentions imprimées, sauvegarde/restauration, aide |

Les listes tabulaires proposent la recherche, le tri par colonne, la modification et la suppression.
Les chantiers s'affichent sous forme de cartes avec filtres par statut et accès direct à la fiche.
Le sélecteur **Chantier** de la barre supérieure filtre la plupart des modules.

La page **Documentation** est organisée en **sous-onglets** : *Bureau d'étude*,
*Topographe*, *Laboratoire*, *Divers* et *Maître d'ouvrage*. Chaque sous-onglet affiche
un compteur de documents. Le bouton **Sous-onglet** de la barre d'outils permet d'en
créer de nouveaux ; ils sont enregistrés dans les paramètres et proposés lors de la
création d'un document. Le sous-onglet actif est utilisé par défaut pour tout nouveau
document.

Chaque chantier comporte une **tranche** de travaux, un code **GH** et un **programme**
renseignés à la création : **nombre d'immeubles**, **type d'immeuble** (logements
collectifs, résidence, bureaux, équipement public…), **nombre d'appartements** et
**nombre de magasins**. Ces informations s'affichent sur la carte du chantier, dans la
fiche détaillée et sur la fiche imprimée.

L'onglet **Planning** affiche **un planning séparé par tranche** : chaque tranche possède
son propre Gantt, son en-tête (nombre de tâches et période), son bouton **Imprimer la
tranche** et son bouton **Nouvelle tâche**. Les tâches héritent de la tranche du chantier
choisi ; le champ **Tranche** du formulaire permet de l'ajuster. Les tâches sans tranche
sont regroupées en fin de page sous « Sans tranche ». L'impression globale (**Imprimer**)
reste disponible et le document imprimé comporte une colonne **Tranche**.

La page **Stock & fournitures** est organisée en **sous-onglets par famille de
matériaux** : *Ciment*, *Tout-venant*, *Briques*, *Treillis soudé*, *Sable* et *Divers*.
L'onglet **Tous** affiche l'ensemble des articles et chaque famille affiche son nombre de
références. Le bouton **Sous-onglet** de la barre d'outils ouvre la gestion des familles :
ajout d'une nouvelle famille (Gravier, Fer à béton…), renommage et suppression. Les
articles sont automatiquement reclassés lors d'un renommage ou d'une suppression (les
articles d'une famille supprimée passent dans *Divers*). Un article créé depuis un
sous-onglet actif est directement rattaché à cette famille.

Chaque article enregistre aussi son **bon de livraison** (numéro) et sa **date de
livraison** : ces informations se saisissent dans le formulaire *Nouvel article*,
s'affichent dans la colonne **Livraison** de la liste et figurent sur la liste imprimée.
La date est préremplie à la date du jour.

Les **entrées de stock** disposent en plus de leur propre numéro de bon de livraison
(saisi avec la date du mouvement) : il est conservé dans l'historique des mouvements. Le
champ est masqué pour une sortie de stock.

La page **Personnel** centralise toutes les coordonnées de l'équipe et des intervenants :
nom, fonction, catégorie, téléphones, email, adresse, chantier d'affectation, statut,
contrat, date d'embauche, contact d'urgence et notes. Les numéros de téléphone et les
adresses email sont **cliquables** : sur téléphone, un appui lance directement l'appel ou
l'application de messagerie. La recherche porte sur l'ensemble des champs et le filtre
**Chantier** permet de ne voir que les personnes affectées à une opération.

La page **Essais béton** (groupe **Qualité**) suit les prélèvements de béton : date et
**heure de coulage**, référence du PV, **numéros de série des éprouvettes**, chantier, type
de béton, ouvrage, centrale, laboratoire, volume coulé, température, résistance cible et
résultats à **7 jours** et **28 jours**. L'heure de coulage s'affiche à côté de la date de
prélèvement et sert aussi au tri des essais d'une même journée. Plusieurs numéros
d'éprouvettes peuvent être saisis pour un même prélèvement (séparés par des virgules) ;
ils sont affichés dans la liste et pris en compte par la recherche.
La conformité est calculée automatiquement : un essai est *Conforme* lorsque le résultat
à 28 jours atteint la résistance cible, *Non conforme* sinon, et *En attente* tant que le
résultat n'est pas saisi. L'échéance des 28 jours (date de prélèvement + 28) est affichée
dans la liste, ce qui permet de repérer les essais à réaliser.

Le bouton **Imprimer le rapport** produit un **rapport récapitulatif A4** prêt à imprimer
ou à enregistrer en PDF : en-tête de l'entreprise, période couverte, KPI (prélèvements,
conformes, non conformes, en attente, taux de conformité), synthèse par chantier, détail
de chaque essai (date et heure de coulage, chantier, béton et ouvrage, n° d'éprouvettes,
cible, résultats 7 j et 28 j, conformité, échéance) et zone de visas. Le rapport respecte
le filtre **Chantier** actif : il ne contient alors que les essais du chantier sélectionné.

### Sur téléphone et tablette

L'interface s'adapte automatiquement aux petits écrans :

- menu latéral escamotable (bouton ☰, fermeture par la croix, le fond ou la touche Échap) ;
- barre supérieure sur deux lignes : titre, bouton **Nouveau** et filtre chantier accessibles au pouce ;
- les tableaux deviennent des **cartes** lisibles, avec le libellé de chaque valeur ;
- un sélecteur **Trier** remplace le clic sur les en-têtes de colonnes ;
- les fenêtres de formulaire s'ouvrent en **panneau bas**, avec défilement interne et boutons pleine largeur ;
- champs de saisie à 16 px (pas de zoom automatique sur iPhone) et boutons d'au moins 44 px ;
- le planning (Gantt) reste consultable par défilement horizontal.

Le site peut être **installé sur l'écran d'accueil** (Safari : *Partager → Sur l'écran d'accueil* ;
Chrome Android : *⋮ → Installer l'application*). Il s'ouvre alors en plein écran et conserve
les données du navigateur.

---

## Sauvegarde et restauration

- **Exporter** : bouton *Exporter* de la barre supérieure, ou *Paramètres → Exporter une sauvegarde JSON*.
  Un fichier `chantierpro-sauvegarde-AAAA-MM-JJ.json` est téléchargé.
- **Importer** : *Paramètres → Importer une sauvegarde*, puis choisissez le fichier JSON.
  Les données actuelles sont remplacées.
- **Recharger la démonstration** : remet le jeu de données d'exemple.
- **Remettre à zéro** : supprime définitivement toutes les données saisies (chantiers,
  tâches, stock, mouvements, devis, commandes, décomptes, personnel, essais béton,
  documents). L'identité de l'entreprise, le logo et le verrouillage sont conservés.
  Action irréversible, à confirmer.

> Les données restent sur le poste et dans le navigateur utilisé. Vider les données du site
> ou utiliser un autre navigateur/profil revient à repartir d'une base vide : exportez
> régulièrement une sauvegarde.

### Pièces jointes

Les documents acceptent un fichier de **1,5 Mo maximum**, stocké en base64 dans le navigateur.
Pour les fichiers plus volumineux, renseignez plutôt un **lien** (URL ou chemin réseau).
Le stockage local du navigateur étant limité, préférez les liens pour les gros plans et PDF.

---

## Logo et devise

- **Logo** : le fichier `assets/logo.jpg` est affiché par défaut dans la barre latérale, sur
  l'écran de verrouillage, dans l'onglet du navigateur (favicon) et en en-tête de tous les
  documents imprimés (devis, bons de commande, décomptes, situations et fiche chantier).
  Pour le remplacer, allez dans *Paramètres → Identité de l'entreprise → Choisir un logo*
  (PNG, JPG, SVG ou WebP, **1 Mo maximum**). Le bouton *Retirer* le supprime.
- **Devise** : tous les montants de l'application et des documents imprimés sont exprimés
  en **dirham marocain (MAD)**.

---

## Protection par nom d'utilisateur et mot de passe

L'application intègre un **verrouillage local** : *Paramètres → Protection par nom
d'utilisateur et mot de passe*. Définissez un nom d'utilisateur (3 caractères minimum,
sans espace) et un mot de passe (4 caractères minimum), confirmez, puis choisissez
« Activer le verrouillage ». Un écran de connexion est demandé à chaque nouvelle
ouverture du site, sur ce navigateur. Les boutons « Verrouiller maintenant », « Mettre à
jour les identifiants » et « Désactiver le verrouillage » sont disponibles dans la même
section.

Une fois le verrouillage activé, l'option **« Demander le mot de passe à chaque
modification »** (activée par défaut) demande une confirmation avant chaque action qui
modifie les données :

- enregistrement d'un formulaire (chantier, tâche, devis, bon de commande, décompte,
  situation, fournisseur, article, document…) ;
- suppression d'une ligne, d'un lot, d'un mouvement de stock ou d'une entrée du journal ;
- duplication d'un devis ou d'un bon de commande, création d'un BC depuis un devis ;
- boutons « Valider », « Marquer payée », « Marquer payé » ;
- import d'une sauvegarde JSON, rechargement de la démonstration, effacement total ;
- modification des paramètres et du logo de l'entreprise.

La fenêtre de confirmation possède son propre champ : le formulaire en cours reste
ouvert et les valeurs saisies sont conservées. Une annulation ou un mot de passe
incorrect laisse les données intactes. Pour ne demander le mot de passe qu'à
l'ouverture, décochez l'option dans *Paramètres → Protection par nom d'utilisateur et
mot de passe*.

- Le mot de passe n'est **jamais enregistré en clair** (empreinte SHA-256 salée).
- Le nom d'utilisateur est mémorisé dans le navigateur ; il n'est pas secret.
- Les identifiants **ne figurent pas dans les sauvegardes JSON** exportées.
- En cas d'oubli, les données locales de ce navigateur ne sont plus accessibles.

> **Limite importante** : c'est une protection de l'interface, pas un chiffrement.
> Elle empêche un utilisateur occasionnel d'ouvrir l'application, mais pas une personne
> technicienne d'accéder aux fichiers ou au stockage du navigateur. Pour restreindre
> réellement l'accès à un site publié, protégez-le chez l'hébergeur (Cloudflare Access
> par exemple). Voir `PUBLIER.md`.

---

## Impression

Chaque onglet de l'application dispose d'un bouton **Imprimer** qui produit une sortie A4
prête à imprimer ou à enregistrer en PDF : tableau de bord, chantiers, planning, avancement,
fournisseurs, stock (avec le sous-onglet actif), bons de commande, devis, décomptes, personnel,
sous-traitants, situations, essais béton, documentation, fiche chantier et fiche entreprise.
Les listes sont imprimées telles qu'affichées (recherche, filtre chantier, sous-onglet et tri
en cours), avec les totaux correspondants. Les documents individuels (devis, bon de commande,
décompte, situation sous-traitant, fiche chantier) conservent leur propre bouton d'impression.
Si rien ne s'ouvre, autorisez les fenêtres pop-up pour le site.

---

## Structure du projet

```
GestionChantierWeb/
├─ index.html               Page unique et chargement des scripts
├─ Ouvrir le site.bat       Démarrage optionnel d'un serveur local
├─ README.md                Ce fichier
├─ PUBLIER.md               Guide de mise en ligne (Cloudflare, GitHub Pages, FTP, réseau local)
├─ _worker.js               Protection optionnelle du site publié (Cloudflare Pages, variables SITE_USER et SITE_PASSWORD)
├─ assets/
│  ├─ styles.css            Design complet (responsive, impression, modales)
│  ├─ icon.svg              Icône PWA (écran d'accueil)
│  └─ logo.jpg              Logo de l'entreprise (remplaçable via Paramètres)
├─ manifest.webmanifest     Manifest de l'application installable
└─ js/
   ├─ core.js               Utilitaires, icônes, modales, formulaires, éditeur de lignes, impression
   ├─ db.js                 Données de démonstration, localStorage, calculs, alertes, import/export
   ├─ security.js           Verrouillage par nom d'utilisateur et mot de passe (SHA-256, écran de connexion)
   ├─ list.js               Listes génériques, formulaires et cartes chantier
   ├─ docs-print.js         Modèles imprimables (devis, BC, décomptes, situations, fiche chantier)
   ├─ views-main.js         Tableau de bord, chantiers, fiche chantier
   ├─ views-planning.js     Gantt et avancement par lot + journal
   ├─ views-business.js     Personnel, fournisseurs, stock, bons de commande, documentation
   ├─ views-devis.js        Devis et décomptes clients
   ├─ views-st.js           Sous-traitants, situations ST, paramètres et sauvegarde
   ├─ views-qualite.js      Essais béton : prélèvements, résultats 7/28 jours, conformité
   └─ boot.js               Navigation, filtre chantier, routage et initialisation
```

Technologies : HTML5, CSS3 et JavaScript natif (aucune dépendance, aucun build).
Compatible avec les navigateurs récents (Chrome, Edge, Firefox).

---

## Bonnes pratiques

1. Ouvrez toujours le site de la même façon (fichier ou serveur local) pour retrouver vos données.
2. Exportez une sauvegarde JSON avant toute modification importante ou mise à jour.
3. Renseignez l'identité de l'entreprise dans **Paramètres** : elle apparaît sur tous les documents imprimés.
4. Mettez à jour l'avancement par lot dans **Avancement** : l'avancement global et les fiches chantier se recalculent automatiquement.
5. Vérifiez les alertes du tableau de bord (stock bas, tâches en retard, assurances, documents expirés).

---

Version 1.4.6 — ChantierPro · Gestion de chantier BTP
