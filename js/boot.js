/* =========================================================
   ChantierPro — SOSMAJED — démarrage, navigation et barre supérieure
   ========================================================= */
(function () {
  'use strict';
  const App = window.App;
  const { el, esc, $, $$ } = App;

  const NAV = [
    { label: 'Pilotage', items: [
      { route: 'dashboard', label: 'Tableau de bord', icon: 'home' },
      { route: 'chantiers', label: 'Chantiers', icon: 'hammer' },
      { route: 'planning', label: 'Planning', icon: 'calendar' },
      { route: 'avancement', label: 'Avancement', icon: 'chart' }
    ] },
    { label: 'Achats & stock', items: [
      { route: 'fournisseurs', label: 'Fournisseurs', icon: 'truck' },
      { route: 'stock', label: 'Stock & fournitures', icon: 'box' },
      { route: 'commandes', label: 'Bons de commande', icon: 'file' }
    ] },
    { label: 'Commercial', items: [
      { route: 'devis', label: 'Devis', icon: 'edit' },
      { route: 'decomptes', label: 'Décomptes clients', icon: 'wallet' }
    ] },
    { label: 'Équipe & sous-traitance', items: [
      { route: 'personnel', label: 'Personnel', icon: 'user' },
      { route: 'sousTraitants', label: 'Sous-traitants', icon: 'truck' },
      { route: 'situations', label: 'Situations ST', icon: 'layers' }
    ] },
    { label: 'Qualité', items: [
      { route: 'essaisBeton', label: 'Essais béton', icon: 'beaker' }
    ] },
    { label: 'Dossier', items: [
      { route: 'documents', label: 'Documentation', icon: 'file' }
    ] },
    { label: 'Système', items: [
      { route: 'parametres', label: 'Paramètres', icon: 'setting' }
    ] }
  ];

  let brandDefaultHTML = null;
  let faviconDefault = null;

  function applyFavicon(logo) {
    const link = document.querySelector('link[rel="icon"]');
    if (!link) return;
    if (faviconDefault === null) faviconDefault = link.getAttribute('href');
    link.setAttribute('href', logo && logo.dataUrl ? logo.dataUrl : faviconDefault);
  }

  function applyLogo() {
    const box = document.querySelector('.brand-logo');
    if (!box) return;
    if (brandDefaultHTML === null) brandDefaultHTML = box.innerHTML;
    const s = App.settings();
    const logo = s && s.societe && s.societe.logo;
    applyFavicon(logo);
    if (logo && logo.dataUrl) {
      box.classList.add('has-image');
      box.innerHTML = '<img class="brand-img" src="' + esc(logo.dataUrl) + '" alt="Logo de l\'entreprise">';
    } else {
      box.classList.remove('has-image');
      box.innerHTML = brandDefaultHTML;
    }
  }
  App.applyLogo = applyLogo;

  /* Bannière modifiable affichée en tête de page. */
  function applyBanner() {
    const box = $('#topBanner');
    if (!box) return;
    const b = App.settings().banniere || {};
    const texte = String(b.texte || '').trim();
    const image = b.image && b.image.dataUrl ? String(b.image.dataUrl) : '';
    if (!b.actif || (!texte && !image)) {
      box.hidden = true;
      box.textContent = '';
      box.style.backgroundImage = '';
      return;
    }
    box.hidden = false;
    box.style.backgroundImage = image
      ? 'linear-gradient(90deg, rgba(11,18,32,.94), rgba(11,18,32,.74)), url("' + image.replace(/"/g, '%22') + '")'
      : '';
    box.innerHTML = '<div class="top-banner-inner"><span class="top-banner-mark"></span>' +
      '<span>' + (texte ? esc(texte) : '&nbsp;') + '</span></div>';
  }
  App.applyBanner = applyBanner;

  function renderNav() {    const nav = $('#nav');
    nav.innerHTML = NAV.map(function (g) {
      return '<div class="nav-group"><span class="nav-label">' + esc(g.label) + '</span>' +
        g.items.map(function (it) {
          return '<a class="nav-item" href="#/' + it.route + '" data-route="' + it.route + '">' + App.icon(it.icon, 18) + '<span>' + esc(it.label) + '</span></a>';
        }).join('') + '</div>';
    }).join('');
  }

  function populateChantierFilter() {
    const sel = $('#chantierFilter');
    const current = App.state.chantierId;
    const chantiers = App.db.get('chantiers');
    if (current !== 'all' && !chantiers.some(function (c) { return c.id === current; })) App.state.chantierId = 'all';
    sel.innerHTML = '<option value="all">Tous les chantiers</option>' + chantiers.map(function (c) {
      return '<option value="' + esc(c.id) + '">' + esc(c.code ? c.code + ' — ' + c.nom : c.nom) + '</option>';
    }).join('');
    sel.value = App.state.chantierId;
  }

  function parseRoute() {
    const raw = location.hash.replace(/^#\/?/, '');
    if (!raw) return { route: 'dashboard', param: null };
    const parts = raw.split('/');
    return { route: parts[0], param: parts[1] || null };
  }

  function render() {
    const parsed = parseRoute();
    let route = parsed.route;
    App.state.param = parsed.param;
    if (!App.views[route]) {
      route = 'dashboard';
      if (location.hash !== '#/dashboard') history.replaceState(null, '', '#/dashboard');
    }
    App.state.route = route;
    const view = App.views[route];

    let title = view.title || '';
    let subtitle = view.subtitle || '';
    if (route === 'chantier') {
      const ch = App.state.param ? App.db.find('chantiers', App.state.param) : null;
      title = ch ? ch.nom : 'Fiche chantier';
      subtitle = ch ? (ch.code || '') + ' · ' + (ch.client || 'Client non renseigné') + ' · ' + (ch.ville || '') : 'Détail de l\'opération';
    }
    if (route === 'dashboard') subtitle = 'Vue d\'ensemble — ' + new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    $('#pageTitle').textContent = title;
    $('#pageSub').textContent = subtitle;
    document.title = 'ChantierPro — SOSMAJED — ' + title;
    applyBanner();

    $$('.nav-item').forEach(function (a) {
      a.classList.toggle('active', a.dataset.route === route || (route === 'chantier' && a.dataset.route === 'chantiers'));
    });

    const quick = $('#btnQuick');
    quick.style.display = view.onNew && !view.hideQuick ? '' : 'none';
    quick.onclick = function () { if (view.onNew) view.onNew(); };

    populateChantierFilter();
    const container = $('#view');
    container.innerHTML = '';
    container.scrollTop = 0;
    view.render(container);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  App.render = render;

  function init() {
    App.db.load();
    if (App.security && App.security.gate(start)) return;
    start();
  }

  function start() {
    renderNav();
    applyLogo();

    $('#chantierFilter').addEventListener('change', function () {
      App.state.chantierId = this.value;
      render();
    });
    $('#btnExport').onclick = function () { App.exportJSON(); };

    function closeNav() {
      document.body.classList.remove('nav-open');
      const bd = $('.nav-backdrop');
      if (bd) bd.remove();
      const mt = $('#menuToggle');
      if (mt) mt.setAttribute('aria-expanded', 'false');
    }
    function openNav() {
      document.body.classList.add('nav-open');
      const mt = $('#menuToggle');
      if (mt) mt.setAttribute('aria-expanded', 'true');
      let bd = $('.nav-backdrop');
      if (!bd) {
        bd = el('div', 'nav-backdrop');
        document.body.appendChild(bd);
        bd.onclick = closeNav;
      }
    }

    $('#menuToggle').onclick = function () {
      if (document.body.classList.contains('nav-open')) closeNav();
      else openNav();
    };
    $('#navClose').onclick = closeNav;
    $$('.nav-item').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080) closeNav();
    });
    window.addEventListener('hashchange', function () { closeNav(); render(); });
    render();

    const info = App.storageInfo();
    const foot = $('#storageFoot');
    if (foot) foot.textContent = info.texte + ' utilisés · v' + App.version;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
