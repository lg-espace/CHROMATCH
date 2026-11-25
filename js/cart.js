/* ==========================================================================
   Chromatch — Panier, codes promo et calcul des totaux
   --------------------------------------------------------------------------
   - Panier et « enregistrés pour plus tard » : persistés dans localStorage.
   - Aucune donnée personnelle ni bancaire n'est jamais stockée ici.
   - Tous les prix sont TTC (TVA 20 % incluse) ; la TVA est affichée « dont TVA ».
   ========================================================================== */
(function (global) {
  'use strict';

  const KEY_CART = 'chromatch_cart_v1';
  const KEY_SAVED = 'chromatch_saved_v1';
  const KEY_PROMO = 'chromatch_promo_v1';

  /** Livraison : offerte dès 100 € d'achats (après remise). */
  const SHIPPING = {
    threshold: 100,
    modes: {
      standard: { id: 'standard', label: 'Livraison standard (3 à 5 jours ouvrés)', price: 4.90, freeAbove: true },
      express:  { id: 'express',  label: 'Livraison express (24 à 48 h)',          price: 9.90, freeAbove: false },
      pickup:   { id: 'pickup',   label: 'Retrait gratuit en boutique Chromatch',  price: 0,    freeAbove: true }
    }
  };
  const VAT_RATE = 0.20;

  /* ---------- Mois en cours (promo dynamique) ---------- */
  const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function stripAccents(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  /** Informations sur le mois courant (calculées avec la date du jour). */
  function monthInfo(date) {
    const d = date || new Date();
    const idx = d.getMonth();
    const name = MONTHS_FR[idx];
    const vowel = /^[aeiouyéèàâh]/i.test(name);        // « d’avril », « d’octobre », « d’août »
    const de = (vowel ? 'd’' : 'de ') + name;
    const info = {
      index: idx,
      name: name,
      de: de,
      label: 'Promo ' + de,
      code: 'COLOR' + stripAccents(name).toUpperCase(),
      percent: 15,
      theme: 'default',
      headline: 'Promo ' + de,
      subline: '−15 % sur tout le site : c’est le moment de colorer votre garde-robe !'
    };
    // Thèmes spéciaux demandés dans le PDF : mois des fiertés (juin) et Octobre rose
    if (global.CM_THEMED_MONTHS !== false) {
      if (idx === 5) {
        info.theme = 'fiertes';
        info.headline = 'Promo de juin · Mois des fiertés';
        info.subline = 'Toutes les couleurs ont leur place. −15 % sur tout le site avec notre code du mois.';
      } else if (idx === 9) {
        info.theme = 'octobre-rose';
        info.headline = 'Promo d’octobre · Octobre rose';
        info.subline = 'Le mois en rose chez Chromatch : −15 % sur tout le site avec notre code du mois.';
      }
    }
    return info;
  }

  /** Codes promo fictifs valides. */
  function findPromo(rawCode) {
    const code = (rawCode || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!code) return null;
    const m = monthInfo();
    if (code === m.code) return { code: code, type: 'percent', value: m.percent, label: m.label + ' : −' + m.percent + ' %' };
    if (code === 'BIENVENUE10') return { code: code, type: 'percent', value: 10, label: 'Bienvenue : −10 %' };
    if (code === 'LIVRAISON') return { code: code, type: 'shipping', value: 0, label: 'Livraison offerte' };
    return null;
  }

  /* ---------- Lecture / écriture localStorage ---------- */
  function read(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* stockage indisponible : on ignore */ }
  }
  function round2(n) { return Math.round(n * 100) / 100; }
  function notify() { document.dispatchEvent(new CustomEvent('cm:cart')); }
  function keyOf(id, size, color) { return [id, size, color].join('|'); }

  /* ---------- Panier ---------- */
  function rawItems() { return read(KEY_CART, []); }

  /** Lignes du panier enrichies avec le produit (les produits disparus du catalogue sont ignorés). */
  function resolve(items) {
    return items.map(function (it) {
      const p = global.CMData.getProduct(it.id);
      if (!p) return null;
      return { key: keyOf(it.id, it.size, it.color), id: it.id, size: it.size, color: it.color, qty: it.qty || 1, product: p, lineTotal: round2(p.price * (it.qty || 1)) };
    }).filter(Boolean);
  }

  const Cart = {
    SHIPPING: SHIPPING,
    VAT_RATE: VAT_RATE,
    monthInfo: monthInfo,
    findPromo: findPromo,

    lines: function () { return resolve(rawItems()); },
    savedLines: function () { return resolve(read(KEY_SAVED, [])); },
    count: function () { return rawItems().reduce(function (n, it) { return n + (it.qty || 1); }, 0); },

    add: function (id, size, color, qty) {
      qty = Math.max(1, parseInt(qty, 10) || 1);
      const items = rawItems();
      const found = items.find(function (it) { return it.id === id && it.size === size && it.color === color; });
      if (found) found.qty = Math.min(99, (found.qty || 1) + qty);
      else items.push({ id: id, size: size, color: color, qty: Math.min(99, qty) });
      write(KEY_CART, items);
      notify();
    },
    setQty: function (key, qty) {
      qty = parseInt(qty, 10);
      let items = rawItems();
      items = items.map(function (it) { return keyOf(it.id, it.size, it.color) === key ? Object.assign({}, it, { qty: Math.max(0, Math.min(99, qty || 0)) }) : it; })
                   .filter(function (it) { return it.qty > 0; });
      write(KEY_CART, items);
      notify();
    },
    remove: function (key) {
      write(KEY_CART, rawItems().filter(function (it) { return keyOf(it.id, it.size, it.color) !== key; }));
      notify();
    },
    clear: function () { write(KEY_CART, []); notify(); },

    /* « Enregistrer pour plus tard » */
    saveForLater: function (key) {
      const items = rawItems();
      const it = items.find(function (x) { return keyOf(x.id, x.size, x.color) === key; });
      if (!it) return;
      const saved = read(KEY_SAVED, []);
      if (!saved.some(function (x) { return keyOf(x.id, x.size, x.color) === key; })) saved.push({ id: it.id, size: it.size, color: it.color, qty: it.qty });
      write(KEY_SAVED, saved);
      write(KEY_CART, items.filter(function (x) { return keyOf(x.id, x.size, x.color) !== key; }));
      notify();
    },
    moveSavedToCart: function (key) {
      const saved = read(KEY_SAVED, []);
      const it = saved.find(function (x) { return keyOf(x.id, x.size, x.color) === key; });
      if (!it) return;
      write(KEY_SAVED, saved.filter(function (x) { return keyOf(x.id, x.size, x.color) !== key; }));
      Cart.add(it.id, it.size, it.color, it.qty);
    },
    removeSaved: function (key) {
      write(KEY_SAVED, read(KEY_SAVED, []).filter(function (x) { return keyOf(x.id, x.size, x.color) !== key; }));
      notify();
    },

    /* Code promo */
    getPromo: function () {
      const stored = read(KEY_PROMO, null);
      if (!stored) return null;
      const again = findPromo(stored.code);   // revalide (ex. le code du mois a changé)
      if (!again) { write(KEY_PROMO, null); return null; }
      return again;
    },
    applyPromo: function (code) {
      const promo = findPromo(code);
      if (!promo) return { ok: false, message: 'Code promo invalide ou expiré.' };
      write(KEY_PROMO, { code: promo.code });
      notify();
      return { ok: true, promo: promo, message: 'Code appliqué : ' + promo.label };
    },
    clearPromo: function () { write(KEY_PROMO, null); notify(); },

    /**
     * Calcule les totaux.
     * @param {string} mode  mode de livraison (standard par défaut)
     */
    totals: function (mode) {
      const lines = Cart.lines();
      const promo = Cart.getPromo();
      const subtotal = round2(lines.reduce(function (s, l) { return s + l.lineTotal; }, 0));
      let discount = 0;
      if (promo && promo.type === 'percent') discount = round2(subtotal * promo.value / 100);
      const afterDiscount = round2(subtotal - discount);
      const m = SHIPPING.modes[mode || 'standard'] || SHIPPING.modes.standard;
      let shipping = lines.length === 0 ? 0 : m.price;
      if (m.freeAbove && afterDiscount >= SHIPPING.threshold) shipping = 0;
      if (promo && promo.type === 'shipping') shipping = 0;
      const total = round2(afterDiscount + shipping);
      const vat = round2(total - total / (1 + VAT_RATE));      // TVA incluse dans le TTC
      return {
        lines: lines, promo: promo, count: Cart.count(),
        subtotal: subtotal, discount: discount, afterDiscount: afterDiscount,
        shipping: shipping, shippingMode: m, total: total, vat: vat,
        missingForFree: Math.max(0, round2(SHIPPING.threshold - afterDiscount)),
        freeShippingReached: afterDiscount >= SHIPPING.threshold
      };
    }
  };

  global.CMCart = Cart;
})(window);
