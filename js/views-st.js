/* =========================================================
   ChantierPro — sous-traitants, situations, paramètres
   ========================================================= */
(function () {
  'use strict';
  const App = window.App;
  const { el, esc, money, num, n, sum, fmtDate, badgeHTML } = App;

  /* ---------------- Sous-traitants ---------------- */
  function assuranceBadge(st) {
    if (!st.assurance) return '<span class="muted">—</span>';
    const j = App.daysTo(st.assurance);
    if (j < 0) return '<span class="badge danger">Expirée</span><div class="sub">' + fmtDate(st.assurance) + '</div>';
    if (j <= 30) return '<span class="badge warn">Expire bientôt</span><div class="sub">' + fmtDate(st.assurance) + '</div>';
    return '<span class="badge ok">Valide</span><div class="sub">' + fmtDate(st.assurance) + '</div>';
  }

  App.entity('sousTraitants', {
    singular: 'Sous-traitant',
    printTitle: 'Sous-traitants',
    cols: [
      { k: 'nom', l: 'Sous-traitant', render: function (r) { return '<strong>' + esc(r.nom) + '</strong><div class="sub">' + esc(r.specialite || '') + '</div>'; } },
      { k: 'contact', l: 'Contact' },
      { k: 'tel', l: 'Téléphone' },
      { k: 'situations', l: 'Marchés', align: 'right', render: function (r) {
        const sits = App.db.get('situations').filter(function (s) { return s.sousTraitantId === r.id; });
        const total = sum(sits, function (s) { return App.calc.situation(s).marche; });
        return '<b>' + money(total) + '</b><div class="sub">' + sits.length + ' situation(s)</div>';
      }, sortValue: function (r) { return sum(App.db.get('situations').filter(function (s) { return s.sousTraitantId === r.id; }), function (s) { return App.calc.situation(s).marche; }); } },
      { k: 'assurance', l: 'Assurance décennale', render: assuranceBadge, sortValue: function (r) { return r.assurance || ''; } }
    ],
    fields: [
      { k: 'nom', l: 'Nom du sous-traitant', required: true, full: true },
      { k: 'specialite', l: 'Spécialité', full: true },
      { k: 'contact', l: 'Personne de contact' },
      { k: 'tel', l: 'Téléphone', type: 'tel' },
      { k: 'email', l: 'Email', type: 'email' },
      { k: 'adresse', l: 'Adresse', full: true },
      { k: 'cp', l: 'Code postal' },
      { k: 'ville', l: 'Ville' },
      { k: 'siret', l: 'SIRET' },
      { k: 'tva', l: 'TVA (%)', type: 'percent', min: 0, max: 100 },
      { k: 'assurance', l: 'Assurance décennale — échéance', type: 'date' },
      { k: 'assuranceNum', l: 'N° de police' },
      { k: 'notes', l: 'Notes', type: 'textarea', full: true }
    ],
    defaultRow: function () { return { tva: 20 }; },
    rowActions: function (r) {
      return [{ icon: 'plus', label: 'Nouvelle situation', fn: function () { situationForm(null, r.id); } }];
    }
  });

  App.view('sousTraitants', {
    title: 'Sous-traitants',
    subtitle: 'Partenaires, assurances et marchés de sous-traitance',
    newLabel: 'Nouveau sous-traitant',
    onNew: function () { App.openEntity('sousTraitants'); },
    render: function (root) {
      const list = App.db.get('sousTraitants');
      const expire = list.filter(function (s) { return s.assurance && App.daysTo(s.assurance) <= 30; });
      const situations = App.db.get('situations');
      const aValider = situations.filter(function (s) { return s.statut === 'À valider'; });
      const kpis = '<div class="kpi-grid four">' +
        App.kpi('Sous-traitants', num(list.length), 'partenaires actifs', 'users', 'blue') +
        App.kpi('Assurances à suivre', num(expire.length), 'expirées ou sous 30 jours', 'warn', 'red') +
        App.kpi('Situations à valider', money(sum(aValider, function (s) { return App.calc.situation(s).periode; })), aValider.length + ' en attente', 'file', 'amber', '#/situations') +
        App.kpi('Marchés sous-traités', money(sum(situations, function (s) { return App.calc.situation(s).marche; })), 'montant total HT', 'wallet', 'violet') +
        '</div>';
      const bar = el('div');
      bar.innerHTML = kpis;
      root.appendChild(bar);
      App.entityList(root, 'sousTraitants');
    }
  });

  /* ---------------- Situations sous-traitants ---------------- */
  App.entity('situations', {
    singular: 'Situation',
    printTitle: 'Situations sous-traitants',
    cols: [
      { k: 'numero', l: 'Numéro', render: function (r) { return '<strong>' + esc(r.numero) + '</strong>'; } },
      { k: 'sousTraitantId', l: 'Sous-traitant', render: function (r) { return esc(App.labelFor('sousTraitants', r.sousTraitantId)); }, sortValue: function (r) { return App.labelFor('sousTraitants', r.sousTraitantId); } },
      { k: 'chantierId', l: 'Chantier', render: function (r) { return esc(App.chantierLabel(r.chantierId)); }, sortValue: function (r) { return App.chantierLabel(r.chantierId); } },
      { k: 'periode', l: 'Période' },
      { k: 'pct', l: 'Avanc. cumulé', align: 'right', render: function (r) { return num(Math.round(App.calc.situationPct(r) * 10) / 10) + ' %'; }, sortValue: function (r) { return App.calc.situationPct(r); } },
      { k: 'periodeHT', l: 'Période HT', align: 'right', render: function (r) { return '<b>' + money(App.calc.situation(r).periode) + '</b>'; }, sortValue: function (r) { return App.calc.situation(r).periode; } },
      { k: 'net', l: 'Net à payer', align: 'right', render: function (r) { return money(App.calc.situation(r).net); }, sortValue: function (r) { return App.calc.situation(r).net; } },
      { k: 'statut', l: 'Statut', type: 'badge' }
    ],
    openForm: function (id) { situationForm(id); },
    sortKey: 'date',
    rowActions: function (r) {
      const acts = [{ icon: 'print', label: 'Imprimer la situation', fn: function () { App.printSituation(r.id); } }];
      if (r.statut === 'À valider') acts.push({ icon: 'check', label: 'Valider la situation', fn: function () {
        App.confirm({ title: 'Valider la situation', message: 'Valider la situation ' + r.numero + ' ?', danger: false, confirmLabel: 'Valider' }).then(async function (ok) {
          if (!ok) return;
          if (App.security && !(await App.security.confirmWrite('Valider la situation ' + r.numero))) return;
          r.statut = 'Validée';
          App.db.upsert('situations', r);
          App.toast('Situation validée.');
          App.refresh();
        });
      } });
      if (r.statut === 'Validée') acts.push({ icon: 'wallet', label: 'Marquer payée', fn: function () {
        App.confirm({ title: 'Marquer payée', message: 'Confirmer le paiement de la situation ' + r.numero + ' ?', danger: false, confirmLabel: 'Marquer payée' }).then(async function (ok) {
          if (!ok) return;
          if (App.security && !(await App.security.confirmWrite('Marquer la situation ' + r.numero + ' comme payée'))) return;
          r.statut = 'Payée';
          App.db.upsert('situations', r);
          App.toast('Situation marquée payée.');
          App.refresh();
        });
      } });
      return acts;
    }
  });

  function situationForm(id, prefillST) {
    const existing = id ? App.db.find('situations', id) : null;
    const row = existing ? Object.assign({}, existing) : {
      numero: App.nextNumber('SIT', 'situations'),
      sousTraitantId: prefillST || App.state.sousTraitantId || '',
      chantierId: App.state.chantierId !== 'all' ? App.state.chantierId : '',
      date: App.todayISO(), periode: App.monthYear(App.todayISO()), statut: 'À valider',
      tva: 20, retenue: App.settings().retenueGarantie, notes: '', lignes: []
    };
    const ff = App.buildFields([
      { k: 'numero', l: 'Numéro de situation', required: true },
      { k: 'statut', l: 'Statut', type: 'select', options: ['À valider', 'Validée', 'Payée'] },
      { k: 'sousTraitantId', l: 'Sous-traitant', type: 'select', ref: 'sousTraitants', required: true },
      { k: 'chantierId', l: 'Chantier', type: 'select', ref: 'chantiers', required: true },
      { k: 'date', l: 'Date', type: 'date' },
      { k: 'periode', l: 'Période', placeholder: 'Ex. novembre 2026' },
      { k: 'tva', l: 'TVA (%)', type: 'percent', min: 0, max: 100 },
      { k: 'retenue', l: 'Retenue de garantie (%)', type: 'percent', min: 0, max: 100 },
      { k: 'notes', l: 'Observations', type: 'textarea', full: true, rows: 2 }
    ], row, {});

    const ed = App.lineEditor({
      columns: [
        { k: 'designation', l: 'Prestation / poste', type: 'text', placeholder: 'Lot, ouvrage, prestation…' },
        { k: 'montantMarche', l: 'Marché HT', type: 'money', width: '120px', align: 'right' },
        { k: 'pctPrecedent', l: '% ant.', type: 'percent', width: '85px', align: 'right' },
        { k: 'pctCumule', l: '% cumulé', type: 'percent', width: '90px', align: 'right' },
        { k: 'cumul', l: 'Cumulé HT', type: 'calc', width: '115px', align: 'right', fn: function (r) { return n(r.montantMarche) * App.clamp(n(r.pctCumule), 0, 100) / 100; } },
        { k: 'periode', l: 'Période HT', type: 'calc', width: '115px', align: 'right', fn: function (r) { return n(r.montantMarche) * (App.clamp(n(r.pctCumule), 0, 100) - App.clamp(n(r.pctPrecedent), 0, 100)) / 100; } }
      ],
      totals: function (rows) {
        const marche = sum(rows, function (r) { return n(r.montantMarche); });
        const cumul = sum(rows, function (r) { return n(r.montantMarche) * App.clamp(n(r.pctCumule), 0, 100) / 100; });
        const prec = sum(rows, function (r) { return n(r.montantMarche) * App.clamp(n(r.pctPrecedent), 0, 100) / 100; });
        const periode = cumul - prec;
        const tvaIn = App.$('[data-k="tva"]', ff.el);
        const retIn = App.$('[data-k="retenue"]', ff.el);
        const tva = tvaIn ? n(tvaIn.value) : n(row.tva);
        const ret = retIn ? n(retIn.value) : n(row.retenue);
        return [
          { label: 'Montant du marché', value: money(marche) },
          { label: 'Travaux cumulés', value: money(cumul) },
          { label: 'Travaux de la période', value: money(periode) },
          { label: 'Retenue (' + num(ret) + ' %)', value: '− ' + money(periode * ret / 100) },
          { label: 'TVA (' + num(tva) + ' %)', value: money(periode * tva / 100) },
          { label: 'Net à payer', value: money(periode * (1 + tva / 100) - periode * ret / 100), strong: true }
        ];
      }
    }, row.lignes || []);

    const body = el('div');
    body.append(ff.el, el('h4', 'form-section-title', 'Détail de la situation'), ed.el);
    ['tva', 'retenue'].forEach(function (k) {
      const inp = App.$('[data-k="' + k + '"]', ff.el);
      if (inp) inp.addEventListener('input', ed.refreshTotals);
    });

    App.modal({
      title: (id ? 'Modifier' : 'Nouvelle') + ' situation de sous-traitant',
      subtitle: 'Avancement cumulé et travaux de la période',
      size: 'xl',
      body: body,
      actions: [{ label: 'Annuler' }, {
        label: 'Enregistrer', kind: 'primary', icon: 'check', onClick: async function (close) {
          if (!ff.validate()) return;
          if (!ed.validate()) return;
          const obj = Object.assign({}, row, ff.read(), { lignes: ed.getRows() });
          if (!obj.id) obj.id = App.uid('sit');
          if (App.security && !(await App.security.confirmWrite((id ? 'Modifier' : 'Créer') + ' la situation ' + obj.numero))) return;
          App.db.upsert('situations', obj);
          close();
          App.toast('Situation enregistrée.');
          App.refresh();
        }
      }]
    });
  }

  App.view('situations', {
    title: 'Situations sous-traitants',
    subtitle: 'Avancement, retenues de garantie et paiements',
    newLabel: 'Nouvelle situation',
    onNew: function () { App.openEntity('situations'); },
    render: function (root) {
      const list = App.db.get('situations');
      const aValider = list.filter(function (s) { return s.statut === 'À valider'; });
      const validees = list.filter(function (s) { return s.statut === 'Validée'; });
      const payees = list.filter(function (s) { return s.statut === 'Payée'; });
      const kpis = '<div class="kpi-grid four">' +
        App.kpi('À valider', money(sum(aValider, function (s) { return App.calc.situation(s).periode; })), aValider.length + ' situations', 'warn', 'amber') +
        App.kpi('Validées à payer', money(sum(validees, function (s) { return App.calc.situation(s).net; })), validees.length + ' situations', 'wallet', 'blue') +
        App.kpi('Payées', money(sum(payees, function (s) { return App.calc.situation(s).net; })), payees.length + ' situations', 'check', 'green') +
        App.kpi('Retenues de garantie', money(sum(list, function (s) { return App.calc.situation(s).retenue; })), 'sur les situations', 'box', 'violet') +
        '</div>';
      const bar = el('div');
      bar.innerHTML = kpis;
      root.appendChild(bar);
      App.entityList(root, 'situations');
    }
  });

  /* ---------------- Paramètres ---------------- */
  App.view('parametres', {
    title: 'Paramètres',
    subtitle: 'Entreprise, valeurs par défaut, sauvegarde et aide',
    hideQuick: true,
    render: function (root) {
      const s = App.settings();
      const wrap = el('div', 'view-body');
      root.appendChild(wrap);

      const card = el('section', 'card pad-card');
      card.innerHTML = '<div class="card-head"><h2>' + App.icon('setting', 18) + ' Identité de l\'entreprise</h2><p>Ces informations apparaissent sur les devis, bons de commande, décomptes et situations.</p></div>';

      /* Logo de l'entreprise */
      const logoBox = el('div', 'logo-settings');
      const logoPreview = el('div', 'logo-preview');
      const logoCopy = el('div', 'logo-copy');
      const logoActions = el('div', 'logo-actions');
      const logoFile = el('input');
      logoFile.type = 'file';
      logoFile.accept = 'image/png,image/jpeg,image/svg+xml,image/webp,image/gif';
      logoFile.style.display = 'none';
      const uploadBtn = el('button', 'btn ghost sm', App.icon('upload') + '<span>Choisir un logo</span>');
      uploadBtn.type = 'button';
      const removeLogoBtn = el('button', 'btn ghost sm', App.icon('trash') + '<span>Retirer</span>');
      removeLogoBtn.type = 'button';
      const drawLogo = function () {
        const logo = s.societe.logo;
        logoPreview.innerHTML = logo && logo.dataUrl
          ? '<img src="' + esc(logo.dataUrl) + '" alt="Logo actuel">'
          : '<span class="muted small">Aucun logo</span>';
        removeLogoBtn.style.display = logo ? '' : 'none';
      };
      drawLogo();
      uploadBtn.onclick = function () { logoFile.click(); };
      logoFile.onchange = function () {
        const file = logoFile.files && logoFile.files[0];
        if (!file) return;
        if (!file.type || file.type.indexOf('image/') !== 0) {
          App.toast('Choisissez une image (PNG, JPG, SVG, WebP).', 'err');
          logoFile.value = '';
          return;
        }
        if (file.size > 1048576) {
          App.toast('Logo trop volumineux (1 Mo maximum).', 'err');
          logoFile.value = '';
          return;
        }
        const fr = new FileReader();
        fr.onload = async function () {
          if (App.security && !(await App.security.confirmWrite('Changer le logo de l\'entreprise'))) return;
          s.societe.logo = { name: file.name, type: file.type, size: file.size, dataUrl: fr.result };
          App.db.persist();
          if (App.applyLogo) App.applyLogo();
          App.toast('Logo enregistré.');
          App.render();
        };
        fr.readAsDataURL(file);
        logoFile.value = '';
      };
      removeLogoBtn.onclick = async function () {
        if (App.security && !(await App.security.confirmWrite('Retirer le logo de l\'entreprise'))) return;
        s.societe.logo = null;
        App.db.persist();
        if (App.applyLogo) App.applyLogo();
        App.toast('Logo retiré.');
        App.render();
      };
      logoActions.append(uploadBtn, removeLogoBtn, logoFile);
      logoCopy.innerHTML = '<h3>Logo de l\'entreprise</h3><p>Ce logo s\'affiche dans la barre latérale et sur tous les documents imprimés. Formats acceptés : PNG, JPG, SVG ou WebP, 1 Mo maximum.</p>';
      logoCopy.appendChild(logoActions);
      logoBox.append(logoPreview, logoCopy);
      card.appendChild(logoBox);

      const ff = App.buildFields([
        { k: 'nom', l: 'Raison sociale', required: true, full: true },
        { k: 'adresse', l: 'Adresse', full: true },
        { k: 'cp', l: 'Code postal' },
        { k: 'ville', l: 'Ville' },
        { k: 'tel', l: 'Téléphone', type: 'tel' },
        { k: 'email', l: 'Email', type: 'email' },
        { k: 'siret', l: 'SIRET' },
        { k: 'tva', l: 'N° TVA intracommunautaire' },
        { k: 'iban', l: 'IBAN', full: true }
      ], s.societe, {});
      const defaults = App.buildFields([
        { k: 'tvaDefaut', l: 'TVA par défaut (%)', type: 'percent', min: 0, max: 100 },
        { k: 'retenueGarantie', l: 'Retenue de garantie par défaut (%)', type: 'percent', min: 0, max: 100 }
      ], s, {});
      const mentions = App.buildFields([
        { k: 'mentionsDevis', l: 'Mentions des devis', type: 'textarea', full: true, rows: 3 },
        { k: 'mentionsCommande', l: 'Mentions des bons de commande', type: 'textarea', full: true, rows: 3 },
        { k: 'mentionsDecompte', l: 'Mentions des décomptes', type: 'textarea', full: true, rows: 3 },
        { k: 'mentionsSituation', l: 'Mentions des situations sous-traitants', type: 'textarea', full: true, rows: 3 }
      ], s, {});

      const grid = el('div', 'settings-grid');
      const c1 = el('div', 'settings-block');
      c1.append(el('h3', '', 'Société'), ff.el);
      const c2 = el('div', 'settings-block');
      c2.append(el('h3', '', 'Valeurs par défaut'), defaults.el, el('h3', 'mt', 'Mentions imprimées'), mentions.el);
      grid.append(c1, c2);
      card.appendChild(grid);
      const saveBar = el('div', 'settings-save');
      const printBtn = el('button', 'btn ghost', App.icon('print') + '<span>Imprimer la fiche entreprise</span>');
      printBtn.type = 'button';
      printBtn.onclick = function () { App.printParametres(); };
      const saveBtn = el('button', 'btn primary', App.icon('check') + '<span>Enregistrer les paramètres</span>');
      saveBtn.type = 'button';
      saveBtn.onclick = async function () {
        if (!ff.validate()) return;
        if (App.security && !(await App.security.confirmWrite('Enregistrer les paramètres'))) return;
        s.societe = Object.assign({}, s.societe, ff.read());
        Object.assign(s, defaults.read(), mentions.read());
        App.db.persist();
        App.toast('Paramètres enregistrés.');
        App.render();
      };
      saveBar.appendChild(printBtn);
      saveBar.appendChild(saveBtn);
      card.appendChild(saveBar);
      wrap.appendChild(card);

      /* ---------------- Sécurité ---------------- */
      if (App.security) {
        const security = App.security;
        const secEnabled = security.isEnabled();
        const secCard = el('section', 'card pad-card');
        secCard.innerHTML = '<div class="card-head"><h2>' + App.icon('lock', 18) + ' Protection par nom d\'utilisateur et mot de passe</h2><p>Un écran de connexion est demandé à l\'ouverture du site sur ce navigateur. Le mot de passe est enregistré sous forme d\'empreinte (SHA-256), jamais en clair.</p></div>';
        const secBox = el('div', 'security-settings');
        const statusRow = el('div', 'security-status');
        statusRow.innerHTML = '<span class="badge ' + (secEnabled ? 'ok' : 'muted') + '">' + (secEnabled ? 'Verrouillage activé' : 'Verrouillage désactivé') + '</span>' +
          '<span class="muted small">' + (secEnabled
            ? 'Compte : <b>' + esc(security.user() || 'admin') + '</b> · ' + (security.requireOnWrite() ? 'demandé à l\'ouverture et à chaque modification.' : 'demandé à l\'ouverture du site.')
            : 'Aucun identifiant n\'est demandé actuellement.') + '</span>';
        secBox.appendChild(statusRow);

        if (secEnabled) {
          const toggle = el('div', 'security-toggle');
          toggle.innerHTML = '<input type="checkbox" id="secWriteToggle"' + (security.requireOnWrite() ? ' checked' : '') + '>' +
            '<div><label for="secWriteToggle">Demander le mot de passe à chaque modification</label>' +
            '<small>Une confirmation est demandée à chaque enregistrement, suppression, importation, réinitialisation ou modification des paramètres.</small></div>';
          const cb = toggle.querySelector('input');
          cb.onchange = async function () {
            const target = cb.checked;
            cb.disabled = true;
            const ok = await security.requestPassword(target ? 'Activer la confirmation à chaque modification' : 'Désactiver la confirmation à chaque modification');
            if (!ok) { cb.checked = !target; cb.disabled = false; return; }
            security.setRequireOnWrite(target);
            cb.disabled = false;
            App.toast(target ? 'Confirmation demandée à chaque modification.' : 'Confirmation à chaque modification désactivée.');
            App.render();
          };
          secBox.appendChild(toggle);
        }

        const secFields = App.buildFields([
          secEnabled ? { k: 'actuel', l: 'Mot de passe actuel', type: 'password', full: true, autocomplete: 'current-password' } : null,
          { k: 'utilisateur', l: 'Nom d\'utilisateur', full: true, autocomplete: 'username', required: true, placeholder: 'Ex. : majed' },
          { k: 'nouveau', l: secEnabled ? 'Nouveau mot de passe (laisser vide pour le conserver)' : 'Mot de passe', type: 'password', full: true, autocomplete: 'new-password' },
          { k: 'confirmation', l: 'Confirmer le mot de passe', type: 'password', full: true, autocomplete: 'new-password' }
        ].filter(Boolean), secEnabled ? { utilisateur: security.user() || '' } : { utilisateur: 'admin' }, {});
        secBox.appendChild(secFields.el);
        if (!secEnabled) secBox.appendChild(el('small', 'hint', 'Nom d\'utilisateur : 3 caractères minimum, sans espace. Mot de passe : 4 caractères minimum. Notez-les : sans eux, l\'accès aux données locales de ce navigateur est perdu.'));

        const secActions = el('div', 'security-actions');
        const saveSec = el('button', 'btn primary', App.icon('check') + '<span>' + (secEnabled ? 'Mettre à jour les identifiants' : 'Activer le verrouillage') + '</span>');
        saveSec.type = 'button';
        saveSec.onclick = function () {
          const v = secFields.read();
          const name = (v.utilisateur || '').trim();
          const pw = v.nouveau || '';
          if (name.length < 3) {
            App.toast('Le nom d\'utilisateur doit contenir au moins 3 caractères.', 'err');
            return;
          }
          if (/\s/.test(name)) {
            App.toast('Le nom d\'utilisateur ne doit pas contenir d\'espace.', 'err');
            return;
          }
          if (secEnabled && !security.verify(v.actuel || '')) {
            App.toast('Mot de passe actuel incorrect.', 'err');
            return;
          }
          if (!secEnabled || pw) {
            if (pw.length < 4) {
              App.toast('Le mot de passe doit contenir au moins 4 caractères.', 'err');
              return;
            }
            if (pw !== (v.confirmation || '')) {
              App.toast('Les deux mots de passe ne correspondent pas.', 'err');
              return;
            }
            security.setCredentials(name, pw);
          } else {
            security.setUser(name);
          }
          App.toast(secEnabled ? 'Identifiants mis à jour.' : 'Verrouillage activé. Il sera demandé à la prochaine ouverture.');
          App.render();
        };
        secActions.appendChild(saveSec);

        if (secEnabled) {
          const now = el('button', 'btn ghost', App.icon('lock') + '<span>Verrouiller maintenant</span>');
          now.type = 'button';
          now.onclick = function () { security.lock(); };
          const off = el('button', 'btn danger-soft', App.icon('trash') + '<span>Désactiver le verrouillage</span>');
          off.type = 'button';
          off.onclick = function () {
            const v = secFields.read();
            if (!security.verify(v.actuel || '')) {
              App.toast('Saisissez le mot de passe actuel pour désactiver.', 'err');
              return;
            }
            App.confirm({ title: 'Désactiver le verrouillage', message: 'Le site ne demandera plus de nom d\'utilisateur ni de mot de passe à l\'ouverture sur ce navigateur.', confirmLabel: 'Désactiver' }).then(function (ok) {
              if (!ok) return;
              security.disable();
              App.toast('Verrouillage désactivé.');
              App.render();
            });
          };
          secActions.append(now, off);
        }
        secBox.appendChild(secActions);
        secBox.appendChild(el('p', 'security-warning', 'Protection locale : l\'écran de connexion verrouille l\'interface de ce navigateur, mais ne chiffre ni les fichiers du site ni les données déjà enregistrées. Une personne ayant accès au navigateur ou aux outils de développement peut les consulter. Pour restreindre l\'accès au site publié pour tous les visiteurs, une protection côté hébergeur est nécessaire (voir PUBLIER.md).'));
        secCard.appendChild(secBox);
        wrap.appendChild(secCard);
      }

      const data = el('section', 'card pad-card');
      data.innerHTML = '<div class="card-head"><h2>' + App.icon('download', 18) + ' Données & sauvegarde</h2><p>Vos données sont enregistrées automatiquement dans ce navigateur (localStorage). Exportez régulièrement une sauvegarde.</p></div>';
      const info = App.storageInfo();
      const zone = el('div', 'data-zone');
      zone.innerHTML = '<div class="data-stat"><span>Espace utilisé</span><b>' + info.texte + '</b></div>' +
        '<div class="data-stat"><span>Version</span><b>' + App.version + '</b></div>' +
        '<div class="data-stat"><span>Chantiers</span><b>' + App.db.get('chantiers').length + '</b></div>';
      data.appendChild(zone);

      const actions = el('div', 'data-actions');
      const exp = el('button', 'btn ghost', App.icon('download') + '<span>Exporter une sauvegarde JSON</span>');
      exp.onclick = App.exportJSON;
      const imp = el('button', 'btn ghost', App.icon('upload') + '<span>Importer une sauvegarde</span>');
      const fileInp = el('input');
      fileInp.type = 'file';
      fileInp.accept = 'application/json,.json';
      fileInp.style.display = 'none';
      imp.onclick = function () { fileInp.click(); };
      fileInp.onchange = async function () {
        const f = fileInp.files && fileInp.files[0];
        if (!f) return;
        if (App.security && !(await App.security.confirmWrite('Importer une sauvegarde'))) { fileInp.value = ''; return; }
        App.importJSON(f).then(function () {
          App.toast('Sauvegarde restaurée.');
          App.render();
        }).catch(function () {
          App.toast('Fichier de sauvegarde invalide.', 'err');
        });
        fileInp.value = '';
      };
      const reset = el('button', 'btn ghost', App.icon('chart') + '<span>Recharger la démonstration</span>');
      reset.onclick = function () {
        App.confirm({ title: 'Recharger la démonstration', message: 'Toutes vos données actuelles seront remplacées par le jeu de démonstration. Exportez d\'abord si nécessaire.', confirmLabel: 'Recharger', danger: false }).then(async function (ok) {
          if (!ok) return;
          if (App.security && !(await App.security.confirmWrite('Recharger les données de démonstration'))) return;
          App.db.reset();
          App.toast('Données de démonstration rechargées.');
          App.render();
        });
      };
      const wipe = el('button', 'btn danger-soft', App.icon('trash') + '<span>Remettre à zéro</span>');
      wipe.onclick = function () {
        App.confirm({
          title: 'Remettre à zéro',
          message: 'Supprimer définitivement tous les chantiers, tâches, articles, mouvements de stock, fournisseurs, devis, commandes, décomptes, personnel, essais béton et documents saisis dans ce navigateur ? L\'identité de l\'entreprise, le logo et le verrouillage sont conservés. Cette action est irréversible : exportez d\'abord une sauvegarde si nécessaire.',
          confirmLabel: 'Tout supprimer'
        }).then(async function (ok) {
          if (!ok) return;
          if (App.security && !(await App.security.confirmWrite('Remettre toutes les données à zéro'))) return;
          App.db.wipe();
          App.state.chantierId = 'all';
          App.toast('Toutes les données saisies ont été supprimées.');
          if (location.hash && location.hash !== '#/dashboard') location.hash = '#/dashboard';
          else App.render();
        });
      };
      actions.append(exp, imp, reset, wipe, fileInp);
      data.appendChild(actions);
      wrap.appendChild(data);

      const help = el('section', 'card pad-card');
      help.innerHTML = '<div class="card-head"><h2>' + App.icon('file', 18) + ' Aide & bonnes pratiques</h2></div>' +
        '<div class="help-grid">' +
          '<div><h4>Modifier n\'importe quelle donnée</h4><p>Chaque liste dispose d\'un crayon pour modifier et d\'une corbeille pour supprimer. Les pourcentages d\'avancement se modifient directement dans le module <b>Avancement</b> (curseur ou saisie).</p></div>' +
          '<div><h4>Chaîne commerciale</h4><p>Créez un <b>devis</b>, imprimez-le, puis utilisez l\'action « Créer un bon de commande » pour préparer vos achats. Les <b>bons de commande</b> se transforment en mouvements de stock via le module Stock.</p></div>' +
          '<div><h4>Sous-traitance</h4><p>Chaque <b>situation</b> calcule le cumulé, la période, la retenue de garantie, la TVA et le net à payer. Validez puis marquez payée en un clic.</p></div>' +
          '<div><h4>Documents</h4><p>Référencez contrats, plans, PV et assurances avec une date d\'expiration. Vous pouvez joindre un fichier de moins de 1,5 Mo ou pointer vers un lien réseau.</p></div>' +
          '<div><h4>Sauvegarde</h4><p>Les données restent dans ce navigateur, sur ce poste. Exportez le fichier JSON pour archiver ou transférer vers un autre poste via « Importer une sauvegarde ».</p></div>' +
          '<div><h4>Impression</h4><p>Les boutons d\'impression ouvrent une fenêtre A4 prête à imprimer ou à enregistrer en PDF. Autorisez les pop-ups si nécessaire.</p></div>' +
        '</div>';
      wrap.appendChild(help);
    }
  });
})();
