/* =========================================================
   ChantierPro — SOSMAJED — rapports quotidiens (journaux de chantier)
   ========================================================= */
(function () {
  'use strict';
  const App = window.App;
  const { esc, num, n, el, fmtDate, badgeHTML, todayISO } = App;

  const METEO = ['Ensoleillé', 'Nuageux', 'Pluvieux', 'Venteux', 'Orage', 'Neige'];
  const STATUTS = ['Brouillon', 'Validé'];

  function extrait(v, max) {
    const s = String(v || '').replace(/\s+/g, ' ').trim();
    return s.length > max ? s.slice(0, max).trim() + '…' : s;
  }

  App.entity('rapportsQuotidien', {
    singular: 'Rapport quotidien',
    printTitle: 'Rapports quotidiens',
    sortKey: 'date',
    sortDir: -1,
    cols: [
      {
        k: 'date', l: 'Date', type: 'date',
        render: function (r) {
          return '<b>' + (r.date ? esc(fmtDate(r.date)) : '—') + '</b>' +
            (r.reference ? '<div class="sub">' + esc(r.reference) + '</div>' : '');
        },
        sortValue: function (r) { return (r.date || '') + ' ' + (r.reference || ''); }
      },
      {
        k: 'chantierId', l: 'Chantier',
        render: function (r) {
          return r.chantierId ? esc(App.chantierLabel(r.chantierId)) : '<span class="muted">—</span>';
        },
        sortValue: function (r) { return App.chantierLabel(r.chantierId); }
      },
      { k: 'responsable', l: 'Responsable' },
      {
        k: 'travaux', l: 'Travaux réalisés',
        render: function (r) {
          return r.travaux ? esc(extrait(r.travaux, 110)) : '<span class="muted">—</span>';
        },
        sortValue: function (r) { return extrait(r.travaux, 200); }
      },
      { k: 'effectif', l: 'Effectif', align: 'right', type: 'number' },
      { k: 'heures', l: 'Heures', align: 'right', type: 'number', render: function (r) { return r.heures ? esc(num(r.heures)) + ' h' : '<span class="muted">—</span>'; } },
      { k: 'meteo', l: 'Météo' },
      { k: 'statut', l: 'Statut', type: 'badge' }
    ],
    fields: [
      { k: 'date', l: 'Date du rapport', type: 'date', required: true },
      { k: 'reference', l: 'Référence / n° de rapport', placeholder: 'RQ-2026-001' },
      { k: 'chantierId', l: 'Chantier', type: 'select', ref: 'chantiers', required: true },
      { k: 'responsable', l: 'Responsable de journée', placeholder: 'Chef de chantier' },
      { k: 'statut', l: 'Statut', type: 'select', options: STATUTS },
      { k: 'effectif', l: 'Effectif présent', type: 'number', min: 0, hint: 'Nombre de personnes sur le chantier.' },
      { k: 'heures', l: 'Heures travaillées', type: 'number', step: '0.5', min: 0 },
      { k: 'meteo', l: 'Météo', type: 'select', options: METEO },
      { k: 'temperature', l: 'Température (°C)', type: 'number', step: '0.1' },
      { k: 'travaux', l: 'Travaux réalisés', type: 'textarea', full: true, rows: 3, required: true, placeholder: 'Décrire les ouvrages exécutés et les zones concernées…' },
      { k: 'mainOeuvre', l: 'Main-d’œuvre / équipes', type: 'textarea', full: true, rows: 2, placeholder: 'Effectifs par corps d’état, sous-traitants présents…' },
      { k: 'materiel', l: 'Matériel utilisé', type: 'textarea', full: true, rows: 2, placeholder: 'Engins, pompe, échafaudages…' },
      { k: 'livraisons', l: 'Livraisons du jour', type: 'textarea', full: true, rows: 2, placeholder: 'Fournitures reçues et numéros de bon de livraison…' },
      { k: 'incidents', l: 'Incidents / retards', type: 'textarea', full: true, rows: 2, placeholder: 'Accidents, aléas climatiques, arrêts de travail, réserves…' },
      { k: 'observations', l: 'Observations', type: 'textarea', full: true, rows: 2, placeholder: 'Remarques diverses et suites à donner…' }
    ],
    defaultRow: function () {
      return {
        date: todayISO(),
        chantierId: App.state.chantierId !== 'all' ? App.state.chantierId : '',
        statut: 'Brouillon',
        meteo: 'Ensoleillé'
      };
    },
    rowActions: function (r) {
      return [{
        icon: 'print',
        label: 'Imprimer ce rapport',
        fn: function () { App.printRapportQuotidien(r.id); }
      }];
    }
  });

  App.view('rapportQuotidien', {
    title: 'Rapport quotidien',
    subtitle: 'Journal de chantier : travaux, effectifs, météo et incidents',
    newLabel: 'Nouveau rapport',
    onNew: function () { App.openEntity('rapportsQuotidien'); },
    render: function (root) {
      const rows = App.db.get('rapportsQuotidien') || [];
      const today = todayISO();
      const mois = today.slice(0, 7);
      const duJour = rows.filter(function (r) { return r.date === today; }).length;
      const duMois = rows.filter(function (r) { return String(r.date || '').slice(0, 7) === mois; }).length;
      const incidents = rows.filter(function (r) { return String(r.incidents || '').trim(); }).length;

      const bar = el('div');
      bar.innerHTML = '<div class="kpi-grid four">' +
        App.kpi('Rapports enregistrés', num(rows.length), 'journaux de chantier', 'file', 'blue') +
        App.kpi('Aujourd’hui', num(duJour), 'rapports du jour', 'calendar', 'amber') +
        App.kpi('Ce mois', num(duMois), 'rapports mensuels', 'chart', 'blue') +
        App.kpi('Avec incidents', num(incidents), 'à consulter', 'warn', 'red') +
        '</div>';
      root.appendChild(bar);

      App.entityList(root, 'rapportsQuotidien', {
        newLabel: 'Nouveau rapport',
        extraButtons: [{
          icon: 'print',
          label: 'Imprimer le rapport',
          onClick: function () { App.printRapportsQuotidien(); }
        }]
      });
    }
  });
})();
