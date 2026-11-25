/* ==========================================================================
   Chromatch — Fiche produit détaillée (pages/produit.html?id=...)
   ========================================================================== */
(function (global) {
  'use strict';
  const CM = global.CM, D = global.CMData;

  function render(p, root) {
    document.title = p.name + ' | Chromatch';
    const metaDesc = document.querySelector('meta[name=description]');
    if (metaDesc) metaDesc.setAttribute('content', p.name + ' — ' + p.description);

    const line = D.LINES[p.line], cat = D.CATEGORIES[p.category];
    const colors = p.colors.map(function (k) {
      const c = D.COLORS[k];
      return '<label class="color-opt"><input type="radio" name="color" value="' + k + '"' + (k === p.baseColor ? ' checked' : '') + '>' +
        '<span class="swatch big" style="--c:' + c.hex + '"></span><span class="sr-only">' + c.label + '</span></label>';
    }).join('');
    const sizes = p.sizes.map(function (s, i) {
      return '<label class="size-opt"><input type="radio" name="size" value="' + CM.esc(s) + '"><span>' + CM.esc(s) + '</span></label>';
    }).join('');

    let costumeBox = '';
    if (p.category === 'costume') {
      const s = D.costumeSaving();
      costumeBox = '<div class="callout"><strong>' + CM.icon('spark', 18) + ' Plus malin qu’un assemblage</strong>' +
        '<p>Chemise + pantalon + veste séparés : ' + D.formatPrice(s.separate) + '. Le costume Chromatch : ' + D.formatPrice(s.costume) + ' — <strong>vous économisez ' + D.formatPrice(s.saving) + '</strong>.</p></div>';
    }

    const reviews = p.reviews.map(function (r) {
      return '<article class="review"><div class="review-head">' + CM.stars(r.rating) + ' <strong>' + CM.esc(r.title) + '</strong></div>' +
        '<p>' + CM.esc(r.text) + '</p><small>' + CM.esc(r.author) + ' · ' + r.date + ' · avis fictif</small></article>';
    }).join('');

    root.innerHTML = '' +
      '<nav class="breadcrumb" aria-label="Fil d’Ariane"><a href="' + CM.url('index.html') + '">Accueil</a> › <a href="' + CM.url('pages/boutique.html') + '">Boutique</a> › ' +
        '<a href="' + CM.url('pages/boutique.html?categorie=' + p.category) + '">' + cat.label + '</a> › <span aria-current="page">' + CM.esc(p.name) + '</span></nav>' +
      '<div class="product-layout">' +
        '<div class="product-gallery">' +
          (p.badge ? '<span class="badge">' + CM.esc(p.badge) + '</span>' : '') +
          '<div class="product-image"><img id="p-img" src="' + CM.url(p.image) + '" alt="' + CM.esc(p.name) + '" width="800" height="800" data-pid="' + p.id + '" data-color="' + p.baseColor + '" onerror="CM.imgFallback(this)"></div>' +
          '<p class="color-caption" aria-live="polite">Couleur affichée : <strong id="p-colorname">' + D.COLORS[p.baseColor].label + '</strong></p>' +
          '<p class="hint">Cliquez sur une pastille : le vêtement change de couleur !</p>' +
        '</div>' +
        '<div class="product-info">' +
          '<p class="eyebrow"><a href="' + CM.url('pages/boutique.html?gamme=' + p.line) + '">' + line.label + '</a> · ' + D.GENDERS[p.gender] + '</p>' +
          '<h1>' + CM.esc(p.name) + '</h1>' +
          '<p class="pcard-rating">' + CM.stars(p.rating) + ' <a href="#avis">' + p.reviewCount + ' avis (fictifs)</a></p>' +
          '<p class="price big">' + D.formatPrice(p.price) + ' <small>TVA incluse</small></p>' +
          '<p class="lead">' + CM.esc(p.description) + '</p>' +
          (p.features.length ? '<ul class="ticks">' + p.features.map(function (f) { return '<li>' + CM.icon('check', 16) + ' ' + CM.esc(f) + '</li>'; }).join('') + '</ul>' : '') +
          costumeBox +
          '<form id="add-form" novalidate>' +
            '<fieldset class="opt-group"><legend>Couleur : <span id="p-colorname2">' + D.COLORS[p.baseColor].label + '</span></legend><div class="color-opts">' + colors + '</div></fieldset>' +
            '<fieldset class="opt-group"><legend>Taille</legend><div class="size-opts">' + sizes + '</div>' +
              '<p class="size-help"><button type="button" class="link-btn" id="size-guide-btn">Guide des tailles</button></p>' +
              '<div class="size-guide" id="size-guide" hidden><p>Guide indicatif (données fictives) : en cas de doute entre deux tailles, prenez la plus grande. Nos vêtements thermochromiques ont une coupe standard et ne rétrécissent pas lorsqu’ils changent de couleur.</p></div>' +
            '</fieldset>' +
            '<div class="qty-row"><label for="p-qty">Quantité</label>' +
              '<div class="qty"><button type="button" class="qty-btn" data-d="-1" aria-label="Diminuer la quantité">−</button><input id="p-qty" type="number" min="1" max="99" value="1" inputmode="numeric"><button type="button" class="qty-btn" data-d="1" aria-label="Augmenter la quantité">+</button></div></div>' +
            '<p class="form-msg err" id="add-msg" role="alert"></p>' +
            '<div class="buy-row"><button type="submit" class="btn btn-lg">' + CM.icon('cart', 20) + ' Ajouter au panier</button>' +
              '<button type="button" class="btn btn-outline btn-lg" id="buy-now">Acheter maintenant</button></div>' +
          '</form>' +
          '<ul class="assurances">' +
            '<li>' + CM.icon('truck', 18) + ' Livraison offerte dès ' + D.formatPrice(global.CMCart.SHIPPING.threshold) + '</li>' +
            '<li>' + CM.icon('refresh', 18) + ' Retours gratuits sous 30 jours</li>' +
            '<li>' + CM.icon('leaf', 18) + ' Coton biologique, fabrication durable</li>' +
          '</ul>' +
          '<div class="accordion">' +
            '<details open><summary>Description</summary><p>' + CM.esc(p.description) + ' Ce vêtement fait partie de la gamme <strong>' + line.label + '</strong> (' + CM.esc(line.tagline.toLowerCase()) + ').</p></details>' +
            '<details><summary>Matière</summary><p>' + CM.esc(p.material) + '</p></details>' +
            '<details><summary>Entretien</summary><p>' + CM.esc(p.care) + '</p></details>' +
            '<details><summary>Changement de couleur</summary><p>Chaque pièce possède ' + p.colors.length + ' teintes disponibles. Le changement s’obtient avec l’Activateur Chromatch (fictif) : il peut être répété à volonté, sans perte de qualité.</p></details>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<section class="section-sm" id="avis" aria-labelledby="avis-t"><h2 id="avis-t">Avis clients <small class="muted">(avis fictifs, générés pour la démonstration)</small></h2><div class="reviews">' + reviews + '</div></section>' +
      '<section class="section-sm" aria-labelledby="rel-t"><h2 id="rel-t">Vous aimerez aussi</h2><div class="grid grid-4" id="related"></div></section>';

    const rel = document.getElementById('related');
    CM.renderProducts(rel, D.relatedProducts(p, 4));

    /* --- Interactions --- */
    const img = document.getElementById('p-img');
    const colorInputs = root.querySelectorAll('input[name=color]');
    colorInputs.forEach(function (inp) {
      inp.addEventListener('change', function () {
        CM.applyColor(img, p, inp.value);
        const label = D.COLORS[inp.value].label;
        document.getElementById('p-colorname').textContent = label;
        document.getElementById('p-colorname2').textContent = label;
        img.alt = p.name + ' – ' + label;
      });
    });
    document.getElementById('size-guide-btn').addEventListener('click', function () {
      const g = document.getElementById('size-guide'); g.hidden = !g.hidden;
    });
    const qty = document.getElementById('p-qty');
    root.querySelectorAll('.qty-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        qty.value = Math.max(1, Math.min(99, (parseInt(qty.value, 10) || 1) + parseInt(b.dataset.d, 10)));
      });
    });

    const addToCart = function () {
      const size = root.querySelector('input[name=size]:checked');
      const color = root.querySelector('input[name=color]:checked');
      const msg = document.getElementById('add-msg');
      if (!size) { msg.textContent = 'Veuillez choisir une taille.'; root.querySelector('.size-opts input').focus(); return false; }
      msg.textContent = '';
      const q = Math.max(1, Math.min(99, parseInt(qty.value, 10) || 1));
      global.CMCart.add(p.id, size.value, color.value, q);
      return { size: size.value, color: color.value, qty: q };
    };
    document.getElementById('add-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const r = addToCart();
      if (r) { CM.toast(p.name + ' ajouté au panier'); CM.openMiniCart(); }
    });
    document.getElementById('buy-now').addEventListener('click', function () {
      if (addToCart()) window.location.href = CM.url('pages/commande.html');
    });
  }

  CM.ready(function () {
    const root = document.getElementById('product-root');
    if (!root) return;
    const p = D.getProduct(CM.param('id'));
    if (!p) {
      root.innerHTML = '<div class="empty-state"><h1>Produit introuvable</h1><p>Ce produit n’existe pas ou a été retiré du catalogue.</p><a class="btn" href="' + CM.url('pages/boutique.html') + '">Retour à la boutique</a></div>';
      return;
    }
    render(p, root);
  });
})(window);
