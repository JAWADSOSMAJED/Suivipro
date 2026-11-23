/* =========================================================
   ChantierPro — qualité : essais béton (7 et 28 jours)
   ========================================================= */
(function () {
  'use strict';
  const App = window.App;
  const { esc, num, n, el, fmtDate, badgeHTML, addDays, todayISO } = App;

  const TYPES_BETON = ['C20/25', 'C25/30', 'C30/37', 'C35/45', 'C40/50', 'C45/55', 'C50/60', 'Béton auto-plaçant', 'Béton de forme', 'Mortier', 'Autre'];

  function cible(e) { return n(e.resistanceCible); }

  /* Statut déduit : résultat 28 jours comparé à la résistance cible. */
  function statutEssai(e) {
    if (!n(e.resultat28)) return 'En attente';
    const c = cible(e);
    if (!c) return '';
    return n(e.resultat28) >= c ? 'Conforme' : 'Non conforme';
  }

  function echeance28(e) { return e.datePrelevement ? addDays(e.datePrelevement, 28) : ''; }

  /* Exposés pour le rapport imprimable (docs-print.js). */
  App.essaiBetonStatut = statutEssai;
  App.essaiBetonEcheance = echeance28;

  function mpa(v) {
    return v == null || v === '' || !n(v) ? '<span class="muted">—</span>' : '<b>' + esc(num(v)) + '</b> <small>MPa</small>';
  }

  /* Un prélèvement comporte souvent plusieurs éprouvettes : on accepte une liste. */
  function serieList(v) {
    return String(v || '').split(/[,;\u00b7\/\n]+/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  App.entity('essaisBeton', {
    singular: 'Essai béton',
    printTitle: 'Essais béton',
    sortKey: 'datePrelevement',
    sortDir: -1,
    cols: [
      {
        k: 'datePrelevement', l: 'Prélèvement', type: 'date',
        render: function (r) {
          const d = r.datePrelevement ? '<b>' + esc(fmtDate(r.datePrelevement)) + '</b>' : '<span class="muted">—</span>';
          const h = r.heureCoulage ? ' <span class="heure">à ' + esc(r.heureCoulage) + '</span>' : '';
          return d + h +
            (r.reference ? '<div class="sub">' + esc(r.reference) + '</div>' : '');
        },
        sortValue: function (r) { return (r.datePrelevement || '') + ' ' + (r.heureCoulage || ''); }
      },
      {
        k: 'chantierId', l: 'Chantier',
        render: function (r) { return r.chantierId ? esc(App.chantierLabel(r.chantierId)) : '<span class="muted">—</span>'; },
        sortValue: function (r) { return App.chantierLabel(r.chantierId); }
      },
      {
        k: 'typeBeton', l: 'Type de béton',
        render: function (r) {
          return (r.typeBeton ? '<strong>' + esc(r.typeBeton) + '</strong>' : '<span class="muted">—</span>') +
            (r.ouvrage ? '<div class="sub">' + esc(r.ouvrage) + '</div>' : '');
        }
      },
      {
        k: 'eprouvettes', l: 'N° éprouvettes',
        render: function (r) {
          const list = serieList(r.eprouvettes);
          if (!list.length) return '<span class="muted">—</span>';
          return '<span class="serie">' + list.map(function (s) { return esc(s); }).join(' · ') + '</span>';
        },
        sortValue: function (r) { return serieList(r.eprouvettes).join(' '); }
      },
      {
        k: 'resistanceCible', l: 'Cible', align: 'right', type: 'number',
        render: function (r) { return mpa(r.resistanceCible); }
      },
      {
        k: 'resultat7', l: '7 jours', align: 'right',
        render: function (r) {
          const v = n(r.resultat7);
          if (!v) return '<span class="muted">—</span>';
          const r28 = n(r.resultat28);
          return mpa(r.resultat7) + (r28 ? '<div class="sub">' + Math.round(v / r28 * 100) + ' % du 28 j</div>' : '');
        },
        sortValue: function (r) { return n(r.resultat7); }
      },
      {
        k: 'resultat28', l: '28 jours', align: 'right',
        render: function (r) {
          if (n(r.resultat28)) return mpa(r.resultat28);
          const d = echeance28(r);
          return '<span class="muted">En attente</span>' + (d ? '<div class="sub">attendu le ' + esc(fmtDate(d)) + '</div>' : '');
        },
        sortValue: function (r) { return n(r.resultat28); }
      },
      {
        k: 'statut', l: 'Conformité',
        render: function (r) {
          const s = statutEssai(r);
          const d = echeance28(r);
          return (s ? badgeHTML(s) : '<span class="muted">—</span>') +
            (d ? '<div class="sub">échéance 28 j : ' + esc(fmtDate(d)) + '</div>' : '');
        },
        sortValue: function (r) { return statutEssai(r); }
      }
    ],
    fields: [
      { k: 'datePrelevement', l: 'Date de prélèvement', type: 'date', required: true },
      {
        k: 'heureCoulage', l: 'Heure de coulage', type: 'time',
        hint: 'Heure de début du coulage (ex. 08:30).'
      },
      { k: 'reference', l: 'Référence / n° de PV', placeholder: 'PV LAB-2026-1042' },
      {
        k: 'eprouvettes', l: 'N° de série des éprouvettes', full: true,
        placeholder: 'A-1201, A-1202, A-1203',
        hint: 'Un ou plusieurs numéros, séparés par des virgules. Ils apparaissent dans la liste et la recherche.'
      },
      { k: 'chantierId', l: 'Chantier', type: 'select', ref: 'chantiers', full: true },
      {
        k: 'typeBeton', l: 'Type de béton', type: 'select', options: TYPES_BETON,
        hint: 'Classe de résistance du béton commandé (ex. C25/30).'
      },
      {
        k: 'resistanceCible', l: 'Résistance cible à 28 j', type: 'number', step: '0.5', min: 0,
        hint: 'Valeur attendue en MPa (cylindre). Sert au calcul de conformité.'
      },
      { k: 'ouvrage', l: 'Ouvrage / localisation', full: true, placeholder: 'Voiles R+1, semelles filantes, plancher haut…' },
      { k: 'fournisseurId', l: 'Centrale / fournisseur', type: 'select', ref: 'fournisseurs' },
      { k: 'laboratoire', l: 'Laboratoire', placeholder: 'Laboratoire Geotec' },
      { k: 'volume', l: 'Volume coulé (m³)', type: 'number', step: '0.1', min: 0 },
      { k: 'temperature', l: 'Température du béton (°C)', type: 'number', step: '0.1' },
      { k: 'resultat7', l: 'Résultat à 7 jours', type: 'number', step: '0.1', min: 0, hint: 'Résistance mesurée en MPa.' },
      { k: 'resultat28', l: 'Résultat à 28 jours', type: 'number', step: '0.1', min: 0, hint: 'Laisser vide tant que l\'essai n\'est pas réalisé.' },
      { k: 'observations', l: 'Observations', type: 'textarea', full: true, placeholder: 'Conditions de coulage, cure, écarts, actions correctives…' }
    ],
    defaultRow: function () {
      return {
        datePrelevement: todayISO(),
        chantierId: App.state.chantierId !== 'all' ? App.state.chantierId : '',
        typeBeton: 'C25/30',
        resistanceCible: 25
      };
    }
  });

  App.view('essaisBeton', {
    title: 'Essais béton',
    subtitle: 'Prélèvements, résistances à 7 et 28 jours et conformité',
    newLabel: 'Nouvel essai',
    onNew: function () { App.openEntity('essaisBeton'); },
    render: function (root) {
      const rows = App.db.get('essaisBeton');
      const attente = rows.filter(function (r) { return !n(r.resultat28); }).length;
      const conformes = rows.filter(function (r) { return statutEssai(r) === 'Conforme'; }).length;
      const nonConformes = rows.filter(function (r) { return statutEssai(r) === 'Non conforme'; }).length;
      const bar = el('div');
      bar.innerHTML = '<div class="kpi-grid four">' +
        App.kpi('Prélèvements', num(rows.length), 'essais enregistrés', 'beaker', 'blue') +
        App.kpi('En attente', num(attente), 'résultat 28 j à venir', 'calendar', 'amber') +
        App.kpi('Conformes', num(conformes), 'résistance ≥ cible', 'check', 'green') +
        App.kpi('Non conformes', num(nonConformes), 'à analyser', 'warn', 'red') +
        '</div>';
      root.appendChild(bar);
      App.entityList(root, 'essaisBeton', {
        newLabel: 'Nouvel essai',
        extraButtons: [
          { icon: 'print', label: 'Imprimer le rapport', onClick: function () { App.printEssaisBeton(); } }
        ]
      });
    }
  });
})();
