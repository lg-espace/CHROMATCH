/* ==========================================================================
   Chromatch — Boutiques physiques
   --------------------------------------------------------------------------
   Les adresses reprennent la liste des 20 Apple Store de France (source :
   apple.com/fr/retail/storelist/, consultée en nov. 2026) avec +10 ajouté
   au numéro de rue (ex. 12 rue Halévy → 22 rue Halévy).
   Quand Apple ne donne pas de numéro (centres commerciaux, places), on n'en
   invente pas : « numeroOriginal » reste null et l'adresse est inchangée.
   Les coordonnées GPS sont APPROXIMATIVES (à ±200 m) : à vérifier.
   Les téléphones sont des numéros réservés par l'ARCEP (01 99 00 xx xx…).
   ========================================================================== */
(function (global) {
  'use strict';

  const HORAIRES = [
    'Lundi – vendredi : 10h00 – 19h30',
    'Samedi : 10h00 – 20h00',
    'Dimanche : 11h00 – 18h00'
  ];

  /* id, nom, adresse (numéro +10 déjà appliqué), CP, ville, tel, lat, lng, note */
  const STORES = [
    { id: 'paris-opera',        nom: 'Chromatch Paris Opéra',            adresse: '22 rue Halévy',                              cp: '75009', ville: 'Paris',                 tel: '01 99 00 10 01', lat: 48.8718, lng: 2.3318, original: '12 rue Halévy' },
    { id: 'paris-champs',       nom: 'Chromatch Champs-Élysées',         adresse: '124 avenue des Champs-Élysées',              cp: '75008', ville: 'Paris',                 tel: '01 99 00 10 02', lat: 48.8715, lng: 2.3050, original: '114 avenue des Champs-Élysées' },
    { id: 'paris-saint-germain',nom: 'Chromatch Marché Saint-Germain',   adresse: '19 rue Clément',                             cp: '75006', ville: 'Paris',                 tel: '01 99 00 10 03', lat: 48.8527, lng: 2.3350, original: '9 rue Clément' },
    { id: 'la-defense',         nom: 'Chromatch La Défense',             adresse: 'Centre commercial Les Quatre Temps, 25 Parvis de la Défense', cp: '92800', ville: 'Puteaux', tel: '01 99 00 10 04', lat: 48.8918, lng: 2.2361, original: '15 Parvis de la Défense' },
    { id: 'rosny-2',            nom: 'Chromatch Rosny 2',                adresse: 'Centre commercial Rosny 2, avenue du Général-de-Gaulle', cp: '93110', ville: 'Rosny-sous-Bois', tel: '01 99 00 10 05', lat: 48.8806, lng: 2.4871, original: null },
    { id: 'carre-senart',       nom: 'Chromatch Carré Sénart',           adresse: 'Centre commercial régional, 13 allée du Préambule', cp: '77127', ville: 'Lieusaint',  tel: '01 99 00 10 06', lat: 48.6344, lng: 2.5638, original: '3 allée du Préambule' },
    { id: 'val-d-europe',       nom: 'Chromatch Val d’Europe',           adresse: 'Centre commercial Val d’Europe, 24 cours du Danube', cp: '77700', ville: 'Serris',     tel: '01 99 00 10 07', lat: 48.8545, lng: 2.7835, original: '14 cours du Danube' },
    { id: 'parly-2',            nom: 'Chromatch Parly 2',                adresse: 'Centre commercial régional Parly 2, avenue Charles-de-Gaulle', cp: '78150', ville: 'Le Chesnay', tel: '01 99 00 10 08', lat: 48.8217, lng: 2.1103, original: null },
    { id: 'velizy-2',           nom: 'Chromatch Vélizy 2',               adresse: '12 avenue de l’Europe',                      cp: '78140', ville: 'Vélizy-Villacoublay',   tel: '01 99 00 10 09', lat: 48.7824, lng: 2.2219, original: '2 avenue de l’Europe' },
    { id: 'lille',              nom: 'Chromatch Lille',                  adresse: '11 rue Faidherbe',                           cp: '59800', ville: 'Lille',                 tel: '03 53 01 10 01', lat: 50.6366, lng: 3.0702, original: '1 rue Faidherbe' },
    { id: 'strasbourg',         nom: 'Chromatch Strasbourg',             adresse: 'L’Aubette, place Kléber',                    cp: '67000', ville: 'Strasbourg',            tel: '03 53 01 10 02', lat: 48.5842, lng: 7.7508, original: null },
    { id: 'dijon',              nom: 'Chromatch Dijon Toison d’Or',      adresse: 'Centre commercial de la Toison d’Or, avenue de Langres', cp: '21000', ville: 'Dijon',      tel: '03 53 01 10 03', lat: 47.3575, lng: 5.0722, original: null },
    { id: 'lyon-part-dieu',     nom: 'Chromatch Lyon Part-Dieu',         adresse: 'Centre commercial La Part-Dieu, 27 rue du Docteur Bouchut', cp: '69003', ville: 'Lyon',    tel: '04 65 71 10 01', lat: 45.7607, lng: 4.8560, original: '17 rue du Docteur Bouchut' },
    { id: 'lyon-confluence',    nom: 'Chromatch Lyon Confluence',        adresse: 'Centre commercial Confluence, 122 cours Charlemagne', cp: '69002', ville: 'Lyon',          tel: '04 65 71 10 02', lat: 45.7425, lng: 4.8185, original: '112 cours Charlemagne' },
    { id: 'marseille',          nom: 'Chromatch Marseille Terrasses du Port', adresse: 'Les Terrasses du Port, 19 quai du Lazaret', cp: '13002', ville: 'Marseille',         tel: '04 65 71 10 03', lat: 43.3101, lng: 5.3637, original: '9 quai du Lazaret' },
    { id: 'aix',                nom: 'Chromatch Aix-en-Provence',        adresse: '12 place du Général de Gaulle',              cp: '13100', ville: 'Aix-en-Provence',       tel: '04 65 71 10 04', lat: 43.5263, lng: 5.4454, original: '2 place du Général de Gaulle' },
    { id: 'nice-cap-3000',      nom: 'Chromatch Nice CAP 3000',          adresse: 'CAP 3000, avenue Eugène Donadeï',            cp: '06700', ville: 'Saint-Laurent-du-Var',  tel: '04 65 71 10 05', lat: 43.6588, lng: 7.1980, original: null },
    { id: 'montpellier',        nom: 'Chromatch Montpellier Odysseum',   adresse: 'Centre commercial Odysseum, zone Odysseum ZAC Port Marianne', cp: '34000', ville: 'Montpellier', tel: '04 65 71 10 06', lat: 43.6055, lng: 3.9199, original: null },
    { id: 'bordeaux',           nom: 'Chromatch Bordeaux Sainte-Catherine', adresse: '12-14 rue Sainte-Catherine',              cp: '33000', ville: 'Bordeaux',              tel: '05 36 49 10 01', lat: 44.8386, lng: -0.5742, original: '2-4 rue Sainte-Catherine' },
    { id: 'saint-herblain',     nom: 'Chromatch Saint-Herblain Atlantis', adresse: 'Galerie Atlantis Le Centre',                cp: '44800', ville: 'Saint-Herblain',        tel: '02 61 91 10 01', lat: 47.2307, lng: -1.6384, original: null }
  ];
  STORES.forEach(function (s) { s.horaires = HORAIRES; });

  /** Distance en km entre deux points GPS (formule de Haversine). */
  function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371; // rayon moyen de la Terre en km
    const toRad = function (d) { return d * Math.PI / 180; };
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /** Renvoie la boutique la plus proche d'un point : { store, km } et le classement complet. */
  function nearestStore(lat, lng) {
    const ranked = STORES.map(function (s) { return { store: s, km: haversine(lat, lng, s.lat, s.lng) }; })
      .sort(function (a, b) { return a.km - b.km; });
    return { nearest: ranked[0], ranked: ranked };
  }

  global.CMStores = { STORES: STORES, HORAIRES: HORAIRES, haversine: haversine, nearestStore: nearestStore };
})(window);
