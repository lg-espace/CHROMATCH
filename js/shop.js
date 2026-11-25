/* ==========================================================================
   Chromatch — Page Boutique : filtres, tri, recherche (état synchronisé avec l'URL)
   ========================================================================== */
(function (global) {
  'use strict';
  const CM = global.CM, D = global.CMData;

  const MAX_PRICE = 250;
  const state = { q: '', cats: [], lines: [], rayon: '', max: MAX_PRICE, sort: 'pertinence' };

  const norm = function (s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };

  function readURL() {
    const get = CM.param;
    state.q = get('q') || '';
    state.cats = (get('categorie') || '').split(',').filter(function (c) { return D.CATEGORIES[c]; });
    state.lines = (get('gamme') || '').split(',').filter(function (c) { return D.LINES[c]; });
    state.rayon = D.GENDERS[get('rayon')] ? get('rayon') : '';
    state.max = Math.min(MAX_PRICE, parseInt(get('max'), 10) || MAX_PRICE);
    state.sort = get('tri') || 'pertinence';
  }
  function writeURL() {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.cats.length) p.set('categorie', state.cats.join(','));
    if (state.lines.length) p.set('gamme', state.lines.join(','));
    if (state.rayon) p.set('rayon', state.rayon);
    if (state.max < MAX_PRICE) p.set('max', state.max);
    if (state.sort !== 'pertinence') p.set('tri', state.sort);
    const qs = p.toString();
    try { history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '')); } catch (e) {}
  }

  function matchesRayon(p) {
    if (!state.rayon) return true;
    if (state.rayon === 'homme') return p.gender === 'homme' || p.gender === 'unisexe';
    if (state.rayon === 'femme') return p.gender === 'femme' || p.gender === 'unisexe';
    return p.gender === state.rayon;
  }

  function filtered() {
    const q = norm(state.q).trim();
    let list = D.PRODUCTS.filter(function (p) {
      if (state.cats.length && state.cats.indexOf(p.category) < 0) return false;
      if (state.lines.length && state.lines.indexOf(p.line) < 0) return false;
      if (!matchesRayon(p)) return false;
      if (p.price > state.max) return false;
      if (q) {
        const hay = norm([p.name, D.CATEGORIES[p.category].label, D.LINES[p.line].label, D.GENDERS[p.gender], p.description, p.features.join(' ')].join(' '));
        if (!q.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; })) return false;
      }
      return true;
    });
    const by = {
      'pertinence': function (a, b) { return (b.featured - a.featured) || (a.order - b.order); },
      'prix-asc': function (a, b) { return a.price - b.price || a.order - b.order; },
      'prix-desc': function (a, b) { return b.price - a.price || a.order - b.order; },
      'note': function (a, b) { return b.rating - a.rating || a.order - b.order; },
      'nouveautes': function (a, b) { return ((b.badge === 'Nouveau') - (a.badge === 'Nouveau')) || (b.order - a.order); },
      'nom': function (a, b) { return a.name.localeCompare(b.name, 'fr'); }
    };
    return list.sort(by[state.sort] || by.pertinence);
  }

  function renderFilters() {
    const counts = function (key, val) { return D.PRODUCTS.filter(function (p) { return p[key] === val; }).length; };
    document.getElementById('f-categories').innerHTML = Object.keys(D.CATEGORIES).map(function (k) {
      return '<label class="check"><input type="checkbox" name="categorie" value="' + k + '"' + (state.cats.indexOf(k) > -1 ? ' checked' : '') + '> <span>' + D.CATEGORIES[k].label + ' <small>(' + counts('category', k) + ')</small></span></label>';
    }).join('');
    document.getElementById('f-lines').innerHTML = Object.keys(D.LINES).map(function (k) {
      return '<label class="check"><input type="checkbox" name="gamme" value="' + k + '"' + (state.lines.indexOf(k) > -1 ? ' checked' : '') + '> <span>' + D.LINES[k].label + ' <small>(' + counts('line', k) + ')</small></span></label>';
    }).join('');
    const rayons = [['', 'Tous les rayons']].concat(Object.keys(D.GENDERS).map(function (k) { return [k, D.GENDERS[k]]; }));
    document.getElementById('f-rayons').innerHTML = rayons.map(function (r) {
      return '<label class="check"><input type="radio" name="rayon" value="' + r[0] + '"' + (state.rayon === r[0] ? ' checked' : '') + '> <span>' + r[1] + '</span></label>';
    }).join('');
    const range = document.getElementById('f-max');
    range.max = MAX_PRICE; range.value = state.max;
    document.getElementById('f-max-out').textContent = state.max >= MAX_PRICE ? 'Tous les prix' : 'Jusqu’à ' + D.formatPrice(state.max);
    document.getElementById('f-q').value = state.q;
    document.getElementById('f-sort').value = state.sort;
  }

  function renderResults() {
    const list = filtered();
    const grid = document.getElementById('shop-grid');
    const none = document.getElementById('shop-empty');
    document.getElementById('shop-count').textContent = list.length + ' produit' + (list.length > 1 ? 's' : '');
    none.hidden = list.length > 0;
    grid.hidden = list.length === 0;
    CM.renderProducts(grid, list);
    writeURL();
  }

  function readFormState() {
    state.cats = Array.prototype.map.call(document.querySelectorAll('input[name=categorie]:checked'), function (i) { return i.value; });
    state.lines = Array.prototype.map.call(document.querySelectorAll('input[name=gamme]:checked'), function (i) { return i.value; });
    const r = document.querySelector('input[name=rayon]:checked');
    state.rayon = r ? r.value : '';
    state.max = parseInt(document.getElementById('f-max').value, 10);
    state.q = document.getElementById('f-q').value;
    state.sort = document.getElementById('f-sort').value;
    document.getElementById('f-max-out').textContent = state.max >= MAX_PRICE ? 'Tous les prix' : 'Jusqu’à ' + D.formatPrice(state.max);
  }

  CM.ready(function () {
    if (!document.getElementById('shop-grid')) return;
    readURL();
    renderFilters();
    renderResults();

    const form = document.getElementById('filters');
    form.addEventListener('input', function () { readFormState(); renderResults(); });
    form.addEventListener('change', function () { readFormState(); renderResults(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    document.getElementById('f-sort').addEventListener('change', function () { readFormState(); renderResults(); });
    document.getElementById('f-reset').addEventListener('click', function () {
      state.q = ''; state.cats = []; state.lines = []; state.rayon = ''; state.max = MAX_PRICE; state.sort = 'pertinence';
      renderFilters(); renderResults();
    });
    const none = document.getElementById('shop-empty-reset');
    if (none) none.addEventListener('click', function () { document.getElementById('f-reset').click(); });

    // Panneau de filtres sur mobile
    const tgl = document.getElementById('filters-toggle');
    tgl.addEventListener('click', function () {
      const open = !form.classList.contains('open');
      form.classList.toggle('open', open);
      tgl.setAttribute('aria-expanded', String(open));
    });
  });
})(window);
