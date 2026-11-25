/* ==========================================================================
   Chromatch — Scripts des pages de contenu
   promo.html, gammes.html, fidelite.html, technologie.html (simulateur), lookbook.html
   ========================================================================== */
(function (global) {
  'use strict';
  const CM = global.CM, D = global.CMData, C = global.CMCart;

  /* ---------- Page Promo : mois calculé avec la date du jour ---------- */
  function setupPromo() {
    const head = document.getElementById('promo-head');
    if (!head) return;
    const m = C.monthInfo();
    head.className = 'page-head banner theme-' + m.theme;
    document.getElementById('promo-title').textContent = m.headline;
    document.getElementById('promo-sub').textContent = m.subline;
    const chip = document.getElementById('promo-chip');
    chip.textContent = m.code;
    chip.setAttribute('data-copy', m.code);
    document.getElementById('promo-apply').addEventListener('click', function () {
      const r = C.applyPromo(m.code);
      const msg = document.getElementById('promo-msg');
      msg.textContent = r.message + ' — retrouvez-le dans votre panier.';
      CM.toast(r.message);
    });
    const grid = document.getElementById('promo-grid');
    if (grid) CM.renderProducts(grid, D.PRODUCTS.filter(function (p) { return p.featured; }).slice(0, 8));
    if (m.theme === 'fiertes') head.style.background = 'linear-gradient(90deg, rgba(255,48,48,.18), rgba(255,233,31,.2), rgba(79,212,67,.18), rgba(56,181,235,.2), rgba(94,23,235,.18))';
    if (m.theme === 'octobre-rose') head.style.background = 'rgba(235,123,191,.22)';
  }

  /* ---------- Page Gammes : quelques produits par gamme ---------- */
  function setupLines() {
    document.querySelectorAll('[data-line-products]').forEach(function (box) {
      const line = box.getAttribute('data-line-products');
      const list = D.PRODUCTS.filter(function (p) { return p.line === line; });
      // on varie les catégories pour montrer l'étendue de la gamme
      const seen = {}, pick = [];
      list.forEach(function (p) { if (!seen[p.category]) { seen[p.category] = 1; pick.push(p); } });
      CM.renderProducts(box, pick.slice(0, 4));
    });
    const s = D.costumeSaving();
    const b = document.getElementById('costume-saving-gammes');
    if (b) b.innerHTML =
      '<div class="saving-row"><span>Chemise + pantalon + veste</span><strong>' + D.formatPrice(s.separate) + '</strong></div>' +
      '<div class="saving-row"><span>Costume Corporate</span><strong>' + D.formatPrice(s.costume) + '</strong></div>' +
      '<div class="saving-row total"><span>Vous économisez</span><strong>' + D.formatPrice(s.saving) + '</strong></div>';
  }

  /* ---------- Fidélité : simulateur de points ---------- */
  function setupLoyalty() {
    const input = document.getElementById('loy-amount');
    if (!input) return;
    const update = function () {
      const amount = Math.max(0, Math.min(5000, parseFloat(input.value) || 0));
      const points = Math.floor(amount);                       // 1 € = 1 point
      const voucher = Math.floor(points / 100) * 5;             // 100 points = 5 €
      const tier = points >= 1500 ? 'Prisme' : points >= 500 ? 'Nuance' : 'Teinte';
      document.getElementById('loy-points').textContent = points.toLocaleString('fr-FR');
      document.getElementById('loy-voucher').textContent = D.formatPrice(voucher);
      document.getElementById('loy-tier').textContent = tier;
    };
    input.addEventListener('input', update);
    update();
  }

  /* ---------- Technologie : simulateur de chaleur ---------- */
  function setupHeat() {
    const range = document.getElementById('heat-range');
    if (!range) return;
    const keys = Object.keys(D.COLORS);
    const tee = document.getElementById('heat-tee');
    const out = document.getElementById('heat-out');
    const update = function () {
      const t = parseInt(range.value, 10);
      const idx = Math.min(keys.length - 1, Math.floor((t - 15) / (31 / keys.length)));
      const c = D.COLORS[keys[idx]];
      tee.style.setProperty('--hero-color', c.hex);
      out.textContent = t + ' °C – ' + c.label;
    };
    range.addEventListener('input', update);
    update();
  }

  /* ---------- Lookbook : couleurs aléatoires des personnages ---------- */
  function setupLookbook() {
    const btn = document.getElementById('shuffle-colors');
    if (!btn) return;
    const hexes = Object.keys(D.COLORS).map(function (k) { return D.COLORS[k].hex; });
    btn.addEventListener('click', function () {
      document.querySelectorAll('#crossing .walker').forEach(function (w) {
        const a = hexes[Math.floor(Math.random() * hexes.length)];
        let b = hexes[Math.floor(Math.random() * hexes.length)];
        if (b === a) b = hexes[(hexes.indexOf(a) + 3) % hexes.length];
        w.querySelectorAll('.w-top').forEach(function (n) { n.setAttribute('fill', a); });
        w.querySelectorAll('.w-bottom').forEach(function (n) { n.setAttribute('fill', b); });
      });
    });
  }

  CM.ready(function () { setupPromo(); setupLines(); setupLoyalty(); setupHeat(); setupLookbook(); });
})(window);
