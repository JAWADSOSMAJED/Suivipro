/* =========================================================
   ChantierPro — planning (Gantt) et avancement
   ========================================================= */
(function () {
  'use strict';
  const App = window.App;
  const { el, esc, num, n, fmtDate, badgeHTML, progressHTML, addDays, daysTo, clamp } = App;

  const diffDays = function (a, b) {
    return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
  };

  /* ---------------- Planning : un planning distinct par tranche ---------------- */
  App.view('planning', {
    title: 'Planning',
    subtitle: 'Un planning distinct par tranche de travaux',
    newLabel: 'Nouvelle tâche',
    onNew: function () { App.openEntity('taches'); },
    render: function (root) {
      let filtre = 'Toutes';
      let visibleTasks = [];
      const chantiers = App.db.get('chantiers');

      const wrap = el('div', 'view-body');
      const toolbar = el('div', 'toolbar');
      const left = el('div', 'toolbar-left');
      const chips = el('div', 'chips');
      ['Toutes', 'En cours', 'En retard', 'À faire', 'Terminé'].forEach(function (s) {
        const b = el('button', 'chip' + (s === filtre ? ' active' : ''), s);
        b.type = 'button';
        b.onclick = function () {
          filtre = s;
          App.$$('.chip', chips).forEach(function (x) { x.classList.toggle('active', x.textContent === s); });
          draw();
        };
        chips.appendChild(b);
      });
      left.appendChild(chips);
      const right = el('div', 'toolbar-right');
      const printBtn = el('button', 'btn ghost', App.icon('print') + '<span>Imprimer</span>');
      printBtn.type = 'button';
      printBtn.onclick = function () { App.printPlanning(visibleTasks, filtre); };
      right.appendChild(printBtn);
      const add = el('button', 'btn primary', App.icon('plus') + '<span>Nouvelle tâche</span>');
      add.onclick = function () { App.openEntity('taches'); };
      right.appendChild(add);
      toolbar.append(left, right);
      wrap.appendChild(toolbar);

      const legend = el('div', 'gantt-legend');
      legend.innerHTML = '<span><i class="dot info"></i>En cours</span><span><i class="dot danger"></i>En retard</span><span><i class="dot muted"></i>À faire</span><span><i class="dot ok"></i>Terminé</span><span class="legend-today"><i></i>Aujourd\'hui</span>';
      wrap.appendChild(legend);

      const sections = el('div', 'planning-sections');
      wrap.appendChild(sections);
      root.appendChild(wrap);

      function filteredTasks() {
        let tasks = App.db.get('taches').slice();
        if (App.state.chantierId !== 'all') {
          tasks = tasks.filter(function (t) { return t.chantierId === App.state.chantierId; });
        }
        if (filtre !== 'Toutes') tasks = tasks.filter(function (t) { return t.statut === filtre; });
        return tasks.filter(function (t) { return t.debut && t.fin; }).sort(function (a, b) {
          return String(a.debut).localeCompare(String(b.debut));
        });
      }

      function ganttHTML(tasks) {
        let min = tasks[0].debut;
        let max = tasks[0].fin;
        tasks.forEach(function (t) {
          if (t.debut < min) min = t.debut;
          if (t.fin > max) max = t.fin;
        });
        const start = addDays(min, -3);
        const end = addDays(max, 4);
        const total = Math.max(diffDays(start, end), 7);
        const weeks = [];
        for (let d = start; d <= end; d = addDays(d, 7)) weeks.push(d);
        const showEvery = weeks.length > 12 ? 2 : 1;
        const todayPct = clamp(diffDays(start, App.todayISO()) / total * 100, 0, 100);
        const weekPct = 7 / total * 100;

        const headTicks = weeks.map(function (d, i) {
          const leftPct = clamp(diffDays(start, d) / total * 100, 0, 100);
          return (i % showEvery === 0 ? '<span class="gantt-tick" style="left:' + leftPct + '%">' + esc(new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })) + '</span>' : '');
        }).join('');

        const rows = tasks.map(function (t) {
          const ch = App.db.find('chantiers', t.chantierId);
          const l = clamp(diffDays(start, t.debut) / total * 100, 0, 100);
          const w = Math.max(clamp((diffDays(t.debut, t.fin) + 1) / total * 100, 0.7, 100), 0.7);
          const cls = t.statut === 'En retard' ? 'danger' : t.statut === 'Terminé' ? 'ok' : t.statut === 'En cours' ? 'info' : 'muted';
          return '<div class="gantt-row" data-task="' + esc(t.id) + '">' +
            '<div class="gantt-label"><strong>' + esc(t.nom) + '</strong><span>' + esc(ch ? ch.code : '—') + ' · ' + esc(t.responsable || 'Non affecté') + '</span></div>' +
            '<div class="gantt-track" style="background-size:' + weekPct + '% 100%">' +
              '<div class="gantt-today" style="left:' + todayPct + '%"></div>' +
              '<div class="gantt-bar ' + cls + '" style="left:' + l + '%;width:' + w + '%" title="' + esc(t.nom + ' — ' + fmtDate(t.debut) + ' → ' + fmtDate(t.fin) + ' (' + t.statut + ')') + '">' +
                '<span>' + (w > 14 ? esc(t.nom) + ' · ' + num(t.avancement) + ' %' : '') + '</span></div>' +
            '</div>' +
            '<div class="gantt-status">' + badgeHTML(t.statut) + '</div>' +
            '<div class="gantt-actions"><button type="button" class="icon-btn danger" data-task-del="' + esc(t.id) + '" title="Supprimer la tâche « ' + esc(t.nom) + ' »" aria-label="Supprimer la tâche">' + App.icon('trash', 15) + '</button></div>' +
          '</div>';
        }).join('');

        return '<div class="gantt-scroll"><div class="gantt-inner" style="--today:' + todayPct + '%">' +
          '<div class="gantt-head"><div class="gantt-label">Tâche</div><div class="gantt-track gantt-track-head" style="background-size:' + weekPct + '% 100%">' + headTicks + '</div><div class="gantt-status">Statut</div><div class="gantt-actions"></div></div>' +
          rows + '</div></div>';
      }

      function draw() {
        const tasks = filteredTasks();
        visibleTasks = tasks;
        if (!tasks.length) {
          sections.innerHTML = App.emptyState('Aucune tâche à afficher. Créez une tâche pour construire le planning d\'une tranche.', 'calendar');
          return;
        }
        const groups = {};
        tasks.forEach(function (t) {
          const name = App.trancheOf(t) || 'Sans tranche';
          if (!groups[name]) groups[name] = [];
          groups[name].push(t);
        });
        const names = Object.keys(groups).sort(function (a, b) {
          if (a === 'Sans tranche') return 1;
          if (b === 'Sans tranche') return -1;
          return a.localeCompare(b, 'fr', { numeric: true, sensitivity: 'base' });
        });
        sections.innerHTML = names.map(function (name) {
          const list = groups[name];
          const dates = [];
          list.forEach(function (t) { if (t.debut) dates.push(t.debut); if (t.fin) dates.push(t.fin); });
          dates.sort();
          const periode = dates.length ? fmtDate(dates[0]) + ' → ' + fmtDate(dates[dates.length - 1]) : '';
          const label = name === 'Sans tranche' ? 'Sans tranche' : 'Tranche ' + name;
          return '<section class="card gantt-card planning-tranche" data-tranche="' + esc(name) + '">' +
            '<div class="card-head gantt-tranche-head"><div><h2>' + esc(label) + '</h2>' +
              '<span class="muted">' + list.length + ' tâche' + (list.length > 1 ? 's' : '') + (periode ? ' · ' + periode : '') + '</span></div>' +
              '<div class="planning-tranche-actions">' +
                '<button type="button" class="btn ghost sm" data-tranche-print="' + esc(name) + '">' + App.icon('print') + '<span>Imprimer la tranche</span></button>' +
                '<button type="button" class="btn primary sm" data-tranche-add="' + esc(name) + '">' + App.icon('plus') + '<span>Nouvelle tâche</span></button>' +
              '</div></div>' + ganttHTML(list) + '</section>';
        }).join('');

        App.$$('[data-tranche-print]', sections).forEach(function (btn) {
          btn.onclick = function () {
            App.printPlanning(groups[btn.dataset.tranchePrint] || [], filtre, { titre: btn.dataset.tranchePrint === 'Sans tranche' ? 'Sans tranche' : 'Tranche ' + btn.dataset.tranchePrint });
          };
        });
        App.$$('[data-tranche-add]', sections).forEach(function (btn) {
          btn.onclick = function () {
            const name = btn.dataset.trancheAdd;
            const ch = chantiers.find(function (c) { return String(c.tranche || '').trim() === name; });
            App.openEntity('taches', null, { tranche: name === 'Sans tranche' ? '' : name, chantierId: ch ? ch.id : '' });
          };
        });
        App.$$('.gantt-row', sections).forEach(function (row) {
          row.onclick = function () { App.openEntity('taches', row.dataset.task); };
        });
        App.$$('[data-task-del]', sections).forEach(function (btn) {
          btn.onclick = function (e) {
            e.stopPropagation();
            App.deleteRow('taches', btn.dataset.taskDel);
          };
        });
      }
      draw();
    }
  });

  /* ---------------- Avancement ---------------- */
  App.view('avancement', {
    title: 'Avancement',
    subtitle: 'Suivi par lot et journal de chantier',
    render: function (root) {
      let chantiers = App.db.get('chantiers');
      if (App.state.chantierId !== 'all') chantiers = chantiers.filter(function (c) { return c.id === App.state.chantierId; });
      const wrap = el('div', 'view-body');
      root.appendChild(wrap);

      const bar = el('div', 'toolbar');
      const barRight = el('div', 'toolbar-right');
      const printBtn = el('button', 'btn ghost', App.icon('print') + '<span>Imprimer</span>');
      printBtn.type = 'button';
      printBtn.onclick = function () { App.printAvancement(chantiers); };
      barRight.appendChild(printBtn);
      bar.appendChild(barRight);
      wrap.appendChild(bar);

      if (!chantiers.length) {
        wrap.innerHTML = App.emptyState('Aucun chantier à suivre.', 'chart');
        return;
      }

      chantiers.forEach(function (ch) { wrap.appendChild(chantierBlock(ch)); });

      function chantierBlock(ch) {
        const card = el('section', 'card av-card');
        const lots = ch.lots || (ch.lots = []);
        const head = el('div', 'card-head');
        head.innerHTML = '<div class="av-head"><span class="code">' + esc(ch.code) + '</span><h2>' + esc(ch.nom) + '</h2><span class="muted">' + esc(ch.client || '') + '</span></div>' +
          '<div class="av-head-right"><a class="link" href="#/chantier/' + ch.id + '">Fiche chantier</a><button type="button" class="btn ghost sm" data-journal>Ajouter au journal</button></div>';
        card.appendChild(head);

        const globalBox = el('div', 'av-global');
        globalBox.innerHTML = '<div class="flex-between"><span class="muted">Avancement global pondéré</span><b class="av-pct">' + num(Math.round(App.avancement(ch) * 10) / 10) + ' %</b></div>' + progressHTML(App.avancement(ch));
        card.appendChild(globalBox);

        const grid = el('div', 'lot-edit-head');
        grid.innerHTML = '<span>Lot</span><span>Poids</span><span>Avancement</span><span>Contribution</span><span></span>';
        card.appendChild(grid);

        const rowsBox = el('div', 'lot-edit-list');
        card.appendChild(rowsBox);

        lots.forEach(function (lot, idx) {
          const row = el('div', 'lot-edit-row');
          const nom = el('input', 'input');
          nom.value = lot.nom || '';
          const poids = el('input', 'input num');
          poids.type = 'number'; poids.min = '0'; poids.max = '100'; poids.value = lot.poids == null ? 0 : lot.poids;
          const avRange = el('input', 'range');
          avRange.type = 'range'; avRange.min = '0'; avRange.max = '100'; avRange.step = '1'; avRange.value = lot.avancement == null ? 0 : lot.avancement;
          const avNum = el('input', 'input num av-num');
          avNum.type = 'number'; avNum.min = '0'; avNum.max = '100'; avNum.value = lot.avancement == null ? 0 : lot.avancement;
          const contrib = el('span', 'contrib');
          const del = el('button', 'icon-btn danger', App.icon('trash', 15));
          del.type = 'button'; del.title = 'Supprimer ce lot';

          const avWrap = el('div', 'av-inputs');
          avWrap.append(avRange, avNum);
          row.append(nom, poids, avWrap, contrib, del);
          rowsBox.appendChild(row);

          let timer = null;
          function refreshUI() {
            contrib.textContent = num(n(lot.poids) * n(lot.avancement) / 100) + ' %';
            const g = App.avancement(ch);
            App.$('.av-pct', globalBox).textContent = num(Math.round(g * 10) / 10) + ' %';
            const p = App.$('.progress .bar', globalBox);
            if (p) p.style.width = clamp(g, 0, 100) + '%';
            const lab = App.$('.pct-label', globalBox);
            if (lab) lab.textContent = num(Math.round(g * 10) / 10) + ' %';
          }
          function commit() {
            clearTimeout(timer);
            timer = setTimeout(async function () {
              if (App.security && !(await App.security.confirmWrite('Modifier le lot « ' + (lot.nom || 'sans nom') + ' »'))) {
                App.db.load();
                App.refresh();
                return;
              }
              App.db.persist();
            }, 120);
          }
          function sync(fromRange) {
            if (fromRange) { lot.avancement = clamp(n(avRange.value), 0, 100); avNum.value = lot.avancement; }
            else { lot.avancement = clamp(n(avNum.value), 0, 100); avRange.value = lot.avancement; avNum.value = lot.avancement; }
            refreshUI();
          }
          nom.oninput = function () { lot.nom = nom.value; refreshUI(); };
          nom.onchange = commit;
          poids.oninput = function () { lot.poids = clamp(n(poids.value), 0, 100); refreshUI(); };
          poids.onchange = commit;
          avRange.oninput = function () { sync(true); };
          avRange.onchange = commit;
          avNum.oninput = function () { sync(false); };
          avNum.onchange = commit;
          del.onclick = async function () {
            const ok = await App.confirm({ title: 'Supprimer le lot', message: 'Supprimer « ' + (lot.nom || 'ce lot') + ' » du suivi d\'avancement ?' });
            if (!ok) return;
            if (App.security && !(await App.security.confirmWrite('Supprimer le lot « ' + (lot.nom || 'sans nom') + ' »'))) return;
            lots.splice(idx, 1);
            App.db.persist();
            App.refresh();
          };
          contrib.textContent = num(n(lot.poids) * n(lot.avancement) / 100) + ' %';
        });

        const add = el('button', 'btn ghost sm add-lot', App.icon('plus') + '<span>Ajouter un lot</span>');
        add.type = 'button';
        add.onclick = function () {
          const ctx = {};
          const ff = App.buildFields([
            { k: 'nom', l: 'Nom du lot', required: true, full: true },
            { k: 'poids', l: 'Poids dans l\'avancement (%)', type: 'percent', min: 0, max: 100, default: 10 },
            { k: 'avancement', l: 'Avancement initial (%)', type: 'percent', min: 0, max: 100 }
          ], { poids: 10, avancement: 0 }, ctx);
          App.modal({
            title: 'Ajouter un lot', size: 'sm', body: ff.el,
            actions: [{ label: 'Annuler' }, {
              label: 'Ajouter', kind: 'primary', icon: 'plus', onClick: async function (close) {
                if (!ff.validate()) return;
                const v = ff.read();
                if (App.security && !(await App.security.confirmWrite('Ajouter un lot d\'avancement'))) return;
                lots.push({ id: App.uid('lot'), nom: v.nom, poids: v.poids, avancement: v.avancement });
                App.db.persist();
                close();
                App.toast('Lot ajouté.');
                App.refresh();
              }
            }]
          });
        };
        card.appendChild(add);

        const journal = App.db.get('avancements').filter(function (a) { return a.chantierId === ch.id; })
          .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
        const jBox = el('div', 'journal');
        jBox.innerHTML = '<div class="journal-head">' + App.icon('calendar', 16) + '<h3>Journal de suivi</h3><span class="pill">' + journal.length + '</span></div>' +
          (journal.length ? journal.slice(0, 5).map(function (a) {
            return '<div class="journal-item"><div class="journal-top"><b>' + fmtDate(a.date) + '</b><span class="badge ok">' + num(a.pct) + ' %</span><span class="muted">' + esc(a.auteur || '') + '</span></div><p>' + esc(a.note || '') + '</p><button type="button" class="icon-btn danger j-del" data-id="' + a.id + '" title="Supprimer">' + App.icon('trash', 14) + '</button></div>';
          }).join('') : '<p class="muted">Aucune entrée pour ce chantier.</p>');
        card.appendChild(jBox);
        App.$$('.j-del', jBox).forEach(function (b) {
          b.onclick = async function () {
            const ok = await App.confirm({ title: 'Supprimer l\'entrée', message: 'Supprimer cette entrée du journal ?' });
            if (!ok) return;
            if (App.security && !(await App.security.confirmWrite('Supprimer une entrée du journal'))) return;
            App.db.remove('avancements', b.dataset.id);
            App.toast('Entrée supprimée.');
            App.refresh();
          };
        });

        App.$('[data-journal]', head).onclick = function () {
          const ctx = {};
          const ff = App.buildFields([
            { k: 'date', l: 'Date', type: 'date', default: App.todayISO() },
            { k: 'pct', l: 'Avancement constaté (%)', type: 'percent', min: 0, max: 100, default: Math.round(App.avancement(ch) * 10) / 10 },
            { k: 'auteur', l: 'Rédigé par', default: ch.chef || '' },
            { k: 'note', l: 'Observation', type: 'textarea', full: true, rows: 4 }
          ], {}, ctx);
          App.modal({
            title: 'Journal — ' + ch.nom, size: 'md', body: ff.el,
            actions: [{ label: 'Annuler' }, {
              label: 'Enregistrer', kind: 'primary', icon: 'check', onClick: async function (close) {
                if (!ff.validate()) return;
                const v = ff.read();
                v.chantierId = ch.id;
                v.id = App.uid('av');
                if (App.security && !(await App.security.confirmWrite('Ajouter une entrée au journal'))) return;
                App.db.upsert('avancements', v);
                close();
                App.toast('Entrée ajoutée au journal.');
                App.refresh();
              }
            }]
          });
        };

        return card;
      }
    }
  });
})();
