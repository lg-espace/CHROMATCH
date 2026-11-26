/* ==========================================================================
   Chromatch — Tunnel de commande (pages/commande.html)
   Étapes : 1) Adresse de livraison  2) Mode de livraison  3) Paiement
   ⚠ Rien n'est stocké ni envoyé : les champs vivent uniquement en mémoire.
     Les données de carte ne sont JAMAIS écrites (ni localStorage, ni sessionStorage).
   ========================================================================== */
(function (global) {
  'use strict';
  const CM = global.CM, D = global.CMData, C = global.CMCart;

  /* ---------- Validations ---------- */

  /** Algorithme de Luhn : vérifie la cohérence d'un numéro de carte. */
  function luhn(num) {
    const digits = String(num).replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;
    let sum = 0, alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits.charAt(i), 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }
  function cardType(num) {
    const d = String(num).replace(/\D/g, '');
    if (/^4/.test(d)) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(d)) return 'Mastercard';
    if (/^3[47]/.test(d)) return 'American Express';
    return '';
  }
  /** Vérifie une date d'expiration au format MM/AA (non expirée). */
  function validExpiry(v) {
    const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(v.trim());
    if (!m) return false;
    const month = parseInt(m[1], 10), year = 2000 + parseInt(m[2], 10);
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    return endOfMonth >= now && year <= now.getFullYear() + 20;
  }
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  const ZIP = /^\d{5}$/;

  function setErr(input, msg) {
    const wrap = input.closest('.field');
    let out = wrap.querySelector('.err-msg');
    if (!out) { out = document.createElement('p'); out.className = 'err-msg'; out.id = input.id + '-err'; wrap.appendChild(out); }
    out.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) input.setAttribute('aria-describedby', out.id); else input.removeAttribute('aria-describedby');
    return !msg;
  }

  /* ---------- État (en mémoire uniquement) ---------- */
  const S = { step: 1, delivery: 'standard', payMode: 'card', done: false };

  function renderSummary() {
    const t = C.totals(S.delivery);
    const f = D.formatPrice;
    const box = document.getElementById('co-summary');
    box.innerHTML = '<h2>Votre commande</h2><ul class="mc-list">' + t.lines.map(function (l) {
      return '<li class="mc-item"><img src="' + CM.url(l.product.image) + '" alt="" width="56" height="56" data-pid="' + l.id + '" data-color="' + l.color + '" style="filter:' + D.colorFilter(l.product.baseColor, l.color) + '" onerror="CM.imgFallback(this)">' +
        '<div><strong>' + CM.esc(l.product.name) + '</strong><small>' + CM.esc(D.COLORS[l.color].label) + ' · ' + CM.esc(l.size) + ' · Qté ' + l.qty + '</small></div><span class="mc-price">' + f(l.lineTotal) + '</span></li>';
    }).join('') + '</ul>' +
      '<dl class="totals">' +
        '<div><dt>Sous-total</dt><dd>' + f(t.subtotal) + '</dd></div>' +
        (t.discount > 0 ? '<div class="disc"><dt>Remise (' + CM.esc(t.promo.code) + ')</dt><dd>−' + f(t.discount) + '</dd></div>' : '') +
        '<div><dt>Livraison</dt><dd>' + (t.shipping === 0 ? '<span class="free">Offerte</span>' : f(t.shipping)) + '</dd></div>' +
        '<div class="grand"><dt>Total TTC</dt><dd>' + f(t.total) + '</dd></div>' +
        '<div class="vat"><dt>dont TVA (20 %)</dt><dd>' + f(t.vat) + '</dd></div>' +
      '</dl>';
    const payTotal = document.getElementById('pay-total');
    if (payTotal) payTotal.textContent = f(t.total);
    // Libellés des modes de livraison (prix mis à jour selon le panier)
    ['standard', 'express', 'pickup'].forEach(function (id) {
      const el = document.getElementById('dm-price-' + id);
      if (!el) return;
      const tt = C.totals(id);
      el.textContent = tt.shipping === 0 ? 'Gratuit' : f(tt.shipping);
    });
  }

  function showStep(n) {
    S.step = n;
    [1, 2, 3].forEach(function (i) {
      document.getElementById('step-' + i).hidden = i !== n;
      const li = document.getElementById('stepper-' + i);
      li.classList.toggle('current', i === n);
      li.classList.toggle('done', i < n);
      if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    const h = document.querySelector('#step-' + n + ' h2');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- Étape 1 : adresse ---------- */
  function validateAddress() {
    const g = function (id) { return document.getElementById(id); };
    let ok = true;
    const need = function (id, label) { const v = g(id).value.trim(); return setErr(g(id), v ? '' : label + ' obligatoire.'); };
    ok = need('a-first', 'Le prénom') && ok;
    ok = need('a-last', 'Le nom') && ok;
    ok = setErr(g('a-email'), EMAIL.test(g('a-email').value.trim()) ? '' : 'Adresse e-mail invalide.') && ok;
    ok = need('a-street', 'L’adresse') && ok;
    ok = setErr(g('a-zip'), ZIP.test(g('a-zip').value.trim()) ? '' : 'Code postal à 5 chiffres.') && ok;
    ok = need('a-city', 'La ville') && ok;
    ok = setErr(g('a-phone'), PHONE.test(g('a-phone').value.trim()) ? '' : 'Numéro de téléphone français invalide (ex. 06 12 34 56 78).') && ok;
    return ok;
  }

  /* ---------- Étape 3 : paiement ---------- */
  function validateCard() {
    const g = function (id) { return document.getElementById(id); };
    let ok = true;
    const num = g('c-number').value;
    const type = cardType(num);
    ok = setErr(g('c-number'), luhn(num) ? '' : 'Numéro de carte invalide (contrôle de Luhn).') && ok;
    ok = setErr(g('c-name'), g('c-name').value.trim().length >= 3 ? '' : 'Nom du titulaire obligatoire.') && ok;
    ok = setErr(g('c-exp'), validExpiry(g('c-exp').value) ? '' : 'Date invalide ou expirée (format MM/AA).') && ok;
    const cvcLen = type === 'American Express' ? 4 : 3;
    ok = setErr(g('c-cvc'), new RegExp('^\\d{' + cvcLen + '}$').test(g('c-cvc').value.trim()) ? '' : 'Code de sécurité à ' + cvcLen + ' chiffres.') && ok;
    return ok;
  }

  /** Termine la commande : numéro de commande, panier vidé, redirection. Aucune donnée perso/bancaire n'est conservée. */
  function completeOrder() {
    const t = C.totals(S.delivery);
    const number = 'CHR-' + new Date().getFullYear() + '-' + String(Math.floor(100000 + Math.random() * 900000));
    // On ne garde que l'indispensable à l'affichage de la confirmation (aucune donnée personnelle ni bancaire).
    const summary = {
      number: number,
      total: t.total,
      shipping: t.shipping,
      delivery: t.shippingMode.label,
      lines: t.lines.map(function (l) { return { name: l.product.name, color: D.COLORS[l.color].label, size: l.size, qty: l.qty, total: l.lineTotal }; })
    };
    try { sessionStorage.setItem('chromatch_last_order', JSON.stringify(summary)); } catch (e) {}
    // Efface les champs sensibles du DOM avant de quitter
    ['c-number', 'c-name', 'c-exp', 'c-cvc'].forEach(function (id) { const el = document.getElementById(id); if (el) el.value = ''; });
    C.clearPromo();
    C.clear();
    window.location.href = CM.url('pages/confirmation.html');
  }

  CM.ready(function () {
    const root = document.getElementById('checkout-root');
    if (!root) return;

    if (!C.lines().length) {
      root.innerHTML = '<div class="empty-state"><h2>Votre panier est vide</h2><p>Ajoutez des articles avant de passer commande.</p><a class="btn" href="' + CM.url('pages/boutique.html') + '">Voir la boutique</a></div>';
      return;
    }
    document.getElementById('checkout-app').hidden = false;
    renderSummary();
    document.addEventListener('cm:cart', renderSummary);
    showStep(1);

    // Étape 1 → 2
    document.getElementById('address-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (validateAddress()) showStep(2);
      else { const bad = document.querySelector('#address-form [aria-invalid=true]'); if (bad) bad.focus(); }
    });

    // Étape 2 → 3
    document.querySelectorAll('input[name=delivery]').forEach(function (r) {
      r.addEventListener('change', function () { S.delivery = r.value; renderSummary(); });
    });
    document.getElementById('delivery-form').addEventListener('submit', function (e) { e.preventDefault(); showStep(3); });
    document.querySelectorAll('[data-back]').forEach(function (b) {
      b.addEventListener('click', function () { showStep(parseInt(b.dataset.back, 10)); });
    });

    // Étape 3 : choix du mode de paiement
    const setPay = function (mode) {
      S.payMode = mode;
      document.getElementById('pay-card').hidden = mode !== 'card';
      document.getElementById('pay-apple').hidden = mode !== 'apple';
    };
    document.querySelectorAll('input[name=pay]').forEach(function (r) {
      r.addEventListener('change', function () { setPay(r.value); });
    });
    setPay('card');

    // Mise en forme automatique des champs carte
    const num = document.getElementById('c-number');
    num.addEventListener('input', function () {
      const d = num.value.replace(/\D/g, '').slice(0, 19);
      const amex = /^3[47]/.test(d);
      num.value = amex ? d.replace(/^(\d{4})(\d{0,6})(\d{0,5}).*/, function (m, a, b, c) { return [a, b, c].filter(Boolean).join(' '); }) : d.replace(/(\d{4})(?=\d)/g, '$1 ');
      document.getElementById('c-type').textContent = cardType(d);
    });
    const exp = document.getElementById('c-exp');
    exp.addEventListener('input', function () {
      let d = exp.value.replace(/\D/g, '').slice(0, 4);
      if (d.length >= 3) d = d.slice(0, 2) + '/' + d.slice(2);
      exp.value = d;
    });
    document.getElementById('c-cvc').addEventListener('input', function (e) { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });
    document.getElementById('fill-test').addEventListener('click', function () {
      num.value = '4242 4242 4242 4242';
      document.getElementById('c-type').textContent = 'Visa';
      document.getElementById('c-name').value = 'CLIENT CHROMATCH';
      exp.value = '12/' + String((new Date().getFullYear() + 3) % 100).padStart(2, '0');
      document.getElementById('c-cvc').value = '123';
    });

    document.getElementById('card-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateCard()) { const bad = document.querySelector('#card-form [aria-invalid=true]'); if (bad) bad.focus(); return; }
      const btn = document.getElementById('pay-btn');
      btn.disabled = true; btn.textContent = 'Paiement en cours…';
      setTimeout(completeOrder, 900);
    });

    // Apple Pay
    const sheet = document.getElementById('apple-sheet');
    document.getElementById('apple-btn').addEventListener('click', function () { CM.openModal(sheet); });
    document.getElementById('apple-cancel').addEventListener('click', function () { CM.closeModal(sheet); });
    document.getElementById('apple-confirm').addEventListener('click', function () {
      this.disabled = true; this.textContent = 'Validation…';
      setTimeout(function () { CM.closeModal(sheet); completeOrder(); }, 900);
    });

    // Avertissement avant de quitter si saisie en cours (confort)
    window.addEventListener('pagehide', function () {
      ['c-number', 'c-name', 'c-exp', 'c-cvc'].forEach(function (id) { const el = document.getElementById(id); if (el) el.value = ''; });
    });
  });

  // Exposé pour les tests manuels dans la console : CMCheckout.luhn('4242424242424242')
  global.CMCheckout = { luhn: luhn, cardType: cardType, validExpiry: validExpiry };
})(window);
