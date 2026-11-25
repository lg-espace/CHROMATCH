/* ==========================================================================
   Chromatch — Script principal (utilitaires communs + page d'accueil)
   Dépend de : products.js, stores.js, cart.js, components.js (chargés avant)
   ========================================================================== */
(function (global) {
  'use strict';

  const CM = global.CM;
  const D = global.CMData;

  CM.ready = function (fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };
  CM.param = function (name) { return new URLSearchParams(window.location.search).get(name); };

  /* ---------- Images produits : fallback + changement de couleur ---------- */

  /** Appelée par onerror : remplace l'image absente par le placeholder (rouge de base) en gardant la couleur choisie. */
  CM.imgFallback = function (img) {
    if (img.dataset.fb) return;               // évite une boucle infinie
    img.dataset.fb = '1';
    img.classList.add('is-placeholder');
    img.src = CM.url('images/products/placeholder.svg');
    const c = img.getAttribute('data-color');
    if (c && D.COLORS[c]) img.style.filter = D.colorFilter('rouge', c);
  };

  /** Applique à une image la couleur choisie (filtre CSS hue-rotate depuis la couleur de base du produit). */
  CM.applyColor = function (img, product, colorKey) {
    const base = img.classList.contains('is-placeholder') ? 'rouge' : product.baseColor;
    img.style.filter = D.colorFilter(base, colorKey);
    img.setAttribute('data-color', colorKey);
  };

  /* ---------- Étoiles ---------- */
  CM.stars = function (rating) {
    const full = Math.round(rating);
    let s = '';
    for (let i = 1; i <= 5; i++) s += '<span class="' + (i <= full ? 'on' : '') + '">★</span>';
    return '<span class="stars" role="img" aria-label="Note : ' + String(rating).replace('.', ',') + ' sur 5">' + s + '</span>';
  };

  /* ---------- Carte produit (liste, accueil, produits associés) ---------- */
  CM.productCard = function (p) {
    const lineLabel = D.LINES[p.line].label + ' · ' + D.GENDERS[p.gender];
    const sw = p.colors.map(function (k) {
      const c = D.COLORS[k];
      return '<button type="button" class="swatch' + (k === p.baseColor ? ' active' : '') + '" style="--c:' + c.hex + '" data-color="' + k + '" aria-label="' + c.label + '" aria-pressed="' + (k === p.baseColor) + '" title="' + c.label + '"></button>';
    }).join('');
    const sizes = p.sizes.map(function (s) { return '<button type="button" class="qa-size" data-size="' + CM.esc(s) + '">' + CM.esc(s) + '</button>'; }).join('');
    return '' +
      '<article class="pcard" data-id="' + p.id + '" data-color="' + p.baseColor + '">' +
        '<div class="pcard-media">' +
          (p.badge ? '<span class="badge">' + CM.esc(p.badge) + '</span>' : '') +
          '<a href="' + CM.url('pages/produit.html?id=' + p.id) + '" tabindex="-1" aria-hidden="true">' +
            '<img src="' + CM.url(p.image) + '" alt="' + CM.esc(p.name + ' – ' + D.COLORS[p.baseColor].label) + '" width="400" height="400" loading="lazy" data-pid="' + p.id + '" data-color="' + p.baseColor + '" onerror="CM.imgFallback(this)">' +
          '</a>' +
          '<div class="qa-panel" hidden><p>Choisissez votre taille</p><div class="qa-sizes">' + sizes + '</div></div>' +
        '</div>' +
        '<div class="pcard-body">' +
          '<p class="pcard-line">' + CM.esc(lineLabel) + '</p>' +
          '<h3 class="pcard-title"><a href="' + CM.url('pages/produit.html?id=' + p.id) + '">' + CM.esc(p.name) + '</a></h3>' +
          '<div class="swatches" role="group" aria-label="Couleurs disponibles pour ' + CM.esc(p.name) + '">' + sw + '</div>' +
          '<p class="pcard-rating">' + CM.stars(p.rating) + ' <small>(' + p.reviewCount + ')</small></p>' +
          '<div class="pcard-foot"><span class="price">' + D.formatPrice(p.price) + '</span>' +
          '<button type="button" class="btn btn-small qa-toggle" aria-expanded="false">Ajouter</button></div>' +
        '</div>' +
      '</article>';
  };

  /** Active les interactions des cartes (couleurs + ajout rapide) dans un conteneur. */
  CM.bindCards = function (container) {
    if (!container || container._bound) return;
    container._bound = true;

    const changeColor = function (btn) {
      const card = btn.closest('.pcard');
      const p = D.getProduct(card.dataset.id);
      const key = btn.dataset.color;
      card.dataset.color = key;
      card.querySelectorAll('.swatch').forEach(function (s) { const on = s === btn; s.classList.toggle('active', on); s.setAttribute('aria-pressed', String(on)); });
      const img = card.querySelector('.pcard-media img');
      CM.applyColor(img, p, key);
      img.alt = p.name + ' – ' + D.COLORS[key].label;
    };

    container.addEventListener('click', function (e) {
      const sw = e.target.closest('.swatch');
      if (sw) { changeColor(sw); return; }

      const tg = e.target.closest('.qa-toggle');
      if (tg) {
        const card = tg.closest('.pcard');
        const panel = card.querySelector('.qa-panel');
        const open = panel.hidden;
        container.querySelectorAll('.qa-panel').forEach(function (x) { x.hidden = true; });
        container.querySelectorAll('.qa-toggle').forEach(function (x) { x.setAttribute('aria-expanded', 'false'); });
        panel.hidden = !open;
        tg.setAttribute('aria-expanded', String(open));
        if (open) { const f = panel.querySelector('.qa-size'); if (f) f.focus(); }
        return;
      }

      const sz = e.target.closest('.qa-size');
      if (sz) {
        const card = sz.closest('.pcard');
        const p = D.getProduct(card.dataset.id);
        global.CMCart.add(p.id, sz.dataset.size, card.dataset.color || p.baseColor, 1);
        card.querySelector('.qa-panel').hidden = true;
        card.querySelector('.qa-toggle').setAttribute('aria-expanded', 'false');
        CM.toast(p.name + ' (' + D.COLORS[card.dataset.color || p.baseColor].label + ', ' + sz.dataset.size + ') ajouté au panier');
        CM.openMiniCart();
      }
    });
    // Aperçu de la couleur au survol d'une pastille (souris uniquement)
    container.addEventListener('mouseover', function (e) {
      const sw = e.target.closest('.swatch');
      if (sw && !sw.classList.contains('active')) changeColor(sw);
    });
  };

  /** Rend une liste de produits dans un conteneur. */
  CM.renderProducts = function (container, products) {
    container.innerHTML = products.map(CM.productCard).join('');
    CM.bindCards(container);
  };

  /* ---------- Apparition au scroll ---------- */
  function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Accueil : héros qui change de couleur ---------- */
  function setupHero() {
    const hero = document.getElementById('hero-tee');
    if (!hero) return;
    const keys = Object.keys(D.COLORS);
    const label = document.getElementById('hero-colorname');
    const dots = document.querySelectorAll('#hero-dots button');
    let i = 0, timer = null;
    const set = function (idx) {
      i = idx;
      const c = D.COLORS[keys[i]];
      hero.style.setProperty('--hero-color', c.hex);
      if (label) label.textContent = c.label;
      dots.forEach(function (d, n) { d.classList.toggle('active', n === i); d.setAttribute('aria-pressed', String(n === i)); });
    };
    set(0);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = function () { if (!reduce) timer = setInterval(function () { set((i + 1) % keys.length); }, 2200); };
    dots.forEach(function (d, n) {
      d.addEventListener('click', function () { clearInterval(timer); set(n); });
    });
    start();
  }

  /* ---------- Accueil : produits phares + démo ---------- */
  function setupHome() {
    const feat = document.getElementById('home-featured');
    if (feat) CM.renderProducts(feat, D.PRODUCTS.filter(function (p) { return p.featured; }).slice(0, 8));

    const save = document.getElementById('costume-saving');
    if (save) {
      const s = D.costumeSaving();
      save.innerHTML =
        '<div class="saving-row"><span>Chemise + pantalon + veste séparés</span><strong>' + D.formatPrice(s.separate) + '</strong></div>' +
        '<div class="saving-row"><span>Costume Corporate Chromatch</span><strong>' + D.formatPrice(s.costume) + '</strong></div>' +
        '<div class="saving-row total"><span>Vous économisez</span><strong>' + D.formatPrice(s.saving) + '</strong></div>';
    }
  }

  /* ---------- Démarrage ---------- */
  CM.ready(function () {
    CM.mountComponents();
    setupReveal();
    setupHero();
    setupHome();
  });
})(window);
