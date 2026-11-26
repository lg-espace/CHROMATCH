/* ==========================================================================
   Chromatch — Page « Nos boutiques » (Leaflet + OpenStreetMap + Nominatim)
   - carte globale avec tous les marqueurs
   - liste des boutiques (adresse, horaires, téléphone)
   - géocodage d'une adresse (Nominatim, côté client, avec gestion d'erreurs)
   - boutique la plus proche (distance de Haversine) + carte dédiée + ligne
   - bouton « Me géolocaliser » (API Geolocation du navigateur)
   ========================================================================== */
(function (global) {
  'use strict';
  const CM = global.CM, S = global.CMStores;

  const FRANCE_CENTER = [46.6, 2.5];
  let map, map2, markers = {}, routeLine = null, originMarker = null, hasLeaflet = false;

  const fmtKm = function (km) { return km < 10 ? km.toFixed(1).replace('.', ',') + ' km' : Math.round(km).toLocaleString('fr-FR') + ' km'; };
  const fullAddress = function (s) { return s.adresse + ', ' + s.cp + ' ' + s.ville; };

  function popupHTML(s) {
    return '<div class="map-popup"><strong>' + CM.esc(s.nom) + '</strong><br>' + CM.esc(fullAddress(s)) + '<br>' +
      '<small>' + CM.esc(s.horaires[0]) + '<br>' + CM.esc(s.horaires[1]) + ' · ' + CM.esc(s.horaires[2]) + '</small><br>' +
      'Tél. : ' + CM.esc(s.tel) + '</div>';
  }

  function markerIcon(cls) {
    return L.divIcon({ className: 'cm-marker ' + (cls || ''), html: '<span></span>', iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -14] });
  }

  function initMaps() {
    if (typeof L === 'undefined') return;       // Leaflet non chargé (hors ligne, bloqué…)
    hasLeaflet = true;
    const tiles = function () {
      return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; contributeurs <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' });
    };
    map = L.map('map', { scrollWheelZoom: false }).setView(FRANCE_CENTER, 6);
    tiles().addTo(map);
    S.STORES.forEach(function (s) {
      markers[s.id] = L.marker([s.lat, s.lng], { icon: markerIcon(), title: s.nom, alt: s.nom }).addTo(map).bindPopup(popupHTML(s));
    });
    map.on('click', function () { map.scrollWheelZoom.enable(); });

    map2 = L.map('map-nearest', { scrollWheelZoom: false }).setView(FRANCE_CENTER, 5);
    tiles().addTo(map2);
  }

  function renderList(filter) {
    const q = (filter || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const list = S.STORES.filter(function (s) {
      if (!q) return true;
      return (s.nom + ' ' + s.adresse + ' ' + s.cp + ' ' + s.ville).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').indexOf(q) > -1;
    });
    document.getElementById('store-count').textContent = list.length + ' boutique' + (list.length > 1 ? 's' : '') + ' sur ' + S.STORES.length;
    document.getElementById('store-list').innerHTML = list.map(function (s) {
      return '<li class="store-card" data-id="' + s.id + '">' +
        '<h3>' + CM.esc(s.nom) + '</h3>' +
        '<p>' + CM.icon('pin', 16) + ' ' + CM.esc(fullAddress(s)) + '</p>' +
        '<ul class="hours">' + s.horaires.map(function (h) { return '<li>' + CM.esc(h) + '</li>'; }).join('') + '</ul>' +
        '<p>Tél. : <a href="tel:' + s.tel.replace(/\s/g, '') + '">' + CM.esc(s.tel) + '</a></p>' +
        '<button type="button" class="btn btn-small btn-outline" data-show="' + s.id + '">Voir sur la carte</button></li>';
    }).join('') || '<li class="muted">Aucune boutique ne correspond à votre recherche.</li>';
  }

  function setStatus(msg, kind) {
    const el = document.getElementById('geo-status');
    el.textContent = msg || '';
    el.className = 'form-msg ' + (kind || '');
  }

  /** Affiche la boutique la plus proche d'un point d'origine (carte, ligne, texte). */
  function showNearest(lat, lng, label) {
    const res = S.nearestStore(lat, lng);
    const n = res.nearest, s = n.store;
    const box = document.getElementById('nearest-result');
    box.hidden = false;
    const link = 'https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=' + lat.toFixed(5) + '%2C' + lng.toFixed(5) + '%3B' + s.lat + '%2C' + s.lng;
    box.innerHTML =
      '<h3>Votre boutique Chromatch la plus proche</h3>' +
      '<p class="nearest-name"><strong>' + CM.esc(s.nom) + '</strong> — à <strong>' + fmtKm(n.km) + '</strong> à vol d’oiseau</p>' +
      '<p>' + CM.icon('pin', 16) + ' ' + CM.esc(fullAddress(s)) + '</p>' +
      '<p>' + CM.esc(s.horaires[0]) + ' · ' + CM.esc(s.horaires[1]) + ' · ' + CM.esc(s.horaires[2]) + '</p>' +
      '<p>Tél. : ' + CM.esc(s.tel) + ' · <a href="' + link + '" target="_blank" rel="noopener">Itinéraire sur OpenStreetMap</a></p>' +
      '<p class="muted">Votre position : ' + CM.esc(label) + '</p>' +
      '<h4>Les 3 plus proches</h4><ol class="top3">' + res.ranked.slice(0, 3).map(function (r) { return '<li>' + CM.esc(r.store.nom) + ' — ' + fmtKm(r.km) + '</li>'; }).join('') + '</ol>';
    document.getElementById('map-nearest-wrap').hidden = false;

    if (!hasLeaflet) return;
    // Carte dédiée
    if (routeLine) { map2.removeLayer(routeLine); routeLine = null; }
    if (originMarker) { map2.removeLayer(originMarker); originMarker = null; }
    map2.eachLayer(function (l) { if (l instanceof L.Marker) map2.removeLayer(l); });
    originMarker = L.marker([lat, lng], { icon: markerIcon('me'), title: 'Votre position' }).addTo(map2).bindPopup('Votre position');
    L.marker([s.lat, s.lng], { icon: markerIcon('best'), title: s.nom }).addTo(map2).bindPopup(popupHTML(s)).openPopup();
    routeLine = L.polyline([[lat, lng], [s.lat, s.lng]], { color: '#5E17EB', weight: 4, dashArray: '8 8' }).addTo(map2);
    setTimeout(function () { map2.invalidateSize(); map2.fitBounds(routeLine.getBounds(), { padding: [50, 50], maxZoom: 14 }); }, 60);
    // Carte globale : on centre aussi sur la boutique
    markers[s.id].openPopup();
    map.setView([s.lat, s.lng], 11);
    document.getElementById('map-nearest-wrap').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /** Géocode une adresse avec Nominatim (OpenStreetMap). */
  function geocode(query) {
    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, 10000);
    const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=0&accept-language=fr&q=' + encodeURIComponent(query);
    return fetch(url, { signal: ctrl.signal, headers: { 'Accept': 'application/json' } })
      .then(function (r) {
        clearTimeout(timer);
        if (r.status === 429) throw new Error('RATE');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .catch(function (err) { clearTimeout(timer); throw err; });
  }

  function setupAddressSearch() {
    const form = document.getElementById('address-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const q = document.getElementById('addr').value.trim();
      if (q.length < 3) { setStatus('Saisissez une adresse (au moins 3 caractères).', 'err'); return; }
      const btn = document.getElementById('addr-btn');
      btn.disabled = true; setStatus('Recherche de l’adresse…', '');
      geocode(q).then(function (data) {
        if (!data || !data.length) { setStatus('Adresse introuvable. Essayez avec le code postal et la ville.', 'err'); return; }
        const r = data[0];
        setStatus('Adresse trouvée : ' + r.display_name, 'ok');
        showNearest(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
      }).catch(function (err) {
        if (err && err.name === 'AbortError') setStatus('Le service d’adresses met trop de temps à répondre. Réessayez dans un instant.', 'err');
        else if (err && err.message === 'RATE') setStatus('Trop de requêtes envoyées au service d’adresses. Patientez quelques secondes puis réessayez.', 'err');
        else setStatus('Impossible de contacter le service d’adresses (connexion ou blocage réseau). Vérifiez votre connexion.', 'err');
      }).then(function () { btn.disabled = false; });
    });

    document.getElementById('geo-btn').addEventListener('click', function () {
      if (!('geolocation' in navigator)) { setStatus('La géolocalisation n’est pas disponible sur ce navigateur.', 'err'); return; }
      setStatus('Localisation en cours…', '');
      navigator.geolocation.getCurrentPosition(function (pos) {
        setStatus('Position détectée.', 'ok');
        showNearest(pos.coords.latitude, pos.coords.longitude, 'position détectée par votre navigateur (' + pos.coords.latitude.toFixed(4) + ', ' + pos.coords.longitude.toFixed(4) + ')');
      }, function (err) {
        const m = { 1: 'Autorisation refusée : activez la localisation ou saisissez une adresse.', 2: 'Position indisponible pour le moment.', 3: 'La localisation a mis trop de temps. Réessayez.' };
        setStatus(m[err.code] || 'Impossible de vous localiser.', 'err');
      }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
    });
  }

  CM.ready(function () {
    if (!document.getElementById('map')) return;
    initMaps();
    if (!hasLeaflet) {
      document.getElementById('map').innerHTML = '<p class="map-fallback">La carte n’a pas pu être chargée (Leaflet indisponible). La liste des boutiques reste disponible ci-dessous.</p>';
      document.getElementById('map-nearest').innerHTML = '';
    }
    renderList('');
    setupAddressSearch();

    document.getElementById('store-filter').addEventListener('input', function (e) { renderList(e.target.value); });
    document.getElementById('store-list').addEventListener('click', function (e) {
      const b = e.target.closest('[data-show]');
      if (!b || !hasLeaflet) return;
      const s = S.STORES.find(function (x) { return x.id === b.dataset.show; });
      map.setView([s.lat, s.lng], 14);
      markers[s.id].openPopup();
      document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
})(window);
