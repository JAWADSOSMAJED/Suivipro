/* =========================================================
   ChantierPro — SOSMAJED — documents imprimables (devis, BC, décomptes…)
   ========================================================= */
(function () {
  'use strict';
  const App = window.App;
  const { esc, money, num, fmtDate, n } = App;

  function soc() { return App.settings().societe; }

  function logoSrc(dataUrl) {
    if (!dataUrl) return '';
    if (/^(data:|blob:|https?:|file:)/i.test(dataUrl)) return dataUrl;
    try { return new URL(dataUrl, window.location.href).href; } catch (e) { return dataUrl; }
  }

  function companyHTML() {
    const s = soc();
    const logo = s.logo && s.logo.dataUrl
      ? '<img class="doc-logo" src="' + esc(logoSrc(s.logo.dataUrl)) + '" alt="Logo ' + esc(s.nom || '') + '">'
      : '';
    return '<div>' + logo + '<h1>' + esc(s.nom || 'Mon entreprise') + '</h1><p>' +
      esc(s.adresse || '') + '<br>' +
      esc((s.cp || '') + ' ' + (s.ville || '')) + '<br>' +
      (s.tel ? 'Tél. ' + esc(s.tel) + '<br>' : '') +
      (s.email ? esc(s.email) + '<br>' : '') + '</p></div>';
  }

  function docHead(label, numero, date, extra, chantier) {
    return '<div class="doc-head">' + companyHTML() +
      '<div class="doc-type"><h2>' + esc(label) + '</h2><p><strong>' + esc(numero) + '</strong><br>' +
      'Date : ' + fmtDate(date) + (extra ? '<br>' + extra : '') +
      (chantier ? '<br>Chantier : ' + esc(chantier.nom) : '') + '</p></div></div>';
  }

  function party(title, html) {
    return '<div class="party"><h4>' + esc(title) + '</h4>' + html + '</div>';
  }

  function table(lines, cols) {
    return '<table class="lines"><thead><tr>' +
      cols.map(function (c) { return '<th class="' + (c.r ? 'r' : '') + '">' + esc(c.label) + '</th>'; }).join('') +
      '</tr></thead><tbody>' + lines + '</tbody></table>';
  }

  function totals(rows) {
    return '<div class="totals">' + rows.map(function (r) {
      return '<div class="' + (r.strong ? 'net' : '') + '"><span>' + esc(r.label) + '</span><b>' + esc(r.value) + '</b></div>';
    }).join('') + '</div>';
  }

  function chantierOf(doc) { return doc.chantierId ? App.db.find('chantiers', doc.chantierId) : null; }

  function chantierAddress(ch) {
    if (!ch) return '';
    return esc(ch.adresse || '') + (ch.cp || ch.ville ? '<br>' + esc((ch.cp || '') + ' ' + (ch.ville || '')) : '');
  }

  /* ---------------- Devis ---------------- */
  App.printDevis = function (id) {
    const d = App.db.find('devis', id);
    if (!d) return;
    const ch = chantierOf(d);
    const t = App.calc.devis(d);
    const lines = (d.lignes || []).map(function (l) {
      return '<tr><td>' + esc(l.designation) + '</td><td>' + esc(l.unite || '') + '</td><td class="r">' + num(l.quantite) +
        '</td><td class="r">' + money(l.pu) + '</td><td class="r">' + money(n(l.quantite) * n(l.pu)) + '</td></tr>';
    }).join('');
    const rows = [
      { label: 'Total HT brut', value: money(t.htBrut) },
      { label: 'Remise (' + num(d.remise) + ' %)', value: '− ' + money(t.remise) },
      { label: 'Total HT', value: money(t.ht) },
      { label: 'TVA (' + num(d.tva) + ' %)', value: money(t.tva) },
      { label: 'Total TTC', value: money(t.ttc), strong: true }
    ];
    const html = docHead('DEVIS', d.numero, d.date, 'Validité : ' + fmtDate(d.validite), ch) +
      '<div class="doc-parties">' +
        party('Client', '<p><strong>' + esc(d.client || (ch && ch.client) || '') + '</strong><br>' + (ch ? chantierAddress(ch) : '') + '</p>') +
        party('Chantier', ch ? '<p><strong>' + esc(ch.code || '') + '</strong><br>' + esc(ch.nom) + '<br>' + chantierAddress(ch) + '</p>' : '<p>—</p>') +
      '</div>' +
      table(lines, [
        { label: 'Désignation' }, { label: 'Unité' }, { label: 'Qté', r: true }, { label: 'P.U. HT', r: true }, { label: 'Montant HT', r: true }
      ]) +
      totals(rows) +
      (d.notes ? '<div class="notes"><strong>Notes :</strong> ' + esc(d.notes) + '</div>' : '') +
      '<div class="notes">' + esc(App.settings().mentionsDevis) + '</div>' +
      '<div class="sign"><div>Date et signature du client<br><em>Bon pour accord</em></div><div>Pour ' + esc(soc().nom) + '</div></div>';
    App.printHTML('Devis ' + d.numero, html);
  };

  /* ---------------- Bon de commande ---------------- */
  App.printCommande = function (id) {
    const c = App.db.find('commandes', id);
    if (!c) return;
    const ch = chantierOf(c);
    const f = App.db.find('fournisseurs', c.fournisseurId);
    const t = App.calc.commande(c);
    const lines = (c.lignes || []).map(function (l) {
      return '<tr><td>' + esc(l.designation) + '</td><td>' + esc(l.unite || '') + '</td><td class="r">' + num(l.quantite) +
        '</td><td class="r">' + money(l.pu) + '</td><td class="r">' + money(n(l.quantite) * n(l.pu)) + '</td></tr>';
    }).join('');
    const rows = [
      { label: 'Total HT', value: money(t.ht) },
      { label: 'TVA (' + num(c.tva) + ' %)', value: money(t.tva) },
      { label: 'Total TTC', value: money(t.ttc), strong: true }
    ];
    const html = docHead('BON DE COMMANDE', c.numero, c.date, 'Livraison souhaitée : ' + fmtDate(c.dateLivraison), ch) +
      '<div class="doc-parties">' +
        party('Fournisseur', f ? '<p><strong>' + esc(f.nom) + '</strong><br>' + esc(f.contact || '') + '<br>' + esc(f.adresse || '') + '<br>' + esc((f.cp || '') + ' ' + (f.ville || '')) + '<br>' + esc(f.tel || '') + (f.email ? '<br>' + esc(f.email) : '') + '</p>' : '<p>—</p>') +
        party('Adresse de livraison', ch ? '<p><strong>' + esc(ch.nom) + '</strong><br>' + chantierAddress(ch) + '<br>Contact : ' + esc(ch.chef || '') + '</p>' : '<p>—</p>') +
      '</div>' +
      table(lines, [
        { label: 'Désignation' }, { label: 'Unité' }, { label: 'Qté', r: true }, { label: 'P.U. HT', r: true }, { label: 'Montant HT', r: true }
      ]) +
      totals(rows) +
      (c.notes ? '<div class="notes"><strong>Instructions :</strong> ' + esc(c.notes) + '</div>' : '') +
      '<div class="notes">' + esc(App.settings().mentionsCommande) + '</div>' +
      '<div class="sign"><div>Le fournisseur</div><div>Pour ' + esc(soc().nom) + '</div></div>';
    App.printHTML('Bon de commande ' + c.numero, html);
  };

  /* ---------------- Décompte client ---------------- */
  App.printDecompte = function (id) {
    const d = App.db.find('decomptes', id);
    if (!d) return;
    const ch = chantierOf(d);
    const t = App.calc.decompte(d);
    const lines = (d.lignes || []).map(function (l) {
      const mt = n(l.quantite) * n(l.pu) * App.clamp(n(l.avancement), 0, 100) / 100;
      return '<tr><td>' + esc(l.designation) + '</td><td>' + esc(l.unite || '') + '</td><td class="r">' + num(l.quantite) +
        '</td><td class="r">' + money(l.pu) + '</td><td class="r">' + num(l.avancement) + ' %</td><td class="r">' + money(mt) + '</td></tr>';
    }).join('');
    const rows = [
      { label: 'Total HT', value: money(t.ht) },
      { label: 'Retenue de garantie (' + num(d.retenue) + ' %)', value: '− ' + money(t.retenue) },
      { label: 'TVA (' + num(d.tva) + ' %)', value: money(t.tva) },
      { label: 'Net à payer', value: money(t.net), strong: true }
    ];
    const html = docHead('DÉCOMPTE', d.numero, d.date, 'Période : ' + esc(d.periode || '—'), ch) +
      '<div class="doc-parties">' +
        party('Maître d\'ouvrage', '<p><strong>' + esc(d.client || (ch && ch.client) || '') + '</strong><br>' + (ch ? chantierAddress(ch) : '') + '</p>') +
        party('Chantier', ch ? '<p><strong>' + esc(ch.code || '') + '</strong><br>' + esc(ch.nom) + '<br>' + chantierAddress(ch) + '</p>' : '<p>—</p>') +
      '</div>' +
      table(lines, [
        { label: 'Désignation' }, { label: 'Unité' }, { label: 'Qté', r: true }, { label: 'P.U. HT', r: true }, { label: 'Avanc.', r: true }, { label: 'Montant HT', r: true }
      ]) +
      totals(rows) +
      (d.notes ? '<div class="notes"><strong>Observations :</strong> ' + esc(d.notes) + '</div>' : '') +
      '<div class="notes">' + esc(App.settings().mentionsDecompte) + '</div>' +
      '<div class="sign"><div>Le maître d\'ouvrage</div><div>Pour ' + esc(soc().nom) + '</div></div>';
    App.printHTML('Décompte ' + d.numero, html);
  };

  /* ---------------- Situation sous-traitant ---------------- */
  App.printSituation = function (id) {
    const s = App.db.find('situations', id);
    if (!s) return;
    const ch = chantierOf(s);
    const st = App.db.find('sousTraitants', s.sousTraitantId);
    const t = App.calc.situation(s);
    const lines = (s.lignes || []).map(function (l) {
      const cumul = n(l.montantMarche) * App.clamp(n(l.pctCumule), 0, 100) / 100;
      const prec = n(l.montantMarche) * App.clamp(n(l.pctPrecedent), 0, 100) / 100;
      return '<tr><td>' + esc(l.designation) + '</td><td class="r">' + money(l.montantMarche) + '</td><td class="r">' + num(l.pctPrecedent) +
        ' %</td><td class="r">' + num(l.pctCumule) + ' %</td><td class="r">' + money(cumul) + '</td><td class="r">' + money(cumul - prec) + '</td></tr>';
    }).join('');
    const rows = [
      { label: 'Montant du marché', value: money(t.marche) },
      { label: 'Travaux cumulés', value: money(t.cumul) },
      { label: 'Déjà facturé', value: '− ' + money(t.precedent) },
      { label: 'Travaux de la période', value: money(t.periode) },
      { label: 'Retenue de garantie (' + num(s.retenue) + ' %)', value: '− ' + money(t.retenue) },
      { label: 'TVA (' + num(s.tva) + ' %)', value: money(t.tva) },
      { label: 'Net à payer', value: money(t.net), strong: true }
    ];
    const html = docHead('SITUATION DE SOUS-TRAITANT', s.numero, s.date, 'Période : ' + esc(s.periode || '—'), ch) +
      '<div class="doc-parties">' +
        party('Sous-traitant', st ? '<p><strong>' + esc(st.nom) + '</strong><br>' + esc(st.specialite || '') + '<br>' + esc(st.adresse || '') + '<br>' + esc((st.cp || '') + ' ' + (st.ville || '')) + '<br>SIRET ' + esc(st.siret || '') + '</p>' : '<p>—</p>') +
        party('Chantier', ch ? '<p><strong>' + esc(ch.code || '') + '</strong><br>' + esc(ch.nom) + '<br>' + chantierAddress(ch) + '</p>' : '<p>—</p>') +
      '</div>' +
      table(lines, [
        { label: 'Désignation' }, { label: 'Marché HT', r: true }, { label: '% ant.', r: true }, { label: '% cumulé', r: true }, { label: 'Cumulé HT', r: true }, { label: 'Période HT', r: true }
      ]) +
      totals(rows) +
      (s.notes ? '<div class="notes"><strong>Observations :</strong> ' + esc(s.notes) + '</div>' : '') +
      '<div class="notes">' + esc(App.settings().mentionsSituation) + '</div>' +
      '<div class="sign"><div>Le sous-traitant</div><div>Pour ' + esc(soc().nom) + '</div></div>';
    App.printHTML('Situation ' + s.numero, html);
  };

  /* ---------------- Fiche chantier ---------------- */
  App.printChantier = function (id) {
    const ch = App.db.find('chantiers', id);
    if (!ch) return;
    const av = App.avancement(ch);
    const tasks = App.db.get('taches').filter(function (t) { return t.chantierId === ch.id; });
    const devis = App.db.get('devis').filter(function (d) { return d.chantierId === ch.id; });
    const commandes = App.db.get('commandes').filter(function (c) { return c.chantierId === ch.id; });
    const decomptes = App.db.get('decomptes').filter(function (d) { return d.chantierId === ch.id; });
    const ca = App.sum(devis.filter(function (d) { return d.statut === 'Accepté'; }), function (d) { return App.calc.devis(d).ht; });
    const engage = App.sum(commandes.filter(function (c) { return c.statut !== 'Annulé'; }), function (c) { return App.calc.commande(c).ht; });
    const facture = App.sum(decomptes.filter(function (d) { return d.statut === 'Payé' || d.statut === 'Envoyé'; }), function (d) { return App.calc.decompte(d).ht; });
    const lots = (ch.lots || []).map(function (l) {
      return '<tr><td>' + esc(l.nom) + '</td><td class="r">' + num(l.poids) + ' %</td><td class="r">' + num(l.avancement) + ' %</td><td class="r">' + num(App.n(l.poids) * App.n(l.avancement) / 100) + ' %</td></tr>';
    }).join('');
    const taskRows = tasks.map(function (t) {
      return '<tr><td>' + esc(t.nom) + '</td><td>' + esc(t.responsable || '') + '</td><td>' + fmtDate(t.debut) + ' → ' + fmtDate(t.fin) + '</td><td>' + esc(t.statut) + '</td><td class="r">' + num(t.avancement) + ' %</td></tr>';
    }).join('');
    const html = docHead('FICHE CHANTIER', ch.code || '—', App.todayISO(), null, ch) +
      '<div class="doc-parties">' +
        party('Maître d\'ouvrage', '<p><strong>' + esc(ch.client || '—') + '</strong><br>' + esc(ch.contact || '') + '<br>' + esc(ch.tel || '') + (ch.email ? '<br>' + esc(ch.email) : '') + '</p>') +
        party('Chantier', '<p><strong>' + esc(ch.nom) + '</strong><br>' + chantierAddress(ch) + '<br>Conducteur : ' + esc(ch.chef || '—') + '<br>Statut : ' + esc(ch.statut || '—') + (ch.tranche ? '<br>Tranche : ' + esc(ch.tranche) : '') + (ch.gh ? '<br>GH : ' + esc(ch.gh) : '') + (App.chantierProgramme(ch) ? '<br>Programme : ' + esc(App.chantierProgramme(ch)) : '') + '</p>') +
      '</div>' +
      '<div class="kpi-doc"><div><span>Avancement</span><b>' + num(Math.round(av * 10) / 10) + ' %</b></div><div><span>Budget</span><b>' + money(ch.budget) + '</b></div><div><span>Devis acceptés</span><b>' + money(ca) + '</b></div><div><span>Achats engagés</span><b>' + money(engage) + '</b></div><div><span>Facturé</span><b>' + money(facture) + '</b></div></div>' +
      (ch.description ? '<div class="doc-title">Description</div><p>' + esc(ch.description) + '</p>' : '') +
      '<div class="doc-title">Avancement par lot</div>' +
      '<table class="lines"><thead><tr><th>Lot</th><th class="r">Poids</th><th class="r">Avancement</th><th class="r">Contribution</th></tr></thead><tbody>' + (lots || '<tr><td colspan="4">Aucun lot renseigné</td></tr>') + '</tbody></table>' +
      '<div class="doc-title">Planning des tâches</div>' +
      '<table class="lines"><thead><tr><th>Tâche</th><th>Responsable</th><th>Période</th><th>Statut</th><th class="r">Avanc.</th></tr></thead><tbody>' + (taskRows || '<tr><td colspan="5">Aucune tâche</td></tr>') + '</tbody></table>' +
      '<div class="notes">Document généré le ' + fmtDate(App.todayISO()) + ' — ' + esc(soc().nom) + '. Données indicatives à vérifier avant diffusion.</div>';
    App.printHTML('Fiche chantier ' + ch.nom, html);
  };
  /* ---------------- Impression des listes (tous les onglets) ---------------- */
  function textOf(html) {
    if (html == null) return '';
    const raw = String(html);
    if (raw.indexOf('<') === -1) return raw;
    const d = document.createElement('div');
    d.innerHTML = raw
      .replace(/<div class="sub">/g, ' — ')
      .replace(/<br\s*\/?>/gi, ' ');
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function listCell(col, row) {
    if (typeof col.print === 'function') {
      const v = col.print(row);
      return v == null ? '' : String(v);
    }
    if (typeof col.render === 'function') return textOf(col.render(row));
    const v = row[col.k];
    switch (col.type) {
      case 'money': return money(v);
      case 'number': return num(v);
      case 'percent': return num(v) + ' %';
      case 'date': return v ? fmtDate(v) : '';
      case 'badge': return v == null ? '' : String(v);
      default: return v == null ? '' : String(v);
    }
  }

  function entityTotals(key, rows) {
    const fns = {
      chantiers: function () {
        const budget = App.sum(rows, function (r) { return n(r.budget); });
        const av = rows.length ? App.sum(rows, function (r) { return App.avancement(r); }) / rows.length : 0;
        return [
          { label: 'Chantiers', value: String(rows.length) },
          { label: 'Budget cumulé', value: money(budget) },
          { label: 'Avancement moyen', value: num(Math.round(av * 10) / 10) + ' %', strong: true }
        ];
      },
      devis: function () {
        const ht = App.sum(rows, function (r) { return App.calc.devis(r).ht; });
        const ttc = App.sum(rows, function (r) { return App.calc.devis(r).ttc; });
        return [
          { label: 'Devis', value: String(rows.length) },
          { label: 'Total HT', value: money(ht) },
          { label: 'Total TTC', value: money(ttc), strong: true }
        ];
      },
      commandes: function () {
        const ht = App.sum(rows, function (r) { return App.calc.commande(r).ht; });
        const ttc = App.sum(rows, function (r) { return App.calc.commande(r).ttc; });
        return [
          { label: 'Bons de commande', value: String(rows.length) },
          { label: 'Total HT', value: money(ht) },
          { label: 'Total TTC', value: money(ttc), strong: true }
        ];
      },
      decomptes: function () {
        const ht = App.sum(rows, function (r) { return App.calc.decompte(r).ht; });
        const net = App.sum(rows, function (r) { return App.calc.decompte(r).net; });
        return [
          { label: 'Décomptes', value: String(rows.length) },
          { label: 'Travaux HT', value: money(ht) },
          { label: 'Net à payer', value: money(net), strong: true }
        ];
      },
      situations: function () {
        const periode = App.sum(rows, function (r) { return App.calc.situation(r).periode; });
        const net = App.sum(rows, function (r) { return App.calc.situation(r).net; });
        return [
          { label: 'Situations', value: String(rows.length) },
          { label: 'Travaux de la période', value: money(periode) },
          { label: 'Net à payer', value: money(net), strong: true }
        ];
      },
      articles: function () {
        const valeur = App.sum(rows, function (r) { return n(r.stock) * n(r.prixUnitaire); });
        const alerts = rows.filter(function (r) { return n(r.stock) <= n(r.seuil); }).length;
        return [
          { label: 'Articles', value: String(rows.length) },
          { label: 'Articles en alerte', value: String(alerts) },
          { label: 'Valeur du stock', value: money(valeur), strong: true }
        ];
      },
      essaisBeton: function () {
        const statutOf = App.essaiBetonStatut || function (e) {
          if (!n(e.resultat28)) return 'En attente';
          if (!n(e.resistanceCible)) return '';
          return n(e.resultat28) >= n(e.resistanceCible) ? 'Conforme' : 'Non conforme';
        };
        const conformes = rows.filter(function (r) { return statutOf(r) === 'Conforme'; }).length;
        const nonConformes = rows.filter(function (r) { return statutOf(r) === 'Non conforme'; }).length;
        const attente = rows.filter(function (r) { return statutOf(r) === 'En attente'; }).length;
        const evalues = conformes + nonConformes;
        return [
          { label: 'Prélèvements', value: String(rows.length) },
          { label: 'Conformes', value: String(conformes) },
          { label: 'Non conformes', value: String(nonConformes) },
          { label: 'En attente', value: String(attente) },
          { label: 'Taux de conformité', value: evalues ? num(Math.round(conformes / evalues * 1000) / 10) + ' %' : '—', strong: true }
        ];
      },
      personnel: function () {
        return [
          { label: 'Contacts', value: String(rows.length) },
          { label: 'Actifs', value: String(rows.filter(function (r) { return r.statut === 'Actif'; }).length) }
        ];
      },
      fournisseurs: function () {
        return [{ label: 'Fournisseurs', value: String(rows.length), strong: true }];
      },
      sousTraitants: function () {
        return [{ label: 'Sous-traitants', value: String(rows.length), strong: true }];
      },
      documents: function () {
        const aValider = rows.filter(function (r) { return App.docStatut && App.docStatut(r) === 'À valider'; }).length;
        return [
          { label: 'Documents', value: String(rows.length) },
          { label: 'À valider', value: String(aValider) }
        ];
      }
    };
    return fns[key] ? fns[key]() : [];
  }

  App.printList = function (key, rows, opts) {
    opts = opts || {};
    const ent = App.entities[key];
    if (!ent) return;
    rows = (rows || []).slice();
    if (!rows.length) {
      App.toast('Aucun élément à imprimer pour cette sélection.', 'err');
      return;
    }
    const byKey = {};
    ent.cols.forEach(function (c) { byKey[c.k] = c; });
    let cols = ent.cols.filter(function (c) { return c.print !== false; });
    if (Array.isArray(ent.printCols) && ent.printCols.length) {
      cols = ent.printCols.map(function (c) { return typeof c === 'string' ? byKey[c] : c; }).filter(Boolean);
    }
    if (Array.isArray(opts.cols) && opts.cols.length) {
      cols = opts.cols.map(function (c) { return typeof c === 'string' ? byKey[c] : c; }).filter(Boolean);
    }
    const title = opts.title || ent.printTitle || ((ent.singular || 'Élément') + 's');
    const ch = opts.chantierId && opts.chantierId !== 'all' ? App.db.find('chantiers', opts.chantierId) : null;
    const sub = opts.subtitle || (rows.length + ' élément' + (rows.length > 1 ? 's' : ''));
    const head = cols.map(function (c) {
      return '<th class="' + (c.align === 'right' ? 'r' : '') + '">' + esc(c.label || c.l || '') + '</th>';
    }).join('');
    const body = rows.map(function (row) {
      return '<tr>' + cols.map(function (c) {
        return '<td class="' + (c.align === 'right' ? 'r' : '') + '">' + esc(listCell(c, row)) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    const totalsHTML = totals(Array.isArray(opts.totals) ? opts.totals : entityTotals(key, rows));
    const html = docHead(title, rows.length + ' élément' + (rows.length > 1 ? 's' : ''), App.todayISO(), esc(sub), ch) +
      '<table class="lines compact"><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table>' +
      totalsHTML +
      '<div class="notes">Document généré le ' + fmtDate(App.todayISO()) + ' — ' + esc(soc().nom) + '. Données indicatives à vérifier avant diffusion.</div>';
    App.printHTML(title, html, { landscape: opts.landscape != null ? opts.landscape : cols.length >= 7 });
  };

  /* ---------------- Planning ---------------- */
  App.printPlanning = function (rows, filtre, opts) {
    rows = (rows || []).slice().sort(function (a, b) { return String(a.debut || '').localeCompare(String(b.debut || '')); });
    if (!rows.length) {
      App.toast('Aucune tâche à imprimer pour cette sélection.', 'err');
      return;
    }
    const titre = opts && opts.titre ? String(opts.titre) : '';
    const lines = rows.map(function (t) {
      const ch = App.db.find('chantiers', t.chantierId);
      return '<tr><td><strong>' + esc(t.nom) + '</strong></td>' +
        '<td>' + esc(ch ? ch.code : '—') + '</td>' +
        '<td>' + esc(App.trancheOf(t) || '—') + '</td>' +
        '<td>' + esc(t.responsable || '—') + '</td>' +
        '<td>' + (t.debut ? fmtDate(t.debut) : '—') + '</td>' +
        '<td>' + (t.fin ? fmtDate(t.fin) : '—') + '</td>' +
        '<td>' + esc(t.statut || '—') + '</td>' +
        '<td class="r">' + num(t.avancement) + ' %</td></tr>';
    }).join('');
    const html = docHead(titre ? 'PLANNING — ' + titre.toUpperCase() : 'PLANNING DES TÂCHES', rows.length + ' tâche' + (rows.length > 1 ? 's' : ''), App.todayISO(),
      filtre && filtre !== 'Toutes' ? 'Filtre : ' + esc(filtre) : null, null) +
      '<table class="lines compact"><thead><tr><th>Tâche</th><th>Chantier</th><th>Tranche</th><th>Responsable</th>' +
      '<th>Début</th><th>Fin</th><th>Statut</th><th class="r">Avanc.</th></tr></thead><tbody>' + lines + '</tbody></table>' +
      '<div class="notes">Document généré le ' + fmtDate(App.todayISO()) + ' — ' + esc(soc().nom) + '. Données indicatives à vérifier avant diffusion.</div>';
    App.printHTML(titre ? 'Planning — ' + titre : 'Planning des tâches', html, { landscape: true });
  };

  /* ---------------- Avancement ---------------- */
  App.printAvancement = function (chantiers) {
    const list = (chantiers || App.db.get('chantiers')).slice();
    if (!list.length) {
      App.toast('Aucun chantier à imprimer.', 'err');
      return;
    }
    const blocks = list.map(function (ch) {
      const lots = ch.lots || [];
      const rows = lots.length ? lots.map(function (l) {
        return '<tr><td>' + esc(l.nom) + '</td><td class="r">' + num(l.poids) + ' %</td>' +
          '<td class="r">' + num(l.avancement) + ' %</td><td class="r">' +
          num(n(l.poids) * n(l.avancement) / 100) + ' %</td></tr>';
      }).join('') : '<tr><td colspan="4">Aucun lot renseigné</td></tr>';
      return '<div class="doc-title">' + esc(ch.code || '—') + ' — ' + esc(ch.nom) + '</div>' +
        '<p><strong>' + esc(ch.client || 'Client non renseigné') + '</strong>' +
        (ch.chef ? ' · Conducteur : ' + esc(ch.chef) : '') +
        (ch.statut ? ' · Statut : ' + esc(ch.statut) : '') + '</p>' +
        '<p>Avancement global pondéré : <strong>' + num(Math.round(App.avancement(ch) * 10) / 10) + ' %</strong></p>' +
        '<table class="lines compact"><thead><tr><th>Lot</th><th class="r">Poids</th><th class="r">Avancement</th><th class="r">Contribution</th></tr></thead><tbody>' +
        rows + '</tbody></table>';
    }).join('');
    const html = docHead('AVANCEMENT DES CHANTIERS', list.length + ' chantier' + (list.length > 1 ? 's' : ''), App.todayISO(), null, null) +
      blocks +
      '<div class="notes">Document généré le ' + fmtDate(App.todayISO()) + ' — ' + esc(soc().nom) + '. Données indicatives à vérifier avant diffusion.</div>';
    App.printHTML('Avancement des chantiers', html, { landscape: false });
  };

  /* ---------------- Tableau de bord ---------------- */
  App.printDashboard = function () {
    const chantiers = App.db.get('chantiers');
    const actifs = chantiers.filter(function (c) { return c.statut === 'En cours'; });
    const avg = actifs.length ? App.sum(actifs, function (c) { return App.avancement(c); }) / actifs.length : 0;
    const devisOK = App.db.get('devis').filter(function (d) { return d.statut === 'Accepté'; });
    const carnet = App.sum(devisOK, function (d) { return App.calc.devis(d).ht; });
    const engagements = App.sum(App.db.get('commandes').filter(function (c) { return c.statut !== 'Annulé'; }), function (c) { return App.calc.commande(c).ht; });
    const aEncaisser = App.sum(App.db.get('decomptes').filter(function (d) { return d.statut === 'Envoyé'; }), function (d) { return App.calc.decompte(d).net; });
    const alerts = App.alerts();
    const tasks = App.db.get('taches').filter(function (t) { return t.statut !== 'Terminé'; })
      .sort(function (a, b) { return String(a.fin || '').localeCompare(String(b.fin || '')); }).slice(0, 8);
    const chLines = actifs.map(function (c) {
      return '<tr><td><strong>' + esc(c.code || '—') + '</strong></td><td><strong>' + esc(c.nom) + '</strong>' +
        (App.chantierRefs(c) ? '<div class="sub">' + esc(App.chantierRefs(c)) + '</div>' : '') + '</td>' +
        '<td>' + esc(c.client || '—') + '</td><td>' + esc(c.chef || '—') + '</td>' +
        '<td class="r">' + num(Math.round(App.avancement(c) * 10) / 10) + ' %</td>' +
        '<td class="r">' + money(c.budget) + '</td><td>' + esc(c.statut || '—') + '</td></tr>';
    }).join('') || '<tr><td colspan="7">Aucun chantier en cours</td></tr>';
    const taskLines = tasks.map(function (t) {
      return '<tr><td>' + esc(t.nom) + '</td><td>' + esc(App.chantierLabel(t.chantierId)) + '</td>' +
        '<td>' + esc(t.responsable || '—') + '</td><td>' + (t.fin ? fmtDate(t.fin) : '—') + '</td>' +
        '<td>' + esc(t.statut || '—') + '</td></tr>';
    }).join('') || '<tr><td colspan="5">Aucune échéance à venir</td></tr>';
    const alertLines = alerts.slice(0, 10).map(function (a) {
      return '<tr><td>' + esc(a.kind || '') + '</td><td>' + esc(a.title || '') + '</td><td>' + esc(a.detail || '') + '</td></tr>';
    }).join('') || '<tr><td colspan="3">Aucune alerte</td></tr>';
    const html = docHead('TABLEAU DE BORD', 'Synthèse d\'activité', App.todayISO(), null, null) +
      '<div class="kpi-doc">' +
        '<div><span>Chantiers actifs</span><b>' + actifs.length + ' / ' + chantiers.length + '</b></div>' +
        '<div><span>Avancement moyen</span><b>' + num(Math.round(avg * 10) / 10) + ' %</b></div>' +
        '<div><span>Carnet de commandes</span><b>' + money(carnet) + '</b></div>' +
        '<div><span>Achats engagés</span><b>' + money(engagements) + '</b></div>' +
      '</div>' +
      '<div class="kpi-doc">' +
        '<div><span>Valeur du stock</span><b>' + money(App.stockValeur()) + '</b></div>' +
        '<div><span>À encaisser</span><b>' + money(aEncaisser) + '</b></div>' +
        '<div><span>Alertes</span><b>' + alerts.length + '</b></div>' +
        '<div><span>Chantiers au total</span><b>' + chantiers.length + '</b></div>' +
      '</div>' +
      '<div class="doc-title">Chantiers en cours</div>' +
      '<table class="lines compact"><thead><tr><th>Code</th><th>Chantier</th><th>Client</th><th>Conducteur</th>' +
      '<th class="r">Avancement</th><th class="r">Budget</th><th>Statut</th></tr></thead><tbody>' + chLines + '</tbody></table>' +
      '<div class="doc-title">Prochaines échéances</div>' +
      '<table class="lines compact"><thead><tr><th>Tâche</th><th>Chantier</th><th>Responsable</th><th>Fin</th><th>Statut</th></tr></thead><tbody>' + taskLines + '</tbody></table>' +
      '<div class="doc-title">Alertes</div>' +
      '<table class="lines compact"><thead><tr><th>Type</th><th>Alerte</th><th>Détail</th></tr></thead><tbody>' + alertLines + '</tbody></table>' +
      '<div class="notes">Document généré le ' + fmtDate(App.todayISO()) + ' — ' + esc(soc().nom) + '. Données indicatives à vérifier avant diffusion.</div>';
    App.printHTML('Tableau de bord', html, { landscape: true });
  };

  /* ---------------- Fiche entreprise (paramètres) ---------------- */
  App.printParametres = function () {
    const s = App.settings();
    const e = s.societe || {};
    const info = App.storageInfo ? App.storageInfo() : null;
    const rows = [
      ['Raison sociale', e.nom], ['Adresse', e.adresse],
      ['Code postal / ville', (e.cp || '') + (e.cp || e.ville ? ' ' : '') + (e.ville || '')],
      ['Téléphone', e.tel], ['Email', e.email]
    ].filter(function (r) { return String(r[1] || '').trim(); }).map(function (r) {
      return '<tr><td><strong>' + esc(r[0]) + '</strong></td><td>' + esc(String(r[1])) + '</td></tr>';
    }).join('') || '<tr><td colspan="2">Identité non renseignée</td></tr>';
    const defs = [
      ['TVA par défaut', num(s.tvaDefaut) + ' %'],
      ['Retenue de garantie par défaut', num(s.retenueGarantie) + ' %']
    ].map(function (r) {
      return '<tr><td><strong>' + esc(r[0]) + '</strong></td><td>' + esc(r[1]) + '</td></tr>';
    }).join('');
    const mentions = [
      ['Devis', s.mentionsDevis], ['Bons de commande', s.mentionsCommande],
      ['Décomptes', s.mentionsDecompte], ['Situations sous-traitants', s.mentionsSituation]
    ].filter(function (r) { return String(r[1] || '').trim(); }).map(function (r) {
      return '<div class="doc-title">' + esc(r[0]) + '</div><p>' + esc(String(r[1])) + '</p>';
    }).join('') || '<p class="muted">Aucune mention personnalisée.</p>';
    const html = docHead('FICHE ENTREPRISE', e.nom || 'Mon entreprise', App.todayISO(), 'Paramètres et identité', null) +
      '<div class="doc-title">Identité</div>' +
      '<table class="lines compact"><tbody>' + rows + '</tbody></table>' +
      '<div class="doc-title">Valeurs par défaut</div>' +
      '<table class="lines compact"><tbody>' + defs + '</tbody></table>' +
      '<div class="doc-title">Mentions imprimées</div>' + mentions +
      '<div class="doc-title">Données locales</div>' +
      '<table class="lines compact"><tbody>' +
        '<tr><td><strong>Version applicative</strong></td><td>' + esc(App.version) + '</td></tr>' +
        '<tr><td><strong>Chantiers</strong></td><td>' + App.db.get('chantiers').length + '</td></tr>' +
        '<tr><td><strong>Articles en stock</strong></td><td>' + App.db.get('articles').length + '</td></tr>' +
        '<tr><td><strong>Documents</strong></td><td>' + App.db.get('documents').length + '</td></tr>' +
        (info ? '<tr><td><strong>Espace utilisé</strong></td><td>' + esc(info.texte) + '</td></tr>' : '') +
      '</tbody></table>' +
      '<div class="notes">Document généré le ' + fmtDate(App.todayISO()) + ' — ' + esc(e.nom || '') + '.</div>';
    App.printHTML('Fiche entreprise', html, { landscape: false });
  };

  /* ---------------- Rapport récapitulatif des essais béton ---------------- */
  App.printEssaisBeton = function () {
    const chId = App.state && App.state.chantierId;
    const filtre = chId && chId !== 'all';
    const all = App.db.get('essaisBeton') || [];
    const rows = (filtre ? all.filter(function (e) { return e.chantierId === chId; }) : all.slice())
      .sort(function (a, b) {
        const ka = (a.datePrelevement || '') + ' ' + (a.heureCoulage || '');
        const kb = (b.datePrelevement || '') + ' ' + (b.heureCoulage || '');
        return kb.localeCompare(ka);
      });
    if (!rows.length) {
      App.toast('Aucun essai béton à imprimer pour cette sélection.', 'err');
      return;
    }

    const statutOf = App.essaiBetonStatut || function (e) {
      if (!n(e.resultat28)) return 'En attente';
      if (!n(e.resistanceCible)) return '';
      return n(e.resultat28) >= n(e.resistanceCible) ? 'Conforme' : 'Non conforme';
    };
    const echeanceOf = App.essaiBetonEcheance || function (e) {
      return e.datePrelevement ? App.addDays(e.datePrelevement, 28) : '';
    };

    const conformes = rows.filter(function (e) { return statutOf(e) === 'Conforme'; }).length;
    const nonConformes = rows.filter(function (e) { return statutOf(e) === 'Non conforme'; }).length;
    const attente = rows.filter(function (e) { return statutOf(e) === 'En attente'; }).length;
    const evalues = conformes + nonConformes;
    const taux = evalues ? Math.round(conformes / evalues * 1000) / 10 : 0;
    const dates = rows.map(function (e) { return e.datePrelevement; }).filter(Boolean).sort();
    const periode = dates.length
      ? 'Période : du ' + fmtDate(dates[0]) + ' au ' + fmtDate(dates[dates.length - 1])
      : '';
    const chantier = filtre ? App.db.find('chantiers', chId) : null;

    const badgeClass = function (s) {
      return s === 'Conforme' ? 'badge-ok' : s === 'Non conforme' ? 'badge-ko' : 'badge-wait';
    };

    const lines = rows.map(function (e) {
      const s = statutOf(e);
      const ech = echeanceOf(e);
      return '<tr>' +
        '<td>' + (e.datePrelevement ? fmtDate(e.datePrelevement) : '—') +
          (e.heureCoulage ? '<br><span style="color:#777">à ' + esc(e.heureCoulage) + '</span>' : '') +
          (e.reference ? '<br><span style="color:#777">' + esc(e.reference) + '</span>' : '') + '</td>' +
        '<td>' + esc(e.chantierId ? App.chantierLabel(e.chantierId) : '—') + '</td>' +
        '<td>' + esc(e.typeBeton || '—') + (e.ouvrage ? '<br><span style="color:#777">' + esc(e.ouvrage) + '</span>' : '') + '</td>' +
        '<td>' + esc(e.eprouvettes || '—') + '</td>' +
        '<td class="r">' + (n(e.resistanceCible) ? num(e.resistanceCible) : '—') + '</td>' +
        '<td class="r">' + (n(e.resultat7) ? num(e.resultat7) : '—') + '</td>' +
        '<td class="r">' + (n(e.resultat28) ? num(e.resultat28) : '—') + '</td>' +
        '<td>' + (s ? '<span class="badge-doc ' + badgeClass(s) + '">' + esc(s) + '</span>' : '—') +
          (s === 'En attente' && ech ? '<br><span style="color:#777">attendu le ' + fmtDate(ech) + '</span>' : '') + '</td>' +
        '</tr>';
    }).join('');

    let synthese = '';
    if (!filtre) {
      const groupes = {};
      rows.forEach(function (e) {
        const k = e.chantierId || '__';
        if (!groupes[k]) groupes[k] = { total: 0, ok: 0, ko: 0, att: 0 };
        groupes[k].total += 1;
        const s = statutOf(e);
        if (s === 'Conforme') groupes[k].ok += 1;
        else if (s === 'Non conforme') groupes[k].ko += 1;
        else groupes[k].att += 1;
      });
      const trs = Object.keys(groupes).map(function (k) {
        const g = groupes[k];
        return '<tr><td>' + esc(k === '__' ? 'Sans chantier' : App.chantierLabel(k)) + '</td>' +
          '<td class="r">' + g.total + '</td><td class="r">' + g.ok + '</td>' +
          '<td class="r">' + g.ko + '</td><td class="r">' + g.att + '</td></tr>';
      }).join('');
      synthese = '<div class="doc-title">Synthèse par chantier</div>' +
        '<table class="lines"><thead><tr><th>Chantier</th><th class="r">Essais</th>' +
        '<th class="r">Conformes</th><th class="r">Non conformes</th><th class="r">En attente</th>' +
        '</tr></thead><tbody>' + trs + '</tbody></table>';
    }

    const html = docHead('RAPPORT ESSAIS BÉTON', 'Récapitulatif', App.todayISO(), periode, chantier) +
      '<div class="kpi-doc">' +
        '<div><span>Prélèvements</span><b>' + rows.length + '</b></div>' +
        '<div><span>Conformes</span><b>' + conformes + '</b></div>' +
        '<div><span>Non conformes</span><b>' + nonConformes + '</b></div>' +
        '<div><span>En attente</span><b>' + attente + '</b></div>' +
        '<div><span>Taux de conformité</span><b>' + num(taux) + ' %</b></div>' +
      '</div>' +
      synthese +
      '<div class="doc-title">Détail des essais (' + rows.length + ')</div>' +
      '<table class="lines compact"><thead><tr>' +
        '<th>Prélèvement</th><th>Chantier</th><th>Béton / ouvrage</th><th>N° éprouvettes</th>' +
        '<th class="r">Cible</th><th class="r">7 j</th><th class="r">28 j</th><th>Conformité</th>' +
      '</tr></thead><tbody>' + lines + '</tbody></table>' +
      '<div class="sign"><div>Visa entreprise</div><div>Visa laboratoire</div></div>' +
      '<div class="notes">Taux de conformité calculé sur les essais dont le résultat à 28 jours est connu (' +
        evalues + ' essai' + (evalues > 1 ? 's' : '') + '). Résistances en MPa. ' +
        'Document généré le ' + fmtDate(App.todayISO()) + ' — ' + esc(soc().nom) + '. Données indicatives à vérifier avant diffusion.</div>';

    App.printHTML('Rapport essais béton', html);
  };

  /* ---------------- Rapports quotidiens (journaux de chantier) ---------------- */
  function texteDoc(v) {
    const s = String(v || '').trim();
    return s ? esc(s).replace(/\n/g, '<br>') : '<span style="color:#777">—</span>';
  }

  function extraitDoc(v, max) {
    const s = String(v || '').replace(/\s+/g, ' ').trim();
    return s.length > max ? s.slice(0, max).trim() + '…' : s;
  }

  function champDoc(label, value) {
    return '<p><strong>' + esc(label) + ' :</strong> ' + texteDoc(value) + '</p>';
  }

  function rapportDetail(r, withTitle) {
    const ch = App.db.find('chantiers', r.chantierId);
    return (withTitle
      ? '<div class="doc-title">Rapport du ' + fmtDate(r.date) + (r.reference ? ' — ' + esc(r.reference) : '') + '</div>'
      : '') +
      '<div class="party">' +
        '<h4>Chantier & encadrement</h4>' +
        champDoc('Chantier', ch ? App.chantierLabel(ch.id) : '') +
        champDoc('Responsable', r.responsable) +
        champDoc('Statut', r.statut) +
        champDoc('Effectif', r.effectif ? num(r.effectif) + ' personne' + (n(r.effectif) > 1 ? 's' : '') : '') +
        champDoc('Heures travaillées', r.heures ? num(r.heures) + ' h' : '') +
        champDoc('Météo', r.meteo) +
        champDoc('Température', r.temperature ? num(r.temperature) + ' °C' : '') +
      '</div>' +
      '<div class="party">' +
        '<h4>Travaux réalisés</h4>' + texteDoc(r.travaux) +
      '</div>' +
      '<div class="party">' +
        '<h4>Main-d’œuvre, matériel et livraisons</h4>' +
        champDoc('Main-d’œuvre', r.mainOeuvre) +
        champDoc('Matériel', r.materiel) +
        champDoc('Livraisons', r.livraisons) +
      '</div>' +
      '<div class="party">' +
        '<h4>Incidents & observations</h4>' +
        champDoc('Incidents / retards', r.incidents) +
        champDoc('Observations', r.observations) +
      '</div>';
  }

  App.printRapportQuotidien = function (id) {
    const r = App.db.find('rapportsQuotidien', id);
    if (!r) {
      App.toast('Rapport quotidien introuvable.', 'err');
      return;
    }
    const ch = App.db.find('chantiers', r.chantierId);
    const html = docHead('RAPPORT QUOTIDIEN', r.reference || fmtDate(r.date), r.date,
      r.statut ? 'Statut : ' + esc(r.statut) : null, ch) +
      '<div class="kpi-doc">' +
        '<div><span>Effectif</span><b>' + (r.effectif ? num(r.effectif) : '—') + '</b></div>' +
        '<div><span>Heures</span><b>' + (r.heures ? num(r.heures) + ' h' : '—') + '</b></div>' +
        '<div><span>Météo</span><b>' + esc(r.meteo || '—') + '</b></div>' +
        '<div><span>Incident</span><b>' + (String(r.incidents || '').trim() ? 'Oui' : 'Non') + '</b></div>' +
      '</div>' +
      rapportDetail(r, false) +
      '<div class="sign"><div>Responsable de chantier</div><div>Visa maître d’ouvrage</div></div>' +
      '<div class="notes">Document généré le ' + fmtDate(App.todayISO()) + ' — ' + esc(soc().nom) +
        '. Données indicatives à vérifier avant diffusion.</div>';
    App.printHTML('Rapport quotidien — ' + (r.reference || fmtDate(r.date)), html);
  };

  App.printRapportsQuotidien = function () {
    const chId = App.state && App.state.chantierId;
    const filtre = chId && chId !== 'all';
    const all = App.db.get('rapportsQuotidien') || [];
    const rows = (filtre ? all.filter(function (r) { return r.chantierId === chId; }) : all.slice())
      .sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
    if (!rows.length) {
      App.toast('Aucun rapport quotidien à imprimer pour cette sélection.', 'err');
      return;
    }
    const dates = rows.map(function (r) { return r.date; }).filter(Boolean).sort();
    const periode = dates.length
      ? 'Période : du ' + fmtDate(dates[0]) + ' au ' + fmtDate(dates[dates.length - 1])
      : '';
    const chantier = filtre ? App.db.find('chantiers', chId) : null;
    const incidents = rows.filter(function (r) { return String(r.incidents || '').trim(); }).length;
    const valides = rows.filter(function (r) { return r.statut === 'Validé'; }).length;

    const lines = rows.map(function (r) {
      return '<tr>' +
        '<td>' + (r.date ? fmtDate(r.date) : '—') +
          (r.reference ? '<br><span style="color:#777">' + esc(r.reference) + '</span>' : '') + '</td>' +
        '<td>' + esc(r.chantierId ? App.chantierLabel(r.chantierId) : '—') + '</td>' +
        '<td>' + esc(r.responsable || '—') + '</td>' +
        '<td>' + esc(extraitDoc(r.travaux, 140)) + '</td>' +
        '<td class="r">' + (r.effectif ? num(r.effectif) : '—') + '</td>' +
        '<td class="r">' + (r.heures ? num(r.heures) + ' h' : '—') + '</td>' +
        '<td>' + esc(r.meteo || '—') + '</td>' +
        '<td>' + esc(r.statut || '—') + '</td>' +
        '</tr>';
    }).join('');

    const html = docHead('RAPPORTS QUOTIDIENS', rows.length + ' rapport' + (rows.length > 1 ? 's' : ''),
      App.todayISO(), periode, chantier) +
      '<div class="kpi-doc">' +
        '<div><span>Rapports</span><b>' + rows.length + '</b></div>' +
        '<div><span>Validés</span><b>' + valides + '</b></div>' +
        '<div><span>Avec incident</span><b>' + incidents + '</b></div>' +
      '</div>' +
      '<div class="doc-title">Historique (' + rows.length + ')</div>' +
      '<table class="lines compact"><thead><tr>' +
        '<th>Date</th><th>Chantier</th><th>Responsable</th><th>Travaux</th>' +
        '<th class="r">Effectif</th><th class="r">Heures</th><th>Météo</th><th>Statut</th>' +
      '</tr></thead><tbody>' + lines + '</tbody></table>' +
      rows.map(function (r) { return rapportDetail(r, true); }).join('') +
      '<div class="sign"><div>Visa entreprise</div><div>Visa maître d’ouvrage</div></div>' +
      '<div class="notes">Document généré le ' + fmtDate(App.todayISO()) + ' — ' + esc(soc().nom) +
        '. Données indicatives à vérifier avant diffusion.</div>';

    App.printHTML('Rapports quotidiens', html, { landscape: true });
  };
})();
