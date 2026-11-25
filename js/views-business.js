/* =========================================================
   ChantierPro — SOSMAJED — fournisseurs, stock, commandes, documents
   ========================================================= */
(function () {
  'use strict';
  const App = window.App;
  const { el, esc, money, num, n, sum, fmtDate, badgeHTML } = App;

  /* ---------------- Fournisseurs ---------------- */
  App.entity('fournisseurs', {
    singular: 'Fournisseur',
    printTitle: 'Fournisseurs',
    cols: [
      { k: 'nom', l: 'Fournisseur', render: function (r) { return '<strong>' + esc(r.nom) + '</strong><div class="sub">' + esc(r.specialite || '') + '</div>'; } },
      { k: 'contact', l: 'Contact' },
      { k: 'tel', l: 'Téléphone' },
      { k: 'email', l: 'Email' },
      { k: 'ville', l: 'Ville' },
      { k: 'commandes', l: 'Commandes', align: 'right', render: function (r) { const c = App.db.get('commandes').filter(function (x) { return x.fournisseurId === r.id; }); return c.length ? '<b>' + c.length + '</b>' : '<span class="muted">0</span>'; }, sortValue: function (r) { return App.db.get('commandes').filter(function (x) { return x.fournisseurId === r.id; }).length; } }
    ],
    fields: [
      { k: 'nom', l: 'Nom du fournisseur', required: true, full: true },
      { k: 'specialite', l: 'Spécialité', full: true },
      { k: 'contact', l: 'Personne de contact' },
      { k: 'tel', l: 'Téléphone', type: 'tel' },
      { k: 'email', l: 'Email', type: 'email' },
      { k: 'adresse', l: 'Adresse', full: true },
      { k: 'cp', l: 'Code postal' },
      { k: 'ville', l: 'Ville' },
      { k: 'notes', l: 'Notes', type: 'textarea', full: true }
    ],
    defaultRow: function () { return {}; }
  });

  App.view('fournisseurs', {
    title: 'Fournisseurs',
    subtitle: 'Carnet d\'adresses et partenaires',
    newLabel: 'Nouveau fournisseur',
    onNew: function () { App.openEntity('fournisseurs'); },
    render: function (root) { App.entityList(root, 'fournisseurs'); }
  });

  /* ---------------- Personnel ---------------- */
  function telHref(v) { return 'tel:' + String(v || '').replace(/[^+0-9]/g, ''); }
  function mailHref(v) { return 'mailto:' + String(v || '').trim(); }

  function contactLink(kind, value) {
    const v = String(value || '').trim();
    if (!v) return '<span class="muted">—</span>';
    const href = kind === 'tel' ? telHref(v) : mailHref(v);
    return '<a class="contact-link" href="' + esc(href) + '">' + App.icon(kind, 13) + '<span>' + esc(v) + '</span></a>';
  }

  App.entity('personnel', {
    singular: 'Contact',
    printTitle: 'Personnel',
    sortKey: 'nom',
    cols: [
      {
        k: 'nom', l: 'Personnel',
        render: function (r) {
          return '<strong>' + esc(r.nom) + '</strong><div class="sub">' + esc(r.fonction || '') +
            (r.categorie ? ' · ' + esc(r.categorie) : '') + '</div>';
        }
      },
      {
        k: 'tel', l: 'Téléphone',
        render: function (r) {
          return contactLink('tel', r.tel) + (r.tel2 ? '<div class="sub">' + contactLink('tel', r.tel2) + '</div>' : '');
        },
        sortValue: function (r) { return String(r.tel || ''); }
      },
      {
        k: 'email', l: 'Email',
        render: function (r) { return contactLink('mail', r.email); }
      },
      {
        k: 'chantierId', l: 'Chantier',
        render: function (r) { return r.chantierId ? esc(App.chantierLabel(r.chantierId)) : '<span class="muted">—</span>'; },
        sortValue: function (r) { return App.chantierLabel(r.chantierId); }
      },
      {
        k: 'statut', l: 'Statut',
        render: function (r) { return badgeHTML(r.statut) + (r.contrat ? '<div class="sub">' + esc(r.contrat) + '</div>' : ''); },
        sortValue: function (r) { return r.statut || ''; }
      }
    ],
    fields: [
      { k: 'nom', l: 'Nom et prénom', required: true },
      { k: 'fonction', l: 'Fonction / poste' },
      { k: 'categorie', l: 'Catégorie', type: 'select', options: ['Équipe interne', 'Sous-traitant', 'Fournisseur', 'Maître d\'ouvrage', 'Bureau d\'étude', 'Topographe', 'Laboratoire', 'Autre'] },
      { k: 'statut', l: 'Statut', type: 'select', options: ['Actif', 'En congé', 'Inactif'] },
      { k: 'contrat', l: 'Type de contrat', type: 'select', options: ['CDI', 'CDD', 'Intérim', 'Apprentissage', 'Sous-traitance', 'Prestation', 'Autre'] },
      { k: 'dateEmbauche', l: 'Date d\'embauche / début', type: 'date' },
      { k: 'tel', l: 'Téléphone principal', type: 'tel', placeholder: '06 12 34 56 78' },
      { k: 'tel2', l: 'Téléphone secondaire', type: 'tel', placeholder: 'Fixe ou mobile professionnel' },
      { k: 'email', l: 'Email', type: 'email', placeholder: 'nom@entreprise.fr' },
      { k: 'adresse', l: 'Adresse', full: true },
      { k: 'cp', l: 'Code postal' },
      { k: 'ville', l: 'Ville' },
      { k: 'chantierId', l: 'Chantier / affectation', type: 'select', ref: 'chantiers', full: true },
      { k: 'urgenceNom', l: 'Contact d\'urgence (nom et lien)' },
      { k: 'urgenceTel', l: 'Téléphone du contact d\'urgence', type: 'tel' },
      { k: 'notes', l: 'Notes, habilitations, informations utiles', type: 'textarea', full: true }
    ],
    defaultRow: function () {
      return {
        categorie: 'Équipe interne',
        statut: 'Actif',
        contrat: 'CDI',
        dateEmbauche: App.todayISO(),
        chantierId: App.state.chantierId !== 'all' ? App.state.chantierId : ''
      };
    }
  });

  App.view('personnel', {
    title: 'Personnel',
    subtitle: 'Annuaire de l\'équipe, des sous-traitants et des intervenants',
    newLabel: 'Nouveau contact',
    onNew: function () { App.openEntity('personnel'); },
    render: function (root) {
      const people = App.db.get('personnel');
      const actifs = people.filter(function (p) { return p.statut === 'Actif'; }).length;
      const affectes = people.filter(function (p) { return !!p.chantierId; }).length;
      const externes = people.filter(function (p) { return p.categorie && p.categorie !== 'Équipe interne'; }).length;
      const bar = el('div');
      bar.innerHTML = '<div class="kpi-grid four">' +
        App.kpi('Contacts', num(people.length), 'équipe et intervenants', 'user', 'blue') +
        App.kpi('Actifs', num(actifs), 'disponibles actuellement', 'check', 'green') +
        App.kpi('Affectés', num(affectes), 'rattachés à un chantier', 'hammer', 'amber') +
        App.kpi('Externes', num(externes), 'sous-traitants et partenaires', 'users', 'red') +
        '</div>';
      root.appendChild(bar);
      App.entityList(root, 'personnel');
    }
  });

  /* ---------------- Stock ---------------- */
  App.entity('articles', {
    singular: 'Article',
    printTitle: 'Stock & fournitures',
    cols: [
      { k: 'ref', l: 'Référence', width: '110px' },
      { k: 'designation', l: 'Article', render: function (r) { return '<strong>' + esc(r.designation) + '</strong><div class="sub">' + esc(App.stockFamille(r)) + (r.categorie ? ' · ' + esc(r.categorie) : '') + (r.emplacement ? ' · ' + esc(r.emplacement) : '') + '</div>'; } },
      { k: 'fournisseurId', l: 'Fournisseur', render: function (r) { return r.fournisseurId ? esc(App.labelFor('fournisseurs', r.fournisseurId)) : '<span class="muted">—</span>'; } },
      { k: 'bonLivraison', l: 'Livraison', width: '150px', render: function (r) {
        if (!r.bonLivraison && !r.dateLivraison) return '<span class="muted">—</span>';
        return (r.bonLivraison ? '<strong>' + esc(r.bonLivraison) + '</strong>' : '<span class="muted">BL non renseigné</span>') +
          '<div class="sub">' + (r.dateLivraison ? esc(App.fmtDate(r.dateLivraison)) : 'date non renseignée') + '</div>';
      }, sortValue: function (r) { return String(r.dateLivraison || ''); } },
      { k: 'stock', l: 'Stock', align: 'right', render: function (r) { const low = n(r.stock) <= n(r.seuil); return '<span class="stock-val' + (low ? ' low' : '') + '"><b>' + num(r.stock) + '</b> ' + esc(r.unite || '') + '</span>' + (low ? ' <span class="badge danger">Alerte</span>' : ''); }, sortValue: function (r) { return n(r.stock); } },
      { k: 'seuil', l: 'Seuil', align: 'right', type: 'number', width: '80px' },
      { k: 'prixUnitaire', l: 'P.U. HT', type: 'money', align: 'right' },
      { k: 'valeur', l: 'Valeur', align: 'right', render: function (r) { return '<b>' + money(n(r.stock) * n(r.prixUnitaire)) + '</b>'; }, sortValue: function (r) { return n(r.stock) * n(r.prixUnitaire); } }
    ],
    fields: [
      { k: 'ref', l: 'Référence', required: true },
      { k: 'designation', l: 'Désignation', required: true },
      { k: 'categorie', l: 'Catégorie', placeholder: 'Gros œuvre, Électricité…' },
      { k: 'famille', l: 'Sous-onglet (famille)', type: 'select', options: function () { return App.stockFamilles(); }, empty: false },
      { k: 'unite', l: 'Unité (u, m, m2, sac…)', placeholder: 'u' },
      { k: 'fournisseurId', l: 'Fournisseur', type: 'select', ref: 'fournisseurs' },
      { k: 'bonLivraison', l: 'Bon de livraison', placeholder: 'N° BL-2026-001' },
      { k: 'dateLivraison', l: 'Date de livraison', type: 'date' },
      { k: 'emplacement', l: 'Emplacement / dépôt' },
      { k: 'stock', l: 'Stock actuel', type: 'number', step: '0.01' },
      { k: 'seuil', l: 'Seuil d\'alerte', type: 'number', step: '0.01' },
      { k: 'prixUnitaire', l: 'Prix unitaire HT', type: 'money' },
      { k: 'notes', l: 'Notes', type: 'textarea', full: true }
    ],
    defaultRow: function () {
      return {
        unite: 'u', stock: 0, seuil: 0, prixUnitaire: 0,
        dateLivraison: App.todayISO(),
        famille: App.state.stockTab && App.state.stockTab !== 'Tous' ? App.state.stockTab : 'Divers'
      };
    },
    rowActions: function (r) {
      return [
        { icon: 'arrowDown', label: 'Entrée de stock', fn: function () { mouvementModal(r.id, 'Entrée'); } },
        { icon: 'arrowUp', label: 'Sortie de stock', fn: function () { mouvementModal(r.id, 'Sortie'); } },
        { icon: 'eye', label: 'Historique des mouvements', fn: function () { historiqueModal(r.id); } }
      ];
    }
  });

  function mouvementModal(articleId, type) {
    const art = articleId ? App.db.find('articles', articleId) : null;
    const ctx = {};
    const ff = App.buildFields([
      { k: 'articleId', l: 'Article', type: 'select', ref: 'articles', required: true, full: true },
      { k: 'type', l: 'Type de mouvement', type: 'select', options: ['Entrée', 'Sortie'], required: true },
      { k: 'quantite', l: 'Quantité', type: 'number', step: '0.01', required: true },
      { k: 'date', l: 'Date', type: 'date', required: true, default: App.todayISO() },
      { k: 'bonLivraison', l: 'Bon de livraison', placeholder: 'N° BL-2026-001' },
      { k: 'chantierId', l: 'Chantier concerné', type: 'select', ref: 'chantiers' },
      { k: 'prixUnitaire', l: 'Prix unitaire HT', type: 'money', default: art ? art.prixUnitaire : 0 },
      { k: 'motif', l: 'Motif / commentaire', full: true, placeholder: 'Coulage dalle, livraison, retour…' }
    ], { articleId: articleId || '', type: type || 'Entrée', date: App.todayISO(), prixUnitaire: art ? art.prixUnitaire : 0 }, ctx);

    /* Le bon de livraison ne concerne que les entrées de stock. */
    const typeEl = ff.el.querySelector('[data-k="type"]');
    const blEl = ff.el.querySelector('[data-k="bonLivraison"]');
    const blWrap = blEl ? blEl.closest('.fld') : null;
    function syncBonLivraison() {
      if (!blWrap || !typeEl) return;
      const entree = typeEl.value === 'Entrée';
      blWrap.style.display = entree ? '' : 'none';
      if (!entree) blEl.value = '';
    }
    if (typeEl) typeEl.addEventListener('change', syncBonLivraison);
    syncBonLivraison();

    App.modal({
      title: 'Mouvement de stock',
      subtitle: art ? art.designation + ' — stock actuel : ' + num(art.stock) + ' ' + (art.unite || '') : 'Entrée ou sortie de dépôt',
      size: 'md',
      body: ff.el,
      actions: [{ label: 'Annuler' }, {
        label: 'Enregistrer le mouvement', kind: 'primary', icon: 'check', onClick: async function (close) {
          if (!ff.validate()) return;
          const v = ff.read();
          if (n(v.quantite) <= 0) { App.toast('La quantité doit être supérieure à zéro.', 'err'); return; }
          if (App.security && !(await App.security.confirmWrite('Enregistrer le mouvement de stock'))) return;
          const a = App.db.find('articles', v.articleId);
          if (v.type === 'Sortie' && a && n(a.stock) < n(v.quantite)) {
            App.confirm({ title: 'Stock insuffisant', message: 'Le stock disponible (' + num(a.stock) + ') est inférieur à la quantité demandée. Continuer quand même ?', confirmLabel: 'Continuer', danger: true }).then(function (ok) {
              if (!ok) return;
              App.addMouvement(null, v.articleId, v.type, v.quantite, v.date, v.chantierId, v.motif, v.prixUnitaire, v.bonLivraison);
              close();
              App.toast('Mouvement enregistré.');
              App.refresh();
            });
            return;
          }
          App.addMouvement(null, v.articleId, v.type, v.quantite, v.date, v.chantierId, v.motif, v.prixUnitaire, v.bonLivraison);
          close();
          App.toast('Mouvement enregistré.');
          App.refresh();
        }
      }]
    });
  }

  function historiqueModal(articleId) {
    const art = App.db.find('articles', articleId);
    if (!art) return;
    const rows = App.db.get('mouvements').filter(function (m) { return m.articleId === articleId; })
      .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    const body = el('div');
    body.innerHTML = '<div class="history-head"><div><span class="muted">Stock actuel</span><b>' + num(art.stock) + ' ' + esc(art.unite || '') + '</b></div><div><span class="muted">Valeur</span><b>' + money(n(art.stock) * n(art.prixUnitaire)) + '</b></div><div><span class="muted">Seuil d\'alerte</span><b>' + num(art.seuil) + '</b></div><div><span class="muted">Bon de livraison</span><b>' + (art.bonLivraison ? esc(art.bonLivraison) : '—') + (art.dateLivraison ? ' · ' + fmtDate(art.dateLivraison) : '') + '</b></div></div>' +
      (rows.length ? '<div class="table-scroll"><table class="data-table"><thead><tr><th>Date</th><th>Type</th><th>BL</th><th class="right">Qté</th><th>Chantier</th><th>Motif</th><th class="right">P.U.</th><th></th></tr></thead><tbody>' +
        rows.map(function (m) {
          return '<tr>' +
            '<td data-label="Date"><div class="cell-val">' + fmtDate(m.date) + '</div></td>' +
            '<td data-label="Type"><div class="cell-val">' + badgeHTML(m.type) + '</div></td>' +
            '<td data-label="BL"><div class="cell-val">' + (m.bonLivraison ? esc(m.bonLivraison) : '<span class="muted">—</span>') + '</div></td>' +
            '<td data-label="Quantité" class="right"><div class="cell-val"><b>' + (m.type === 'Entrée' ? '+' : '−') + num(m.quantite) + '</b></div></td>' +
            '<td data-label="Chantier"><div class="cell-val">' + esc(m.chantierId ? App.chantierLabel(m.chantierId) : '—') + '</div></td>' +
            '<td data-label="Motif"><div class="cell-val">' + esc(m.motif || '') + '</div></td>' +
            '<td data-label="Prix unitaire" class="right"><div class="cell-val">' + money(m.prixUnitaire) + '</div></td>' +
            '<td class="actions-col"><div class="row-actions"><button type="button" class="icon-btn danger" data-del="' + m.id + '" title="Supprimer" aria-label="Supprimer le mouvement">' + App.icon('trash', 14) + '</button></div></td>' +
            '</tr>';
        }).join('') + '</tbody></table></div>'
        : '<p class="muted center pad">Aucun mouvement enregistré pour cet article.</p>');

    const m = App.modal({
      title: 'Historique — ' + art.designation,
      size: 'lg',
      body: body,
      actions: [
        { label: 'Ajouter un mouvement', icon: 'plus', onClick: function (close) { close(); setTimeout(function () { mouvementModal(articleId, 'Entrée'); }, 180); } },
        { label: 'Fermer', kind: 'primary' }
      ]
    });
    App.$$('[data-del]', body).forEach(function (b) {
      b.onclick = async function () {
        const ok = await App.confirm({ title: 'Supprimer le mouvement', message: 'Le stock sera recalculé automatiquement. Continuer ?' });
        if (!ok) return;
        if (App.security && !(await App.security.confirmWrite('Supprimer le mouvement de stock'))) return;
        App.deleteMouvement(b.dataset.del);
        m.close();
        App.toast('Mouvement supprimé.');
        setTimeout(function () { App.refresh(); }, 200);
      };
    });
  }

  /* Gestion des sous-onglets de stock (familles de matériaux). */
  function manageStockFamilles() {
    const items = App.stockFamilles().map(function (name) { return { orig: name, value: name }; });
    const body = el('div');
    const intro = el('p', 'muted');
    intro.style.margin = '0 0 10px';
    intro.textContent = 'Organisez le stock par famille de matériaux. Le renommage et la suppression mettent à jour les articles automatiquement.';
    const rowsWrap = el('div');
    const addWrap = el('div', 'famille-add');
    const addInput = el('input', 'input');
    addInput.placeholder = 'Ex. Gravier, Fer à béton…';
    addInput.setAttribute('aria-label', 'Nouveau sous-onglet de stock');
    const addBtn = el('button', 'btn ghost', App.icon('plus') + '<span>Ajouter</span>');
    addBtn.type = 'button';
    addWrap.append(addInput, addBtn);
    body.append(intro, rowsWrap, addWrap);

    function drawRows() {
      rowsWrap.innerHTML = '';
      items.forEach(function (item, i) {
        const row = el('div', 'famille-row');
        const input = el('input', 'input');
        input.value = item.value;
        input.setAttribute('aria-label', 'Nom du sous-onglet');
        input.addEventListener('input', function () { item.value = input.value; });
        const nb = App.db.get('articles').filter(function (a) { return App.stockFamille(a) === item.orig; }).length;
        const info = el('span', 'famille-count', nb + ' art.');
        const del = el('button', 'icon-btn danger', App.icon('trash', 15));
        del.type = 'button';
        del.title = 'Supprimer ce sous-onglet';
        del.setAttribute('aria-label', 'Supprimer ' + item.value);
        del.onclick = function () {
          if (items.length <= 1) { App.toast('Conservez au moins un sous-onglet.', 'err'); return; }
          items.splice(i, 1);
          drawRows();
        };
        row.append(input, info, del);
        rowsWrap.appendChild(row);
      });
    }

    function addFamily() {
      const name = addInput.value.replace(/\s+/g, ' ').trim();
      if (!name) { App.toast('Saisissez un nom de sous-onglet.', 'err'); addInput.focus(); return; }
      if (items.some(function (it) { return String(it.value).trim().toLowerCase() === name.toLowerCase(); })) {
        App.toast('Ce sous-onglet existe déjà.', 'err');
        addInput.focus();
        return;
      }
      items.push({ orig: name, value: name });
      addInput.value = '';
      drawRows();
      addInput.focus();
    }

    addBtn.onclick = addFamily;
    addInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); addFamily(); }
    });

    drawRows();

    App.modal({
      title: 'Sous-onglets du stock',
      subtitle: 'Familles de matériaux',
      size: 'md',
      body: body,
      actions: [
        { label: 'Annuler' },
        {
          label: 'Enregistrer', kind: 'primary', icon: 'check', onClick: async function (close) {
            const names = items.map(function (it) { return String(it.value).replace(/\s+/g, ' ').trim(); });
            if (names.some(function (x) { return !x; })) {
              App.toast('Chaque sous-onglet doit avoir un nom.', 'err');
              return;
            }
            const low = names.map(function (x) { return x.toLowerCase(); });
            if (new Set(low).size !== low.length) {
              App.toast('Deux sous-onglets portent le même nom.', 'err');
              return;
            }
            if (App.security && !(await App.security.confirmWrite('Modifier les sous-onglets du stock'))) return;

            const kept = {};
            const rename = {};
            items.forEach(function (it, i) {
              kept[it.orig] = true;
              if (names[i] !== it.orig) rename[it.orig] = names[i];
            });
            const removed = App.stockFamilles().filter(function (f) { return !kept[f]; });
            const fallback = names.indexOf('Divers') >= 0 ? 'Divers' : names[0];

            App.db.get('articles').forEach(function (a) {
              const f = App.stockFamille(a);
              if (rename[f]) a.famille = rename[f];
              else if (removed.indexOf(f) >= 0) a.famille = fallback;
            });
            App.settings().stockFamilles = names;
            App.state.stockTab = rename[App.state.stockTab] ||
              (App.state.stockTab === 'Tous' || kept[App.state.stockTab] ? App.state.stockTab : 'Tous');
            App.db.persist();
            close();
            App.toast('Sous-onglets mis à jour.');
            App.render();
          }
        }
      ]
    });
  }

  App.view('stock', {
    title: 'Stock & fournitures',
    subtitle: 'Dépôt, entrées/sorties et alertes de réapprovisionnement',
    newLabel: 'Nouvel article',
    onNew: function () { App.openEntity('articles'); },
    render: function (root) {
      const arts = App.db.get('articles');
      const alerts = arts.filter(function (a) { return n(a.stock) <= n(a.seuil); });
      const mois = App.todayISO().slice(0, 7);
      const mvs = App.db.get('mouvements').filter(function (m) { return String(m.date || '').slice(0, 7) === mois; });
      const kpis = '<div class="kpi-grid four">' +
        App.kpi('Valeur du stock', money(App.stockValeur()), arts.length + ' références', 'box', 'green') +
        App.kpi('Articles en alerte', num(alerts.length), 'seuil atteint ou dépassé', 'warn', 'red') +
        App.kpi('Mouvements ce mois', num(mvs.length), 'entrées et sorties', 'chart', 'blue') +
        App.kpi('Fournisseurs', num(App.db.get('fournisseurs').length), 'partenaires référencés', 'truck', 'violet', '#/fournisseurs') +
        '</div>';
      const bar = el('div');
      bar.innerHTML = kpis;
      root.appendChild(bar);

      const familles = App.stockFamilles().slice();
      let active = App.state.stockTab || 'Tous';
      if (active !== 'Tous' && familles.indexOf(active) === -1) active = 'Tous';
      App.state.stockTab = active;

      const tabBar = el('div', 'doc-tabs');
      const chips = el('div', 'chips');
      chips.setAttribute('role', 'group');
      chips.setAttribute('aria-label', 'Sous-onglets du stock');
      tabBar.appendChild(chips);
      root.appendChild(tabBar);

      const listArea = el('div');
      root.appendChild(listArea);

      const counts = { 'Tous': arts.length };
      familles.forEach(function (f) { counts[f] = 0; });
      arts.forEach(function (a) {
        const f = App.stockFamille(a);
        counts[f] = (counts[f] || 0) + 1;
      });

      function drawList() {
        listArea.innerHTML = '';
        App.entityList(listArea, 'articles', {
          filter: active === 'Tous' ? null : function (a) { return App.stockFamille(a) === active; },
          newLabel: active === 'Tous' ? 'Nouvel article' : 'Nouvel article — ' + active,
          print: { title: 'Stock & fournitures' + (active === 'Tous' ? '' : ' — ' + active) },
          extraButtons: [
            { label: 'Mouvement de stock', icon: 'right', onClick: function () { mouvementModal(null, 'Entrée'); } },
            { label: 'Sous-onglet', icon: 'plus', onClick: manageStockFamilles }
          ]
        });
      }

      function selectTab(t) {
        active = t;
        App.state.stockTab = t;
        App.$$('.chip', chips).forEach(function (b) {
          const on = b.dataset.tab === t;
          b.classList.toggle('active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        drawList();
      }

      ['Tous'].concat(familles).forEach(function (t) {
        const chip = el('button', 'chip' + (t === active ? ' active' : ''),
          '<span>' + esc(t) + '</span><span class="chip-count">' + (counts[t] || 0) + '</span>');
        chip.type = 'button';
        chip.dataset.tab = t;
        chip.setAttribute('aria-pressed', t === active ? 'true' : 'false');
        chip.onclick = function () { selectTab(t); };
        chips.appendChild(chip);
      });

      drawList();
    }
  });

  /* ---------------- Bons de commande ---------------- */
  App.entity('commandes', {
    singular: 'Bon de commande',
    printTitle: 'Bons de commande',
    cols: [
      { k: 'numero', l: 'Numéro', render: function (r) { return '<strong>' + esc(r.numero) + '</strong>'; } },
      { k: 'fournisseurId', l: 'Fournisseur', render: function (r) { return r.fournisseurId ? esc(App.labelFor('fournisseurs', r.fournisseurId)) : '<span class="muted">—</span>'; }, sortValue: function (r) { return r.fournisseurId ? App.labelFor('fournisseurs', r.fournisseurId) : ''; } },
      { k: 'chantierId', l: 'Chantier', render: function (r) { return r.chantierId ? esc(App.chantierLabel(r.chantierId)) : '<span class="muted">—</span>'; }, sortValue: function (r) { return App.chantierLabel(r.chantierId); } },
      { k: 'date', l: 'Date', type: 'date' },
      { k: 'dateLivraison', l: 'Livraison', type: 'date' },
      { k: 'total', l: 'Total TTC', align: 'right', render: function (r) { return '<b>' + money(App.calc.commande(r).ttc) + '</b>'; }, sortValue: function (r) { return App.calc.commande(r).ttc; } },
      { k: 'statut', l: 'Statut', type: 'badge' }
    ],
    openForm: function (id) { commandeForm(id); },
    sortKey: 'date',
    rowActions: function (r) {
      return [
        { icon: 'print', label: 'Imprimer', fn: function () { App.printCommande(r.id); } },
        { icon: 'copy', label: 'Dupliquer', fn: async function () {
          if (App.security && !(await App.security.confirmWrite('Dupliquer le bon de commande ' + r.numero))) return;
          const copie = Object.assign({}, r, {
            id: App.uid('bc'), numero: App.nextNumber('BC', 'commandes'), date: App.todayISO(),
            dateLivraison: App.addDays(App.todayISO(), 7), statut: 'Brouillon',
            lignes: (r.lignes || []).map(function (l) { return Object.assign({}, l); })
          });
          App.db.upsert('commandes', copie);
          App.toast('Bon de commande dupliqué.');
          App.openEntity('commandes', copie.id);
        } }
      ];
    }
  });

  function commandeForm(id) {
    const existing = id ? App.db.find('commandes', id) : null;
    const row = existing ? Object.assign({}, existing) : {
      id: '', numero: App.nextNumber('BC', 'commandes'), fournisseurId: '',
      chantierId: App.state.chantierId !== 'all' ? App.state.chantierId : '',
      date: App.todayISO(), dateLivraison: App.addDays(App.todayISO(), 7),
      statut: 'Brouillon', tva: App.settings().tvaDefaut, notes: '', lignes: []
    };
    const ctx = {};
    const ff = App.buildFields([
      { k: 'numero', l: 'Numéro', required: true },
      { k: 'statut', l: 'Statut', type: 'select', options: ['Brouillon', 'Envoyé', 'Livré partiellement', 'Livré', 'Annulé'] },
      { k: 'fournisseurId', l: 'Fournisseur', type: 'select', ref: 'fournisseurs', required: true },
      { k: 'chantierId', l: 'Chantier', type: 'select', ref: 'chantiers' },
      { k: 'date', l: 'Date', type: 'date' },
      { k: 'dateLivraison', l: 'Livraison souhaitée', type: 'date' },
      { k: 'tva', l: 'TVA (%)', type: 'percent', min: 0, max: 100 },
      { k: 'notes', l: 'Instructions de livraison', type: 'textarea', full: true, rows: 2 }
    ], row, ctx);

    const ed = App.lineEditor({
      columns: [
        { k: 'designation', l: 'Désignation', type: 'text', placeholder: 'Article ou prestation' },
        { k: 'unite', l: 'Unité', type: 'text', width: '80px' },
        { k: 'quantite', l: 'Qté', type: 'number', step: '0.01', width: '90px', align: 'right' },
        { k: 'pu', l: 'P.U. HT', type: 'money', width: '110px', align: 'right' },
        { k: 'montant', l: 'Montant HT', type: 'calc', width: '120px', align: 'right', fn: function (r) { return n(r.quantite) * n(r.pu); } }
      ],
      totals: function (rows) {
        const ht = sum(rows, function (r) { return n(r.quantite) * n(r.pu); });
        const tvaInput = App.$('[data-k="tva"]', ff.el);
        const tva = tvaInput ? n(tvaInput.value) : n(row.tva);
        return [
          { label: 'Total HT', value: money(ht) },
          { label: 'TVA (' + num(tva) + ' %)', value: money(ht * tva / 100) },
          { label: 'Total TTC', value: money(ht * (1 + tva / 100)), strong: true }
        ];
      }
    }, row.lignes || []);

    const body = el('div');
    body.append(ff.el, el('h4', 'form-section-title', 'Lignes de commande'), ed.el);
    const tvaInput = App.$('[data-k="tva"]', ff.el);
    if (tvaInput) tvaInput.addEventListener('input', ed.refreshTotals);

    App.modal({
      title: (id ? 'Modifier' : 'Nouveau') + ' bon de commande',
      subtitle: 'Les totaux se calculent automatiquement',
      size: 'xl',
      body: body,
      actions: [{ label: 'Annuler' }, {
        label: 'Enregistrer', kind: 'primary', icon: 'check', onClick: async function (close) {
          if (!ff.validate()) return;
          if (!ed.validate()) return;
          const obj = Object.assign({}, row, ff.read(), { lignes: ed.getRows() });
          if (!obj.id) obj.id = App.uid('bc');
          if (App.security && !(await App.security.confirmWrite((id ? 'Modifier' : 'Créer') + ' le bon de commande ' + obj.numero))) return;
          App.db.upsert('commandes', obj);
          close();
          App.toast('Bon de commande enregistré.');
          App.refresh();
        }
      }]
    });
  }

  App.view('commandes', {
    title: 'Bons de commande',
    subtitle: 'Achats, livraisons et engagements fournisseurs',
    newLabel: 'Nouveau bon de commande',
    onNew: function () { App.openEntity('commandes'); },
    render: function (root) {
      const list = App.db.get('commandes');
      const enCours = list.filter(function (c) { return c.statut === 'Envoyé' || c.statut === 'Livré partiellement'; });
      const livres = list.filter(function (c) { return c.statut === 'Livré'; });
      const kpis = '<div class="kpi-grid four">' +
        App.kpi('Engagements HT', money(sum(list.filter(function (c) { return c.statut !== 'Annulé'; }), function (c) { return App.calc.commande(c).ht; })), list.length + (list.length > 1 ? ' bons de commande' : ' bon de commande'), 'truck', 'violet') +
        App.kpi('En attente de livraison', num(enCours.length), money(sum(enCours, function (c) { return App.calc.commande(c).ttc; })) + ' TTC', 'calendar', 'amber') +
        App.kpi('Commandes livrées', num(livres.length), money(sum(livres, function (c) { return App.calc.commande(c).ttc; })) + ' TTC', 'check', 'green') +
        App.kpi('Brouillons', num(list.filter(function (c) { return c.statut === 'Brouillon'; }).length), 'à finaliser', 'edit', 'slate') +
        '</div>';
      const bar = el('div');
      bar.innerHTML = kpis;
      root.appendChild(bar);
      App.entityList(root, 'commandes');
    }
  });

  /* ---------------- Documents ---------------- */
  App.entity('documents', {
    singular: 'Document',
    printTitle: 'Documentation',
    cols: [
      { k: 'nom', l: 'Document', render: function (r) { return '<strong>' + esc(r.nom) + '</strong><div class="sub">' + esc(App.docRubrique(r)) + ' · ' + esc(r.categorie || '') + (r.fichier ? ' · ' + App.icon('file', 12) + ' ' + esc(r.fichier.name) : '') + '</div>'; } },
      { k: 'chantierId', l: 'Chantier', render: function (r) { return r.chantierId ? esc(App.chantierLabel(r.chantierId)) : '<span class="muted">—</span>'; }, sortValue: function (r) { return App.chantierLabel(r.chantierId); } },
      { k: 'date', l: 'Date', type: 'date' },
      { k: 'version', l: 'Version', width: '80px' },
      { k: 'dateExpiration', l: 'Expiration', type: 'date' },
      { k: 'statut', l: 'Statut', render: function (r) { return badgeHTML(App.docStatut(r)); }, sortValue: function (r) { return App.docStatut(r); } }
    ],
    fields: [
      { k: 'nom', l: 'Nom du document', required: true, full: true },
      { k: 'rubrique', l: 'Sous-onglet', type: 'select', options: function () { return App.docRubriques(); }, empty: false, default: 'Divers' },
      { k: 'categorie', l: 'Catégorie', type: 'select', options: ['Contrat', 'Plan', 'PV', 'Assurance', 'Facture', 'Étude', 'Autre'] },
      { k: 'chantierId', l: 'Chantier', type: 'select', ref: 'chantiers' },
      { k: 'date', l: 'Date du document', type: 'date' },
      { k: 'version', l: 'Version / indice', placeholder: '1.0, C…' },
      { k: 'statut', l: 'Statut', type: 'select', options: ['Validé', 'À valider', 'Archivé'] },
      { k: 'dateExpiration', l: 'Date d\'expiration (optionnelle)', type: 'date' },
      { k: 'lien', l: 'Lien (URL ou chemin réseau)', type: 'url', full: true, placeholder: 'https://…' },
      { k: 'notes', l: 'Notes', type: 'textarea', full: true },
      { k: 'fichier', l: 'Pièce jointe (max 1,5 Mo)', type: 'file', full: true, accept: '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt', hint: 'Le fichier est stocké dans le navigateur. Pour de gros fichiers, utilisez un lien.' }
    ],
    defaultRow: function () {
      return {
        date: App.todayISO(), version: '1.0', statut: 'Validé',
        rubrique: App.state.docTab && App.state.docTab !== 'Tous' ? App.state.docTab : 'Divers',
        chantierId: App.state.chantierId !== 'all' ? App.state.chantierId : ''
      };
    },
    sortKey: 'date',
    rowActions: function (r) {
      return [
        { icon: 'eye', label: 'Consulter', fn: function () { documentModal(r.id); } },
        { icon: 'download', label: 'Télécharger / ouvrir', fn: function () { openDocument(r); } }
      ];
    }
  });

  function openDocument(doc) {
    if (doc.fichier && doc.fichier.dataUrl) {
      const a = document.createElement('a');
      a.href = doc.fichier.dataUrl;
      a.download = doc.fichier.name || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
      App.toast('Téléchargement lancé.');
    } else if (doc.lien) {
      window.open(doc.lien, '_blank');
    } else {
      App.toast('Aucun fichier ni lien associé.', 'err');
    }
  }

  function documentModal(id) {
    const d = App.db.find('documents', id);
    if (!d) return;
    const ch = d.chantierId ? App.db.find('chantiers', d.chantierId) : null;
    const body = el('div', 'doc-detail');
    body.innerHTML = '<div class="doc-detail-head"><span class="doc-big">' + App.icon('file', 28) + '</span><div><h3>' + esc(d.nom) + '</h3><p class="muted">' + esc(App.docRubrique(d)) + ' · ' + esc(d.categorie) + ' · version ' + esc(d.version || '1.0') + '</p></div>' + badgeHTML(App.docStatut(d)) + '</div>' +
      '<dl class="doc-meta">' +
        '<div><dt>Sous-onglet</dt><dd>' + esc(App.docRubrique(d)) + '</dd></div>' +
        '<div><dt>Chantier</dt><dd>' + (ch ? esc(ch.nom) : '—') + '</dd></div>' +
        '<div><dt>Date</dt><dd>' + fmtDate(d.date) + '</dd></div>' +
        '<div><dt>Expiration</dt><dd>' + (d.dateExpiration ? fmtDate(d.dateExpiration) : '—') + '</dd></div>' +
        '<div><dt>Fichier</dt><dd>' + (d.fichier ? esc(d.fichier.name) + ' (' + App.fileSize(d.fichier.size) + ')' : '—') + '</dd></div>' +
        '<div><dt>Lien</dt><dd>' + (d.lien ? '<a href="' + esc(d.lien) + '" target="_blank" rel="noopener">' + esc(d.lien) + '</a>' : '—') + '</dd></div>' +
      '</dl>' +
      (d.notes ? '<div class="doc-note"><strong>Notes</strong><p>' + esc(d.notes) + '</p></div>' : '') +
      (d.fichier && d.fichier.dataUrl ? '<div class="doc-preview">' + (String(d.fichier.type || '').indexOf('image/') === 0 ? '<img src="' + d.fichier.dataUrl + '" alt="aperçu">' : App.icon('file', 40)) + '</div>' : '');
    App.modal({
      title: 'Document',
      size: 'md',
      body: body,
      actions: [
        { label: 'Fermer' },
        { label: d.fichier || d.lien ? 'Ouvrir' : 'Modifier', kind: 'primary', icon: 'download', onClick: function (close) { if (d.fichier || d.lien) openDocument(d); else { close(); App.openEntity('documents', d.id); } } }
      ]
    });
  }

  function addDocumentRubrique() {
    const body = el('div');
    body.innerHTML = '<div class="fld">' +
      '<label for="newDocRubrique">Nom du sous-onglet</label>' +
      '<input id="newDocRubrique" class="input" maxlength="40" placeholder="Ex. Bureau de contrôle" autocomplete="off">' +
      '<small class="hint">Il apparaîtra dans Documentation et dans le formulaire des documents.</small>' +
      '</div>';
    const input = body.querySelector('input');
    let busy = false;
    let closeThis = null;

    function closeModal() {
      if (closeThis) { closeThis(); return; }
      const overlays = App.$$('.overlay').filter(function (o) {
        return !o.classList.contains('pw-overlay') && !o.classList.contains('closing');
      });
      const last = overlays[overlays.length - 1];
      const closeBtn = last && last.querySelector('.modal-head .icon-btn');
      if (closeBtn) closeBtn.click();
    }

    async function submit() {
      if (busy) return;
      const name = input.value.replace(/\s+/g, ' ').trim();
      if (!name) {
        App.toast('Saisissez un nom pour le sous-onglet.', 'err');
        input.focus();
        return;
      }
      const tabs = App.docRubriques();
      if (tabs.some(function (t) { return String(t).toLowerCase() === name.toLowerCase(); })) {
        App.toast('Ce sous-onglet existe déjà.', 'err');
        input.focus();
        return;
      }
      busy = true;
      if (App.security && !(await App.security.confirmWrite('Créer le sous-onglet « ' + name + ' »'))) {
        busy = false;
        return;
      }
      tabs.push(name);
      App.db.persist();
      App.state.docTab = name;
      busy = false;
      closeModal();
      App.toast('Sous-onglet « ' + name + ' » créé.');
      App.render();
    }

    App.modal({
      title: 'Nouveau sous-onglet',
      subtitle: 'Documentation',
      size: 'sm',
      body: body,
      actions: [
        { label: 'Annuler' },
        { label: 'Créer', kind: 'primary', icon: 'plus', onClick: function (close) { closeThis = close; submit(); } }
      ]
    });
    setTimeout(function () { input.focus(); }, 80);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });
  }

  App.view('documents', {
    title: 'Documentation',
    subtitle: 'Plans, rapports, contrats et pièces classés par sous-onglet',
    newLabel: 'Nouveau document',
    onNew: function () { App.openEntity('documents'); },
    render: function (root) {
      const docs = App.db.get('documents');
      const aValider = docs.filter(function (d) { return d.statut === 'À valider'; }).length;
      const expire = docs.filter(function (d) { const s = App.docStatut(d); return s === 'Expiré' || s === 'Expire bientôt'; }).length;
      const kpis = '<div class="kpi-grid four">' +
        App.kpi('Documents', num(docs.length), 'pièces référencées', 'file', 'blue') +
        App.kpi('À valider', num(aValider), 'en attente de contrôle', 'warn', 'amber') +
        App.kpi('Expirations', num(expire), 'expirés ou sous 30 jours', 'calendar', 'red') +
        App.kpi('Avec fichier joint', num(docs.filter(function (d) { return !!d.fichier; }).length), 'stockés dans le navigateur', 'download', 'green') +
        '</div>';
      const bar = el('div');
      bar.innerHTML = kpis;
      root.appendChild(bar);

      const tabs = App.docRubriques().slice();
      let active = App.state.docTab || 'Tous';
      if (active !== 'Tous' && tabs.indexOf(active) === -1) active = 'Tous';
      App.state.docTab = active;

      const tabBar = el('div', 'doc-tabs');
      const chips = el('div', 'chips');
      chips.setAttribute('role', 'group');
      chips.setAttribute('aria-label', 'Sous-onglets de documentation');
      tabBar.appendChild(chips);
      root.appendChild(tabBar);

      const listArea = el('div');
      root.appendChild(listArea);

      function inChantier(d) {
        if (App.state.chantierId === 'all') return true;
        if (!Object.prototype.hasOwnProperty.call(d, 'chantierId')) return true;
        return d.chantierId === App.state.chantierId;
      }

      const counts = { 'Tous': 0 };
      tabs.forEach(function (t) { counts[t] = 0; });
      docs.forEach(function (d) {
        if (!inChantier(d)) return;
        counts['Tous'] += 1;
        const r = App.docRubrique(d);
        counts[r] = (counts[r] || 0) + 1;
      });

      function drawList() {
        listArea.innerHTML = '';
        App.entityList(listArea, 'documents', {
          filter: active === 'Tous' ? null : function (d) { return App.docRubrique(d) === active; },
          print: { title: 'Documentation' + (active === 'Tous' ? '' : ' — ' + active) },
          extraButtons: [{ icon: 'plus', label: 'Sous-onglet', onClick: addDocumentRubrique }]
        });
      }

      function selectTab(t) {
        active = t;
        App.state.docTab = t;
        App.$$('.chip', chips).forEach(function (b) {
          const on = b.dataset.tab === t;
          b.classList.toggle('active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        drawList();
      }

      ['Tous'].concat(tabs).forEach(function (t) {
        const chip = el('button', 'chip' + (t === active ? ' active' : ''),
          '<span>' + esc(t) + '</span><span class="chip-count">' + (counts[t] || 0) + '</span>');
        chip.type = 'button';
        chip.dataset.tab = t;
        chip.setAttribute('aria-pressed', t === active ? 'true' : 'false');
        chip.onclick = function () { selectTab(t); };
        chips.appendChild(chip);
      });

      drawList();
    }
  });
})();
