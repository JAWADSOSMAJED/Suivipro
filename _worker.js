/* =========================================================
   Protection optionnelle par nom d'utilisateur et mot de passe
   — Cloudflare Pages
   ---------------------------------------------------------
   Actif uniquement si la variable d'environnement SITE_PASSWORD
   est définie dans le projet Cloudflare Pages.
   Identifiant demandé : SITE_USER (valeur par défaut « chantier »).
   Sans SITE_PASSWORD, le site reste accessible normalement.
   ========================================================= */
export default {
  async fetch(request, env) {
    const password = env && env.SITE_PASSWORD;
    if (!password) return env.ASSETS.fetch(request);
    const user = (env && env.SITE_USER) || 'chantier';

    const header = request.headers.get('Authorization') || '';
    if (header.indexOf('Basic ') !== 0) return unauthorized();

    let decoded = '';
    try {
      decoded = decodeURIComponent(escape(atob(header.slice(6))));
    } catch (e) {
      return unauthorized();
    }
    const sep = decoded.indexOf(':');
    if (sep < 0) return unauthorized();
    const givenUser = decoded.slice(0, sep);
    const givenPassword = decoded.slice(sep + 1);
    if (!same(givenUser, user) || !same(givenPassword, password)) return unauthorized();

    return env.ASSETS.fetch(request);
  }
};

function same(a, b) {
  const x = String(a == null ? '' : a);
  const y = String(b == null ? '' : b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

function unauthorized() {
  return new Response('Acc\u00e8s prot\u00e9g\u00e9 par nom d\u2019utilisateur et mot de passe.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="ChantierPro", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}
