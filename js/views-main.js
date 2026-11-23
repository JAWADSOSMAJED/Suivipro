/* =========================================================
   ChantierPro — tableau de bord, chantiers, fiche chantier
   ========================================================= */
(function () {
  'use strict';
  const App = window.App;
  const { el, esc, money, num, n, sum, fmtDate, daysTo, badgeHTML, progressHTML } = App;

  /* ---------------- Entités ---------------- */
  App.entity('chantiers', {
    singular: 'Chantier',
    printTitle: 'Chantiers',
    cols: [
      { k: 'code', l: 'Code', width: '110px' },
      { k: 'nom', l: 'Chantier', render: function (r) { return '<strong>' + esc(r.nom) + '</strong><div class="sub">' + esc(r.ville || '') + '</div>'; } },
      { k: 'client', l: 'Client' },
      { k: 'chef', l: 'Conducteur' },
      { k: 'dateFin', l: 'Fin prévue', type: 'date' },
      { k: 'budget', l: 'Budget', type: 'money', align: 'right' },
      { k: 'avancement', l: 'Avancement', render: function (r) { return progressHTML(App.avancement(r), true); }, sortValue: function (r) { return App.avancement(r); }, width: '150px' },
      { k: 'statut', l: 'Statut', type: 'badge' }
    ],
    fields: [
      { k: 'code', l: 'Code chantier', required: true },
      { k: 'nom', l: 'Nom du chantier', required: true, full: true },
      { k: 'tranche', l: 'Tranche', placeholder: 'T1, Tranche 1…' },
      { k: 'gh', l: 'GH', placeholder: 'GH1, Groupe Habitation…' },
      { k: 'client', l: 'Client / Maître d\'ouvrage' },
      { k: 'contact', l: 'Contact client' },
      { k: 'adresse', l: 'Adresse', full: true },
      { k: 'cp', l: 'Code postal' },
      { k: 'ville', l: 'Ville' },
      { k: 'nbImmeubles', l: 'Nombre d\'immeubles', type: 'number', min: 0, step: 1, default: 0 },
      { k: 'typeImmeuble', l: 'Type d\'immeuble', type: 'select', options: ['Logements collectifs', 'Résidence', 'Immeuble de bureaux', 'Immeuble mixte', 'Maison individuelle', 'Équipement public', 'Bâtiment industriel', 'Autre'] },
      { k: 'nbAppartements', l: 'Nombre d\'appartements', type: 'number', min: 0, step: 1, default: 0 },
      { k: 'nbMagasins', l: 'Nombre de magasins', type: 'number', min: 0, step: 1, default: 0 },
      { k: 'dateDebut', l: 'Date de début', type: 'date' },
      { k: 'dateFin', l: 'Date de fin prévue', type: 'date' },
      { k: 'budget', l: 'Budget (HT)', type: 'money' },
      { k: 'chef', l: 'Conducteur de travaux' },
      { k: 'tel', l: 'Téléphone client', type: 'tel' },
      { k: 'email', l: 'Email client', type: 'email' },
      { k: 'statut', l: 'Statut', type: 'select', options: ['En cours', 'En attente', 'Suspendu', 'Terminé', 'Annulé'] },
      { k: 'description', l: 'Description', type: 'textarea', full: true }
    ],
    defaultRow: function () {
      const year = new Date().getFullYear();
      let max = 0;
      App.db.get('chantiers').forEach(function (c) {
        const m = String(c.code || '').match(new RegExp('^CH-' + year + '-(\\d+)$'));
        if (m) max = Math.max(max, parseInt(m[1], 10));
      });
      return {
        code: 'CH-' + year + '-' + String(max + 1).padStart(2, '0'),
        statut: 'En cours', dateDebut: App.todayISO(), dateFin: App.addDays(App.todayISO(), 120),
        budget: 0, tranche: '', gh: '', nbImmeubles: 0, typeImmeuble: '', nbAppartements: 0, nbMagasins: 0, lots: []
      };
    },
    rowActions: function (r) {
      return [{ icon: 'eye', label: 'Fiche chantier', fn: function () { App.go('#/chantier/' + r.id); } }];
    }
  });

  App.entity('taches', {
    singular: 'Tâche',
    feminine: true,
    cols: [
      { k: 'nom', l: 'Tâche', render: function (r) { return '<strong>' + esc(r.nom) + '</strong><div class="sub">' + esc(App.chantierLabel(r.chantierId)) + '</div>'; }, sortValue: function (r) { return r.nom; } },
      { k: 'responsable', l: 'Responsable' },
      { k: 'debut', l: 'Début', type: 'date' },
      { k: 'fin', l: 'Fin', type: 'date', render: function (r) { return r.fin && r.statut !== 'Terminé' && daysTo(r.fin) < 0 ? '<span class="text-danger">' + fmtDate(r.fin) + '</span>' : (r.fin ? fmtDate(r.fin) : '—'); }, sortValue: function (r) { return r.fin || ''; } },
      { k: 'avancement', l: 'Avancement', render: function (r) { return progressHTML(r.avancement, true); }, align: 'right', width: '150px' },
      { k: 'statut', l: 'Statut', type: 'badge' }
    ],
    fields: [
      { k: 'nom', l: 'Intitulé de la tâche', required: true, full: true },
      { k: 'chantierId', l: 'Chantier', type: 'select', ref: 'chantiers', required: true },
      { k: 'tranche', l: 'Tranche', type: 'select', options: function () { return App.tranches(); }, hint: 'Renseignée automatiquement selon le chantier, modifiable.' },
      { k: 'responsable', l: 'Responsable / équipe' },
      { k: 'debut', l: 'Date de début', type: 'date' },
      { k: 'fin', l: 'Date de fin', type: 'date' },
      { k: 'statut', l: 'Statut', type: 'select', options: ['À faire', 'En cours', 'En retard', 'Terminé'] },
      { k: 'avancement', l: 'Avancement (%)', type: 'percent', min: 0, max: 100 },
      { k: 'notes', l: 'Notes', type: 'textarea', full: true }
    ],
    defaultRow: function () {
      const ch = App.state.chantierId !== 'all' ? App.state.chantierId : (App.db.get('chantiers')[0] || {}).id;
      return { statut: 'À faire', debut: App.todayISO(), fin: App.addDays(App.todayISO(), 7), avancement: 0, chantierId: ch || '', responsable: '' };
    },
    sortKey: 'debut'
  });

  /* ---------------- Tableau de bord ---------------- */
  App.view('dashboard', {
    title: 'Tableau de bord',
    subtitle: 'Vue d\'ensemble de votre activité',
    timeStamp: true,
    render: function (root) {
      const chantiers = App.db.get('chantiers');
      const actifs = chantiers.filter(function (c) { return c.statut === 'En cours'; });
      const avg = actifs.length ? sum(actifs, function (c) { return App.avancement(c); }) / actifs.length : 0;
      const devisOK = App.db.get('devis').filter(function (d) { return d.statut === 'Accepté'; });
      const carnet = sum(devisOK, function (d) { return App.calc.devis(d).ht; });
      const engagements = sum(App.db.get('commandes').filter(function (c) { return c.statut !== 'Annulé'; }), function (c) { return App.calc.commande(c).ht; });
      const aEncaisser = sum(App.db.get('decomptes').filter(function (d) { return d.statut === 'Envoyé'; }), function (d) { return App.calc.decompte(d).net; });
      const alerts = App.alerts();
      const tasks = App.db.get('taches').filter(function (t) { return t.statut !== 'Terminé'; })
        .sort(function (a, b) { return String(a.fin || '').localeCompare(String(b.fin || '')); }).slice(0, 6);
      const kpis = '<div class="kpi-grid">' +
        App.kpi('Chantiers actifs', num(actifs.length), 'sur ' + chantiers.length + ' au total', 'hammer', 'amber', '#/chantiers') +
        App.kpi('Avancement moyen', num(Math.round(avg * 10) / 10) + ' %', 'chantiers en cours', 'chart', 'blue') +
        App.kpi('Carnet de commandes', money(carnet), 'devis acceptés HT', 'file', 'green', '#/devis') +
        App.kpi('Achats engagés', money(engagements), 'bons de commande HT', 'truck', 'violet', '#/commandes') +
        App.kpi('Valeur du stock', money(App.stockValeur()), 'articles en dépôt', 'box', 'slate', '#/stock') +
        App.kpi('À encaisser', money(aEncaisser), 'décomptes envoyés', 'wallet', 'red', '#/decomptes') +
        '</div>';

      const chRows = actifs.length ? actifs.map(function (c) {
        return '<a class="dash-ch" href="#/chantier/' + c.id + '"><div class="dash-ch-top"><div><strong>' + esc(c.nom) + '</strong><span class="sub">' + esc(c.code) + (App.chantierRefs(c) ? ' · ' + esc(App.chantierRefs(c)) : '') + ' · ' + esc(c.client || '') + '</span></div>' + badgeHTML(c.statut) + '</div>' +
          '<div class="dash-ch-progress">' + progressHTML(App.avancement(c), true) + '<span class="muted">' + esc(c.chef || '') + '</span></div></a>';
      }).join('') : App.emptyState('Aucun chantier en cours.', 'hammer');

      const alertRows = alerts.length ? alerts.slice(0, 7).map(function (a) {
        return '<a class="alert-item ' + a.level + '" href="' + a.route + '"><span class="alert-ico">' + App.icon(a.icon, 17) + '</span><div><strong>' + esc(a.title) + '</strong><span>' + esc(a.detail) + '</span></div><span class="alert-kind">' + esc(a.kind) + '</span></a>';
      }).join('') + (alerts.length > 7 ? '<p class="muted small center">+ ' + (alerts.length - 7) + ' autres alertes</p>' : '') : '<div class="ok-empty">' + App.icon('check', 20) + '<p>Aucune alerte. Tout est sous contrôle.</p></div>';

      const taskRows = tasks.length ? tasks.map(function (t) {
        const late = t.fin && daysTo(t.fin) < 0;
        const dj = t.fin ? daysTo(t.fin) : 0;
        return '<a class="dash-task" href="#/planning"><span class="date-chip ' + (late ? 'late' : '') + '">' + (late ? 'J+' + Math.abs(dj) : dj === 0 ? 'Auj.' : 'J-' + dj) + '</span>' +
          '<div><strong>' + esc(t.nom) + '</strong><span class="sub">' + esc(App.chantierLabel(t.chantierId)) + '</span></div>' + badgeHTML(t.statut) + '</a>';
      }).join('') : App.emptyState('Aucune échéance à venir.', 'calendar');

      const tools = el('div', 'toolbar');
      const toolsRight = el('div', 'toolbar-right');
      const printBtn = el('button', 'btn ghost', App.icon('print') + '<span>Imprimer</span>');
      printBtn.type = 'button';
      printBtn.onclick = function () { App.printDashboard(); };
      toolsRight.appendChild(printBtn);
      tools.appendChild(toolsRight);

      root.innerHTML = kpis +
        '<div class="dash-grid">' +
          '<section class="card span-2"><div class="card-head"><h2>Chantiers en cours</h2><a class="link" href="#/chantiers">Tout voir ' + App.icon('right', 14) + '</a></div><div class="dash-ch-list">' + chRows + '</div></section>' +
          '<section class="card"><div class="card-head"><h2>Alertes</h2><span class="pill">' + alerts.length + '</span></div><div class="alert-list">' + alertRows + '</div></section>' +
          '<section class="card"><div class="card-head"><h2>Prochaines échéances</h2><a class="link" href="#/planning">Planning ' + App.icon('right', 14) + '</a></div><div class="dash-tasks">' + taskRows + '</div></section>' +
        '</div>';
      root.insertBefore(tools, root.firstChild);
    }
  });

  /* ---------------- Liste des chantiers ---------------- */
  App.view('chantiers', {
    title: 'Chantiers',
    subtitle: 'Pilotez vos opérations, leur avancement et leur budget',
    newLabel: 'Nouveau chantier',
    onNew: function () { App.openEntity('chantiers'); },
    render: function (root) {
      let filtre = 'Tous';
      const wrap = el('div', 'view-body');
      const toolbar = el('div', 'toolbar');
      const chips = el('div', 'chips');
      ['Tous', 'En cours', 'En attente', 'Suspendu', 'Terminé'].forEach(function (s) {
        const b = el('button', 'chip' + (s === filtre ? ' active' : ''), s);
        b.type = 'button';
        b.onclick = function () {
          filtre = s;
          App.$$('.chip', chips).forEach(function (x) { x.classList.toggle('active', x.textContent === s); });
          draw();
        };
        chips.appendChild(b);
      });
      const right = el('div', 'toolbar-right');
      let visible = [];
      const printBtn = el('button', 'btn ghost', App.icon('print') + '<span>Imprimer</span>');
      printBtn.type = 'button';
      printBtn.onclick = function () {
        App.printList('chantiers', visible, { title: 'Chantiers' + (filtre === 'Tous' ? '' : ' — ' + filtre) });
      };
      right.appendChild(printBtn);
      const add = el('button', 'btn primary', App.icon('plus') + '<span>Nouveau chantier</span>');
      add.onclick = function () { App.openEntity('chantiers'); };
      right.appendChild(add);
      toolbar.append(chips, right);
      wrap.appendChild(toolbar);
      const grid = el('div', 'proj-grid');
      wrap.appendChild(grid);
      root.appendChild(wrap);

      function draw() {
        let list = App.db.get('chantiers');
        if (App.state.chantierId !== 'all') list = list.filter(function (c) { return c.id === App.state.chantierId; });
        if (filtre !== 'Tous') list = list.filter(function (c) { return c.statut === filtre; });
        visible = list;
        if (!list.length) {
          grid.innerHTML = App.emptyState('Aucun chantier dans cette vue.', 'hammer');
          return;
        }
        grid.innerHTML = list.map(function (c) { return App.chantierCard(c); }).join('');
        App.bindChantierCards(grid);
      }
      draw();
    }
  });

  /* ---------------- Fiche chantier ---------------- */
  App.view('chantier', {
    title: 'Fiche chantier',
    subtitle: 'Détail de l\'opération',
    hideQuick: true,
    render: function (root) {
      const id = App.state.param;
      const ch = App.db.find('chantiers', id);
      if (!ch) {
        root.innerHTML = App.emptyState('Chantier introuvable.', 'hammer') + '<p class="center"><a class="btn ghost" href="#/chantiers">Retour aux chantiers</a></p>';
        return;
      }
      const av = App.avancement(ch);
      const tasks = App.db.get('taches').filter(function (t) { return t.chantierId === ch.id; });
      const docs = App.db.get('documents').filter(function (d) { return d.chantierId === ch.id; });
      const devis = App.db.get('devis').filter(function (d) { return d.chantierId === ch.id; });
      const decomptes = App.db.get('decomptes').filter(function (d) { return d.chantierId === ch.id; });
      const situations = App.db.get('situations').filter(function (s) { return s.chantierId === ch.id; });
      const commandes = App.db.get('commandes').filter(function (c) { return c.chantierId === ch.id; });
      const ca = sum(devis.filter(function (d) { return d.statut === 'Accepté'; }), function (d) { return App.calc.devis(d).ht; });
      const engage = sum(commandes.filter(function (c) { return c.statut !== 'Annulé'; }), function (c) { return App.calc.commande(c).ht; });
      const facture = sum(decomptes.filter(function (d) { return d.statut === 'Envoyé' || d.statut === 'Payé'; }), function (d) { return App.calc.decompte(d).ht; });
      const stValide = sum(situations.filter(function (s) { return s.statut !== 'À valider'; }), function (s) { return App.calc.situation(s).net; });

      const toolbar = '<div class="toolbar"><div class="toolbar-left"><a class="btn ghost" href="#/chantiers">' + App.icon('right', 15) + '<span>Retour</span></a></div><div class="toolbar-right">' +
        '<button type="button" class="btn ghost" id="chPrint">' + App.icon('print') + '<span>Imprimer la fiche</span></button>' +
        '<button type="button" class="btn ghost" id="chAv">' + App.icon('chart') + '<span>Mettre à jour l\'avancement</span></button>' +
        '<button type="button" class="btn primary" id="chEdit">' + App.icon('edit') + '<span>Modifier</span></button>' +
        '<button type="button" class="btn danger-soft" id="chDelete">' + App.icon('trash') + '<span>Supprimer</span></button></div></div>';

      const hero = '<section class="card hero-card"><div class="hero-main"><div class="proj-top"><span class="code">' + esc(ch.code) + '</span>' + badgeHTML(ch.statut) + '</div>' +
        '<h2>' + esc(ch.nom) + '</h2><p class="muted">' + esc(ch.client || 'Client non renseigné') + (ch.contact ? ' · ' + esc(ch.contact) : '') + '</p>' +
        '<div class="hero-meta">' +
          '<span>' + App.icon('home', 15) + ' ' + esc([ch.adresse, ch.cp, ch.ville].filter(Boolean).join(', ') || 'Adresse non renseignée') + '</span>' +
          '<span>' + App.icon('calendar', 15) + ' ' + fmtDate(ch.dateDebut) + ' → ' + fmtDate(ch.dateFin) + '</span>' +
          '<span>' + App.icon('users', 15) + ' ' + esc(ch.chef || 'Conducteur non renseigné') + '</span>' +
          (ch.tranche ? '<span>' + App.icon('layers', 15) + ' Tranche : ' + esc(ch.tranche) + '</span>' : '') +
          (ch.gh ? '<span>GH : ' + esc(ch.gh) + '</span>' : '') +
          (App.chantierProgramme(ch) ? '<span>' + App.icon('home', 15) + ' ' + esc(App.chantierProgramme(ch)) + '</span>' : '') +
        '</div>' + (ch.description ? '<p class="hero-desc">' + esc(ch.description) + '</p>' : '') + '</div>' +
        '<div class="hero-progress"><span class="muted">Avancement global</span><b class="big-pct">' + num(Math.round(av * 10) / 10) + ' %</b>' + progressHTML(av) + '<span class="muted">Budget : ' + money(ch.budget) + '</span></div></section>';

      const kpis = '<div class="kpi-grid five">' +
        App.kpi('Devis acceptés', money(ca), devis.filter(function (d) { return d.statut === 'Accepté'; }).length + ' devis', 'file', 'green', '#/devis') +
        App.kpi('Achats engagés', money(engage), commandes.length + ' commandes', 'truck', 'violet', '#/commandes') +
        App.kpi('Facturé HT', money(facture), decomptes.length + ' décomptes', 'wallet', 'amber', '#/decomptes') +
        App.kpi('Sous-traitance validée', money(stValide), situations.length + ' situations', 'users', 'blue', '#/situations') +
        App.kpi('Documents', num(docs.length), 'pièces au dossier', 'file', 'slate', '#/documents') +
        '</div>';

      const lots = (ch.lots || []).length ? ch.lots.map(function (l) {
        return '<div class="lot-line"><div class="lot-name">' + esc(l.nom) + '<span class="muted"> · poids ' + num(l.poids) + ' %</span></div>' + progressHTML(l.avancement, true) + '</div>';
      }).join('') : '<p class="muted">Aucun lot renseigné. <a href="#/avancement">Ajouter des lots</a>.</p>';

      const taskList = tasks.length ? tasks.slice().sort(function (a, b) { return String(a.fin || '').localeCompare(String(b.fin || '')); }).slice(0, 6).map(function (t) {
        return '<div class="mini-row"><span class="date-chip">' + fmtDate(t.fin) + '</span><div><strong>' + esc(t.nom) + '</strong><span class="sub">' + esc(t.responsable || '') + '</span></div>' + badgeHTML(t.statut) + '</div>';
      }).join('') : '<p class="muted">Aucune tâche planifiée.</p>';

      const docList = docs.length ? docs.slice(0, 6).map(function (d) {
        return '<div class="mini-row"><span class="doc-ico">' + App.icon('file', 16) + '</span><div><strong>' + esc(d.nom) + '</strong><span class="sub">' + esc(d.categorie) + ' · v' + esc(d.version || '1.0') + ' · ' + fmtDate(d.date) + '</span></div>' + badgeHTML(App.docStatut(d)) + '</div>';
      }).join('') : '<p class="muted">Aucun document.</p>';

      const devisList = devis.length ? devis.map(function (d) {
        return '<div class="mini-row"><div><strong>' + esc(d.numero) + '</strong><span class="sub">' + fmtDate(d.date) + ' · ' + esc(d.client || '') + '</span></div><div class="right-nowrap"><b>' + money(App.calc.devis(d).ht) + '</b> ' + badgeHTML(d.statut) + '</div></div>';
      }).join('') : '<p class="muted">Aucun devis.</p>';

      const decList = decomptes.length ? decomptes.map(function (d) {
        return '<div class="mini-row"><div><strong>' + esc(d.numero) + '</strong><span class="sub">' + fmtDate(d.date) + ' · ' + esc(d.periode || '') + '</span></div><div class="right-nowrap"><b>' + money(App.calc.decompte(d).net) + '</b> ' + badgeHTML(d.statut) + '</div></div>';
      }).join('') : '<p class="muted">Aucun décompte.</p>';

      root.innerHTML = toolbar + hero + kpis +
        '<div class="detail-grid">' +
          '<section class="card"><div class="card-head"><h2>Avancement par lot</h2><a class="link" href="#/avancement">Modifier</a></div><div class="lot-list">' + lots + '</div></section>' +
          '<section class="card"><div class="card-head"><h2>Planning</h2><a class="link" href="#/planning">Voir tout</a></div><div class="mini-list">' + taskList + '</div></section>' +
          '<section class="card"><div class="card-head"><h2>Documents</h2><a class="link" href="#/documents">Voir tout</a></div><div class="mini-list">' + docList + '</div></section>' +
          '<section class="card"><div class="card-head"><h2>Devis</h2><a class="link" href="#/devis">Voir tout</a></div><div class="mini-list">' + devisList + '</div></section>' +
          '<section class="card"><div class="card-head"><h2>Décomptes</h2><a class="link" href="#/decomptes">Voir tout</a></div><div class="mini-list">' + decList + '</div></section>' +
        '</div>';

      App.$('#chEdit').onclick = function () { App.openEntity('chantiers', ch.id); };
      App.$('#chDelete').onclick = async function () {
        await App.deleteRow('chantiers', ch.id);
        if (!App.db.find('chantiers', ch.id)) App.go('#/chantiers');
      };
      App.$('#chPrint').onclick = function () { App.printChantier(ch.id); };
      App.$('#chAv').onclick = function () {
        App.state.chantierId = ch.id;
        App.go('#/avancement');
      };
    }
  });
})();
