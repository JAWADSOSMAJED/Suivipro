/* =========================================================
   ChantierPro — SOSMAJED — stockage local, données de démonstration, calculs
   ========================================================= */
(function () {
  'use strict';
  const App = window.App;
  const { uid, n, sum, addDays, todayISO, monthYear } = App;

  const KEY = 'chantierpro_web_v1';
  const STORE_VERSION = 7;
  const COLLECTIONS = ['chantiers', 'taches', 'avancements', 'fournisseurs', 'articles', 'mouvements', 'devis', 'commandes', 'sousTraitants', 'situations', 'decomptes', 'documents', 'personnel', 'essaisBeton'];

  const DEFAULT_DOC_RUBRIQUES = ['Bureau d\'étude', 'Topographe', 'Laboratoire', 'Divers', 'Maître d\'ouvrage'];
  const DEFAULT_STOCK_FAMILLES = ['Ciment', 'Tout-venant', 'Briques', 'Treillis soudé', 'Sable', 'Divers'];

  function defaultDocRubriques() {
    return DEFAULT_DOC_RUBRIQUES.slice();
  }

  function defaultStockFamilles() {
    return DEFAULT_STOCK_FAMILLES.slice();
  }

  function defaultLogo() {
    return { name: 'SOS.jpg', type: 'image/jpeg', size: 19597, dataUrl: 'assets/logo.jpg' };
  }

  function defaultSettings() {
    return {
      societe: {
        nom: 'SOSMAJED',
        adresse: 'Lot N°31, Lotissement Kamilia',
        cp: '20000',
        ville: 'Casablanca',
        tel: '01 23 45 67 89',
        email: 'contact@sosmajed.com',
        logo: defaultLogo()
      },
      banniere: { actif: true, texte: 'SOSMAJED — Gestion de chantier BTP', image: null },
      tvaDefaut: 20,
      retenueGarantie: 5,
      docRubriques: defaultDocRubriques(),
      stockFamilles: defaultStockFamilles(),
      mentionsDevis: 'Devis valable 30 jours. Acompte de 30 % à la commande. TVA acquittée sur les encaissements.',
      mentionsDecompte: 'Paiement à 30 jours fin de mois. Retenue de garantie de 5 % libérable après parfait achèvement.',
      mentionsCommande: 'Merci de rappeler le numéro de commande sur le bon de livraison et la facture.',
      mentionsSituation: 'Situation établie sous réserve de validation du maître d\'œuvre. Paiement selon contrat de sous-traitance.'
    };
  }

  /* Contacts de démonstration de l'équipe et des intervenants. */
  function demoPersonnel() {
    const A = (d) => addDays(todayISO(), d);
    return [
      {
        id: 'pers1', nom: 'Karim Benali', fonction: 'Conducteur de travaux', categorie: 'Équipe interne',
        tel: '06 12 34 56 78', tel2: '01 23 45 67 89', email: 'karim.benali@sosmajed.com',
        adresse: '12 rue des Bâtisseurs', cp: '75011', ville: 'Paris',
        chantierId: 'ch_cedres', statut: 'Actif', contrat: 'CDI', dateEmbauche: A(-1250),
        urgenceNom: 'Leïla Benali (épouse)', urgenceTel: '06 98 76 54 32',
        notes: 'Référent sécurité et interlocuteur principal du maître d\'ouvrage.'
      },
      {
        id: 'pers2', nom: 'Sophie Martin', fonction: 'Chef de chantier', categorie: 'Équipe interne',
        tel: '06 23 45 67 89', tel2: '', email: 'sophie.martin@sosmajed.com',
        adresse: '4 allée des Peupliers', cp: '44300', ville: 'Nantes',
        chantierId: 'ch_ecole', statut: 'Actif', contrat: 'CDI', dateEmbauche: A(-820),
        urgenceNom: 'Paul Martin (père)', urgenceTel: '06 11 22 33 44',
        notes: 'Suivi quotidien du groupe scolaire et des sous-traitants.'
      },
      {
        id: 'pers3', nom: 'Ahmed El Fassi', fonction: 'Chef d\'équipe maçonnerie', categorie: 'Équipe interne',
        tel: '06 34 56 78 90', tel2: '', email: 'ahmed.elfassi@sosmajed.com',
        adresse: '28 rue de la Gare', cp: '93100', ville: 'Montreuil',
        chantierId: 'ch_mairie', statut: 'Actif', contrat: 'CDI', dateEmbauche: A(-1520),
        urgenceNom: 'Nadia El Fassi (épouse)', urgenceTel: '06 55 66 77 88',
        notes: 'Habilité travail en hauteur et port du harnais.'
      },
      {
        id: 'pers4', nom: 'Julien Moreau', fonction: 'Grutier', categorie: 'Équipe interne',
        tel: '06 45 67 89 01', tel2: '', email: 'julien.moreau@sosmajed.com',
        adresse: '7 rue des Lilas', cp: '75020', ville: 'Paris',
        chantierId: 'ch_cedres', statut: 'En congé', contrat: 'Intérim', dateEmbauche: A(-210),
        urgenceNom: 'Marie Moreau (mère)', urgenceTel: '06 77 88 99 00',
        notes: 'CACES grue à tour en cours de renouvellement, retour prévu lundi.'
      },
      {
        id: 'pers5', nom: 'Claire Dubois', fonction: 'Assistante de direction', categorie: 'Équipe interne',
        tel: '01 23 45 67 90', tel2: '', email: 'claire.dubois@sosmajed.com',
        adresse: '12 rue des Bâtisseurs', cp: '75011', ville: 'Paris',
        chantierId: '', statut: 'Actif', contrat: 'CDI', dateEmbauche: A(-1900),
        urgenceNom: 'Luc Dubois (frère)', urgenceTel: '06 12 98 76 54',
        notes: 'Secrétariat, facturation et accueil des fournisseurs.'
      },
      {
        id: 'pers6', nom: 'Marc Aubert', fonction: 'Responsable électricité', categorie: 'Sous-traitant',
        tel: '05 56 99 88 77', tel2: '06 88 77 66 55', email: 'm.aubert@elecpro.fr',
        adresse: '5 rue du Voltage', cp: '33100', ville: 'Bordeaux',
        chantierId: 'ch_cedres', statut: 'Actif', contrat: 'Sous-traitance', dateEmbauche: A(-480),
        urgenceNom: 'Élec\'Pro — accueil', urgenceTel: '05 56 99 88 70',
        notes: 'Contact de l\'entreprise Élec\'Pro pour les courants forts et faibles.'
      }
    ];
  }

  /* Essais de résistance du béton : prélèvement, résultats à 7 et 28 jours. */
  function demoEssaisBeton() {
    const A = (d) => addDays(todayISO(), d);
    return [
      {
        id: 'bet1', datePrelevement: A(-42), heureCoulage: '07:30', chantierId: 'ch_cedres', typeBeton: 'C25/30',
        ouvrage: 'Voiles périphériques — R+1', reference: 'PV LAB-' + new Date().getFullYear() + '-1042',
        eprouvettes: 'A-1042-1, A-1042-2, A-1042-3',
        fournisseurId: 'f_pointp', laboratoire: 'Laboratoire Geotec', volume: 32, temperature: 18.5,
        resistanceCible: 25, resultat7: 19.6, resultat28: 30.2,
        observations: 'Béton pompé, cure humide. Résultats conformes au CCTP.'
      },
      {
        id: 'bet2', datePrelevement: A(-20), heureCoulage: '09:15', chantierId: 'ch_cedres', typeBeton: 'C30/37',
        ouvrage: 'Plancher haut — R+2', reference: 'PV LAB-' + new Date().getFullYear() + '-1108',
        eprouvettes: 'A-1108-1, A-1108-2, A-1108-3',
        fournisseurId: 'f_pointp', laboratoire: 'Laboratoire Geotec', volume: 48, temperature: 21,
        resistanceCible: 30, resultat7: 24.1, resultat28: 0,
        observations: 'Éprouvettes en attente de l\'essai à 28 jours.'
      },
      {
        id: 'bet3', datePrelevement: A(-55), heureCoulage: '08:00', chantierId: 'ch_ecole', typeBeton: 'C25/30',
        ouvrage: 'Semelles filantes — zone A', reference: 'PV LAB-' + new Date().getFullYear() + '-0987',
        eprouvettes: 'A-0987-1, A-0987-2, A-0987-3',
        fournisseurId: 'f_pointp', laboratoire: 'Laboratoire Geotec', volume: 26, temperature: 16,
        resistanceCible: 25, resultat7: 18.2, resultat28: 23.4,
        observations: 'Résistance à 28 jours inférieure à la cible : analyse avec le bureau d\'études.'
      },
      {
        id: 'bet4', datePrelevement: A(-75), heureCoulage: '14:30', chantierId: 'ch_ecole', typeBeton: 'C20/25',
        ouvrage: 'Dalle extérieure — préau', reference: 'PV LAB-' + new Date().getFullYear() + '-0931',
        eprouvettes: 'A-0931-1, A-0931-2',
        fournisseurId: 'f_gedimat', laboratoire: 'Laboratoire BTP Ouest', volume: 18, temperature: 19,
        resistanceCible: 25, resultat7: 15.8, resultat28: 26.1,
        observations: 'Coulage par temps sec, résultats conformes.'
      },
      {
        id: 'bet5', datePrelevement: A(-8), heureCoulage: '11:45', chantierId: 'ch_mairie', typeBeton: 'C25/30',
        ouvrage: 'Longrines — hall d\'entrée', reference: 'PV LAB-' + new Date().getFullYear() + '-1155',
        eprouvettes: 'A-1155-1, A-1155-2, A-1155-3',
        fournisseurId: 'f_gedimat', laboratoire: 'Laboratoire Geotec', volume: 12, temperature: 17.5,
        resistanceCible: 25, resultat7: 21, resultat28: 0,
        observations: 'Prélèvement du 3e camion, essai 28 jours programmé.'
      }
    ];
  }

  /* Mise à niveau des données existantes (v1 → v2 : logo ; v3 : sous-onglets documentaires ; v4 : personnel ; v5 : essais béton). */
  function guessDocRubrique(cat) {
    switch (cat) {
      case 'Contrat': return 'Maître d\'ouvrage';
      case 'Plan': return 'Bureau d\'étude';
      case 'Étude': return 'Laboratoire';
      default: return 'Divers';
    }
  }

  /* Rattache un article existant à une famille de matériaux. */
  function guessStockFamille(art) {
    const txt = String((art && (art.designation || '') + ' ' + (art.categorie || '') + ' ' + (art.ref || '')) || '').toLowerCase();
    if (/treillis|panneau\s+soud|ts\s?\d/.test(txt)) return 'Treillis soudé';
    if (/ciment|cem\b|liant/.test(txt)) return 'Ciment';
    if (/tout[\s-]?venant|\btv\b|grave|remblai/.test(txt)) return 'Tout-venant';
    if (/brique|parpaing|bloc|agglos?/.test(txt)) return 'Briques';
    if (/sable|sabl/.test(txt)) return 'Sable';
    return 'Divers';
  }

  function migrate(data) {
    if (!data || typeof data !== 'object') return data;
    if (!data.settings) data.settings = defaultSettings();
    if (!data.settings.societe) data.settings.societe = defaultSettings().societe;
    /* Raison sociale : remplace l'ancien nom par defaut sans ecraser une saisie personnalisee. */
    if (data.settings.societe) {
      const raisonSociale = String(data.settings.societe.nom || '').trim();
      if (!raisonSociale || raisonSociale === 'BTP Constructions Majed' || raisonSociale === 'JawadProjet') {
        data.settings.societe.nom = 'SOSMAJED';
      }
      /* Ancienne adresse de demonstration : remplacee, sans toucher a une adresse saisie. */
      if (String(data.settings.societe.adresse || '').trim() === '12 rue des Bâtisseurs') {
        data.settings.societe.adresse = 'Lot N°31, Lotissement Kamilia';
      }
      if (String(data.settings.societe.cp || '').trim() === '75011') data.settings.societe.cp = '20000';
      if (String(data.settings.societe.ville || '').trim() === 'Paris') data.settings.societe.ville = 'Casablanca';
      if (String(data.settings.societe.email || '').trim() === 'contact@btp-majed.fr') {
        data.settings.societe.email = 'contact@sosmajed.com';
      }
      /* Identité simplifiée : ces numéros ne sont plus utilisés ni imprimés. */
      delete data.settings.societe.siret;
      delete data.settings.societe.tva;
      delete data.settings.societe.iban;
    }
    /* Bannière de tête de page : ajoutée sans écraser les réglages existants. */
    if (!data.settings.banniere || typeof data.settings.banniere !== 'object') {
      data.settings.banniere = defaultSettings().banniere;
    } else {
      if (data.settings.banniere.actif == null) data.settings.banniere.actif = true;
      if (data.settings.banniere.texte == null) data.settings.banniere.texte = 'SOSMAJED — Gestion de chantier BTP';
      if (!('image' in data.settings.banniere)) data.settings.banniere.image = null;
    }
    if (!Array.isArray(data.settings.docRubriques) || !data.settings.docRubriques.length) {
      data.settings.docRubriques = defaultDocRubriques();
    }
    if (!Array.isArray(data.settings.stockFamilles) || !data.settings.stockFamilles.length) {
      data.settings.stockFamilles = defaultStockFamilles();
    }
    if (Array.isArray(data.articles)) {
      data.articles.forEach(function (a) {
        if (a && !a.famille) a.famille = guessStockFamille(a);
      });
    }
    if (Array.isArray(data.chantiers)) {
      data.chantiers.forEach(function (c) {
        if (!c) return;
        if (c.tranche == null) c.tranche = '';
        if (c.gh == null) c.gh = '';
        if (c.nbImmeubles == null) c.nbImmeubles = 0;
        if (c.nbAppartements == null) c.nbAppartements = 0;
        if (c.nbMagasins == null) c.nbMagasins = 0;
        if (c.typeImmeuble == null) c.typeImmeuble = '';
      });
    }
    if (Array.isArray(data.documents)) {
      data.documents.forEach(function (d) {
        if (d && !d.rubrique) d.rubrique = guessDocRubrique(d.categorie);
      });
    }
    if (!data.version || data.version < 2) {
      if (!data.settings.societe.logo) data.settings.societe.logo = defaultLogo();
    }
    if (!Array.isArray(data.personnel)) data.personnel = demoPersonnel();
    if (!Array.isArray(data.essaisBeton)) data.essaisBeton = [];
    if (!data.version || data.version < 3) data.version = 3;
    if (!data.version || data.version < 4) data.version = 4;
    if (!data.version || data.version < 5) data.version = 5;
    if (!data.version || data.version < 6) data.version = 6;
    if (!data.version || data.version < 7) data.version = 7;
    return data;
  }

  /* ---------------- Données de démonstration ---------------- */
  /* Base vide : premier démarrage et remise à zéro (aucune donnée saisie). */
  function emptyStore() {
    const data = { version: STORE_VERSION, settings: defaultSettings() };
    COLLECTIONS.forEach(function (c) { data[c] = []; });
    return data;
  }

  function seed() {
    const Y = new Date().getFullYear();
    const T = todayISO();
    const A = (d) => addDays(T, d);

    const chantiers = [
      {
        id: 'ch_cedres', code: 'CH-' + Y + '-01', nom: 'Résidence Les Cèdres', client: 'SCI Les Cèdres',
        contact: 'Hélène Vasseur', tel: '05 56 12 34 56', email: 'contact@sci-cedres.fr',
        adresse: '14 avenue des Cèdres', cp: '33800', ville: 'Bordeaux',
        dateDebut: A(-150), dateFin: A(210), budget: 1850000, chef: 'Karim Benali', statut: 'En cours',
        tranche: 'T1', gh: 'GH1',
        nbImmeubles: 1, typeImmeuble: 'Résidence', nbAppartements: 12, nbMagasins: 0,
        description: 'Construction de 12 logements collectifs avec parkings en sous-sol et espaces verts.',
        lots: [
          { id: 'lot_c1', nom: 'Gros œuvre', poids: 30, avancement: 85 },
          { id: 'lot_c2', nom: 'Charpente / couverture', poids: 15, avancement: 60 },
          { id: 'lot_c3', nom: 'Menuiseries extérieures', poids: 15, avancement: 25 },
          { id: 'lot_c4', nom: 'Électricité', poids: 10, avancement: 10 },
          { id: 'lot_c5', nom: 'Plomberie / CVC', poids: 10, avancement: 5 },
          { id: 'lot_c6', nom: 'Finitions', poids: 20, avancement: 0 }
        ]
      },
      {
        id: 'ch_ecole', code: 'CH-' + Y + '-02', nom: 'Extension groupe scolaire Jean Moulin', client: 'Ville de Nantes',
        contact: 'Service technique', tel: '02 40 11 22 33', email: 'technique@nantes.fr',
        adresse: '8 rue Jean Moulin', cp: '44300', ville: 'Nantes',
        dateDebut: A(-60), dateFin: A(70), budget: 640000, chef: 'Sophie Marchand', statut: 'En cours',
        tranche: 'T1', gh: 'GH2',
        nbImmeubles: 1, typeImmeuble: 'Équipement public', nbAppartements: 0, nbMagasins: 0,
        description: 'Extension de 4 salles de classe, réfectoire et sanitaires. Site occupé pendant les travaux.',
        lots: [
          { id: 'lot_e1', nom: 'Terrassement', poids: 20, avancement: 100 },
          { id: 'lot_e2', nom: 'Structure', poids: 30, avancement: 70 },
          { id: 'lot_e3', nom: 'Enveloppe', poids: 20, avancement: 30 },
          { id: 'lot_e4', nom: 'Lots techniques', poids: 20, avancement: 0 },
          { id: 'lot_e5', nom: 'Aménagements', poids: 10, avancement: 0 }
        ]
      },
      {
        id: 'ch_mairie', code: 'CH-' + Y + '-03', nom: 'Réhabilitation mairie de Saint-Rémy', client: 'Commune de Saint-Rémy',
        contact: 'M. le Maire', tel: '03 80 55 66 77', email: 'mairie@saint-remy.fr',
        adresse: 'Place de la République', cp: '71100', ville: 'Saint-Rémy',
        dateDebut: A(-25), dateFin: A(150), budget: 380000, chef: 'Karim Benali', statut: 'En attente',
        tranche: 'T2', gh: 'GH1',
        nbImmeubles: 1, typeImmeuble: 'Équipement public', nbAppartements: 0, nbMagasins: 0,
        description: 'Rénovation énergétique, mise aux normes accessibilité et réaménagement du hall.',
        lots: [
          { id: 'lot_m1', nom: 'Démolition / dépose', poids: 15, avancement: 40 },
          { id: 'lot_m2', nom: 'Isolation / façades', poids: 30, avancement: 5 },
          { id: 'lot_m3', nom: 'Menuiseries', poids: 20, avancement: 0 },
          { id: 'lot_m4', nom: 'Électricité / chauffage', poids: 20, avancement: 0 },
          { id: 'lot_m5', nom: 'Finitions', poids: 15, avancement: 0 }
        ]
      },
      {
        id: 'ch_agence', code: 'CH-' + Y + '-04', nom: 'Rénovation agence bancaire', client: 'Banque Populaire',
        contact: 'Direction immobilière', tel: '01 44 55 66 77', email: 'immobilier@bp.fr',
        adresse: '25 boulevard Haussmann', cp: '75009', ville: 'Paris',
        dateDebut: A(-210), dateFin: A(-20), budget: 210000, chef: 'Sophie Marchand', statut: 'Terminé',
        tranche: 'T1', gh: 'GH3',
        nbImmeubles: 1, typeImmeuble: 'Immeuble de bureaux', nbAppartements: 0, nbMagasins: 0,
        description: 'Rénovation complète de l\'agence : accueil, bureaux, salle de réunion et local technique.',
        lots: [
          { id: 'lot_a1', nom: 'Cloisons / plafonds', poids: 30, avancement: 100 },
          { id: 'lot_a2', nom: 'Électricité', poids: 25, avancement: 100 },
          { id: 'lot_a3', nom: 'Peinture / sols', poids: 25, avancement: 100 },
          { id: 'lot_a4', nom: 'Mobilier / signalétique', poids: 20, avancement: 100 }
        ]
      }
    ];

    const taches = [
      { id: 't1', chantierId: 'ch_cedres', nom: 'Coulage dalle niveau 2', debut: A(-5), fin: A(2), statut: 'En cours', responsable: 'Équipe gros œuvre', avancement: 70, notes: 'Coulage prévu jeudi, commande béton à confirmer.' },
      { id: 't2', chantierId: 'ch_cedres', nom: 'Pose charpente bâtiment C', debut: A(-12), fin: A(-1), statut: 'En retard', responsable: 'SARL Toiture Ouest', avancement: 40, notes: 'Retard livraison fermettes.' },
      { id: 't3', chantierId: 'ch_cedres', nom: 'Réseaux électriques niveaux 1-2', debut: A(3), fin: A(20), statut: 'À faire', responsable: 'Élec\'Pro', avancement: 0, notes: '' },
      { id: 't4', chantierId: 'ch_cedres', nom: 'Étanchéité toiture-terrasse', debut: A(12), fin: A(26), statut: 'À faire', responsable: 'SARL Toiture Ouest', avancement: 0, notes: '' },
      { id: 't5', chantierId: 'ch_cedres', nom: 'Livraison menuiseries', debut: A(18), fin: A(19), statut: 'À faire', responsable: 'Menuiserie Lemaire', avancement: 0, notes: '' },
      { id: 't6', chantierId: 'ch_ecole', nom: 'Fondations et longrines', debut: A(-20), fin: A(-8), statut: 'Terminé', responsable: 'Équipe gros œuvre', avancement: 100, notes: '' },
      { id: 't7', chantierId: 'ch_ecole', nom: 'Élévation murs préfabriqués', debut: A(-6), fin: A(9), statut: 'En cours', responsable: 'Équipe gros œuvre', avancement: 55, notes: '2 semi-remorques livrées sur 4.' },
      { id: 't8', chantierId: 'ch_ecole', nom: 'Charpente métallique réfectoire', debut: A(7), fin: A(18), statut: 'À faire', responsable: 'Métal Structure', avancement: 0, notes: '' },
      { id: 't9', chantierId: 'ch_ecole', nom: 'Passage des gaines CVC', debut: A(20), fin: A(35), statut: 'À faire', responsable: 'Plomberie Duval', avancement: 0, notes: '' },
      { id: 't10', chantierId: 'ch_ecole', nom: 'Réception gros œuvre', debut: A(38), fin: A(38), statut: 'À faire', responsable: 'Maîtrise d\'œuvre', avancement: 0, notes: '' },
      { id: 't11', chantierId: 'ch_mairie', nom: 'Installation de chantier', debut: A(-10), fin: A(-4), statut: 'Terminé', responsable: 'Conducteur', avancement: 100, notes: '' },
      { id: 't12', chantierId: 'ch_mairie', nom: 'Dépose menuiseries existantes', debut: A(-2), fin: A(8), statut: 'En cours', responsable: 'Équipe second œuvre', avancement: 35, notes: 'Accès public à maintenir.' },
      { id: 't13', chantierId: 'ch_mairie', nom: 'Isolation thermique par l\'extérieur', debut: A(15), fin: A(45), statut: 'À faire', responsable: 'Isolation Ouest', avancement: 0, notes: '' },
      { id: 't14', chantierId: 'ch_mairie', nom: 'Réfection électricité', debut: A(30), fin: A(60), statut: 'À faire', responsable: 'Élec\'Pro', avancement: 0, notes: '' },
      { id: 't15', chantierId: 'ch_agence', nom: 'Réception et levée des réserves', debut: A(-30), fin: A(-24), statut: 'Terminé', responsable: 'Sophie Marchand', avancement: 100, notes: '' },
      { id: 't16', chantierId: 'ch_cedres', nom: 'Terrassement parking', debut: A(-70), fin: A(-40), statut: 'Terminé', responsable: 'Équipe terrassement', avancement: 100, notes: '' }
    ];

    const avancements = [
      { id: 'av1', chantierId: 'ch_cedres', date: A(-7), pct: 48, auteur: 'Karim Benali', note: 'Dalle niveau 2 à 70 %. Charpente C bloquée par la livraison de fermettes.' },
      { id: 'av2', chantierId: 'ch_ecole', date: A(-5), pct: 54, auteur: 'Sophie Marchand', note: 'Élévation des murs préfabriqués en cours, 2 livraisons sur 4.' },
      { id: 'av3', chantierId: 'ch_cedres', date: A(-14), pct: 46, auteur: 'Karim Benali', note: 'Réception des fondations bâtiment B validée par le bureau de contrôle.' },
      { id: 'av4', chantierId: 'ch_mairie', date: A(-8), pct: 8, auteur: 'Karim Benali', note: 'Dépose des menuiseries démarrée, protection des sols en place.' },
      { id: 'av5', chantierId: 'ch_ecole', date: A(-12), pct: 48, auteur: 'Sophie Marchand', note: 'Fondations terminées, démarrage de l\'élévation.' },
      { id: 'av6', chantierId: 'ch_agence', date: A(-25), pct: 100, auteur: 'Sophie Marchand', note: 'Réception prononcée sans réserve majeure. Dossier de clôture à constituer.' }
    ];

    const fournisseurs = [
      { id: 'f_pointp', nom: 'Point.P Matériaux', contact: 'Agence Bordeaux Lac', tel: '05 56 43 21 00', email: 'bordeauxlac@pointp.fr', adresse: 'ZA de Bordeaux Lac', cp: '33300', ville: 'Bordeaux', specialite: 'Gros œuvre, matériaux' },
      { id: 'f_cedeo', nom: 'Cedeo Sanitaire', contact: 'Julien Faure', tel: '05 56 78 90 12', email: 'j.faure@cedeo.fr', adresse: '8 rue des Artisans', cp: '33100', ville: 'Bordeaux', specialite: 'Plomberie, sanitaire' },
      { id: 'f_rexel', nom: 'Rexel Électro', contact: 'Nadia Perrin', tel: '02 40 55 66 77', email: 'n.perrin@rexel.fr', adresse: '3 rue de l\'Industrie', cp: '44000', ville: 'Nantes', specialite: 'Électricité, éclairage' },
      { id: 'f_kiloutou', nom: 'Kiloutou', contact: 'Agence Nantes', tel: '02 40 12 13 14', email: 'nantes@kiloutou.fr', adresse: '15 route de Rennes', cp: '44300', ville: 'Nantes', specialite: 'Location matériel' },
      { id: 'f_gedimat', nom: 'Gedimat Saint-Rémy', contact: 'Accueil', tel: '03 80 44 55 66', email: 'saintremy@gedimat.fr', adresse: 'ZA des Gravieres', cp: '71100', ville: 'Saint-Rémy', specialite: 'Matériaux, outillage' }
    ];

    const articles = [
      { id: 'a_ciment', ref: 'CIM-CEM2', designation: 'Ciment CEM II 35 kg', categorie: 'Gros œuvre', famille: 'Ciment', unite: 'sac', stock: 48, seuil: 80, prixUnitaire: 8.9, fournisseurId: 'f_pointp', emplacement: 'Dépôt A1', bonLivraison: 'BL-' + Y + '-0142', dateLivraison: A(-9) },
      { id: 'a_toutvenant', ref: 'TV-0/31', designation: 'Tout-venant 0/31,5', categorie: 'Granulats', famille: 'Tout-venant', unite: 'm3', stock: 14, seuil: 6, prixUnitaire: 28.5, fournisseurId: 'f_pointp', emplacement: 'Dépôt extérieur', bonLivraison: 'BL-' + Y + '-0151', dateLivraison: A(-12) },
      { id: 'a_brique', ref: 'BRI-12', designation: 'Brique creuse 12 x 20 x 50', categorie: 'Maçonnerie', famille: 'Briques', unite: 'u', stock: 640, seuil: 200, prixUnitaire: 0.95, fournisseurId: 'f_gedimat', emplacement: 'Palette P3', bonLivraison: 'BL-' + Y + '-0287', dateLivraison: A(-16) },
      { id: 'a_treillis', ref: 'TS-ST25', designation: 'Treillis soudé ST25C (panneau)', categorie: 'Armatures', famille: 'Treillis soudé', unite: 'panneau', stock: 45, seuil: 20, prixUnitaire: 32.9, fournisseurId: 'f_pointp', emplacement: 'Dépôt A3', bonLivraison: 'BL-' + Y + '-0143', dateLivraison: A(-9) },
      { id: 'a_sable', ref: 'SAB-0/4', designation: 'Sable 0/4 lavé', categorie: 'Granulats', famille: 'Sable', unite: 'm3', stock: 8, seuil: 4, prixUnitaire: 34, fournisseurId: 'f_pointp', emplacement: 'Dépôt extérieur', bonLivraison: 'BL-' + Y + '-0164', dateLivraison: A(-12) },
      { id: 'a_parpaing', ref: 'PAR-20', designation: 'Parpaing béton 20x20x50', categorie: 'Gros œuvre', famille: 'Briques', unite: 'u', stock: 1250, seuil: 500, prixUnitaire: 1.85, fournisseurId: 'f_pointp', emplacement: 'Extérieur', bonLivraison: 'BL-' + Y + '-0208', dateLivraison: A(-16) },
      { id: 'a_fer', ref: 'FER-HA12', designation: 'Fer à béton HA 12 mm (6 m)', categorie: 'Gros œuvre', famille: 'Divers', unite: 'barre', stock: 320, seuil: 200, prixUnitaire: 12.4, fournisseurId: 'f_pointp', emplacement: 'Dépôt A2' },
      { id: 'a_beton', ref: 'BET-C25', designation: 'Béton prêt à l\'emploi C25/30', categorie: 'Gros œuvre', famille: 'Divers', unite: 'm3', stock: 0, seuil: 0, prixUnitaire: 118, fournisseurId: 'f_pointp', emplacement: 'Livraison directe' },
      { id: 'a_gaine', ref: 'EL-G16', designation: 'Gaine électrique ICTA 16 mm', categorie: 'Électricité', famille: 'Divers', unite: 'm', stock: 780, seuil: 300, prixUnitaire: 0.72, fournisseurId: 'f_rexel', emplacement: 'Dépôt B1', bonLivraison: 'BL-' + Y + '-0312', dateLivraison: A(-12) },
      { id: 'a_cable', ref: 'EL-R2V', designation: 'Câble R2V 3G2.5 mm²', categorie: 'Électricité', famille: 'Divers', unite: 'm', stock: 410, seuil: 250, prixUnitaire: 1.35, fournisseurId: 'f_rexel', emplacement: 'Dépôt B1' },
      { id: 'a_prise', ref: 'EL-P16', designation: 'Prise 16 A encastrée', categorie: 'Électricité', famille: 'Divers', unite: 'u', stock: 96, seuil: 40, prixUnitaire: 4.6, fournisseurId: 'f_rexel', emplacement: 'Dépôt B2' },
      { id: 'a_tube', ref: 'PL-PER16', designation: 'Tube PER 16 mm', categorie: 'Plomberie', famille: 'Divers', unite: 'm', stock: 150, seuil: 100, prixUnitaire: 2.15, fournisseurId: 'f_cedeo', emplacement: 'Dépôt C1', bonLivraison: 'BL-' + Y + '-0405', dateLivraison: A(-18) },
      { id: 'a_raccord', ref: 'PL-COU16', designation: 'Coude PER 16 mm', categorie: 'Plomberie', famille: 'Divers', unite: 'u', stock: 60, seuil: 80, prixUnitaire: 1.9, fournisseurId: 'f_cedeo', emplacement: 'Dépôt C2' },
      { id: 'a_carrelage', ref: 'CAR-60', designation: 'Carrelage grès 60x60 gris', categorie: 'Finitions', famille: 'Divers', unite: 'm2', stock: 230, seuil: 60, prixUnitaire: 24.9, fournisseurId: 'f_gedimat', emplacement: 'Dépôt D' },
      { id: 'a_peinture', ref: 'PEI-BLANC', designation: 'Peinture acrylique blanche 15 L', categorie: 'Finitions', famille: 'Divers', unite: 'seau', stock: 18, seuil: 12, prixUnitaire: 39.9, fournisseurId: 'f_gedimat', emplacement: 'Dépôt D' },
      { id: 'a_isolant', ref: 'ISO-120', designation: 'Panneau isolant 120 mm', categorie: 'Isolation', famille: 'Divers', unite: 'm2', stock: 95, seuil: 150, prixUnitaire: 11.5, fournisseurId: 'f_pointp', emplacement: 'Dépôt E' },
      { id: 'a_echafaudage', ref: 'LOC-ECH', designation: 'Échafaudage roulant (location/semaine)', categorie: 'Location', famille: 'Divers', unite: 'semaine', stock: 2, seuil: 1, prixUnitaire: 185, fournisseurId: 'f_kiloutou', emplacement: 'Chantier' },
      { id: 'a_fermette', ref: 'CHR-FERM', designation: 'Fermette de charpente 8 m', categorie: 'Charpente', famille: 'Divers', unite: 'u', stock: 12, seuil: 20, prixUnitaire: 165, fournisseurId: 'f_gedimat', emplacement: 'Dépôt extérieur' }
    ];

    const mouvements = [
      { id: 'mv1', articleId: 'a_ciment', type: 'Entrée', quantite: 120, date: A(-9), chantierId: 'ch_cedres', motif: 'BC ' + 'BC-' + Y + '-031 — livraison Point.P', prixUnitaire: 8.9, bonLivraison: 'BL-' + Y + '-0142' },
      { id: 'mv2', articleId: 'a_ciment', type: 'Sortie', quantite: 72, date: A(-4), chantierId: 'ch_cedres', motif: 'Coulage dalle niveau 2', prixUnitaire: 8.9 },
      { id: 'mv3', articleId: 'a_parpaing', type: 'Entrée', quantite: 1680, date: A(-16), chantierId: 'ch_ecole', motif: 'Livraison initiale', prixUnitaire: 1.8, bonLivraison: 'BL-' + Y + '-0208' },
      { id: 'mv4', articleId: 'a_parpaing', type: 'Sortie', quantite: 430, date: A(-7), chantierId: 'ch_ecole', motif: 'Élévation murs réfectoire', prixUnitaire: 1.85 },
      { id: 'mv5', articleId: 'a_fermette', type: 'Entrée', quantite: 20, date: A(-20), chantierId: 'ch_cedres', motif: 'Commande charpente bâtiment C', prixUnitaire: 158 },
      { id: 'mv6', articleId: 'a_fermette', type: 'Sortie', quantite: 8, date: A(-6), chantierId: 'ch_cedres', motif: 'Pose bâtiment C (partielle)', prixUnitaire: 165 },
      { id: 'mv7', articleId: 'a_gaine', type: 'Entrée', quantite: 1000, date: A(-12), chantierId: 'ch_cedres', motif: 'Réception Rexel', prixUnitaire: 0.7, bonLivraison: 'BL-' + Y + '-0312' },
      { id: 'mv8', articleId: 'a_cable', type: 'Sortie', quantite: 240, date: A(-3), chantierId: 'ch_cedres', motif: 'Tirage câbles niveau 1', prixUnitaire: 1.35 },
      { id: 'mv9', articleId: 'a_tube', type: 'Entrée', quantite: 300, date: A(-18), chantierId: 'ch_mairie', motif: 'Livraison Cedeo', prixUnitaire: 2.1, bonLivraison: 'BL-' + Y + '-0405' },
      { id: 'mv10', articleId: 'a_isolant', type: 'Sortie', quantite: 55, date: A(-2), chantierId: 'ch_mairie', motif: 'ITÉ façade sud', prixUnitaire: 11.5 },
      { id: 'mv11', articleId: 'a_raccord', type: 'Entrée', quantite: 120, date: A(-15), chantierId: 'ch_ecole', motif: 'Livraison Cedeo', prixUnitaire: 1.85 },
      { id: 'mv12', articleId: 'a_raccord', type: 'Sortie', quantite: 60, date: A(-5), chantierId: 'ch_ecole', motif: 'Alimentation sanitaires', prixUnitaire: 1.9 }
    ];

    const devis = [
      {
        id: 'dv1', numero: 'DV-' + Y + '-014', chantierId: 'ch_cedres', client: 'SCI Les Cèdres', date: A(-120), validite: A(-90), statut: 'Accepté', tva: 10, remise: 3, notes: 'Offre pour la construction des 12 logements, hors VRD et aménagements extérieurs.',
        lignes: [
          { designation: 'Installation de chantier et clôtures', unite: 'forfait', quantite: 1, pu: 12500 },
          { designation: 'Terrassement et évacuation des terres', unite: 'm3', quantite: 850, pu: 32 },
          { designation: 'Fondations et radier béton armé', unite: 'm3', quantite: 240, pu: 185 },
          { designation: 'Structure béton armé (poteaux, voiles, planchers)', unite: 'm2', quantite: 1450, pu: 210 },
          { designation: 'Maçonnerie et cloisons', unite: 'm2', quantite: 980, pu: 85 },
          { designation: 'Charpente et couverture', unite: 'm2', quantite: 620, pu: 145 }
        ]
      },
      {
        id: 'dv2', numero: 'DV-' + Y + '-018', chantierId: 'ch_ecole', client: 'Ville de Nantes', date: A(-40), validite: A(-10), statut: 'Accepté', tva: 20, remise: 0, notes: 'Extension de 4 classes et réfectoire. Travaux en site occupé, horaires contraints.',
        lignes: [
          { designation: 'Installation et protections de chantier', unite: 'forfait', quantite: 1, pu: 8500 },
          { designation: 'Terrassement et fondations', unite: 'm3', quantite: 180, pu: 42 },
          { designation: 'Murs préfabriqués et planchers', unite: 'm2', quantite: 520, pu: 195 },
          { designation: 'Charpente métallique et couverture', unite: 'm2', quantite: 310, pu: 168 },
          { designation: 'Lots techniques (élec, plomberie, CVC)', unite: 'forfait', quantite: 1, pu: 148000 },
          { designation: 'Aménagements intérieurs et finitions', unite: 'forfait', quantite: 1, pu: 72000 }
        ]
      },
      {
        id: 'dv3', numero: 'DV-' + Y + '-021', chantierId: 'ch_mairie', client: 'Commune de Saint-Rémy', date: A(-15), validite: A(15), statut: 'Envoyé', tva: 20, remise: 0, notes: 'Variante avec isolation biosourcée disponible sur demande.',
        lignes: [
          { designation: 'Démolition et dépose', unite: 'forfait', quantite: 1, pu: 24000 },
          { designation: 'Isolation thermique par l\'extérieur', unite: 'm2', quantite: 420, pu: 138 },
          { designation: 'Remplacement des menuiseries', unite: 'u', quantite: 34, pu: 1250 },
          { designation: 'Électricité et chauffage', unite: 'forfait', quantite: 1, pu: 86000 },
          { designation: 'Finitions et peinture', unite: 'm2', quantite: 680, pu: 38 }
        ]
      },
      {
        id: 'dv4', numero: 'DV-' + Y + '-009', chantierId: 'ch_agence', client: 'Banque Populaire', date: A(-220), validite: A(-190), statut: 'Accepté', tva: 20, remise: 2, notes: 'Rénovation de l\'agence, travaux de nuit.',
        lignes: [
          { designation: 'Démolition / cloisons / plafonds', unite: 'forfait', quantite: 1, pu: 45000 },
          { designation: 'Électricité et courants faibles', unite: 'forfait', quantite: 1, pu: 38000 },
          { designation: 'Peinture et revêtements de sol', unite: 'm2', quantite: 560, pu: 72 },
          { designation: 'Mobilier sur mesure et signalétique', unite: 'forfait', quantite: 1, pu: 52000 }
        ]
      }
    ];

    const commandes = [
      {
        id: 'bc1', numero: 'BC-' + Y + '-031', fournisseurId: 'f_pointp', chantierId: 'ch_cedres', date: A(-10), dateLivraison: A(-8), statut: 'Livré', tva: 20, notes: 'Livraison sur chantier — accès par l\'avenue des Cèdres.',
        lignes: [
          { designation: 'Ciment CEM II 35 kg', unite: 'sac', quantite: 120, pu: 8.9 },
          { designation: 'Parpaing béton 20x20x50', unite: 'u', quantite: 600, pu: 1.85 },
          { designation: 'Fer à béton HA 12 (6 m)', unite: 'barre', quantite: 80, pu: 12.4 }
        ]
      },
      {
        id: 'bc2', numero: 'BC-' + Y + '-032', fournisseurId: 'f_rexel', chantierId: 'ch_ecole', date: A(-6), dateLivraison: A(4), statut: 'Envoyé', tva: 20, notes: 'Livraison au dépôt de chantier, contact Sophie Marchand.',
        lignes: [
          { designation: 'Gaine ICTA 16 mm', unite: 'm', quantite: 500, pu: 0.72 },
          { designation: 'Câble R2V 3G2.5', unite: 'm', quantite: 400, pu: 1.35 },
          { designation: 'Prise 16 A encastrée', unite: 'u', quantite: 48, pu: 4.6 }
        ]
      },
      {
        id: 'bc3', numero: 'BC-' + Y + '-033', fournisseurId: 'f_cedeo', chantierId: 'ch_cedres', date: A(-2), dateLivraison: A(5), statut: 'Brouillon', tva: 20, notes: 'Compléter les quantités après métré.',
        lignes: [
          { designation: 'Tube PER 16 mm', unite: 'm', quantite: 200, pu: 2.15 },
          { designation: 'Coude PER 16 mm', unite: 'u', quantite: 100, pu: 1.9 }
        ]
      }
    ];

    const sousTraitants = [
      { id: 'st_elec', nom: 'Élec\'Pro', specialite: 'Électricité, courants faibles', contact: 'Marc Aubert', tel: '05 56 99 88 77', email: 'm.aubert@elecpro.fr', adresse: '5 rue du Voltage', cp: '33100', ville: 'Bordeaux', siret: '745 812 963 00014', assurance: A(45), assuranceNum: 'AXA 45-812-963', tva: 20 },
      { id: 'st_plom', nom: 'Plomberie Duval', specialite: 'Plomberie, CVC', contact: 'Sébastien Duval', tel: '02 40 33 22 11', email: 'contact@plomberie-duval.fr', adresse: '12 rue des Tuyaux', cp: '44300', ville: 'Nantes', siret: '812 745 963 00028', assurance: A(200), assuranceNum: 'MAAF 887-412', tva: 20 },
      { id: 'st_toit', nom: 'SARL Toiture Ouest', specialite: 'Charpente, couverture, étanchéité', contact: 'Yann Le Goff', tel: '02 99 88 77 66', email: 'yann@toiture-ouest.fr', adresse: 'ZA de la Lande', cp: '35700', ville: 'Rennes', siret: '663 214 589 00017', assurance: A(-12), assuranceNum: 'Groupama 556-998', tva: 20 }
    ];

    const situations = [
      {
        id: 'sit1', numero: 'SIT-' + Y + '-008', sousTraitantId: 'st_elec', chantierId: 'ch_cedres', date: A(-14), periode: monthYear(A(-45)), statut: 'À valider', tva: 20, retenue: 5, notes: 'Situation n°8 — travaux électriques niveaux 1 et 2.',
        lignes: [
          { designation: 'Installation électrique logements', montantMarche: 185000, pctPrecedent: 55, pctCumule: 70 },
          { designation: 'Colonnes montantes', montantMarche: 42000, pctPrecedent: 60, pctCumule: 80 },
          { designation: 'Éclairage extérieur', montantMarche: 18500, pctPrecedent: 0, pctCumule: 35 }
        ]
      },
      {
        id: 'sit2', numero: 'SIT-' + Y + '-009', sousTraitantId: 'st_plom', chantierId: 'ch_ecole', date: A(-4), periode: monthYear(A(-35)), statut: 'Validée', tva: 20, retenue: 5, notes: 'Situation n°3 — alimentation sanitaires et réfectoire.',
        lignes: [
          { designation: 'Alimentation sanitaires', montantMarche: 46000, pctPrecedent: 30, pctCumule: 65 },
          { designation: 'Réseaux CVC réfectoire', montantMarche: 82000, pctPrecedent: 10, pctCumule: 25 }
        ]
      },
      {
        id: 'sit3', numero: 'SIT-' + Y + '-005', sousTraitantId: 'st_toit', chantierId: 'ch_mairie', date: A(-45), periode: monthYear(A(-75)), statut: 'Payée', tva: 20, retenue: 5, notes: 'Situation n°1 — dépose et préparation des supports.',
        lignes: [
          { designation: 'Dépose couverture existante', montantMarche: 28000, pctPrecedent: 0, pctCumule: 100 },
          { designation: 'Préparation supports étanchéité', montantMarche: 35000, pctPrecedent: 0, pctCumule: 40 }
        ]
      }
    ];

    const decomptes = [
      {
        id: 'dec1', numero: 'DEC-' + Y + '-005', chantierId: 'ch_cedres', client: 'SCI Les Cèdres', date: A(-25), periode: monthYear(A(-40)), statut: 'Envoyé', tva: 10, retenue: 5, notes: 'Décompte n°5 — travaux réalisés jusqu\'au 30 du mois.',
        lignes: [
          { designation: 'Terrassement et évacuation', unite: 'm3', quantite: 850, pu: 32, avancement: 100 },
          { designation: 'Fondations et radier', unite: 'm3', quantite: 240, pu: 185, avancement: 100 },
          { designation: 'Structure béton armé', unite: 'm2', quantite: 1450, pu: 210, avancement: 62 },
          { designation: 'Maçonnerie et cloisons', unite: 'm2', quantite: 980, pu: 85, avancement: 30 }
        ]
      },
      {
        id: 'dec2', numero: 'DEC-' + Y + '-006', chantierId: 'ch_ecole', client: 'Ville de Nantes', date: A(-8), periode: monthYear(A(-30)), statut: 'Brouillon', tva: 20, retenue: 5, notes: 'À compléter avec les travaux de la semaine.',
        lignes: [
          { designation: 'Installation et protections', unite: 'forfait', quantite: 1, pu: 8500, avancement: 100 },
          { designation: 'Terrassement et fondations', unite: 'm3', quantite: 180, pu: 42, avancement: 100 },
          { designation: 'Murs préfabriqués et planchers', unite: 'm2', quantite: 520, pu: 195, avancement: 70 },
          { designation: 'Charpente métallique', unite: 'm2', quantite: 310, pu: 168, avancement: 10 }
        ]
      },
      {
        id: 'dec3', numero: 'DEC-' + Y + '-004', chantierId: 'ch_cedres', client: 'SCI Les Cèdres', date: A(-70), periode: monthYear(A(-85)), statut: 'Payé', tva: 10, retenue: 5, notes: 'Décompte n°4 — validé et payé.',
        lignes: [
          { designation: 'Installation de chantier', unite: 'forfait', quantite: 1, pu: 12500, avancement: 100 },
          { designation: 'Terrassement et évacuation', unite: 'm3', quantite: 850, pu: 32, avancement: 65 },
          { designation: 'Fondations et radier', unite: 'm3', quantite: 240, pu: 185, avancement: 40 }
        ]
      }
    ];

    const documents = [
      { id: 'doc1', nom: 'Marché de travaux — Résidence Les Cèdres', categorie: 'Contrat', rubrique: 'Maître d\'ouvrage', chantierId: 'ch_cedres', date: A(-160), version: '1.0', statut: 'Validé', dateExpiration: A(400), lien: '', notes: 'Marché signé avec la SCI Les Cèdres. Lot unique.', fichier: null },
      { id: 'doc2', nom: 'Plan masse — indice C', categorie: 'Plan', rubrique: 'Bureau d\'étude', chantierId: 'ch_cedres', date: A(-90), version: 'C', statut: 'Validé', dateExpiration: '', lien: '', notes: 'Intègre les modifications de voirie demandées par la mairie.', fichier: null },
      { id: 'doc3', nom: 'PV de réception gros œuvre', categorie: 'PV', rubrique: 'Divers', chantierId: 'ch_cedres', date: A(-30), version: '1.0', statut: 'Validé', dateExpiration: '', lien: '', notes: 'Réception avec 3 réserves mineures levées depuis.', fichier: null },
      { id: 'doc4', nom: 'Attestation assurance décennale — Toiture Ouest', categorie: 'Assurance', rubrique: 'Divers', chantierId: 'ch_mairie', date: A(-320), version: '2025', statut: 'Validé', dateExpiration: A(30), lien: '', notes: 'À renouveler avant le démarrage de la couverture.', fichier: null },
      { id: 'doc5', nom: 'Facture Point.P n°2026-8812', categorie: 'Facture', rubrique: 'Divers', chantierId: 'ch_cedres', date: A(-8), version: '1.0', statut: 'À valider', dateExpiration: '', lien: '', notes: 'Facture correspondant au BC ' + 'BC-' + Y + '-031.', fichier: null },
      { id: 'doc6', nom: 'Étude de sol — Groupe scolaire', categorie: 'Étude', rubrique: 'Laboratoire', chantierId: 'ch_ecole', date: A(-140), version: '2.0', statut: 'Validé', dateExpiration: '', lien: '', notes: 'Préconisations de fondations superficielles.', fichier: null },
      { id: 'doc7', nom: 'Relevé topographique initial', categorie: 'Plan', rubrique: 'Topographe', chantierId: 'ch_cedres', date: A(-155), version: '1.0', statut: 'Validé', dateExpiration: '', lien: '', notes: 'Relevé de l\'état des lieux avant terrassement.', fichier: null },
      { id: 'doc8', nom: 'Rapport d\'essais béton — semelles', categorie: 'Étude', rubrique: 'Laboratoire', chantierId: 'ch_ecole', date: A(-120), version: '1.0', statut: 'Validé', dateExpiration: '', lien: '', notes: 'Résultats de résistance conformes au CCTP.', fichier: null }
    ];

    const personnel = demoPersonnel();

    return {
      version: STORE_VERSION,
      settings: defaultSettings(),
      chantiers: chantiers,
      taches: taches,
      avancements: avancements,
      fournisseurs: fournisseurs,
      articles: articles,
      mouvements: mouvements,
      devis: devis,
      commandes: commandes,
      sousTraitants: sousTraitants,
      situations: situations,
      decomptes: decomptes,
      documents: documents,
      personnel: personnel,
      essaisBeton: demoEssaisBeton()
    };
  }

  /* ---------------- Stockage ---------------- */
  const db = (App.db = {
    data: null,
    get: function (coll) {
      if (!this.data) this.load();
      if (!Array.isArray(this.data[coll])) this.data[coll] = [];
      return this.data[coll];
    },
    find: function (coll, id) { return this.get(coll).find(function (x) { return x.id === id; }) || null; },
    upsert: function (coll, row) {
      const arr = this.get(coll);
      const i = arr.findIndex(function (x) { return x.id === row.id; });
      if (i >= 0) arr[i] = Object.assign({}, arr[i], row);
      else arr.push(row);
      this.persist();
      return row;
    },
    remove: function (coll, id) {
      const arr = this.get(coll);
      const i = arr.findIndex(function (x) { return x.id === id; });
      if (i >= 0) arr.splice(i, 1);
      this.persist();
    },
    persist: function () {
      try {
        localStorage.setItem(KEY, JSON.stringify(this.data));
      } catch (e) {
        console.error(e);
        App.toast('Stockage saturé. Exportez puis allégez les pièces jointes.', 'err', 5000);
      }
    },
    load: function () {
      let raw = null;
      try { raw = localStorage.getItem(KEY); } catch (e) { console.warn(e); }
      if (raw) {
        try {
          this.data = JSON.parse(raw);
        } catch (e) {
          console.warn('Données illisibles, réinitialisation.', e);
          this.data = null;
        }
      }
      if (!this.data || !this.data.settings) {
        /* Premier démarrage : base vide. Le jeu de démonstration reste accessible
           via le bouton « Recharger la démonstration » ou l'adresse ?demo=1. */
        let demo = false;
        try { demo = /(?:^|[?&])demo=1(?:&|$)/.test(location.search || ''); } catch (e) {}
        this.data = demo ? seed() : emptyStore();
        this.persist();
      }
      const before = this.data.version;
      migrate(this.data);
      COLLECTIONS.forEach(function (c) { if (!Array.isArray(db.data[c])) db.data[c] = []; });
      if (before !== this.data.version) this.persist();
      return this.data;
    },
    reset: function () {
      const sec = this.data && this.data.security;
      this.data = seed();
      if (sec) this.data.security = sec;
      this.persist();
    },
    wipe: function () {
      const sec = this.data && this.data.security;
      const settings = this.data && this.data.settings ? this.data.settings : defaultSettings();
      this.data = { version: STORE_VERSION, settings: settings };
      if (sec) this.data.security = sec;
      COLLECTIONS.forEach(function (c) { db.data[c] = []; });
      this.persist();
    }
  });

  /* ---------------- Libellés et listes de référence ---------------- */
  App.settings = function () { return db.data.settings; };

  App.docRubriques = function () {
    const s = App.settings();
    if (!Array.isArray(s.docRubriques) || !s.docRubriques.length) s.docRubriques = defaultDocRubriques();
    return s.docRubriques;
  };

  App.docRubrique = function (doc) {
    const v = doc && doc.rubrique ? String(doc.rubrique).trim() : '';
    return v || 'Divers';
  };

  /* Sous-onglets du stock : familles de matériaux (ciment, sable, briques…). */
  App.stockFamilles = function () {
    const s = App.settings();
    if (!Array.isArray(s.stockFamilles) || !s.stockFamilles.length) s.stockFamilles = defaultStockFamilles();
    return s.stockFamilles;
  };

  App.stockFamille = function (art) {
    const v = art && art.famille ? String(art.famille).trim() : '';
    return v || 'Divers';
  };

  /* Références d'opération : tranche de travaux et code GH. */
  App.chantierRefs = function (ch) {
    if (!ch) return '';
    return [ch.tranche, ch.gh].map(function (v) { return String(v || '').trim(); })
      .filter(Boolean).join(' · ');
  };

  /* Tranches disponibles (chantiers et tâches) et tranche d'une tâche. */
  App.tranches = function () {
    const names = {};
    function add(v) { v = String(v || '').trim(); if (v) names[v] = true; }
    (App.db.get('chantiers') || []).forEach(function (c) { add(c.tranche); });
    (App.db.get('taches') || []).forEach(function (t) { add(t.tranche); });
    return Object.keys(names).sort(function (a, b) {
      return a.localeCompare(b, 'fr', { numeric: true, sensitivity: 'base' });
    });
  };
  App.trancheOf = function (t) {
    if (!t) return '';
    const direct = String(t.tranche || '').trim();
    if (direct) return direct;
    const ch = App.db.find('chantiers', t.chantierId);
    return ch ? String(ch.tranche || '').trim() : '';
  };

  /* Programme d'un chantier : type d'immeuble et nombres de lots construits. */
  App.chantierProgramme = function (ch) {
    if (!ch) return '';
    const parts = [];
    if (ch.typeImmeuble) parts.push(String(ch.typeImmeuble));
    const imm = App.n(ch.nbImmeubles);
    if (imm) parts.push(imm + (imm > 1 ? ' immeubles' : ' immeuble'));
    const apt = App.n(ch.nbAppartements);
    if (apt) parts.push(apt + (apt > 1 ? ' appartements' : ' appartement'));
    const mag = App.n(ch.nbMagasins);
    if (mag) parts.push(mag + (mag > 1 ? ' magasins' : ' magasin'));
    return parts.join(' · ');
  };

  App.avancement = function (ch) {
    const lots = ch && ch.lots ? ch.lots : [];
    if (!lots.length) return App.clamp(App.n(ch && ch.avancement), 0, 100);
    const poids = App.sum(lots, function (l) { return l.poids; });
    if (poids <= 0) return App.sum(lots, function (l) { return l.avancement; }) / lots.length;
    return App.sum(lots, function (l) { return App.n(l.poids) * App.clamp(App.n(l.avancement), 0, 100); }) / poids;
  };

  App.labelFor = function (coll, rowOrId) {
    const row = typeof rowOrId === 'string' ? db.find(coll, rowOrId) : rowOrId;
    if (!row) return '—';
    switch (coll) {
      case 'chantiers': return (row.code ? row.code + ' — ' : '') + (row.nom || '');
      case 'fournisseurs': return row.nom || '';
      case 'sousTraitants': return row.nom || '';
      case 'personnel': return (row.nom || '') + (row.fonction ? ' — ' + row.fonction : '');
      case 'articles': return (row.ref ? row.ref + ' — ' : '') + (row.designation || '');
      case 'devis': return (row.numero || '') + (row.client ? ' — ' + row.client : '');
      case 'commandes': return (row.numero || '') + (row.fournisseurId ? ' — ' + App.labelFor('fournisseurs', row.fournisseurId) : '');
      case 'situations': return (row.numero || '') + (row.sousTraitantId ? ' — ' + App.labelFor('sousTraitants', row.sousTraitantId) : '');
      case 'decomptes': return (row.numero || '') + (row.client ? ' — ' + row.client : '');
      case 'essaisBeton': return (row.reference || '') + (row.typeBeton ? (row.reference ? ' — ' : '') + row.typeBeton : '');
      default: return row.nom || row.numero || row.designation || row.id;
    }
  };

  App.refOptions = function (coll) {
    return db.get(coll).map(function (r) { return { value: r.id, label: App.labelFor(coll, r) }; })
      .sort(function (a, b) { return a.label.localeCompare(b.label, 'fr'); });
  };

  App.chantierLabel = function (id) { return id ? App.labelFor('chantiers', id) : '—'; };

  App.rowText = function (key, row) {
    const parts = [];
    Object.keys(row).forEach(function (k) {
      const v = row[k];
      if (v && typeof v === 'object') return;
      parts.push(v == null ? '' : String(v));
    });
    ['chantierId', 'fournisseurId', 'sousTraitantId', 'articleId'].forEach(function (k) {
      if (row[k]) {
        const c = { chantierId: 'chantiers', fournisseurId: 'fournisseurs', sousTraitantId: 'sousTraitants', articleId: 'articles' }[k];
        parts.push(App.labelFor(c, row[k]));
      }
    });
    return parts.join(' ').toLowerCase();
  };

  /* ---------------- Calculs financiers ---------------- */
  App.calc = {
    devis: function (d) {
      const htBrut = App.sum(d.lignes || [], function (r) { return App.n(r.quantite) * App.n(r.pu); });
      const remisePct = App.clamp(App.n(d.remise), 0, 100);
      const remise = htBrut * remisePct / 100;
      const ht = htBrut - remise;
      const tva = ht * App.n(d.tva) / 100;
      return { htBrut: htBrut, remise: remise, ht: ht, tva: tva, ttc: ht + tva };
    },
    commande: function (c) {
      const ht = App.sum(c.lignes || [], function (r) { return App.n(r.quantite) * App.n(r.pu); });
      const tva = ht * App.n(c.tva) / 100;
      return { ht: ht, tva: tva, ttc: ht + tva };
    },
    decompte: function (d) {
      const ht = App.sum(d.lignes || [], function (r) { return App.n(r.quantite) * App.n(r.pu) * App.clamp(App.n(r.avancement), 0, 100) / 100; });
      const retenue = ht * App.clamp(App.n(d.retenue), 0, 100) / 100;
      const tva = ht * App.n(d.tva) / 100;
      return { ht: ht, retenue: retenue, tva: tva, ttc: ht + tva, net: ht + tva - retenue };
    },
    situation: function (s) {
      const marche = App.sum(s.lignes || [], function (r) { return App.n(r.montantMarche); });
      const cumul = App.sum(s.lignes || [], function (r) { return App.n(r.montantMarche) * App.clamp(App.n(r.pctCumule), 0, 100) / 100; });
      const precedent = App.sum(s.lignes || [], function (r) { return App.n(r.montantMarche) * App.clamp(App.n(r.pctPrecedent), 0, 100) / 100; });
      const periode = cumul - precedent;
      const retenue = periode * App.clamp(App.n(s.retenue), 0, 100) / 100;
      const tva = periode * App.n(s.tva) / 100;
      return { marche: marche, cumul: cumul, precedent: precedent, periode: periode, retenue: retenue, tva: tva, net: periode + tva - retenue };
    },
    situationPct: function (s) {
      const m = App.sum(s.lignes || [], function (r) { return App.n(r.montantMarche); });
      if (!m) return 0;
      const c = App.sum(s.lignes || [], function (r) { return App.n(r.montantMarche) * App.clamp(App.n(r.pctCumule), 0, 100) / 100; });
      return c / m * 100;
    }
  };

  /* ---------------- Stock ---------------- */
  App.addMouvement = function (mv, articleId, type, quantite, date, chantierId, motif, prixUnitaire, bonLivraison) {
    const art = db.find('articles', articleId);
    if (!art) { App.toast('Article introuvable.', 'err'); return; }
    const row = mv || {
      id: uid('mv'), articleId: articleId, type: type, quantite: App.n(quantite),
      date: date || todayISO(), chantierId: chantierId || '', motif: motif || '', prixUnitaire: App.n(prixUnitaire),
      bonLivraison: bonLivraison || ''
    };
    db.upsert('mouvements', row);
    art.stock = App.n(art.stock) + (row.type === 'Entrée' ? App.n(row.quantite) : -App.n(row.quantite));
    if (row.prixUnitaire) art.prixUnitaire = App.n(row.prixUnitaire);
    db.persist();
  };

  App.deleteMouvement = function (id) {
    const mv = db.find('mouvements', id);
    if (!mv) return;
    const art = db.find('articles', mv.articleId);
    if (art) art.stock = App.n(art.stock) - (mv.type === 'Entrée' ? App.n(mv.quantite) : -App.n(mv.quantite));
    db.remove('mouvements', id);
    db.persist();
  };

  App.stockValeur = function () {
    return App.sum(db.get('articles'), function (a) { return App.n(a.stock) * App.n(a.prixUnitaire); });
  };

  /* ---------------- Alertes ---------------- */
  App.alerts = function () {
    const out = [];
    db.get('articles').forEach(function (a) {
      if (App.n(a.stock) <= App.n(a.seuil)) {
        out.push({
          level: App.n(a.stock) === 0 ? 'danger' : 'warn', kind: 'Stock',
          icon: 'box', title: a.designation,
          detail: 'Stock ' + App.num(a.stock) + ' ' + (a.unite || '') + ' — seuil ' + App.num(a.seuil),
          route: '#/stock'
        });
      }
    });
    db.get('taches').forEach(function (t) {
      if (t.statut !== 'Terminé' && t.fin && App.daysTo(t.fin) < 0) {
        out.push({
          level: 'danger', kind: 'Planning', icon: 'calendar', title: t.nom,
          detail: 'En retard de ' + Math.abs(App.daysTo(t.fin)) + ' j — ' + App.chantierLabel(t.chantierId),
          route: '#/planning'
        });
      }
    });
    db.get('situations').forEach(function (s) {
      if (s.statut === 'À valider') {
        out.push({
          level: 'warn', kind: 'Sous-traitance', icon: 'users', title: s.numero + ' — ' + App.labelFor('sousTraitants', s.sousTraitantId),
          detail: 'Situation à valider : ' + App.money(App.calc.situation(s).periode) + ' HT',
          route: '#/situations'
        });
      }
    });
    db.get('documents').forEach(function (d) {
      if (d.dateExpiration) {
        const j = App.daysTo(d.dateExpiration);
        if (j < 0) out.push({ level: 'danger', kind: 'Document', icon: 'file', title: d.nom, detail: 'Expiré depuis ' + Math.abs(j) + ' j', route: '#/documents' });
        else if (j <= 30) out.push({ level: 'warn', kind: 'Document', icon: 'file', title: d.nom, detail: 'Expire dans ' + j + ' j', route: '#/documents' });
      }
    });
    db.get('chantiers').forEach(function (c) {
      if (c.statut === 'En cours' && c.dateFin && App.daysTo(c.dateFin) < 0) {
        out.push({ level: 'danger', kind: 'Chantier', icon: 'hammer', title: c.nom, detail: 'Dépassement de la date de fin prévue', route: '#/chantier/' + c.id });
      }
    });
    const order = { danger: 0, warn: 1, info: 2 };
    return out.sort(function (a, b) { return order[a.level] - order[b.level]; });
  };

  App.docStatut = function (d) {
    if (d.dateExpiration) {
      const j = App.daysTo(d.dateExpiration);
      if (j < 0) return 'Expiré';
      if (j <= 30) return 'Expire bientôt';
    }
    return d.statut || 'Validé';
  };

  /* ---------------- Numérotation ---------------- */
  App.nextNumber = function (prefix, coll) {
    const year = new Date().getFullYear();
    let max = 0;
    db.get(coll).forEach(function (r) {
      const m = String(r.numero || '').match(new RegExp('^' + prefix + '-' + year + '-(\\d+)$'));
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return prefix + '-' + year + '-' + String(max + 1).padStart(3, '0');
  };

  /* ---------------- Sauvegarde / restauration ---------------- */
  App.exportJSON = function () {
    const copy = JSON.parse(JSON.stringify(db.data));
    delete copy.security; /* le mot de passe ne figure jamais dans une sauvegarde */
    const data = JSON.stringify(copy, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sosmajed-sauvegarde-' + todayISO() + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    App.toast('Sauvegarde exportée.');
  };

  App.importJSON = function (file) {
    return new Promise(function (resolve, reject) {
      const fr = new FileReader();
      fr.onload = function () {
        try {
          const obj = JSON.parse(fr.result);
          if (!obj || typeof obj !== 'object' || !obj.settings) throw new Error('Format invalide');
          const sec = db.data && db.data.security;
          if (!Array.isArray(obj.personnel)) obj.personnel = [];
          if (!Array.isArray(obj.essaisBeton)) obj.essaisBeton = [];
          db.data = migrate(obj);
          delete db.data.security; /* on conserve le verrouillage de ce navigateur */
          if (sec) db.data.security = sec;
          COLLECTIONS.forEach(function (c) { if (!Array.isArray(db.data[c])) db.data[c] = []; });
          db.persist();
          resolve(true);
        } catch (e) { reject(e); }
      };
      fr.onerror = function () { reject(new Error('Lecture impossible')); };
      fr.readAsText(file);
    });
  };

  App.storageInfo = function () {
    let size = 0;
    try { size = (localStorage.getItem(KEY) || '').length; } catch (e) { size = 0; }
    return { octets: size * 2, texte: App.fileSize(size * 2) };
  };

  App.deleteRow = async function (coll, id) {
    const ent = App.entities[coll];
    const label = ent ? ent.singular || 'élément' : 'élément';
    const ok = await App.confirm({
      title: 'Supprimer ' + label.toLowerCase(),
      message: 'Cette suppression est définitive. Les éléments liés ne seront pas supprimés automatiquement.',
      confirmLabel: 'Supprimer'
    });
    if (!ok) return;
    if (App.security && !(await App.security.confirmWrite('Supprimer ' + label.toLowerCase()))) return;
    if (coll === 'chantiers') {
      const ch = db.find('chantiers', id);
      if (ch) {
        db.get('taches').forEach(function (t) { if (t.chantierId === id) t.chantierId = ''; });
        db.get('avancements').forEach(function (a) { if (a.chantierId === id) a.chantierId = ''; });
      }
    }
    db.remove(coll, id);
    App.toast(label + ' supprimé.');
    App.refresh();
  };

  App.refresh = function () { if (App.render) App.render(); };
})();
