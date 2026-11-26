/* ==========================================================================
   Chromatch — Formulaires : création de compte, connexion, contact
   ⚠ Aucune donnée n'est stockée ni envoyée : tout reste dans la page, puis est effacé.
   ========================================================================== */
(function (global) {
  'use strict';
  const CM = global.CM;

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  const ZIP = /^\d{5}$/;
  const NAME = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]{1,}$/;

  /** Affiche (ou efface) un message d'erreur accessible sous un champ. */
  function setErr(input, msg) {
    const wrap = input.closest('.field');
    let out = wrap.querySelector('.err-msg');
    if (!out) { out = document.createElement('p'); out.className = 'err-msg'; out.id = (input.id || input.name) + '-err'; wrap.appendChild(out); }
    out.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) input.setAttribute('aria-describedby', out.id); else input.removeAttribute('aria-describedby');
    return !msg;
  }
  const $ = function (id) { return document.getElementById(id); };

  /** Force du mot de passe : 0 à 4. */
  function passwordScore(p) {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }

  /* ---------- Création de compte ---------- */
  function setupSignup() {
    const form = $('signup-form');
    if (!form) return;

    const pw = $('s-password');
    pw.addEventListener('input', function () {
      const s = passwordScore(pw.value);
      const labels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'];
      const bar = $('pw-bar');
      bar.style.width = (pw.value ? (s + 1) * 20 : 0) + '%';
      bar.setAttribute('data-score', s);
      $('pw-label').textContent = pw.value ? 'Robustesse : ' + labels[s] : '';
    });
    document.querySelectorAll('[data-toggle-pw]').forEach(function (b) {
      b.addEventListener('click', function () {
        const input = $(b.dataset.togglePw);
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        b.textContent = show ? 'Masquer' : 'Afficher';
        b.setAttribute('aria-pressed', String(show));
      });
    });

    // Date de naissance : bornes (15 ans minimum, pas dans le futur)
    const birth = $('s-birth');
    const today = new Date();
    birth.max = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate()).toISOString().slice(0, 10);
    birth.min = '1900-01-01';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let ok = true;
      const need = function (id, label, rx) {
        const v = $(id).value.trim();
        if (!v) return setErr($(id), label + ' obligatoire.');
        if (rx && !rx.test(v)) return setErr($(id), label + ' invalide.');
        return setErr($(id), '');
      };
      const civ = form.querySelector('input[name=civilite]:checked');
      const civWrap = $('civ-group');
      const civErr = civWrap.querySelector('.err-msg') || civWrap.appendChild(Object.assign(document.createElement('p'), { className: 'err-msg' }));
      civErr.textContent = civ ? '' : 'Veuillez choisir une civilité.';
      ok = !!civ && ok;
      ok = need('s-first', 'Le prénom', NAME) && ok;
      ok = need('s-last', 'Le nom', NAME) && ok;
      ok = need('s-email', 'L’adresse e-mail', EMAIL) && ok;

      const p = pw.value;
      ok = setErr(pw, passwordScore(p) >= 3 && p.length >= 8 ? '' : 'Mot de passe : 8 caractères minimum avec majuscule, minuscule, chiffre (et idéalement un symbole).') && ok;
      ok = setErr($('s-password2'), $('s-password2').value === p && p ? '' : 'Les mots de passe ne correspondent pas.') && ok;
      ok = need('s-phone', 'Le téléphone', PHONE) && ok;

      const b = $('s-birth').value;
      let birthMsg = '';
      if (!b) birthMsg = 'La date de naissance est obligatoire.';
      else if (new Date(b) > new Date($('s-birth').max)) birthMsg = 'Vous devez avoir au moins 15 ans.';
      else if (new Date(b) < new Date('1900-01-01')) birthMsg = 'Date de naissance invalide.';
      ok = setErr($('s-birth'), birthMsg) && ok;

      ok = need('s-street', 'L’adresse') && ok;
      ok = need('s-zip', 'Le code postal', ZIP) && ok;
      ok = need('s-city', 'La ville') && ok;
      ok = setErr($('s-country'), $('s-country').value ? '' : 'Veuillez choisir un pays.') && ok;
      ok = setErr($('s-terms'), $('s-terms').checked ? '' : 'Vous devez accepter les conditions pour continuer.') && ok;

      const msg = $('signup-msg');
      if (!ok) {
        msg.className = 'form-banner err';
        msg.textContent = 'Merci de corriger les champs signalés.';
        const bad = form.querySelector('[aria-invalid=true]'); if (bad) bad.focus();
        return;
      }
      const first = $('s-first').value.trim();
      form.reset();
      $('pw-bar').style.width = '0'; $('pw-label').textContent = '';
      msg.className = 'form-banner ok';
      msg.innerHTML = CM.icon('check', 18) + ' Compte créé avec succès, bienvenue ' + CM.esc(first) + ' !';
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ---------- Connexion : toujours un échec ---------- */
  function setupLogin() {
    const form = $('login-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const msg = $('login-msg');
      msg.className = 'form-banner err';
      msg.textContent = 'Identifiant ou mot de passe incorrect.';
      $('l-password').value = '';
      $('l-password').focus();
    });
    document.querySelectorAll('[data-toggle-pw]').forEach(function (b) {
      b.addEventListener('click', function () {
        const input = $(b.dataset.togglePw);
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        b.textContent = show ? 'Masquer' : 'Afficher';
        b.setAttribute('aria-pressed', String(show));
      });
    });
    const forgot = $('forgot-link');
    if (forgot) forgot.addEventListener('click', function (e) {
      e.preventDefault();
      const msg = $('login-msg');
      msg.className = 'form-banner info';
      msg.textContent = 'Si cette adresse correspond à un compte, un e-mail de réinitialisation vous sera envoyé.';
    });
  }

  /* ---------- Contact ---------- */
  function setupContact() {
    const form = $('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let ok = true;
      ok = setErr($('c-name'), $('c-name').value.trim().length >= 2 ? '' : 'Votre nom est obligatoire.') && ok;
      ok = setErr($('c-email'), EMAIL.test($('c-email').value.trim()) ? '' : 'Adresse e-mail invalide.') && ok;
      ok = setErr($('c-subject'), $('c-subject').value ? '' : 'Choisissez un sujet.') && ok;
      ok = setErr($('c-message'), $('c-message').value.trim().length >= 10 ? '' : 'Votre message doit faire au moins 10 caractères.') && ok;
      const msg = $('contact-msg');
      if (!ok) { msg.className = 'form-banner err'; msg.textContent = 'Merci de corriger les champs signalés.'; const bad = form.querySelector('[aria-invalid=true]'); if (bad) bad.focus(); return; }
      form.reset();
      msg.className = 'form-banner ok';
      msg.innerHTML = CM.icon('check', 18) + ' Message envoyé. Notre équipe vous répondra dans les meilleurs délais.';
    });
  }

  CM.ready(function () { setupSignup(); setupLogin(); setupContact(); });
})(window);
