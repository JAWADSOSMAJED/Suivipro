/* =========================================================
   ChantierPro — verrouillage par mot de passe
   (protection locale de l'interface, sans serveur)
   ========================================================= */
(function () {
  'use strict';
  const App = window.App;
  const { el, esc } = App;

  const SESSION_KEY = 'chantierpro_unlocked';
  const ITERATIONS = 12000;

  /* ---------------- SHA-256 (pur JavaScript, compatible file://) ---------------- */
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  function sha256Hex(text) {
    const bytes = Array.from(new TextEncoder().encode(String(text)));
    const bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    const hi = Math.floor(bitLen / 4294967296);
    bytes.push((hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255);
    bytes.push((bitLen >>> 24) & 255, (bitLen >>> 16) & 255, (bitLen >>> 8) & 255, bitLen & 255);

    let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const w = new Array(64);
    for (let off = 0; off < bytes.length; off += 64) {
      for (let i = 0; i < 16; i++) {
        w[i] = (bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) | (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3];
      }
      for (let i = 16; i < 64; i++) {
        const x = w[i - 15];
        const y = w[i - 2];
        const s0 = rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
        const s1 = rotr(y, 17) ^ rotr(y, 19) ^ (y >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (let i = 0; i < 64; i++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0;
        d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0;
      H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0;
      H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map(function (x) { return (x >>> 0).toString(16).padStart(8, '0'); }).join('');
  }

  function randomSalt() {
    const b = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(b);
    else for (let i = 0; i < b.length; i++) b[i] = Math.floor(Math.random() * 256);
    return Array.from(b).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
  }

  function derive(password, salt) {
    let h = sha256Hex(salt + ':' + password);
    for (let i = 0; i < ITERATIONS; i++) h = sha256Hex(h + salt);
    return h;
  }

  function normalizeUser(value) {
    return String(value == null ? '' : value).trim().toLowerCase();
  }

  /* ---------------- État ---------------- */
  let memoryUnlocked = false;

  function security() { return App.db.data ? App.db.data.security : null; }

  function isEnabled() {
    const s = security();
    return !!(s && s.hash && s.salt);
  }

  function userName() {
    const s = security();
    return s && s.user ? String(s.user) : '';
  }

  function isUnlocked() {
    if (memoryUnlocked) return true;
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; }
  }

  function setCredentials(user, password) {
    const salt = randomSalt();
    const previous = security();
    const name = String(user == null || user === '' ? (previous && previous.user) || 'admin' : user).trim();
    App.db.data.security = {
      user: name,
      salt: salt,
      hash: derive(password, salt),
      iterations: ITERATIONS,
      requireOnWrite: previous && previous.requireOnWrite === false ? false : true,
      updatedAt: new Date().toISOString()
    };
    App.db.persist();
  }

  /* Change uniquement le nom d'utilisateur, en conservant le mot de passe. */
  function setUser(name) {
    const s = security();
    if (!s) return;
    s.user = String(name == null ? '' : name).trim();
    s.updatedAt = new Date().toISOString();
    App.db.persist();
  }

  /* Conservé pour compatibilité : le nom d'utilisateur reste inchangé (ou « admin »). */
  function setPassword(password, user) {
    setCredentials(user == null ? (userName() || 'admin') : user, password);
  }

  function requireOnWrite() {
    const s = security();
    return !!(s && s.requireOnWrite !== false);
  }

  function setRequireOnWrite(value) {
    const s = security();
    if (!s) return;
    s.requireOnWrite = !!value;
    App.db.persist();
  }

  function verify(password) {
    const s = security();
    if (!s || !s.hash) return false;
    return derive(password, s.salt) === s.hash;
  }

  /* Vérifie le couple nom d'utilisateur / mot de passe.
     Les protections créées avant l'ajout du nom d'utilisateur acceptent
     n'importe quel nom : il est alors enregistré à la première connexion. */
  function checkCredentials(username, password) {
    const s = security();
    if (!s || !s.hash) return false;
    const name = normalizeUser(username);
    if (!name) return false;
    if (s.user && normalizeUser(s.user) !== name) return false;
    if (!verify(password)) return false;
    if (!s.user) {
      s.user = String(username).trim();
      App.db.persist();
    }
    return true;
  }

  function disable() {
    App.db.data.security = null;
    App.db.persist();
    memoryUnlocked = false;
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  /* ---------------- Confirmation d'une modification ---------------- */
  function requestPassword(label) {
    return new Promise(function (resolve) {
      const root = document.getElementById('modalRoot');
      const overlay = el('div', 'overlay pw-overlay');
      const box = el('div', 'modal sm pw-modal');
      box.innerHTML =
        '<div class="modal-head"><div><h3>Confirmation par mot de passe</h3><p>' + esc(label || 'Valider cette modification') + '</p></div>' +
          '<button type="button" class="icon-btn" data-pw-cancel title="Annuler">&times;</button></div>' +
        '<div class="modal-body">' +
          '<div class="lock-field"><label for="pwConfirm">Mot de passe</label>' +
          '<input id="pwConfirm" class="input" type="password" autocomplete="current-password" required></div>' +
          '<p class="lock-error" hidden>Mot de passe incorrect.</p>' +
        '</div>' +
        '<div class="modal-foot"><button type="button" class="btn ghost" data-pw-cancel>Annuler</button>' +
          '<button type="button" class="btn primary" data-pw-ok>' + App.icon('check') + '<span>Valider</span></button></div>';
      overlay.appendChild(box);
      root.appendChild(overlay);
      document.body.classList.add('modal-open');

      const input = box.querySelector('#pwConfirm');
      const error = box.querySelector('.lock-error');
      const ok = box.querySelector('[data-pw-ok]');
      let done = false;
      setTimeout(function () { input.focus(); }, 80);

      function cleanup() {
        document.removeEventListener('keydown', onKey, true);
        overlay.classList.add('closing');
        setTimeout(function () {
          overlay.remove();
          if (!document.querySelector('.overlay')) document.body.classList.remove('modal-open');
        }, 160);
      }
      function finish(result) {
        if (done) return;
        done = true;
        cleanup();
        resolve(result);
      }
      function onKey(e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          finish(false);
        }
      }
      document.addEventListener('keydown', onKey, true);

      box.querySelectorAll('[data-pw-cancel]').forEach(function (b) {
        b.onclick = function () { finish(false); };
      });
      overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) finish(false); });

      function submit() {
        if (done) return;
        const value = input.value;
        if (!value) {
          error.hidden = false;
          error.textContent = 'Saisissez le mot de passe.';
          input.focus();
          return;
        }
        error.hidden = true;
        ok.disabled = true;
        ok.innerHTML = '<span>Vérification…</span>';
        setTimeout(function () {
          if (verify(value)) {
            finish(true);
          } else {
            error.hidden = false;
            error.textContent = 'Mot de passe incorrect.';
            input.value = '';
            input.focus();
            box.classList.add('shake');
            setTimeout(function () { box.classList.remove('shake'); }, 340);
            ok.disabled = false;
            ok.innerHTML = App.icon('check') + '<span>Valider</span>';
          }
        }, 20);
      }
      ok.onclick = submit;
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
      });
    });
  }

  function confirmWrite(label) {
    if (!isEnabled()) return Promise.resolve(true);
    if (!requireOnWrite()) return Promise.resolve(true);
    return requestPassword(label);
  }

  /* ---------------- Écran de verrouillage ---------------- */
  let activeGate = null;

  function showGate(onUnlock) {
    if (activeGate) return;
    const societe = App.settings().societe || {};
    const hasLogo = !!(societe.logo && societe.logo.dataUrl);
    const logo = hasLogo
      ? '<img src="' + esc(societe.logo.dataUrl) + '" alt="Logo">'
      : App.icon('lock', 24);

    const screen = el('div', 'lock-screen');
    screen.innerHTML =
      '<form class="lock-card" autocomplete="off">' +
        '<div class="lock-logo' + (hasLogo ? ' has-image' : '') + '">' + logo + '</div>' +
        '<h1>' + esc(societe.nom || 'ChantierPro') + '</h1>' +
        '<p class="lock-sub">Site protégé. Saisissez votre nom d\'utilisateur et votre mot de passe pour accéder à vos données.</p>' +
        '<div class="lock-field">' +
          '<label for="lockUser">Nom d\'utilisateur</label>' +
          '<input id="lockUser" class="input" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" required>' +
        '</div>' +
        '<div class="lock-field">' +
          '<label for="lockPassword">Mot de passe</label>' +
          '<input id="lockPassword" class="input" type="password" autocomplete="current-password" required>' +
        '</div>' +
        '<p class="lock-error" hidden>Nom d\'utilisateur ou mot de passe incorrect.</p>' +
        '<button type="submit" class="btn primary">Déverrouiller</button>' +
        '<small class="lock-note">Identifiants oubliés ? Les données sont stockées dans ce navigateur. La seule solution est de réinitialiser le stockage local, ce qui efface les données.</small>' +
      '</form>';

    document.body.appendChild(screen);
    document.body.classList.add('modal-open');
    activeGate = screen;

    const form = screen.querySelector('form');
    const userInput = screen.querySelector('#lockUser');
    const input = screen.querySelector('#lockPassword');
    const error = screen.querySelector('.lock-error');
    const submit = screen.querySelector('button[type="submit"]');
    setTimeout(function () { userInput.focus(); }, 60);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!userInput.value.trim() || !input.value) {
        error.hidden = false;
        error.textContent = 'Saisissez le nom d\'utilisateur et le mot de passe.';
        (userInput.value.trim() ? input : userInput).focus();
        return;
      }
      error.hidden = true;
      submit.disabled = true;
      submit.textContent = 'Vérification…';
      setTimeout(function () {
        if (checkCredentials(userInput.value, input.value)) {
          memoryUnlocked = true;
          try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e2) {}
          screen.remove();
          activeGate = null;
          if (!document.querySelector('.overlay')) document.body.classList.remove('modal-open');
          if (typeof onUnlock === 'function') onUnlock();
        } else {
          error.hidden = false;
          error.textContent = 'Nom d\'utilisateur ou mot de passe incorrect.';
          input.value = '';
          input.focus();
          submit.disabled = false;
          submit.textContent = 'Déverrouiller';
          screen.classList.add('shake');
          setTimeout(function () { screen.classList.remove('shake'); }, 340);
        }
      }, 20);
    });
  }

  function gate(onUnlock) {
    if (!isEnabled()) return false;
    if (isUnlocked()) return false;
    showGate(onUnlock);
    return true;
  }

  function lock() {
    memoryUnlocked = false;
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    if (isEnabled()) showGate(null);
  }

  App.security = {
    _sha256: sha256Hex,
    isEnabled: isEnabled,
    isUnlocked: isUnlocked,
    user: userName,
    setCredentials: setCredentials,
    setUser: setUser,
    setPassword: setPassword,
    verify: verify,
    checkCredentials: checkCredentials,
    disable: disable,
    requireOnWrite: requireOnWrite,
    setRequireOnWrite: setRequireOnWrite,
    requestPassword: requestPassword,
    confirmWrite: confirmWrite,
    gate: gate,
    lock: lock
  };
})();
