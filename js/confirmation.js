/* ==========================================================================
   Chromatch — Page de confirmation (fictive)
   Lit le résumé minimal (sans donnée personnelle ni bancaire) laissé par checkout.js
   ========================================================================== */
(function (global) {
  'use strict';
  const CM = global.CM, D = global.CMData;

  CM.ready(function () {
    const root = document.getElementById('confirm-root');
    if (!root) return;
    let o = null;
    try { o = JSON.parse(sessionStorage.getItem('chromatch_last_order')); } catch (e) {}
    if (!o) {
      root.innerHTML = '<div class="empty-state"><h1>Aucune commande à afficher</h1><p>Cette page apparaît après un paiement fictif.</p><a class="btn" href="' + CM.url('pages/boutique.html') + '">Retour à la boutique</a></div>';
      return;
    }
    const lines = o.lines.map(function (l) {
      return '<li><span>' + CM.esc(l.name) + ' <small>(' + CM.esc(l.color) + ', ' + CM.esc(l.size) + ') × ' + l.qty + '</small></span><strong>' + D.formatPrice(l.total) + '</strong></li>';
    }).join('');
    root.innerHTML =
      '<div class="confirm-card">' +
        '<div class="confirm-check" aria-hidden="true">' + CM.icon('check', 40) + '</div>' +
        '<p class="eyebrow">Paiement fictif – démonstration</p>' +
        '<h1>Merci pour votre commande !</h1>' +
        '<p class="lead">Aucun paiement réel n’a été effectué et aucune donnée n’a été enregistrée.</p>' +
        '<p class="order-number">N° de commande (fictif) : <strong>' + CM.esc(o.number) + '</strong></p>' +
        '<ul class="confirm-lines">' + lines + '</ul>' +
        '<dl class="totals"><div><dt>Livraison (' + CM.esc(o.delivery) + ')</dt><dd>' + (o.shipping === 0 ? 'Offerte' : D.formatPrice(o.shipping)) + '</dd></div>' +
        '<div class="grand"><dt>Total TTC</dt><dd>' + D.formatPrice(o.total) + '</dd></div></dl>' +
        '<p class="hint">Votre panier a été vidé. Gagnez des points avec le programme de fidélité (fictif) !</p>' +
        '<div class="buy-row"><a class="btn" href="' + CM.url('pages/boutique.html') + '">Continuer mes achats</a><a class="btn btn-outline" href="' + CM.url('pages/fidelite.html') + '">Programme de fidélité</a></div>' +
      '</div>';
    try { sessionStorage.removeItem('chromatch_last_order'); } catch (e) {}
  });
})(window);
