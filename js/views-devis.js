/* =========================================================
   ChantierPro — SOSMAJED — devis et décomptes clients
   ========================================================= */
(function () {
  'use strict';
  const App = window.App;
  const { el, esc, money, num, n, sum, fmtDate, badgeHTML } = App;

  /* ---------------- Devis ---------------- */
  App.entity('devis', {
    singular: 'Devis',
    printTitle: 'Devis',
    cols: [
      { k: 'numero', l: 'Numéro', render: function (r) { return '<strong>' + esc(r.numero) + '</strong>'; } },
      { k: 'client', l: 'Client', render: function (r) { return '<strong>' + esc(r.client || '—') + '</strong><div class="sub">' + esc(r.chantierId ? App.chantierLabel(r.chantierId) : 'Sans chantier') + '</div>'; } },
      { k: 'date', l: 'Date', type: 'date' },
      { k: 'validite', l: 'Validité', type: 'date' },
      { k: 'ht', l: 'Total HT', align: 'right', render: function (r) { return '<b>' + money(App.calc.devis(r).ht) + '</b>'; }, sortValue: function (r) { return App.calc.devis(r).ht; } },
      { k: 'ttc', l: 'Total TTC', align: 'right', render: function (r) { return money(App.calc.devis(r).ttc); }, sortValue: function (r) { return App.calc.devis(r).ttc; } },
      { k: 'statut', l: 'Statut', type: 'badge' }
    ],
    openForm: function (id) { devisForm(id); },
    sortKey: 'date',
    rowActions: function (r) {
      return [
        { icon: 'print', label: 'Imprimer le devis', fn: function () { App.printDevis(r.id); } },
        { icon: 'copy', label: 'Dupliquer', fn: async function () {
          if (App.security && !(await App.security.confirmWrite('Dupliquer le devis ' + r.numero))) return;
          const copie = Object.assign({}, r, {
            id: App.uid('dv'), numero: App.nextNumber('DV', 'devis'), date: App.todayISO(),
            validite: App.addDays(App.todayISO(), 30), statut: 'Brouillon',
            lignes: (r.lignes || []).map(function (l) { return Object.assign({}, l); })
          });
          App.db.upsert('devis', copie);
          App.toast('Devis dupliqué.');
          App.openEntity('devis', copie.id);
        } },
        { icon: 'right', label: 'Créer un bon de commande', fn: async function () {
          if (App.security && !(await App.security.confirmWrite('Créer un bon de commande depuis le devis ' + r.numero))) return;
          const bc = {
            id: App.uid('bc'), numero: App.nextNumber('BC', 'commandes'), fournisseurId: '',
            chantierId: r.chantierId || '', date: App.todayISO(), dateLivraison: App.addDays(App.todayISO(), 7),
            statut: 'Brouillon', tva: r.tva, notes: 'Créé depuis le devis ' + r.numero + '. Choisissez le fournisseur.',
            lignes: (r.lignes || []).map(function (l) { return { designation: l.designation, unite: l.unite, quantite: l.quantite, pu: l.pu }; })
          };
          App.db.upsert('commandes', bc);
          App.toast('Bon de commande créé depuis le devis.');
          App.openEntity('commandes', bc.id);
        } }
      ];
    }
  });

  function devisForm(id) {
    const existing = id ? App.db.find('devis', id) : null;
    const row = existing ? Object.assign({}, existing) : {
      numero: App.nextNumber('DV', 'devis'), chantierId: App.state.chantierId !== 'all' ? App.state.chantierId : '',
      client: '', date: App.todayISO(), validite: App.addDays(App.todayISO(), 30), statut: 'Brouillon',
      tva: App.settings().tvaDefaut, remise: 0, notes: '', lignes: []
    };
    if (!existing && row.chantierId) {
      const ch = App.db.find('chantiers', row.chantierId);
      if (ch) row.client = ch.client || '';
    }
    const ff = App.buildFields([
      { k: 'numero', l: 'Numéro de devis', required: true },
      { k: 'statut', l: 'Statut', type: 'select', options: ['Brouillon', 'Envoyé', 'Accepté', 'Refusé'] },
      { k: 'chantierId', l: 'Chantier', type: 'select', ref: 'chantiers' },
      { k: 'client', l: 'Client', required: true },
      { k: 'date', l: 'Date', type: 'date' },
      { k: 'validite', l: 'Validité jusqu\'au', type: 'date' },
      { k: 'tva', l: 'TVA (%)', type: 'percent', min: 0, max: 100 },
      { k: 'remise', l: 'Remise (%)', type: 'percent', min: 0, max: 100 },
      { k: 'notes', l: 'Notes / conditions particulières', type: 'textarea', full: true, rows: 2 }
    ], row, {});

    const ed = App.lineEditor({
      columns: [
        { k: 'designation', l: 'Désignation', type: 'text', placeholder: 'Prestation, ouvrage, fourniture…' },
        { k: 'unite', l: 'Unité', type: 'text', width: '80px' },
        { k: 'quantite', l: 'Qté', type: 'number', step: '0.01', width: '90px', align: 'right' },
        { k: 'pu', l: 'P.U. HT', type: 'money', width: '110px', align: 'right' },
        { k: 'montant', l: 'Montant HT', type: 'calc', width: '120px', align: 'right', fn: function (r) { return n(r.quantite) * n(r.pu); } }
      ],
      totals: function (rows) {
        const htBrut = sum(rows, function (r) { return n(r.quantite) * n(r.pu); });
        const tvaInput = App.$('[data-k="tva"]', ff.el);
        const remiseInput = App.$('[data-k="remise"]', ff.el);
        const tva = tvaInput ? n(tvaInput.value) : n(row.tva);
        const remisePct = remiseInput ? n(remiseInput.value) : n(row.remise);
        const remise = htBrut * remisePct / 100;
        const ht = htBrut - remise;
        return [
          { label: 'Total HT brut', value: money(htBrut) },
          { label: 'Remise (' + num(remisePct) + ' %)', value: '− ' + money(remise) },
          { label: 'Total HT', value: money(ht) },
          { label: 'TVA (' + num(tva) + ' %)', value: money(ht * tva / 100) },
          { label: 'Total TTC', value: money(ht * (1 + tva / 100)), strong: true }
        ];
      }
    }, row.lignes || []);

    const body = el('div');
    body.append(ff.el, el('h4', 'form-section-title', 'Détail du devis'), ed.el);
    ['tva', 'remise'].forEach(function (k) {
      const inp = App.$('[data-k="' + k + '"]', ff.el);
      if (inp) inp.addEventListener('input', ed.refreshTotals);
    });
    const chSel = App.$('[data-k="chantierId"]', ff.el);
    if (chSel) chSel.addEventListener('change', function () {
      const ch = App.db.find('chantiers', chSel.value);
      const cl = App.$('[data-k="client"]', ff.el);
      if (ch && cl && !cl.value.trim()) cl.value = ch.client || '';
    });

    App.modal({
      title: (id ? 'Modifier' : 'Nouveau') + ' devis',
      subtitle: 'Le total se met à jour automatiquement',
      size: 'xl',
      body: body,
      actions: [{ label: 'Annuler' }, {
        label: 'Enregistrer', kind: 'primary', icon: 'check', onClick: async function (close) {
          if (!ff.validate()) return;
          if (!ed.validate()) return;
          const obj = Object.assign({}, row, ff.read(), { lignes: ed.getRows() });
          if (!obj.id) obj.id = App.uid('dv');
          if (App.security && !(await App.security.confirmWrite((id ? 'Modifier' : 'Créer') + ' le devis ' + obj.numero))) return;
          App.db.upsert('devis', obj);
          close();
          App.toast('Devis enregistré.');
          App.refresh();
        }
      }]
    });
  }

  App.view('devis', {
    title: 'Devis',
    subtitle: 'Chiffrage, validation et transformation en commandes',
    newLabel: 'Nouveau devis',
    onNew: function () { App.openEntity('devis'); },
    render: function (root) {
      const devis = App.db.get('devis');
      const acceptes = devis.filter(function (d) { return d.statut === 'Accepté'; });
      const envoyes = devis.filter(function (d) { return d.statut === 'Envoyé'; });
      const totalAccepte = sum(acceptes, function (d) { return App.calc.devis(d).ht; });
      const kpis = '<div class="kpi-grid four">' +
        App.kpi('Devis acceptés', money(totalAccepte), acceptes.length + ' affaires signées', 'check', 'green') +
        App.kpi('Devis en attente', num(envoyes.length), money(sum(envoyes, function (d) { return App.calc.devis(d).ht; })) + ' HT', 'file', 'amber') +
        App.kpi('Taux d\'acceptation', num(devis.length ? Math.round(acceptes.length / devis.length * 100) : 0) + ' %', 'sur ' + devis.length + ' devis', 'chart', 'blue') +
        App.kpi('Brouillons', num(devis.filter(function (d) { return d.statut === 'Brouillon'; }).length), 'à finaliser', 'edit', 'slate') +
        '</div>';
      const bar = el('div');
      bar.innerHTML = kpis;
      root.appendChild(bar);
      App.entityList(root, 'devis');
    }
  });

  /* ---------------- Décomptes clients ---------------- */
  App.entity('decomptes', {
    singular: 'Décompte',
    printTitle: 'Décomptes clients',
    cols: [
      { k: 'numero', l: 'Numéro', render: function (r) { return '<strong>' + esc(r.numero) + '</strong>'; } },
      { k: 'client', l: 'Client', render: function (r) { return '<strong>' + esc(r.client || '—') + '</strong><div class="sub">' + esc(r.chantierId ? App.chantierLabel(r.chantierId) : '') + '</div>'; } },
      { k: 'periode', l: 'Période' },
      { k: 'date', l: 'Date', type: 'date' },
      { k: 'ht', l: 'Travaux HT', align: 'right', render: function (r) { return '<b>' + money(App.calc.decompte(r).ht) + '</b>'; }, sortValue: function (r) { return App.calc.decompte(r).ht; } },
      { k: 'net', l: 'Net à payer', align: 'right', render: function (r) { return '<b>' + money(App.calc.decompte(r).net) + '</b>'; }, sortValue: function (r) { return App.calc.decompte(r).net; } },
      { k: 'statut', l: 'Statut', type: 'badge' }
    ],
    openForm: function (id) { decompteForm(id); },
    sortKey: 'date',
    rowActions: function (r) {
      return [
        { icon: 'print', label: 'Imprimer le décompte', fn: function () { App.printDecompte(r.id); } },
        { icon: 'check', label: 'Marquer comme payé', fn: function () {
          if (r.statut === 'Payé') { App.toast('Ce décompte est déjà payé.'); return; }
          App.confirm({ title: 'Marquer payé', message: 'Confirmer l\'encaissement du décompte ' + r.numero + ' ?', danger: false, confirmLabel: 'Marquer payé' }).then(async function (ok) {
            if (!ok) return;
            if (App.security && !(await App.security.confirmWrite('Marquer le décompte ' + r.numero + ' comme payé'))) return;
            r.statut = 'Payé';
            App.db.upsert('decomptes', r);
            App.toast('Décompte marqué payé.');
            App.refresh();
          });
        } }
      ];
    }
  });

  function decompteForm(id) {
    const existing = id ? App.db.find('decomptes', id) : null;
    const row = existing ? Object.assign({}, existing) : {
      numero: App.nextNumber('DEC', 'decomptes'), chantierId: App.state.chantierId !== 'all' ? App.state.chantierId : '',
      client: '', date: App.todayISO(), periode: App.monthYear(App.todayISO()), statut: 'Brouillon',
      tva: App.settings().tvaDefaut, retenue: App.settings().retenueGarantie, notes: '', lignes: []
    };
    if (!existing && row.chantierId) {
      const ch = App.db.find('chantiers', row.chantierId);
      if (ch) row.client = ch.client || '';
    }
    const ff = App.buildFields([
      { k: 'numero', l: 'Numéro de décompte', required: true },
      { k: 'statut', l: 'Statut', type: 'select', options: ['Brouillon', 'Envoyé', 'Payé'] },
      { k: 'chantierId', l: 'Chantier', type: 'select', ref: 'chantiers' },
      { k: 'client', l: 'Client / Maître d\'ouvrage', required: true },
      { k: 'date', l: 'Date', type: 'date' },
      { k: 'periode', l: 'Période concernée', placeholder: 'Ex. novembre 2026' },
      { k: 'tva', l: 'TVA (%)', type: 'percent', min: 0, max: 100 },
      { k: 'retenue', l: 'Retenue de garantie (%)', type: 'percent', min: 0, max: 100 },
      { k: 'notes', l: 'Observations', type: 'textarea', full: true, rows: 2 }
    ], row, {});

    const ed = App.lineEditor({
      columns: [
        { k: 'designation', l: 'Désignation', type: 'text', placeholder: 'Ouvrage ou poste du marché' },
        { k: 'unite', l: 'Unité', type: 'text', width: '75px' },
        { k: 'quantite', l: 'Qté', type: 'number', step: '0.01', width: '85px', align: 'right' },
        { k: 'pu', l: 'P.U. HT', type: 'money', width: '105px', align: 'right' },
        { k: 'avancement', l: 'Avanc. %', type: 'percent', width: '85px', align: 'right' },
        { k: 'montant', l: 'Montant HT', type: 'calc', width: '115px', align: 'right', fn: function (r) { return n(r.quantite) * n(r.pu) * App.clamp(n(r.avancement), 0, 100) / 100; } }
      ],
      totals: function (rows) {
        const ht = sum(rows, function (r) { return n(r.quantite) * n(r.pu) * App.clamp(n(r.avancement), 0, 100) / 100; });
        const tvaIn = App.$('[data-k="tva"]', ff.el);
        const retIn = App.$('[data-k="retenue"]', ff.el);
        const tva = tvaIn ? n(tvaIn.value) : n(row.tva);
        const ret = retIn ? n(retIn.value) : n(row.retenue);
        return [
          { label: 'Total travaux HT', value: money(ht) },
          { label: 'Retenue de garantie (' + num(ret) + ' %)', value: '− ' + money(ht * ret / 100) },
          { label: 'TVA (' + num(tva) + ' %)', value: money(ht * tva / 100) },
          { label: 'Net à payer', value: money(ht * (1 + tva / 100) - ht * ret / 100), strong: true }
        ];
      }
    }, row.lignes || []);

    const body = el('div');
    body.append(ff.el, el('h4', 'form-section-title', 'Détail des travaux'), ed.el);
    ['tva', 'retenue'].forEach(function (k) {
      const inp = App.$('[data-k="' + k + '"]', ff.el);
      if (inp) inp.addEventListener('input', ed.refreshTotals);
    });
    const chSel = App.$('[data-k="chantierId"]', ff.el);
    if (chSel) chSel.addEventListener('change', function () {
      const ch = App.db.find('chantiers', chSel.value);
      const cl = App.$('[data-k="client"]', ff.el);
      if (ch && cl && !cl.value.trim()) cl.value = ch.client || '';
    });

    App.modal({
      title: (id ? 'Modifier' : 'Nouveau') + ' décompte',
      subtitle: 'Situation de travaux client — retenue et TVA calculées automatiquement',
      size: 'xl',
      body: body,
      actions: [{ label: 'Annuler' }, {
        label: 'Enregistrer', kind: 'primary', icon: 'check', onClick: async function (close) {
          if (!ff.validate()) return;
          if (!ed.validate()) return;
          const obj = Object.assign({}, row, ff.read(), { lignes: ed.getRows() });
          if (!obj.id) obj.id = App.uid('dec');
          if (App.security && !(await App.security.confirmWrite((id ? 'Modifier' : 'Créer') + ' le décompte ' + obj.numero))) return;
          App.db.upsert('decomptes', obj);
          close();
          App.toast('Décompte enregistré.');
          App.refresh();
        }
      }]
    });
  }

  App.view('decomptes', {
    title: 'Décomptes clients',
    subtitle: 'Situations de travaux, retenues et encaissements',
    newLabel: 'Nouveau décompte',
    onNew: function () { App.openEntity('decomptes'); },
    render: function (root) {
      const list = App.db.get('decomptes');
      const envoye = list.filter(function (d) { return d.statut === 'Envoyé'; });
      const paye = list.filter(function (d) { return d.statut === 'Payé'; });
      const kpis = '<div class="kpi-grid four">' +
        App.kpi('À encaisser', money(sum(envoye, function (d) { return App.calc.decompte(d).net; })), envoye.length + ' décomptes envoyés', 'wallet', 'amber') +
        App.kpi('Encaissé', money(sum(paye, function (d) { return App.calc.decompte(d).net; })), paye.length + ' décomptes payés', 'check', 'green') +
        App.kpi('Travaux facturés', money(sum(list, function (d) { return App.calc.decompte(d).ht; })), 'total HT des décomptes', 'file', 'blue') +
        App.kpi('Retenues de garantie', money(sum(list, function (d) { return App.calc.decompte(d).retenue; })), 'constituées', 'box', 'violet') +
        '</div>';
      const bar = el('div');
      bar.innerHTML = kpis;
      root.appendChild(bar);
      App.entityList(root, 'decomptes');
    }
  });
})();
