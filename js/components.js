/* ==========================================================================
   Chromatch — Composants communs injectés sur toutes les pages
   --------------------------------------------------------------------------
   Header, footer, bandeau promo, mini-panier, pop-up cookies (factice),
   pop-up promotion du mois, notifications (toasts).
   Chaque page déclare <body data-root="../"> (ou "" pour index.html) afin que
   tous les liens restent RELATIFS (compatible GitHub Pages).
   ========================================================================== */
(function (global) {
  'use strict';

  const CM = global.CM = global.CM || {};
  CM.root = document.body.getAttribute('data-root') || '';
  CM.url = function (path) { return CM.root + path; };

  /** Échappe le HTML (sécurité pour tout texte injecté dans innerHTML). */
  CM.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ---------- Icônes SVG (inline, sans dépendance externe) ---------- */
  const ICONS = {
    cart:   '<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.5L20.5 8H6.2"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>',
    user:   '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    menu:   '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close:  '<path d="M6 6l12 12M18 6 6 18"/>',
    pin:    '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    check:  '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    truck:  '<path d="M2 6h11v10H2zM13 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
    leaf:   '<path d="M20 4C9 4 4 9 4 15c0 2 1 4 3 5 1-6 5-9 11-10-5 2-8 5-9 10 7 1 11-5 11-16z"/>',
    spark:  '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
    star:   '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    lock:   '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    arrow:  '<path d="M5 12h14M13 6l6 6-6 6"/>',
    heart:  '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    gift:   '<rect x="3" y="8" width="18" height="4"/><path d="M5 12v8h14v-8M12 8v12M12 8c-3 0-4-4-1-4 2 0 1 4 1 4zm0 0c3 0 4-4 1-4-2 0-1 4-1 4z"/>',
    refresh:'<path d="M20 11a8 8 0 0 0-14-4L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4l2-2M20 20v-5h-5"/>',
    thermo: '<path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/>'
  };
  CM.icon = function (name, size) {
    size = size || 22;
    return '<svg class="icon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
  };

  /* ---------- Gestion générique des fenêtres modales (focus, Échap) ---------- */
  let lastFocus = null;
  CM.openModal = function (el, opts) {
    opts = opts || {};
    lastFocus = document.activeElement;
    el.hidden = false;
    document.body.classList.add('modal-open');
    const focusables = function () {
      return Array.prototype.slice.call(el.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter(function (n) { return n.offsetParent !== null; });
    };
    const first = el.querySelector('[data-autofocus]') || focusables()[0];
    if (first) setTimeout(function () { first.focus(); }, 30);
    el._trap = function (e) {
      if (e.key === 'Escape' && !opts.locked) { CM.closeModal(el); return; }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      const a = f[0], b = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener('keydown', el._trap);
  };
  CM.closeModal = function (el) {
    el.hidden = true;
    document.body.classList.remove('modal-open');
    if (el._trap) document.removeEventListener('keydown', el._trap);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  };

  /* ---------- Notifications ---------- */
  CM.toast = function (msg) {
    let box = document.getElementById('toasts');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toasts';
      box.className = 'toasts';
      box.setAttribute('aria-live', 'polite');
      document.body.appendChild(box);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(function () { t.classList.add('out'); }, 2600);
    setTimeout(function () { t.remove(); }, 3100);
  };

  /* ==========================================================================
     HEADER
     ========================================================================== */
  const NAV = [
    { id: 'boutique',   href: 'pages/boutique.html',   label: 'Boutique' },
    { id: 'gammes',     href: 'pages/gammes.html',     label: 'Gammes' },
    { id: 'technologie',href: 'pages/technologie.html',label: 'Technologie' },
    { id: 'ecologie',   href: 'pages/ecologie.html',   label: 'Écologie' },
    { id: 'fidelite',   href: 'pages/fidelite.html',   label: 'Fidélité' },
    { id: 'boutiques',  href: 'pages/boutiques.html',  label: 'Nos boutiques' },
    { id: 'lookbook',   href: 'pages/lookbook.html',   label: 'Lookbook' }
  ];

  function headerHTML() {
    const page = document.body.getAttribute('data-page') || '';
    const m = global.CMCart.monthInfo();
    const links = NAV.map(function (n) {
      const current = n.id === page ? ' aria-current="page"' : '';
      let extra = '';
      if (n.id === 'boutique') {
        extra = '<ul class="subnav" aria-label="Rayons">' +
          '<li><a href="' + CM.url('pages/boutique.html?rayon=homme') + '">Homme</a></li>' +
          '<li><a href="' + CM.url('pages/boutique.html?rayon=femme') + '">Femme</a></li>' +
          '<li><a href="' + CM.url('pages/boutique.html?rayon=unisexe') + '">Unisexe</a></li>' +
          '<li><a href="' + CM.url('pages/boutique.html?rayon=enfant') + '">Enfant</a></li>' +
          '<li><a href="' + CM.url('pages/boutique.html?gamme=olympus') + '">Sport</a></li>' +
          '<li><a href="' + CM.url('pages/boutique.html?categorie=chaussures') + '">Chaussures</a></li>' +
          '</ul>';
      }
      return '<li class="nav-item"><a href="' + CM.url(n.href) + '"' + current + '>' + n.label + '</a>' + extra + '</li>';
    }).join('');

    return '' +
      '<div class="promo-bar theme-' + m.theme + '" role="region" aria-label="Promotion du mois">' +
        '<p><strong>' + CM.esc(m.headline) + '</strong> — code <button type="button" class="code-chip" data-copy="' + m.code + '" title="Copier le code">' + m.code + '</button> · <a href="' + CM.url('pages/promo.html') + '">En profiter</a></p>' +
      '</div>' +
      '<header class="site-header">' +
        '<div class="container header-inner">' +
          '<button type="button" class="icon-btn nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Ouvrir le menu">' + CM.icon('menu') + '</button>' +
          '<a class="brand" href="' + CM.url('index.html') + '" aria-label="Chromatch – accueil">' +
            '<img src="' + CM.url('images/logo2-trim.png') + '" alt="Chromatch – Color your style !" width="95" height="80">' +
          '</a>' +
          '<nav id="main-nav" class="main-nav" aria-label="Navigation principale"><ul>' + links + '</ul></nav>' +
          '<form class="header-search" role="search" action="' + CM.url('pages/boutique.html') + '" method="get">' +
            '<label class="sr-only" for="hs-q">Rechercher un produit</label>' +
            '<input id="hs-q" type="search" name="q" placeholder="Rechercher…" autocomplete="off">' +
            '<button type="submit" class="icon-btn" aria-label="Lancer la recherche">' + CM.icon('search', 20) + '</button>' +
          '</form>' +
          '<div class="header-actions">' +
            '<a class="icon-btn" href="' + CM.url('pages/connexion.html') + '" aria-label="Mon compte">' + CM.icon('user') + '</a>' +
            '<div class="cart-wrap">' +
              '<button type="button" class="icon-btn cart-btn" id="cart-btn" aria-expanded="false" aria-controls="minicart" aria-label="Panier : 0 article">' +
                CM.icon('cart') + '<span class="cart-count" id="cart-count" aria-hidden="true">0</span>' +
              '</button>' +
              '<div class="minicart" id="minicart" role="dialog" aria-label="Aperçu du panier" hidden></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</header>';
  }

  /* ---------- Mini-panier déroulant ---------- */
  function renderMiniCart() {
    const box = document.getElementById('minicart');
    if (!box) return;
    const t = global.CMCart.totals();
    const fmt = global.CMData.formatPrice;
    let html = '';
    if (!t.lines.length) {
      html = '<p class="mc-empty">Votre panier est vide.</p><a class="btn btn-block" href="' + CM.url('pages/boutique.html') + '">Découvrir la boutique</a>';
    } else {
      html += '<ul class="mc-list">' + t.lines.map(function (l) {
        const col = global.CMData.COLORS[l.color];
        return '<li class="mc-item">' +
          '<img src="' + CM.url(l.product.image) + '" alt="" width="56" height="56" data-pid="' + l.id + '" data-color="' + l.color + '" style="filter:' + global.CMData.colorFilter(l.product.baseColor, l.color) + '" onerror="CM.imgFallback(this)">' +
          '<div><a href="' + CM.url('pages/produit.html?id=' + l.id) + '">' + CM.esc(l.product.name) + '</a>' +
          '<small>' + CM.esc(col ? col.label : l.color) + ' · ' + CM.esc(l.size) + ' · Qté ' + l.qty + '</small></div>' +
          '<span class="mc-price">' + fmt(l.lineTotal) + '</span></li>';
      }).join('') + '</ul>';
      html += '<div class="mc-total"><span>Sous-total</span><strong>' + fmt(t.subtotal) + '</strong></div>';
      html += '<p class="mc-ship">' + (t.freeShippingReached ? CM.icon('truck', 16) + ' Livraison offerte !' : 'Plus que <strong>' + fmt(t.missingForFree) + '</strong> pour la livraison offerte') + '</p>';
      html += '<div class="mc-actions"><a class="btn btn-outline" href="' + CM.url('pages/panier.html') + '">Voir le panier</a><a class="btn" href="' + CM.url('pages/commande.html') + '">Commander</a></div>';
    }
    box.innerHTML = html;
  }
  CM.renderMiniCart = renderMiniCart;

  function updateCartBadge() {
    const n = global.CMCart.count();
    const c = document.getElementById('cart-count');
    const b = document.getElementById('cart-btn');
    if (c) { c.textContent = n; c.classList.toggle('has-items', n > 0); }
    if (b) b.setAttribute('aria-label', 'Panier : ' + n + ' article' + (n > 1 ? 's' : ''));
    renderMiniCart();
  }

  function toggleMiniCart(force) {
    const box = document.getElementById('minicart');
    const btn = document.getElementById('cart-btn');
    if (!box) return;
    const open = force != null ? force : box.hidden;
    if (open) renderMiniCart();
    box.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  }
  CM.openMiniCart = function () { toggleMiniCart(true); };

  /* ==========================================================================
     FOOTER
     ========================================================================== */
  function footerHTML() {
    const y = new Date().getFullYear();
    return '' +
      '<footer class="site-footer">' +
        '<div class="rainbow-line" aria-hidden="true"></div>' +
        '<div class="container footer-grid">' +
          '<div class="footer-brand">' +
            '<img src="' + CM.url('images/logo1-trim.png') + '" alt="Chromatch" width="150" height="150" loading="lazy">' +
            '<p>Color your style !<br>Des vêtements qui changent de couleur.</p>' +
          '</div>' +
          '<nav aria-label="Boutique"><h2>Boutique</h2><ul>' +
            '<li><a href="' + CM.url('pages/boutique.html') + '">Tous les produits</a></li>' +
            '<li><a href="' + CM.url('pages/gammes.html') + '">Nos gammes</a></li>' +
            '<li><a href="' + CM.url('pages/promo.html') + '">Promotions</a></li>' +
            '<li><a href="' + CM.url('pages/boutiques.html') + '">Nos boutiques</a></li>' +
            '<li><a href="' + CM.url('pages/lookbook.html') + '">Lookbook</a></li>' +
          '</ul></nav>' +
          '<nav aria-label="Chromatch"><h2>Chromatch</h2><ul>' +
            '<li><a href="' + CM.url('pages/technologie.html') + '">Notre technologie</a></li>' +
            '<li><a href="' + CM.url('pages/ecologie.html') + '">Engagements écologiques</a></li>' +
            '<li><a href="' + CM.url('pages/fidelite.html') + '">Programme de fidélité</a></li>' +
            '<li><a href="' + CM.url('pages/a-propos.html') + '">À propos</a></li>' +
          '</ul></nav>' +
          '<nav aria-label="Aide"><h2>Aide</h2><ul>' +
            '<li><a href="' + CM.url('pages/contact.html') + '">Contact</a></li>' +
            '<li><a href="' + CM.url('pages/faq.html') + '">FAQ</a></li>' +
            '<li><a href="' + CM.url('pages/connexion.html') + '">Se connecter</a></li>' +
            '<li><a href="' + CM.url('pages/compte.html') + '">Créer un compte</a></li>' +
            '<li><a href="' + CM.url('pages/panier.html') + '">Mon panier</a></li>' +
          '</ul></nav>' +
          '<div class="footer-news"><h2>Newsletter</h2>' +
            '<form id="newsletter-form" novalidate>' +
              '<label class="sr-only" for="nl-email">Votre e-mail</label>' +
              '<input id="nl-email" type="email" placeholder="Votre e-mail" autocomplete="email">' +
              '<button class="btn" type="submit">OK</button>' +
            '</form>' +
            '<p class="form-msg" id="nl-msg" role="status"></p>' +
            '<small>Démonstration : l’adresse n’est ni envoyée ni enregistrée.</small>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom"><div class="container">' +
          '<p class="demo-note">Site de démonstration — projet marketing scolaire fictif. Les produits, prix, boutiques et avis sont inventés. Aucune donnée n’est enregistrée.</p>' +
          '<ul class="legal-links">' +
            '<li><a href="' + CM.url('pages/mentions-legales.html') + '">Mentions légales</a></li>' +
            '<li><a href="' + CM.url('pages/cgv.html') + '">CGV</a></li>' +
            '<li><a href="' + CM.url('pages/confidentialite.html') + '">Confidentialité</a></li>' +
            '<li><button type="button" class="link-btn" id="open-cookies">Gérer les cookies</button></li>' +
          '</ul>' +
          '<p>© ' + y + ' Chromatch (marque fictive)</p>' +
        '</div></div>' +
      '</footer>';
  }

  /* ==========================================================================
     COOKIES (FACTICE) + POP-UP PROMO
     ========================================================================== */
  const KEY_COOKIES = 'chromatch_cookies_v1';

  function cookieModalHTML() {
    return '' +
      '<div class="modal-backdrop" id="cookie-modal" hidden>' +
        '<div class="modal cookie-modal" role="dialog" aria-modal="true" aria-labelledby="ck-title" aria-describedby="ck-desc">' +
          '<img class="modal-logo" src="' + CM.url('images/logo2-trim.png') + '" alt="Chromatch" width="90" height="76">' +
          '<h2 id="ck-title">Un petit mot sur les cookies</h2>' +
          '<p id="ck-desc">Ceci est un <strong>faux bandeau de cookies</strong> (site de démonstration) : votre choix est seulement mémorisé dans votre navigateur et ne déclenche rien d’autre.</p>' +
          '<div class="ck-custom" id="ck-custom" hidden>' +
            '<label class="switch"><input type="checkbox" checked disabled> <span>Cookies nécessaires <small>(toujours actifs)</small></span></label>' +
            '<label class="switch"><input type="checkbox" id="ck-analytics"> <span>Mesure d’audience <small>(fictif)</small></span></label>' +
            '<label class="switch"><input type="checkbox" id="ck-marketing"> <span>Publicité personnalisée <small>(fictif)</small></span></label>' +
            '<label class="switch"><input type="checkbox" id="ck-perso"> <span>Personnalisation du site <small>(fictif)</small></span></label>' +
            '<button type="button" class="btn" id="ck-save">Enregistrer mes choix</button>' +
          '</div>' +
          '<div class="modal-actions" id="ck-actions">' +
            '<button type="button" class="btn" id="ck-accept" data-autofocus>Accepter</button>' +
            '<button type="button" class="btn btn-outline" id="ck-refuse">Refuser</button>' +
            '<button type="button" class="btn btn-ghost" id="ck-custom-btn" aria-expanded="false" aria-controls="ck-custom">Personnaliser</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function promoModalHTML() {
    const m = global.CMCart.monthInfo();
    return '' +
      '<div class="modal-backdrop" id="promo-modal" hidden>' +
        '<div class="modal promo-modal theme-' + m.theme + '" role="dialog" aria-modal="true" aria-labelledby="pm-title">' +
          '<button type="button" class="icon-btn modal-close" id="pm-close" aria-label="Fermer">' + CM.icon('close') + '</button>' +
          '<img class="modal-logo" src="' + CM.url('images/logo1-trim.png') + '" alt="Chromatch" width="110" height="110">' +
          '<p class="eyebrow">Offre du mois</p>' +
          '<h2 id="pm-title">' + CM.esc(m.headline) + '</h2>' +
          '<p class="promo-big">−' + m.percent + ' %</p>' +
          '<p>' + CM.esc(m.subline) + '</p>' +
          '<p class="promo-code-line">Code promo : <button type="button" class="code-chip big" data-copy="' + m.code + '">' + m.code + '</button></p>' +
          '<div class="modal-actions">' +
            '<button type="button" class="btn" id="pm-apply" data-autofocus>J’en profite</button>' +
            '<button type="button" class="btn btn-ghost" id="pm-later">Plus tard</button>' +
          '</div>' +
          '<small>Code fictif, applicable dans le panier. Offre de démonstration.</small>' +
        '</div>' +
      '</div>';
  }

  function saveCookieChoice(choice) {
    try { localStorage.setItem(KEY_COOKIES, JSON.stringify(Object.assign({ date: new Date().toISOString() }, choice))); } catch (e) {}
  }
  function hasCookieChoice() {
    try { return !!localStorage.getItem(KEY_COOKIES); } catch (e) { return true; }
  }

  function showPromoPopup() {
    const pm = document.getElementById('promo-modal');
    if (pm) CM.openModal(pm);
  }

  function openCookieModal(fromFooter) {
    const ck = document.getElementById('cookie-modal');
    if (!ck) return;
    ck.dataset.fromFooter = fromFooter ? '1' : '';
    CM.openModal(ck, { locked: !fromFooter });
  }

  function setupCookies() {
    const ck = document.getElementById('cookie-modal');
    const finish = function (choice) {
      saveCookieChoice(choice);
      const fromFooter = ck.dataset.fromFooter === '1';
      CM.closeModal(ck);
      if (!fromFooter) setTimeout(showPromoPopup, 250);   // promo juste APRÈS le choix des cookies
    };
    document.getElementById('ck-accept').addEventListener('click', function () { finish({ necessary: true, analytics: true, marketing: true, personalization: true }); });
    document.getElementById('ck-refuse').addEventListener('click', function () { finish({ necessary: true, analytics: false, marketing: false, personalization: false }); });
    document.getElementById('ck-custom-btn').addEventListener('click', function () {
      const panel = document.getElementById('ck-custom');
      const open = panel.hidden;
      panel.hidden = !open;
      this.setAttribute('aria-expanded', String(open));
    });
    document.getElementById('ck-save').addEventListener('click', function () {
      finish({ necessary: true, analytics: document.getElementById('ck-analytics').checked, marketing: document.getElementById('ck-marketing').checked, personalization: document.getElementById('ck-perso').checked });
    });
    const footerBtn = document.getElementById('open-cookies');
    if (footerBtn) footerBtn.addEventListener('click', function () { openCookieModal(true); });

    // Pop-up promo
    const pm = document.getElementById('promo-modal');
    document.getElementById('pm-close').addEventListener('click', function () { CM.closeModal(pm); });
    document.getElementById('pm-later').addEventListener('click', function () { CM.closeModal(pm); });
    pm.addEventListener('click', function (e) { if (e.target === pm) CM.closeModal(pm); });
    document.getElementById('pm-apply').addEventListener('click', function () {
      const r = global.CMCart.applyPromo(global.CMCart.monthInfo().code);
      CM.closeModal(pm);
      CM.toast(r.message);
      if (document.body.getAttribute('data-page') !== 'boutique') window.location.href = CM.url('pages/boutique.html');
    });

    if (!hasCookieChoice()) openCookieModal(false);
  }

  /* ==========================================================================
     MONTAGE
     ========================================================================== */
  CM.mountComponents = function () {
    const h = document.getElementById('site-header');
    const f = document.getElementById('site-footer');
    if (h) h.outerHTML = headerHTML();
    if (f) f.outerHTML = footerHTML();
    const holder = document.createElement('div');
    holder.innerHTML = cookieModalHTML() + promoModalHTML();
    while (holder.firstChild) document.body.appendChild(holder.firstChild);

    // Menu mobile
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('main-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        const open = !nav.classList.contains('open');
        nav.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      });
    }

    // Mini-panier
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
      cartBtn.addEventListener('click', function (e) { e.stopPropagation(); toggleMiniCart(); });
      document.addEventListener('click', function (e) {
        const box = document.getElementById('minicart');
        if (box && !box.hidden && !box.contains(e.target)) toggleMiniCart(false);
      });
      document.addEventListener('keydown', function (e) {
        const box = document.getElementById('minicart');
        if (e.key === 'Escape' && box && !box.hidden) { toggleMiniCart(false); cartBtn.focus(); }
      });
    }
    document.addEventListener('cm:cart', updateCartBadge);
    window.addEventListener('storage', updateCartBadge);   // synchro entre onglets
    updateCartBadge();

    // Copier un code promo (boutons .code-chip)
    document.addEventListener('click', function (e) {
      const chip = e.target.closest('[data-copy]');
      if (!chip) return;
      const code = chip.getAttribute('data-copy');
      const done = function () { CM.toast('Code ' + code + ' copié !'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, done);
      else done();
    });

    // Newsletter factice
    const nl = document.getElementById('newsletter-form');
    if (nl) nl.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = document.getElementById('nl-email');
      const msg = document.getElementById('nl-msg');
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
      msg.textContent = ok ? 'Merci ! (Démonstration : aucune inscription enregistrée.)' : 'Veuillez saisir une adresse e-mail valide.';
      msg.className = 'form-msg ' + (ok ? 'ok' : 'err');
      if (ok) input.value = '';
    });

    setupCookies();
  };
})(window);
