/* =========================================================
   ChantierPro — SOSMAJED — socle : utilitaires et composants d'interface
   Site autonome, données stockées dans le navigateur.
   ========================================================= */
(function () {
  'use strict';

  const App = (window.App = window.App || {});
  App.version = '1.4.8';
  App.entities = {};
  App.views = {};
  App.entity = function (key, def) { App.entities[key] = def; };
  App.view = function (key, def) { App.views[key] = def; };
  App.state = { chantierId: 'all', route: 'dashboard', param: null };

  /* ---------------- Formatage et calculs de base ---------------- */
  const isoOf = (d) =>
    d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

  const uid = (p) => (p || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  const n = function (v) {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    const x = parseFloat(String(v == null ? '' : v).replace(/\s/g, '').replace(',', '.'));
    return isFinite(x) ? x : 0;
  };

  const sum = (arr, f) => (arr || []).reduce((s, x) => s + (f ? n(f(x)) : n(x)), 0);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const moneyFmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', currencyDisplay: 'code', maximumFractionDigits: 2 });
  const numFmt = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
  const money = (v) => moneyFmt.format(n(v));
  const num = (v) => numFmt.format(n(v));
  const pct = (v) => num(v) + ' %';
  const todayISO = () => isoOf(new Date());

  const addDays = function (iso, days) {
    const d = new Date((iso || todayISO()) + 'T12:00:00');
    d.setDate(d.getDate() + Number(days || 0));
    return isoOf(d);
  };

  const fmtDate = function (v) {
    if (!v) return '—';
    const d = new Date(String(v).slice(0, 10) + 'T00:00:00');
    return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString('fr-FR');
  };

  const daysTo = function (v) {
    const a = new Date(String(v).slice(0, 10) + 'T00:00:00');
    const b = new Date(todayISO() + 'T00:00:00');
    if (isNaN(a.getTime())) return 0;
    return Math.round((a - b) / 86400000);
  };

  const esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const monthYear = (iso) => {
    const d = new Date((iso || todayISO()) + 'T12:00:00');
    return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const fileSize = function (octets) {
    const o = n(octets);
    if (!o) return '';
    if (o < 1024) return o + ' o';
    if (o < 1024 * 1024) return (o / 1024).toFixed(0) + ' Ko';
    return (o / 1024 / 1024).toFixed(1) + ' Mo';
  };

  /* ---------------- Icônes ---------------- */
  const ICONS = {
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    box: '<path d="M21 8V21H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z"/><circle cx="12" cy="12" r="3"/>',
    right: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    warn: '<path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    arrowUp: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
    arrowDown: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    setting: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2Z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    truck: '<path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-4l-3-5h-5v9h3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
    wallet: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    hammer: '<path d="m15 12-8.5 8.5a2.1 2.1 0 0 1-3-3L12 9"/><path d="M17.6 15.6 22 11l-3-3-1.5 1.5"/><path d="M14 6 9 1 5.5 4.5 8 7"/><path d="M12 9 9.5 6.5"/>',
    beaker: '<path d="M9 3h6"/><path d="M10 3v5.5L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 8.5V3"/><path d="M7.3 14h9.4"/>'
  };
  App.icon = function (name, size) {
    const s = size || 16;
    return '<svg class="ico" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
  };

  /* ---------------- DOM ---------------- */
  const el = function (tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ---------------- Badges et avancement ---------------- */
  const TONES = {
    'En cours': 'info', 'Terminé': 'ok', 'En attente': 'warn', 'Suspendu': 'danger', 'Annulé': 'muted',
    'Accepté': 'ok', 'Envoyé': 'info', 'Refusé': 'danger', 'Brouillon': 'muted',
    'Validé': 'ok', 'Validée': 'ok', 'Payé': 'ok', 'Payée': 'ok', 'À valider': 'warn',
    'Livré': 'ok', 'Livré partiellement': 'warn', 'En retard': 'danger',
    'À faire': 'muted', 'Urgent': 'danger', 'Haute': 'danger', 'Moyenne': 'warn', 'Basse': 'muted',
    'Expiré': 'danger', 'Expire bientôt': 'warn', 'Archivé': 'muted',
    'Actif': 'ok', 'En congé': 'warn', 'Inactif': 'muted',
    'Conforme': 'ok', 'Non conforme': 'danger'
  };
  const tone = (t) => TONES[t] || 'info';
  const badgeHTML = function (t) {
    if (!t) return '<span class="muted">—</span>';
    return '<span class="badge ' + tone(t) + '">' + esc(t) + '</span>';
  };
  const progressHTML = function (v, small) {
    const p = clamp(n(v), 0, 100);
    return '<div class="progress-wrap' + (small ? ' sm' : '') + '"><div class="progress"><div class="bar" style="width:' + p + '%"></div></div><span class="pct-label">' + num(Math.round(p * 10) / 10) + ' %</span></div>';
  };

  /* ---------------- Toasts ---------------- */
  function toast(message, kind, ms) {
    const root = document.getElementById('toastRoot');
    if (!root) return;
    const t = el('div', 'toast ' + (kind || 'ok'));
    t.innerHTML = '<span class="toast-ico">' + (kind === 'err' ? App.icon('warn') : App.icon('check')) + '</span><span>' + esc(message) + '</span>';
    root.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 10);
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 250);
    }, ms || 2800);
  }

  /* ---------------- Fenêtre modale ---------------- */
  function modal(opts) {
    const root = document.getElementById('modalRoot');
    const overlay = el('div', 'overlay');
    const box = el('div', 'modal ' + (opts.size || 'md'));
    const head = el('div', 'modal-head');
    head.innerHTML = '<div><h3>' + esc(opts.title || '') + '</h3>' + (opts.subtitle ? '<p>' + esc(opts.subtitle) + '</p>' : '') + '</div>';
    const closeBtn = el('button', 'icon-btn', '&times;');
    closeBtn.type = 'button';
    closeBtn.title = 'Fermer';
    closeBtn.onclick = () => close();
    head.appendChild(closeBtn);

    const body = el('div', 'modal-body');
    if (typeof opts.body === 'string') body.innerHTML = opts.body;
    else if (opts.body) body.appendChild(opts.body);

    const foot = el('div', 'modal-foot');
    (opts.actions || []).forEach(function (a) {
      const b = el('button', 'btn ' + (a.kind || 'ghost'), (a.icon ? App.icon(a.icon) : '') + '<span>' + esc(a.label) + '</span>');
      b.type = 'button';
      b.onclick = function () {
        if (a.onClick) a.onClick(close);
        else close();
      };
      foot.appendChild(b);
    });

    box.append(head, body, foot);
    overlay.appendChild(box);
    root.appendChild(overlay);
    document.body.classList.add('modal-open');

    function close() {
      overlay.classList.add('closing');
      setTimeout(function () {
        overlay.remove();
        if (!document.querySelector('.overlay')) document.body.classList.remove('modal-open');
      }, 160);
    }
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });
    const onKey = function (e) {
      if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); close(); }
    };
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(function () { box.classList.add('in'); });
    return { el: box, body: body, close: close };
  }

  function confirmDialog(opts) {
    const o = typeof opts === 'string' ? { message: opts } : (opts || {});
    return new Promise(function (resolve) {
      let done = false;
      const m = modal({
        title: o.title || 'Confirmation',
        size: 'sm',
        body: '<p class="confirm-text">' + esc(o.message || 'Confirmez-vous cette action ?') + '</p>',
        actions: [
          { label: o.cancelLabel || 'Annuler', kind: 'ghost', onClick: function (close) { done = true; close(); resolve(false); } },
          { label: o.confirmLabel || 'Confirmer', kind: o.danger === false ? 'primary' : 'danger', onClick: function (close) { done = true; close(); resolve(true); } }
        ]
      });
      const root = document.getElementById('modalRoot');
      const obs = new MutationObserver(function () {
        if (done) { obs.disconnect(); return; }
        if (!document.body.contains(m.el)) { obs.disconnect(); resolve(false); }
      });
      obs.observe(root, { childList: true });
    });
  }

  /* ---------------- Champs de formulaire ---------------- */
  function optionList(f) {
    let opts = typeof f.options === 'function' ? f.options() : f.options;
    if (f.ref) opts = App.refOptions(f.ref);
    return (opts || []).map(function (o) {
      return typeof o === 'object' ? o : { value: o, label: o };
    });
  }

  function buildFields(fields, data, ctx) {
    const grid = el('div', 'form-grid');
    const readers = [];
    const checks = [];

    fields.forEach(function (f) {
      const wrap = el('div', 'fld' + (f.full ? ' full' : '') + (f.type === 'checkbox' ? ' fld-check' : ''));
      const value = data[f.k];
      const label = f.l || f.label || '';

      if (f.type === 'checkbox') {
        const lab = el('label', 'check-row');
        const input = el('input');
        input.type = 'checkbox';
        input.dataset.k = f.k;
        input.checked = !!value;
        lab.append(input, el('span', '', esc(label)));
        wrap.appendChild(lab);
        readers.push(function () { const o = {}; o[f.k] = input.checked; return o; });
        grid.appendChild(wrap);
        return;
      }

      if (f.type === 'file') {
        wrap.appendChild(el('label', '', esc(label)));
        const holder = el('div', 'file-field');
        const info = el('div', 'file-info');
        const removeBtn = el('button', 'btn ghost sm', 'Retirer');
        removeBtn.type = 'button';
        ctx.fileValue = value || null;
        const showInfo = function () {
          const v = ctx.fileValue;
          info.innerHTML = v && v.name
            ? App.icon('file') + ' <span class="file-name">' + esc(v.name) + '</span> <small>' + fileSize(v.size) + '</small>'
            : '<span class="muted">Aucun fichier joint</span>';
          removeBtn.style.display = v && v.name ? '' : 'none';
        };
        showInfo();
        const input = el('input');
        input.type = 'file';
        input.className = 'input file-input';
        if (f.accept) input.accept = f.accept;
        input.onchange = function () {
          const file = input.files && input.files[0];
          if (!file) return;
          const max = f.maxSize || 1500000;
          if (file.size > max) {
            toast('Fichier trop volumineux (max ' + fileSize(max) + '). Utilisez plutôt un lien.', 'err');
            input.value = '';
            return;
          }
          const fr = new FileReader();
          fr.onload = function () {
            ctx.fileValue = { name: file.name, type: file.type, size: file.size, dataUrl: fr.result };
            showInfo();
          };
          fr.readAsDataURL(file);
        };
        removeBtn.onclick = function () { ctx.fileValue = null; input.value = ''; showInfo(); };
        holder.append(info, input, removeBtn);
        wrap.appendChild(holder);
        if (f.hint) wrap.appendChild(el('small', 'hint', esc(f.hint)));
        readers.push(function () { const o = {}; o[f.k] = ctx.fileValue || null; return o; });
        grid.appendChild(wrap);
        return;
      }

      wrap.appendChild(el('label', '', esc(label) + (f.required ? ' <span class="req">*</span>' : '')));
      let input;
      const v = value == null ? (f.default == null ? '' : f.default) : value;

      if (f.type === 'textarea') {
        input = el('textarea');
        input.rows = f.rows || 3;
        input.value = v;
        if (f.placeholder) input.placeholder = f.placeholder;
      } else if (f.type === 'select') {
        input = el('select');
        const opts = optionList(f);
        if (f.empty !== false) input.appendChild(new Option(f.emptyLabel || '— Choisir —', ''));
        opts.forEach(function (o) { input.appendChild(new Option(o.label, o.value)); });
        input.value = v == null ? '' : v;
        if (f.required && !optLen(opts)) input.dataset.empty = '1';
      } else if (f.type === 'date') {
        input = el('input');
        input.type = 'date';
        input.value = v ? String(v).slice(0, 10) : '';
      } else if (f.type === 'number' || f.type === 'money' || f.type === 'percent') {
        input = el('input');
        input.type = 'number';
        input.step = f.type === 'number' ? (f.step || '1') : '0.01';
        if (f.min != null) input.min = f.min;
        if (f.max != null) input.max = f.max;
        input.inputMode = 'decimal';
        input.value = v === '' || v == null ? '' : v;
      } else {
        input = el('input');
        input.type = f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : f.type === 'url' ? 'url' : f.type === 'password' ? 'password' : f.type === 'time' ? 'time' : 'text';
        input.value = v == null ? '' : v;
        if (f.placeholder) input.placeholder = f.placeholder;
      }
      if (!input.className) input.className = 'input';
      if (input.tagName === 'SELECT') input.className = 'input';
      if (input.tagName === 'TEXTAREA') input.className = 'input';
      input.dataset.k = f.k;
      if (f.autocomplete) input.autocomplete = f.autocomplete;
      if (f.required) {
        input.required = true;
        checks.push({ input: input, label: label, type: f.type });
      }
      if (f.hint) wrap.appendChild(input), wrap.appendChild(el('small', 'hint', esc(f.hint)));
      else wrap.appendChild(input);

      readers.push(function () {
        const o = {};
        if (f.type === 'number' || f.type === 'money' || f.type === 'percent') {
          o[f.k] = input.value === '' ? 0 : n(input.value);
        } else {
          o[f.k] = input.value.trim ? input.value.trim() : input.value;
        }
        return o;
      });
      grid.appendChild(wrap);
    });

    function optLen(o) { return (o || []).length; }

    return {
      el: grid,
      read: function () {
        const out = {};
        readers.forEach(function (r) { Object.assign(out, r()); });
        return out;
      },
      validate: function () {
        let bad = null;
        checks.forEach(function (c) {
          c.input.classList.remove('invalid');
          if (c.type === 'checkbox') { if (!c.input.checked) bad = bad || c; }
          else if (String(c.input.value).trim() === '') { c.input.classList.add('invalid'); bad = bad || c; }
        });
        if (bad) {
          bad.input.focus();
          toast('Champ obligatoire : ' + bad.label, 'err');
          return false;
        }
        return true;
      }
    };
  }

  /* ---------------- Éditeur de lignes (devis, BC, décomptes…) ---------------- */
  function lineEditor(cfg, initialRows) {
    const cols = cfg.columns || [];
    const mainKey = cfg.mainKey || (cols[0] && cols[0].k) || 'designation';
    let rows = (initialRows || []).map(function (r) { return Object.assign({}, r); });
    if (!rows.length && cfg.autoAdd !== false) rows.push(cfg.newRow ? cfg.newRow() : {});

    const wrap = el('div', 'line-editor');
    const scroll = el('div', 'line-scroll');
    const table = el('table', 'lines-table');
    const thead = el('thead');
    const trh = el('tr');
    cols.forEach(function (c) {
      const th = el('th', c.align === 'right' ? 'right' : '', esc(c.label || c.l || ''));
      if (c.width) th.style.width = c.width;
      trh.appendChild(th);
    });
    trh.appendChild(el('th', '', ''));
    thead.appendChild(trh);
    const tbody = el('tbody');
    table.append(thead, tbody);
    scroll.appendChild(table);
    wrap.appendChild(scroll);

    const footer = el('div', 'line-foot');
    const totalsBox = el('div', 'line-totals');
    const addBtn = el('button', 'btn ghost sm', App.icon('plus') + '<span>Ajouter une ligne</span>');
    addBtn.type = 'button';
    addBtn.onclick = function () {
      rows.push(cfg.newRow ? cfg.newRow() : {});
      render();
    };
    footer.append(addBtn, totalsBox);
    wrap.appendChild(footer);

    function calcValue(c, row) {
      return c.fn ? c.fn(row) : row[c.k];
    }

    function rowNode(row, index) {
      const tr = el('tr');
      tr.dataset.i = index;
      cols.forEach(function (c) {
        const td = el('td', c.align === 'right' ? 'right' : '');
        if (c.type === 'calc') {
          td.className = 'calc-cell' + (c.align === 'right' ? ' right' : '');
          td.dataset.k = c.k;
          td.textContent = c.fmt ? c.fmt(calcValue(c, row)) : money(calcValue(c, row));
        } else if (c.type === 'select') {
          const sel = el('select', 'line-input');
          (typeof c.options === 'function' ? c.options() : c.options || []).forEach(function (o) {
            const opt = typeof o === 'object' ? o : { value: o, label: o };
            sel.appendChild(new Option(opt.label, opt.value));
          });
          sel.value = row[c.k] || (c.default || '');
          sel.onchange = function () { row[c.k] = sel.value; updateTotals(); };
          td.appendChild(sel);
        } else {
          const inp = el('input', 'line-input' + (c.type === 'number' || c.type === 'money' || c.type === 'percent' ? ' num' : ''));
          if (c.type === 'number' || c.type === 'money' || c.type === 'percent') {
            inp.type = 'number';
            inp.step = c.step || (c.type === 'number' ? '1' : '0.01');
            inp.min = '0';
          } else {
            inp.type = 'text';
          }
          if (c.placeholder) inp.placeholder = c.placeholder;
          inp.value = row[c.k] == null ? '' : row[c.k];
          inp.oninput = function () {
            row[c.k] = (c.type === 'number' || c.type === 'money' || c.type === 'percent')
              ? (inp.value === '' ? '' : n(inp.value))
              : inp.value;
            cols.forEach(function (cc) {
              if (cc.type === 'calc') {
                const cell = tr.querySelector('.calc-cell[data-k="' + cc.k + '"]');
                if (cell) cell.textContent = cc.fmt ? cc.fmt(calcValue(cc, row)) : money(calcValue(cc, row));
              }
            });
            updateTotals();
          };
          td.appendChild(inp);
        }
        tr.appendChild(td);
      });
      const tdDel = el('td', 'line-del');
      const del = el('button', 'icon-btn danger', App.icon('trash', 15));
      del.type = 'button';
      del.title = 'Supprimer la ligne';
      del.onclick = function () {
        rows.splice(index, 1);
        if (!rows.length && cfg.autoAdd !== false) rows.push(cfg.newRow ? cfg.newRow() : {});
        render();
      };
      tdDel.appendChild(del);
      tr.appendChild(tdDel);
      return tr;
    }

    function updateTotals() {
      totalsBox.innerHTML = '';
      const items = cfg.totals ? cfg.totals(rows) : [];
      items.forEach(function (it) {
        const line = el('div', 'line-total' + (it.strong ? ' strong' : ''));
        line.innerHTML = '<span>' + esc(it.label) + '</span><b>' + esc(it.value) + '</b>';
        totalsBox.appendChild(line);
      });
    }

    function render() {
      tbody.innerHTML = '';
      rows.forEach(function (row, i) { tbody.appendChild(rowNode(row, i)); });
      updateTotals();
    }

    render();

    return {
      el: wrap,
      getRows: function () {
        return rows.filter(function (r) { return String(r[mainKey] == null ? '' : r[mainKey]).trim() !== ''; })
          .map(function (r) { return Object.assign({}, r); });
      },
      refreshTotals: updateTotals,
      validate: function () {
        if (!this.getRows().length) {
          toast('Ajoutez au moins une ligne.', 'err');
          return false;
        }
        return true;
      }
    };
  }

  /* ---------------- Impression ---------------- */
  function printHTML(title, bodyHTML, opts) {
    opts = opts || {};
    const w = window.open('', '_blank');
    if (!w) {
      toast('Autorisez les fenêtres pop-up pour imprimer.', 'err');
      return;
    }
    const css = [
      '@page{size:' + (opts.landscape ? 'A4 landscape' : 'A4') + ';margin:' + (opts.landscape ? '10mm' : '14mm') + '}',
      '*{box-sizing:border-box}',
      'body{font-family:"Segoe UI",Arial,sans-serif;color:#111;font-size:12px;margin:0}',
      '.doc{max-width:' + (opts.landscape ? '1100px' : '780px') + ';margin:0 auto}',
      '.doc-head{display:flex;justify-content:space-between;gap:30px;border-bottom:3px solid #0f172a;padding-bottom:14px}',
      '.doc-logo{display:block;max-height:54px;max-width:190px;object-fit:contain;margin-bottom:10px}',
      '.doc-head h1{font-size:20px;margin:0 0 4px;color:#0f172a}',
      '.doc-head p{margin:0;line-height:1.5;color:#444;font-size:11px}',
      '.doc-type{text-align:right}',
      '.doc-type h2{font-size:18px;letter-spacing:1px;margin:0 0 6px;color:#b45309}',
      '.doc-type p{margin:0;line-height:1.6}',
      '.doc-parties{display:flex;justify-content:space-between;gap:30px;margin:22px 0}',
      '.party{max-width:48%}.party h4{margin:0 0 4px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#777}',
      '.party p{margin:0;line-height:1.5}.party strong{font-size:13px}',
      'table.lines{width:100%;border-collapse:collapse;margin-top:8px}',
      'table.lines th{background:#0f172a;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:.4px;padding:8px;text-align:left}',
      'table.lines td{border-bottom:1px solid #e2e8f0;padding:7px 8px;vertical-align:top}',
      'table.lines td.r,table.lines th.r{text-align:right;white-space:nowrap}',
      'table.lines tbody tr:nth-child(even){background:#f8fafc}',
      'table.compact th,table.compact td{padding:5px;font-size:10px}',
      'table.compact td{overflow-wrap:anywhere}',
      '.totals{margin-left:auto;width:290px;margin-top:14px}',
      '.totals div{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #e2e8f0}',
      '.totals div.net{border-top:2px solid #0f172a;border-bottom:none;font-size:15px;font-weight:700;margin-top:4px;padding-top:8px;color:#b45309}',
      '.notes{margin-top:22px;font-size:10px;color:#555;line-height:1.5;border-top:1px solid #ddd;padding-top:10px}',
      '.sign{display:flex;gap:50px;margin-top:40px}.sign div{flex:1;border-top:1px solid #999;padding-top:6px;font-size:10px;color:#555}',
      '.badge-doc{display:inline-block;padding:2px 7px;border-radius:9px;background:#f1f5f9;font-size:10px}',
      '.badge-ok{background:#d1fae5;color:#065f46}',
      '.badge-ko{background:#fee2e2;color:#991b1b}',
      '.badge-wait{background:#fef3c7;color:#92400e}',
      '.kpi-doc{display:flex;gap:16px;margin:16px 0}.kpi-doc div{flex:1;border:1px solid #e2e8f0;border-radius:6px;padding:8px}',
      '.kpi-doc span{display:block;font-size:9px;text-transform:uppercase;color:#777}.kpi-doc b{font-size:14px}',
      '.doc-title{font-size:13px;margin:18px 0 6px;font-weight:700}',
      '@media print{.no-print{display:none}}'
    ].join('');
    w.document.open();
    w.document.write('<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>' + esc(title) + '</title><style>' + css + '</style></head><body><div class="doc">' + bodyHTML + '</div><script>window.onload=function(){setTimeout(function(){window.print()},350)}<\/script></body></html>');
    w.document.close();
  }

  /* ---------------- Exports ---------------- */
  Object.assign(App, {
    uid: uid, n: n, sum: sum, clamp: clamp, money: money, num: num, pct: pct,
    todayISO: todayISO, addDays: addDays, fmtDate: fmtDate, daysTo: daysTo, monthYear: monthYear,
    esc: esc, fileSize: fileSize, isoOf: isoOf,
    el: el, $: $, $$: $$, tone: tone, badgeHTML: badgeHTML, progressHTML: progressHTML,
    toast: toast, modal: modal, confirm: confirmDialog, buildFields: buildFields,
    lineEditor: lineEditor, printHTML: printHTML
  });
})();
