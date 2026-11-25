/* =========================================================
   ChantierPro — SOSMAJED — listes génériques et formulaires
   ========================================================= */
(function () {
  'use strict';
  const App = window.App;
  const { el, esc, n, num, money, fmtDate, pct, badgeHTML, progressHTML } = App;

  function cellHTML(col, row) {
    if (col.render) return col.render(row);
    const v = row[col.k];
    switch (col.type) {
      case 'money': return esc(money(v));
      case 'number': return esc(num(v));
      case 'percent': return esc(pct(v));
      case 'date': return v ? esc(fmtDate(v)) : '<span class="muted">—</span>';
      case 'badge': return badgeHTML(v);
      case 'progress': return progressHTML(v, true);
      default: return v == null || v === '' ? '<span class="muted">—</span>' : esc(v);
    }
  }

  function sortValue(col, row) {
    return col.sortValue ? col.sortValue(row) : row[col.k];
  }

  /* ---------------- Liste générique ---------------- */
  App.entityList = function (container, key, opts) {
    opts = opts || {};
    const ent = App.entities[key];
    if (!ent) { container.textContent = 'Entité inconnue : ' + key; return; }

    let q = opts.search || '';
    let sortKey = opts.sortKey || ent.sortKey || null;
    let sortDir = opts.sortDir || ent.sortDir || 1;

    const wrap = el('div', 'view-body');
    const toolbar = el('div', 'toolbar');
    const left = el('div', 'toolbar-left');
    const search = el('input', 'input search');
    search.type = 'search';
    search.placeholder = 'Rechercher…';
    search.value = q;
    const count = el('span', 'count');
    const sortSel = el('select', 'input sort-select');
    sortSel.setAttribute('aria-label', 'Trier la liste');
    sortSel.innerHTML = '<option value="">Trier : par défaut</option>' +
      ent.cols.filter(function (c) { return c.sort !== false; }).map(function (c) {
        const lab = c.label || c.l || '';
        return '<option value="' + esc(c.k) + '|1">' + esc(lab) + ' ↑</option>' +
          '<option value="' + esc(c.k) + '|-1">' + esc(lab) + ' ↓</option>';
      }).join('');
    sortSel.onchange = function () {
      const parts = sortSel.value.split('|');
      sortKey = parts[0] || null;
      sortDir = parts[1] === '-1' ? -1 : 1;
      draw();
    };
    left.append(search, count, sortSel);
    const right = el('div', 'toolbar-right');
    let currentRows = [];
    const printBtn = el('button', 'btn ghost', App.icon('print') + '<span>Imprimer la liste</span>');
    printBtn.type = 'button';
    printBtn.onclick = function () {
      App.printList(key, currentRows, opts.print || {});
    };
    right.appendChild(printBtn);
    (opts.extraButtons || []).forEach(function (b) {
      const btn = el('button', 'btn ghost', (b.icon ? App.icon(b.icon) : '') + '<span>' + esc(b.label) + '</span>');
      btn.type = 'button';
      btn.onclick = b.onClick;
      right.appendChild(btn);
    });
    if (!opts.hideNew) {
      const add = el('button', 'btn primary', App.icon('plus') + '<span>' + esc(opts.newLabel || 'Nouveau') + '</span>');
      add.type = 'button';
      add.onclick = function () { App.openEntity(key); };
      right.appendChild(add);
    }
    toolbar.append(left, right);
    wrap.appendChild(toolbar);

    const card = el('div', 'card table-card');
    const scroll = el('div', 'table-scroll');
    const table = el('table', 'data-table');
    const thead = el('thead');
    const trh = el('tr');
    ent.cols.forEach(function (col) {
      const th = el('th', col.align === 'right' ? 'right' : '', esc(col.label || col.l || ''));
      if (col.width) th.style.width = col.width;
      if (col.sort !== false) {
        th.classList.add('sortable');
        th.onclick = function () {
          if (sortKey === col.k) sortDir *= -1;
          else { sortKey = col.k; sortDir = 1; }
          draw();
        };
      }
      trh.appendChild(th);
    });
    trh.appendChild(el('th', 'actions-col', ''));
    thead.appendChild(trh);
    const tbody = el('tbody');
    table.append(thead, tbody);
    scroll.appendChild(table);
    card.appendChild(scroll);
    wrap.appendChild(card);
    container.appendChild(wrap);

    function actionsFor(row) {
      const list = [];
      if (!ent.noEdit) list.push({ icon: 'edit', label: 'Modifier', fn: function () { App.openEntity(key, row.id); } });
      if (ent.rowActions) list.push.apply(list, ent.rowActions(row));
      if (!ent.noDelete) list.push({ icon: 'trash', label: 'Supprimer', danger: true, fn: function () { App.deleteRow(key, row.id); } });
      return list;
    }

    function draw() {
      const total = App.db.get(key).length;
      let rows = App.db.get(key).filter(function (row) {
        if (App.state.chantierId !== 'all' && Object.prototype.hasOwnProperty.call(row, 'chantierId') && row.chantierId !== App.state.chantierId) return false;
        if (q && App.rowText(key, row).indexOf(q.toLowerCase()) === -1) return false;
        if (opts.filter && !opts.filter(row)) return false;
        return true;
      });
      if (sortKey) {
        const col = ent.cols.find(function (c) { return c.k === sortKey; });
        if (col) {
          rows.sort(function (a, b) {
            const va = sortValue(col, a);
            const vb = sortValue(col, b);
            if (typeof va === 'number' || typeof vb === 'number') return (n(va) - n(vb)) * sortDir;
            return String(va == null ? '' : va).localeCompare(String(vb == null ? '' : vb), 'fr') * sortDir;
          });
        }
      }
      count.textContent = rows.length + (rows.length !== total ? ' / ' + total : '') + ' élément' + (total > 1 ? 's' : '');
      currentRows = rows;
      App.$$('th.sortable', thead).forEach(function (th, i) {
        const col = ent.cols[i];
        th.classList.toggle('sorted', !!col && col.k === sortKey);
        th.classList.toggle('desc', !!col && col.k === sortKey && sortDir < 0);
      });
      sortSel.value = sortKey ? sortKey + '|' + sortDir : '';
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="' + (ent.cols.length + 1) + '"><div class="empty">' +
          App.icon('search', 22) + '<p>' + (q ? 'Aucun résultat pour « ' + esc(q) + ' ».' : 'Aucun élément pour le moment.') + '</p>' +
          (!q ? '<button type="button" class="btn ghost sm" data-new="1">' + App.icon('plus') + '<span>Créer</span></button>' : '') +
          '</div></td></tr>';
        const b = tbody.querySelector('[data-new]');
        if (b) b.onclick = function () { App.openEntity(key); };
        return;
      }
      tbody.innerHTML = rows.map(function (row) {
        const acts = actionsFor(row);
        const actionHtml = acts.map(function (a, i) {
          return '<button type="button" class="icon-btn' + (a.danger ? ' danger' : '') + '" data-act="' + i + '" title="' + esc(a.label) + '" aria-label="' + esc(a.label) + '">' + App.icon(a.icon, 15) + '</button>';
        }).join('');
        return '<tr data-id="' + esc(row.id) + '">' +
          ent.cols.map(function (col) {
            return '<td data-label="' + esc(col.label || col.l || '') + '" class="' + (col.align === 'right' ? 'right' : '') + (col.cls ? ' ' + col.cls : '') + '">' +
              '<div class="cell-val">' + cellHTML(col, row) + '</div></td>';
          }).join('') +
          '<td class="actions-col"><div class="row-actions">' + actionHtml + '</div></td></tr>';
      }).join('');
    }

    tbody.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const tr = btn.closest('tr');
      const row = App.db.find(key, tr.dataset.id);
      if (!row) return;
      const acts = actionsFor(row);
      const a = acts[parseInt(btn.dataset.act, 10)];
      if (a) a.fn();
    });

    let t = null;
    search.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () { q = search.value; draw(); }, 120);
    });
    draw();
  };

  /* ---------------- Formulaire générique ---------------- */
  App.openEntity = function (key, id, preset) {
    const ent = App.entities[key];
    if (!ent) return;
    if (ent.openForm) return ent.openForm(id);

    const existing = id ? App.db.find(key, id) : null;
    const row = existing ? Object.assign({}, existing) : Object.assign({}, ent.defaultRow ? ent.defaultRow() : {}, preset || {});
    if (id) row.id = id;
    const ctx = {};
    const ff = App.buildFields(ent.fields, row, ctx);

    /* Tâches : la tranche suit le chantier choisi, sauf saisie manuelle. */
    if (key === 'taches' && !existing) {
      const chSel = ff.el.querySelector('[data-k="chantierId"]');
      const trSel = ff.el.querySelector('[data-k="tranche"]');
      if (chSel && trSel) {
        chSel.addEventListener('change', function () {
          const ch = App.db.find('chantiers', chSel.value);
          const v = ch ? String(ch.tranche || '').trim() : '';
          if (v) trSel.value = v;
        });
      }
    }
    const sing = (ent.singular || 'élément').toLowerCase();
    const prefix = id ? 'Modifier ' : (ent.feminine ? 'Nouvelle ' : (/^[aeiouyéèêh]/i.test(sing) ? 'Nouvel ' : 'Nouveau '));

    const m = App.modal({
      title: prefix + sing,
      subtitle: ent.formSubtitle || '',
      size: ent.formSize || 'md',
      body: ff.el,
      actions: [
        { label: 'Annuler' },
        {
          label: 'Enregistrer', kind: 'primary', icon: 'check',
          onClick: async function (close) {
            if (!ff.validate()) return;
            const obj = Object.assign({}, row, ff.read());
            if (!obj.id) obj.id = App.uid(key.slice(0, 3));
            if (ent.beforeSave) ent.beforeSave(obj, !!existing);
            if (App.security && !(await App.security.confirmWrite((id ? 'Modifier ' : 'Créer ') + sing))) return;
            App.db.upsert(key, obj);
            close();
            App.toast((ent.singular || 'Élément') + ' enregistré.');
            App.refresh();
          }
        }
      ]
    });
    setTimeout(function () {
      const first = m.body.querySelector('input:not([type=file]),select,textarea');
      if (first) first.focus();
    }, 60);
  };

  /* ---------------- Petits composants réutilisables ---------------- */
  App.miniStat = function (label, value, iconName, tone2) {
    return '<div class="mini-stat ' + (tone2 || '') + '"><span class="ms-ico">' + App.icon(iconName || 'chart', 18) + '</span><div><span class="ms-label">' + esc(label) + '</span><b>' + value + '</b></div></div>';
  };

  App.kpi = function (label, value, sub, iconName, tone2, route) {
    const tag = route ? 'a' : 'div';
    const open = route ? '<a href="' + route + '" class="kpi ' + (tone2 || '') + '">' : '<div class="kpi ' + (tone2 || '') + '">';
    return open +
      '<div class="kpi-top"><span class="kpi-ico">' + App.icon(iconName || 'chart', 20) + '</span>' + (sub ? '<span class="kpi-sub">' + esc(sub) + '</span>' : '') + '</div>' +
      '<b class="kpi-value">' + value + '</b><span class="kpi-label">' + esc(label) + '</span></' + tag + '>';
  };

  App.emptyState = function (message, iconName) {
    return '<div class="empty">' + App.icon(iconName || 'box', 22) + '<p>' + esc(message) + '</p></div>';
  };

  App.chantierOptions = function (emptyLabel) {
    const opts = App.db.get('chantiers').map(function (c) { return { value: c.id, label: App.labelFor('chantiers', c) }; });
    return opts;
  };

  /* ---------------- Aperçu d'un chantier (carte) ---------------- */
  App.chantierCard = function (ch) {
    const tasks = App.db.get('taches').filter(function (t) { return t.chantierId === ch.id; });
    const done = tasks.filter(function (t) { return t.statut === 'Terminé'; }).length;
    const av = App.avancement(ch);
    const devis = App.db.get('devis').filter(function (d) { return d.chantierId === ch.id && d.statut === 'Accepté'; });
    const ca = App.sum(devis, function (d) { return App.calc.devis(d).ht; });
    return '<article class="proj-card">' +
      '<div class="proj-top"><span class="code">' + esc(ch.code || '—') + '</span>' + badgeHTML(ch.statut) + '</div>' +
      '<h3>' + esc(ch.nom) + '</h3>' +
      (App.chantierRefs(ch) ? '<p class="proj-refs">' + App.icon('layers', 14) + ' ' + esc(App.chantierRefs(ch)) + '</p>' : '') +
      '<p class="proj-client">' + App.icon('users', 14) + ' ' + esc(ch.client || 'Client non renseigné') + (ch.ville ? ' · ' + esc(ch.ville) : '') + '</p>' +
      (App.chantierProgramme(ch) ? '<p class="proj-program">' + App.icon('home', 14) + ' ' + esc(App.chantierProgramme(ch)) + '</p>' : '') +
      '<div class="proj-av"><div class="flex-between"><span class="muted">Avancement</span><b>' + num(Math.round(av * 10) / 10) + ' %</b></div>' + progressHTML(av, true) + '</div>' +
      '<div class="proj-meta">' +
        '<div><span>Budget</span><b>' + money(ch.budget) + '</b></div>' +
        '<div><span>Affaires conclues</span><b>' + money(ca) + '</b></div>' +
        '<div><span>Tâches</span><b>' + done + ' / ' + tasks.length + '</b></div>' +
      '</div>' +
      '<div class="proj-foot"><span class="muted">' + App.icon('calendar', 14) + ' ' + fmtDate(ch.dateDebut) + ' → ' + fmtDate(ch.dateFin) + '</span>' +
      '<div class="proj-actions">' +
        '<button type="button" class="icon-btn" data-ch-open="' + ch.id + '" title="Ouvrir la fiche">' + App.icon('eye', 15) + '</button>' +
        '<button type="button" class="icon-btn" data-ch-edit="' + ch.id + '" title="Modifier">' + App.icon('edit', 15) + '</button>' +
        '<button type="button" class="icon-btn danger" data-ch-del="' + ch.id + '" title="Supprimer">' + App.icon('trash', 15) + '</button>' +
      '</div></div></article>';
  };

  App.bindChantierCards = function (root) {
    App.$$('[data-ch-open]', root).forEach(function (b) { b.onclick = function () { App.go('#/chantier/' + b.dataset.chOpen); }; });
    App.$$('[data-ch-edit]', root).forEach(function (b) { b.onclick = function () { App.openEntity('chantiers', b.dataset.chEdit); }; });
    App.$$('[data-ch-del]', root).forEach(function (b) { b.onclick = function () { App.deleteRow('chantiers', b.dataset.chDel); }; });
  };

  App.go = function (hash) {
    if (location.hash === hash) App.render();
    else location.hash = hash;
  };
})();
