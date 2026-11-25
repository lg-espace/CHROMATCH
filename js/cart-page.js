/* ==========================================================================
   Chromatch — Page Panier complète (pages/panier.html)
   Quantités, suppression, « enregistrer pour plus tard », code promo, totaux
   ========================================================================== */
(function (global) {
  'use strict';
  const CM = global.CM, D = global.CMData, C = global.CMCart;

  function lineHTML(l, saved) {
    const col = D.COLORS[l.color];
    const filter = D.colorFilter(l.product.baseColor, l.color);
    return '<li class="cart-line" data-key="' + CM.esc(l.key) + '">' +
      '<a class="cl-img" href="' + CM.url('pages/produit.html?id=' + l.id) + '"><img src="' + CM.url(l.product.image) + '" alt="' + CM.esc(l.product.name) + '" width="120" height="120" data-pid="' + l.id + '" data-color="' + l.color + '" style="filter:' + filter + '" onerror="CM.imgFallback(this)"></a>' +
      '<div class="cl-info">' +
        '<h3><a href="' + CM.url('pages/produit.html?id=' + l.id) + '">' + CM.esc(l.product.name) + '</a></h3>' +
        '<p class="muted">' + D.LINES[l.product.line].label + ' · Couleur : ' + CM.esc(col ? col.label : l.color) + ' · Taille : ' + CM.esc(l.size) + '</p>' +
        '<p class="stock">' + CM.icon('check', 14) + ' En stock (fictif)</p>' +
        '<div class="cl-actions">' +
          (saved
            ? '<button type="button" class="link-btn" data-act="move">Remettre dans le panier</button><button type="button" class="link-btn" data-act="remove-saved">Supprimer</button>'
            : '<div class="qty"><button type="button" class="qty-btn" data-act="dec" aria-label="Diminuer la quantité de ' + CM.esc(l.product.name) + '">−</button>' +
              '<input type="number" min="1" max="99" value="' + l.qty + '" aria-label="Quantité de ' + CM.esc(l.product.name) + '" data-act="qty">' +
              '<button type="button" class="qty-btn" data-act="inc" aria-label="Augmenter la quantité de ' + CM.esc(l.product.name) + '">+</button></div>' +
              '<button type="button" class="link-btn" data-act="remove">Supprimer</button>' +
              '<button type="button" class="link-btn" data-act="save">Enregistrer pour plus tard</button>') +
        '</div>' +
      '</div>' +
      '<p class="cl-price">' + D.formatPrice(saved ? l.product.price : l.lineTotal) + (!saved && l.qty > 1 ? '<small>' + D.formatPrice(l.product.price) + ' / unité</small>' : '') + '</p>' +
    '</li>';
  }

  function summaryHTML(t) {
    const f = D.formatPrice;
    let ship;
    if (t.shipping === 0) ship = '<span class="free">Offerte</span>';
    else ship = f(t.shipping);
    let bar = '';
    if (t.lines.length) {
      const pct = Math.min(100, Math.round(t.afterDiscount / C.SHIPPING.threshold * 100));
      bar = '<div class="ship-progress"><p>' + (t.freeShippingReached ? CM.icon('truck', 16) + ' <strong>Livraison offerte !</strong>' : 'Plus que <strong>' + f(t.missingForFree) + '</strong> pour profiter de la livraison offerte') + '</p>' +
            '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><span style="width:' + pct + '%"></span></div></div>';
    }
    return bar +
      '<dl class="totals">' +
        '<div><dt>Sous-total (' + t.count + ' article' + (t.count > 1 ? 's' : '') + ')</dt><dd>' + f(t.subtotal) + '</dd></div>' +
        (t.discount > 0 ? '<div class="disc"><dt>Remise (' + CM.esc(t.promo.code) + ')</dt><dd>−' + f(t.discount) + '</dd></div>' : '') +
        '<div><dt>Livraison estimée</dt><dd>' + ship + '</dd></div>' +
        '<div class="grand"><dt>Total TTC</dt><dd>' + f(t.total) + '</dd></div>' +
        '<div class="vat"><dt>dont TVA (20 %)</dt><dd>' + f(t.vat) + '</dd></div>' +
      '</dl>';
  }

  function render() {
    const root = document.getElementById('cart-root');
    if (!root) return;
    const t = C.totals();
    const saved = C.savedLines();

    let html = '';
    if (!t.lines.length) {
      html += '<div class="empty-state"><h2>Votre panier est vide</h2><p>Découvrez nos vêtements qui changent de couleur.</p><a class="btn" href="' + CM.url('pages/boutique.html') + '">Voir la boutique</a></div>';
    } else {
      html += '<div class="cart-layout"><section aria-labelledby="cart-h"><h2 id="cart-h" class="sr-only">Articles du panier</h2><ul class="cart-lines">' + t.lines.map(function (l) { return lineHTML(l, false); }).join('') + '</ul>' +
        '<p class="right"><button type="button" class="link-btn" id="clear-cart">Vider le panier</button></p></section>' +
        '<aside class="cart-summary" aria-labelledby="sum-h"><h2 id="sum-h">Récapitulatif</h2>' + summaryHTML(t) +
          '<form id="promo-form" class="promo-form" novalidate><label for="promo-code">Code promo</label><div class="inline-field"><input id="promo-code" type="text" placeholder="Ex. ' + C.monthInfo().code + '" autocomplete="off" value="' + (t.promo ? CM.esc(t.promo.code) : '') + '"><button class="btn btn-outline" type="submit">Appliquer</button></div>' +
          '<p class="form-msg ' + (t.promo ? 'ok' : '') + '" id="promo-msg" role="status">' + (t.promo ? CM.esc('Code appliqué : ' + t.promo.label) : '') + '</p>' +
          (t.promo ? '<button type="button" class="link-btn" id="promo-remove">Retirer le code</button>' : '') +
          '<p class="hint">Code du mois (fictif) : <button type="button" class="code-chip" data-copy="' + C.monthInfo().code + '">' + C.monthInfo().code + '</button></p></form>' +
          '<a class="btn btn-lg btn-block" href="' + CM.url('pages/commande.html') + '">Passer la commande</a>' +
          '<p class="hint center">' + CM.icon('lock', 14) + ' Paiement fictif — démonstration</p>' +
        '</aside></div>';
    }
    if (saved.length) {
      html += '<section class="section-sm" aria-labelledby="saved-h"><h2 id="saved-h">Enregistrés pour plus tard (' + saved.length + ')</h2><ul class="cart-lines saved">' + saved.map(function (l) { return lineHTML(l, true); }).join('') + '</ul></section>';
    }
    root.innerHTML = html;
  }

  CM.ready(function () {
    const root = document.getElementById('cart-root');
    if (!root) return;
    render();
    document.addEventListener('cm:cart', render);

    root.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-act]');
      if (btn) {
        const line = btn.closest('.cart-line');
        const key = line.dataset.key;
        const act = btn.dataset.act;
        const cur = C.lines().find(function (l) { return l.key === key; });
        if (act === 'inc') C.setQty(key, cur.qty + 1);
        else if (act === 'dec') C.setQty(key, cur.qty - 1);
        else if (act === 'remove') { C.remove(key); CM.toast('Article supprimé'); }
        else if (act === 'save') { C.saveForLater(key); CM.toast('Article enregistré pour plus tard'); }
        else if (act === 'move') { C.moveSavedToCart(key); CM.toast('Article remis dans le panier'); }
        else if (act === 'remove-saved') { C.removeSaved(key); }
        return;
      }
      if (e.target.id === 'clear-cart') { C.clear(); CM.toast('Panier vidé'); }
      if (e.target.id === 'promo-remove') { C.clearPromo(); }
    });
    root.addEventListener('change', function (e) {
      if (e.target.matches('input[data-act=qty]')) {
        C.setQty(e.target.closest('.cart-line').dataset.key, e.target.value);
      }
    });
    root.addEventListener('submit', function (e) {
      if (e.target.id !== 'promo-form') return;
      e.preventDefault();
      const input = document.getElementById('promo-code');
      const r = C.applyPromo(input.value);
      if (!r.ok) {
        const msg = document.getElementById('promo-msg');
        msg.textContent = r.message; msg.className = 'form-msg err';
      } else CM.toast(r.message);
    });
  });
})(window);
