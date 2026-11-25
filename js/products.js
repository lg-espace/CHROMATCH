/* ==========================================================================
   Chromatch — Catalogue produits (DONNÉES FICTIVES)
   --------------------------------------------------------------------------
   Ce fichier contient TOUT le catalogue de la boutique : palette, gammes,
   catégories, produits, avis fictifs et fonctions utilitaires.
   Chaque produit référence UNE image : images/products/<id>.png
   (ex. tshirt-casual-homme-01.png). Si l'image est absente, un placeholder
   propre s'affiche (voir CM.imgFallback dans main.js).
   ========================================================================== */
(function (global) {
  'use strict';

  /* ---------- Palette officielle (Fiche décisionnelle n°2) ---------- */
  const COLORS = {
    rouge:  { label: 'Rouge écarlate',    hex: '#FF3030' },
    orange: { label: 'Orange sanguin',    hex: '#FF6F16' },
    jaune:  { label: 'Jaune maïs',        hex: '#FFE91F' },
    vert:   { label: 'Vert clair',        hex: '#4FD443' },
    ciel:   { label: 'Bleu ciel',         hex: '#38B5EB' },
    mer:    { label: 'Bleu de mer',       hex: '#1A04A4' },
    violet: { label: 'Violet lumineux',   hex: '#5E17EB' },
    rose:   { label: 'Rose marshmallow',  hex: '#EB7BBF' }
  };

  /** Convertit un code hexadécimal en teinte (0-360°). */
  function hexToHue(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    if (d === 0) return 0;
    let h;
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    return h < 0 ? h + 360 : h;
  }
  Object.keys(COLORS).forEach(function (k) { COLORS[k].hue = hexToHue(COLORS[k].hex); });

  /** Filtre CSS qui transforme la couleur de base d'un produit vers une autre couleur. */
  function colorFilter(baseKey, targetKey) {
    const delta = COLORS[targetKey].hue - COLORS[baseKey].hue;
    let f = 'hue-rotate(' + delta + 'deg) saturate(1.1)';
    if (targetKey === 'mer') f += ' brightness(0.82)';
    if (targetKey === 'jaune') f += ' brightness(1.05)';
    return f;
  }

  /* ---------- Gammes, catégories, rayons ---------- */
  const LINES = {
    casual:    { label: 'Casual',    tagline: 'Le style de tous les jours',  desc: 'Des basiques colorés et confortables pour la ville, le week-end et tout ce qu’il y a entre les deux.' },
    olympus:   { label: 'Olympus',   tagline: 'Le sport, version caméléon',  desc: 'Des tenues techniques et respirantes qui changent de couleur à l’effort et à l’envie.' },
    corporate: { label: 'Corporate', tagline: 'Le bureau, en couleurs',      desc: 'Costumes, cravates et ceintures élégants : un seul costume pour tous les dress codes.' },
    spartiate: { label: 'Spartiate', tagline: 'Camouflage adaptatif',        desc: 'Sous-marque Chromatch : des tenues de camouflage qui s’adaptent à chaque terrain.' },
    chromini:  { label: 'Chromini',  tagline: 'Enfants et bébés',            desc: 'La gamme enfants et bébés (0-14 ans) : douce, solide et amusante. Un vêtement qui grandit avec leurs envies de couleurs.' }
  };

  const CATEGORIES = {
    tshirt:     { label: 'T-shirts',   single: 'T-shirt',   price: 60 },
    pantalon:   { label: 'Pantalons',  single: 'Pantalon',  price: 99.99 },
    chaussures: { label: 'Chaussures', single: 'Chaussures', price: 150 },
    chemise:    { label: 'Chemises',   single: 'Chemise',   price: 79.90 },
    costume:    { label: 'Costumes',   single: 'Costume',   price: 225 },
    veste:      { label: 'Vestes',     single: 'Veste',     price: 92 },
    cravate:    { label: 'Cravates',   single: 'Cravate',   price: 29.90 },
    ceinture:   { label: 'Ceintures',  single: 'Ceinture',  price: 39.90 }
  };

  const GENDERS = { homme: 'Homme', femme: 'Femme', unisexe: 'Unisexe', enfant: 'Enfant' };

  /* Prix « finaux » du PDF projet : T-shirt 60 €, pantalon 99,99 €, chaussures 150 €,
     chemise 79,90 €, costume 225 €, veste 92 €.
     Prix déduits (non fournis dans le PDF) : cravate 29,90 €, ceinture 39,90 €,
     enfants ≈ -40 %, sport allégé (short, legging) et Spartiate renforcé (veste, rangers). */

  /* ---------- Matières et entretien par type de produit ---------- */
  const MATERIALS = {
    tshirt:     '95 % coton biologique épais (220 g/m²), 5 % élasthanne, traitement thermochromique Chromatch',
    pantalon:   '97 % coton biologique sergé, 3 % élasthanne, traitement thermochromique Chromatch',
    chaussures: 'Tige en toile de coton bio et cuir végétal, semelle en caoutchouc recyclé, pigments thermochromiques',
    chemise:    '100 % coton biologique, tissage serré, traitement thermochromique Chromatch',
    costume:    '65 % laine recyclée, 35 % polyester recyclé, doublure viscose, traitement thermochromique Chromatch',
    veste:      '98 % coton biologique épais, 2 % élasthanne, doublure recyclée, traitement thermochromique Chromatch',
    cravate:    '100 % polyester recyclé tissé serré, traitement thermochromique Chromatch',
    ceinture:   'Cuir végétal (liège et coton enduit) et boucle en acier recyclé'
  };
  const MATERIALS_LINE = {
    olympus:   'Polyester recyclé respirant (88 %) et élasthanne (12 %), séchage rapide, traitement thermochromique Chromatch',
    spartiate: 'Coton-polyamide renforcé (ripstop), impression camouflage thermochromique Chromatch',
    chromini:  'Coton biologique doux certifié, sans substance irritante, pigments thermochromiques Chromatch'
  };
  const CARE_DEFAULT = 'Lavage en machine à 30 °C maximum, cycle délicat. Sans adoucissant ni javel. Séchage à plat ou à basse température. Repassage doux (110 °C max) à l’envers. Données fictives.';

  /* ---------- Fabrique de produits ---------- */
  const PRODUCTS = [];

  /**
   * P(catégorie, gamme, rayon, n°, nom, couleurBase, description, visuel, options)
   *  - id = catégorie-gamme-rayon-n°  → image images/products/<id>.png
   *  - visuel = description de l'image (utilisée pour générer prompts_images.txt)
   */
  function P(cat, line, gender, nn, name, base, desc, visual, opt) {
    opt = opt || {};
    const id = [cat, line, gender, nn].join('-');
    PRODUCTS.push({
      id: id,
      name: name,
      category: cat,
      line: line,
      gender: gender,
      price: opt.price != null ? opt.price : CATEGORIES[cat].price,
      image: 'images/products/' + id + '.png',
      baseColor: base,
      colors: opt.colors || (line === 'corporate' ? ['mer', 'violet', 'ciel', 'rouge', 'vert', 'rose'] : Object.keys(COLORS)),
      description: desc,
      features: opt.features || [],
      material: opt.material || ((MATERIALS_LINE[line] && cat !== 'ceinture' && cat !== 'chaussures') ? MATERIALS_LINE[line] : MATERIALS[cat]),
      care: CARE_DEFAULT,
      badge: opt.badge || '',
      featured: !!opt.featured,
      visual: visual,
      order: PRODUCTS.length
    });
  }

  /* ===== CASUAL ===== */
  P('tshirt', 'casual', 'homme', '01', 'T-shirt Chroma Classic', 'orange',
    'Notre produit phare : le T-shirt qui change de couleur. Coupe droite, jersey épais et doux, coutures renforcées. Un seul T-shirt, toutes vos humeurs.',
    'T-shirt à col rond côtelé et manches courtes, coupe droite (regular), jersey de coton épais, coutures de renfort visibles aux épaules, ourlet net',
    { badge: 'Best-seller', featured: true, features: ['Produit phare Chromatch', 'Coutures renforcées', 'Coton biologique'] });
  P('tshirt', 'casual', 'femme', '01', 'T-shirt Chroma Fit', 'rose',
    'Coupe ajustée et col légèrement dégagé : le T-shirt féminin qui passe du bureau à la soirée en changeant de teinte.',
    'T-shirt ajusté à col rond légèrement dégagé, manches courtes, coupe près du corps, longueur à la taille, ourlet net',
    { featured: true, features: ['Coupe ajustée', 'Tissu doux', 'Coton biologique'] });
  P('tshirt', 'casual', 'unisexe', '01', 'T-shirt Oversize Prisme', 'ciel',
    'Un T-shirt oversize aux épaules tombantes, pour toutes les morphologies. Sa couleur évolue au fil de la journée.',
    'T-shirt oversize aux épaules tombantes, col rond côtelé épais, manches mi-longues larges, ourlet droit',
    { badge: 'Nouveau', features: ['Coupe oversize', 'Unisexe', 'Coton biologique'] });
  P('tshirt', 'casual', 'femme', '02', 'T-shirt Col V Aurore', 'jaune',
    'Col V et coupe fluide pour un look léger. Idéal sous une veste, parfait seul.',
    'T-shirt à col V, manches courtes, coupe fluide, bas légèrement arrondi',
    { features: ['Col V', 'Coupe fluide'] });
  P('pantalon', 'casual', 'homme', '01', 'Chino Horizon', 'mer',
    'Le chino indémodable, coupe droite et confortable. Un seul pantalon pour toutes vos tenues.',
    'Pantalon chino coupe droite, ceinture à passants, poches italiennes, braguette zippée, coutures apparentes',
    { featured: true, features: ['Coupe droite', 'Stretch confort'] });
  P('pantalon', 'casual', 'femme', '01', 'Pantalon Mirage Taille Haute', 'violet',
    'Taille haute, jambe droite fluide : il change de couleur sans changer de tombé.',
    'Pantalon taille haute à jambe droite fluide, pinces devant, fermeture latérale discrète, ceinture large',
    { features: ['Taille haute', 'Jambe droite'] });
  P('pantalon', 'casual', 'unisexe', '01', 'Cargo Urbain', 'vert',
    'Un cargo moderne aux grandes poches pratiques, pour la ville comme pour la rando urbaine.',
    'Pantalon cargo coupe droite, deux grandes poches latérales à rabat, cordon de serrage aux chevilles',
    { features: ['Grandes poches', 'Unisexe'] });
  P('chaussures', 'casual', 'unisexe', '01', 'Sneakers Chroma Low', 'rouge',
    'Les sneakers basses qui changent de couleur : semelle gomme épaisse, confort toute la journée.',
    'Sneakers basses en toile épaisse et cuir végétal, lacets plats, semelle gomme blanche épaisse, vue de trois quarts',
    { badge: 'Best-seller', featured: true, features: ['Semelle gomme recyclée', 'Unisexe'] });
  P('chaussures', 'casual', 'unisexe', '02', 'Baskets Montantes Spectre', 'ciel',
    'Des baskets montantes au maintien parfait, pour un style urbain affirmé.',
    'Baskets montantes à lacets avec empiècement sur la cheville, semelle cupsole blanche, vue de trois quarts',
    { features: ['Maintien cheville', 'Unisexe'] });
  P('chemise', 'casual', 'homme', '01', 'Chemise Lin Mistral', 'vert',
    'Une chemise en lin respirant, décontractée et élégante. Parfaite pour l’été et pour les changements de couleur.',
    'Chemise à manches longues en lin, col classique, boutons nacrés, poche poitrine, coupe décontractée',
    { features: ['Lin respirant', 'Coupe décontractée'] });
  P('chemise', 'casual', 'femme', '01', 'Chemise Popeline Zéphyr', 'rose',
    'Popeline de coton légère et coupe légèrement oversize pour un style effortless.',
    'Chemise en popeline de coton, col classique, boutons discrets, coupe légèrement oversize, manches longues',
    { features: ['Popeline de coton', 'Coupe oversize'] });
  P('veste', 'casual', 'unisexe', '01', 'Bomber Éclipse', 'violet',
    'Le bomber iconique, doublé et zippé, qui change de couleur selon votre humeur.',
    'Blouson bomber zippé, col et poignets côtelés, deux poches latérales zippées, doublure visible au col',
    { badge: 'Nouveau', featured: true, features: ['Doublure recyclée', 'Unisexe'] });
  P('veste', 'casual', 'homme', '01', 'Veste Harrington Nuance', 'mer',
    'Une veste légère à col montant et fermeture zippée, pour les mi-saisons.',
    'Veste légère type Harrington à col montant, fermeture zippée, deux poches plaquées, poignets élastiques',
    { features: ['Col montant', 'Légère'] });
  P('veste', 'casual', 'femme', '01', 'Veste Denim Lumière', 'ciel',
    'Une veste courte en denim bio, boutons métal, qui change de couleur sans perdre son allure.',
    'Veste courte en denim, col chemise, boutons métal, deux poches poitrine, coupe cropped',
    { features: ['Denim bio', 'Coupe courte'] });

  /* ===== OLYMPUS (sport) ===== */
  P('tshirt', 'olympus', 'homme', '01', 'T-shirt Olympus Sprint', 'rouge',
    'T-shirt technique respirant, séchage rapide, panneaux d’aération dans le dos. La couleur suit votre effort.',
    'T-shirt technique de sport à manches courtes, tissu respirant, panneaux d’aération en maille dans le dos, coutures plates',
    { features: ['Séchage rapide', 'Panneaux d’aération'] });
  P('tshirt', 'olympus', 'femme', '01', 'T-shirt Olympus Pulse', 'violet',
    'T-shirt de running coupe ajustée, dos allongé et bande réfléchissante discrète.',
    'T-shirt de running femme ajusté, dos légèrement plus long, fine bande réfléchissante, manches courtes, coutures plates',
    { badge: 'Nouveau', features: ['Bande réfléchissante', 'Respirant'] });
  P('pantalon', 'olympus', 'homme', '01', 'Jogging Olympus Tempo', 'mer',
    'Jogging fuselé, poches zippées et bas resserré : le confort pour l’entraînement comme pour la détente.',
    'Pantalon de jogging fuselé, taille élastique avec cordon, poches zippées, bas resserré aux chevilles',
    { price: 89.90, features: ['Poches zippées', 'Léger'] });
  P('pantalon', 'olympus', 'femme', '01', 'Legging Olympus Flex', 'violet',
    'Legging taille haute compressif et opaque, avec poche discrète pour le téléphone.',
    'Legging de sport taille haute, tissu compressif opaque, ceinture large plate, petite poche discrète',
    { price: 79.90, featured: true, features: ['Taille haute', 'Opaque', 'Poche téléphone'] });
  P('pantalon', 'olympus', 'unisexe', '01', 'Short Olympus Rush', 'vert',
    'Short léger aux côtés fendus, avec sous-short intégré, pour courir sans se poser de questions.',
    'Short de sport léger au-dessus du genou, ceinture élastique, côtés légèrement fendus, doublure intégrée',
    { price: 59.90, features: ['Sous-short intégré', 'Ultra-léger'] });
  P('chaussures', 'olympus', 'unisexe', '01', 'Running Olympus Vélocité', 'jaune',
    'Chaussures de running légères, mesh respirant et semelle amortissante, pour les longues distances colorées.',
    'Chaussures de running légères, tige en mesh respirant, semelle intermédiaire épaisse amortissante, vue de trois quarts',
    { featured: true, features: ['Mesh respirant', 'Amorti renforcé'] });
  P('chaussures', 'olympus', 'unisexe', '02', 'Training Olympus Titan', 'orange',
    'Stabilité et accroche pour la salle : semelle plate crantée et tige renforcée.',
    'Chaussures de training stables, tige renforcée, semelle plate crantée, vue de trois quarts',
    { features: ['Semelle stable', 'Tige renforcée'] });
  P('veste', 'olympus', 'unisexe', '01', 'Coupe-vent Olympus Aéro', 'ciel',
    'Coupe-vent ultra-léger à capuche, repliable dans sa poche. Parfait pour les sorties matinales.',
    'Veste coupe-vent ultra-légère à capuche, zip intégral, poches zippées, panneau d’aération dans le dos',
    { features: ['Ultra-léger', 'Capuche'] });
  P('veste', 'olympus', 'homme', '01', 'Veste Olympus Podium', 'rouge',
    'Veste de survêtement zippée à col montant, deux fines bandes sur les manches.',
    'Veste de survêtement zippée à col montant, deux fines bandes contrastées sur les manches, poches zippées',
    { features: ['Col montant', 'Poches zippées'] });

  /* ===== CORPORATE (travail) ===== */
  P('costume', 'corporate', 'homme', '01', 'Costume Corporate Prestige', 'mer',
    'Le costume deux pièces qui change de couleur : un seul achat pour tous vos rendez-vous. Il coûte moins cher que chemise + pantalon + veste achetés séparément.',
    'Costume deux pièces homme : veste droite à un bouton, revers cranté, poches à rabat, pantalon assorti, coupe classique, présenté sur mannequin invisible',
    { badge: 'Économique', featured: true, features: ['2 pièces', 'Doublure viscose', 'Moins cher que les pièces séparées'] });
  P('costume', 'corporate', 'femme', '01', 'Tailleur Corporate Élégance', 'violet',
    'Le tailleur féminin deux pièces : veste ajustée et pantalon droit, élégance et couleurs à volonté.',
    'Tailleur femme deux pièces : veste ajustée à un bouton, col tailleur, pantalon droit assorti, présenté sur mannequin invisible',
    { features: ['2 pièces', 'Coupe ajustée'] });
  P('costume', 'corporate', 'homme', '02', 'Costume Corporate Slim Signature', 'violet',
    'Une coupe slim pour les silhouettes modernes, avec la même technologie de changement de couleur.',
    'Costume deux pièces homme coupe slim : veste cintrée à deux boutons, revers cranté, pantalon fuselé assorti, présenté sur mannequin invisible',
    { badge: 'Nouveau', features: ['Coupe slim', '2 pièces'] });
  P('chemise', 'corporate', 'homme', '01', 'Chemise Business Oxford', 'ciel',
    'Chemise en oxford de coton, col boutonné et coupe ajustée, la base d’un look professionnel.',
    'Chemise à manches longues en tissu oxford, col boutonné, coupe ajustée, poignets mousquetaire',
    { features: ['Oxford de coton', 'Col boutonné'] });
  P('chemise', 'corporate', 'femme', '01', 'Chemisier Business Satiné', 'rose',
    'Un chemisier satiné aux boutons cachés, pour une allure soignée toute la journée.',
    'Chemisier femme satiné à manches longues, col classique, boutons cachés, coupe fluide',
    { features: ['Satiné', 'Boutons cachés'] });
  P('pantalon', 'corporate', 'homme', '01', 'Pantalon de Costume Corporate', 'mer',
    'Pantalon de costume à pinces avec pli marqué, à porter seul ou avec sa veste.',
    'Pantalon de costume homme à pinces, ceinture à passants, ligne de repassage marquée, ourlet droit',
    { features: ['À pinces', 'Pli marqué'] });
  P('pantalon', 'corporate', 'femme', '01', 'Pantalon Cigarette Corporate', 'violet',
    'Coupe cigarette ajustée à la cheville, élégante et confortable.',
    'Pantalon cigarette femme, taille haute, jambe étroite arrêtée à la cheville, fermeture latérale discrète',
    { features: ['Coupe cigarette', 'Taille haute'] });
  P('veste', 'corporate', 'femme', '01', 'Blazer Corporate Signature', 'rouge',
    'Un blazer structuré à porter avec n’importe quel pantalon. Osez la couleur au bureau.',
    'Blazer femme structuré à un bouton, col tailleur, poches à rabat, épaules légèrement marquées',
    { features: ['Structuré', 'Doublé'] });
  P('veste', 'corporate', 'homme', '01', 'Veste de Costume Classique', 'mer',
    'La veste de costume vendue seule, pour composer vos propres associations.',
    'Veste de costume homme droite à un bouton, revers cranté, poches à rabat, doublure intérieure',
    { features: ['Doublée', 'Revers cranté'] });
  P('cravate', 'corporate', 'unisexe', '01', 'Cravate Corporate Classique', 'rouge',
    'La cravate qui change de couleur pour s’assortir à chaque chemise. Largeur classique 8 cm.',
    'Cravate classique de 8 cm de large, nouée, présentée à plat et légèrement droite, tissu finement texturé',
    { price: 29.90, features: ['8 cm', 'Polyester recyclé'], colors: ['mer', 'violet', 'ciel', 'rouge', 'vert', 'rose', 'orange', 'jaune'] });
  P('cravate', 'corporate', 'unisexe', '02', 'Cravate Corporate Slim', 'violet',
    'La version slim 6 cm pour un look moderne.',
    'Cravate slim de 6 cm de large, nouée, présentée à plat et légèrement droite, tissu finement texturé',
    { price: 29.90, features: ['6 cm', 'Polyester recyclé'], colors: ['mer', 'violet', 'ciel', 'rouge', 'vert', 'rose', 'orange', 'jaune'] });
  P('ceinture', 'corporate', 'unisexe', '01', 'Ceinture Cuir Corporate', 'orange',
    'Ceinture en cuir végétal lisse, boucle en acier recyclé. Elle suit la couleur de votre tenue.',
    'Ceinture en cuir lisse, boucle métal argenté rectangulaire, présentée enroulée en spirale',
    { price: 39.90, features: ['Cuir végétal', 'Boucle acier recyclé'] });
  P('ceinture', 'corporate', 'unisexe', '02', 'Ceinture Tressée Corporate', 'vert',
    'Une ceinture tressée élastique pour un confort total au bureau.',
    'Ceinture tressée élastique avec boucle métal discrète, présentée enroulée en spirale',
    { price: 34.90, features: ['Tressée', 'Élastique'] });
  P('chaussures', 'corporate', 'homme', '01', 'Derbies Corporate', 'mer',
    'Derbies en cuir végétal lisse, bout rond et semelle fine pour un look sobre et coloré.',
    'Chaussures derby à lacets en cuir lisse, bout rond, semelle fine, vue de trois quarts',
    { features: ['Cuir végétal', 'Semelle fine'] });
  P('chaussures', 'corporate', 'femme', '01', 'Escarpins Corporate', 'rouge',
    'Escarpins à talon moyen de 6 cm, confortables pour une journée entière.',
    'Escarpins femme à talon moyen de 6 cm, bout arrondi, cuir lisse, vue de trois quarts',
    { features: ['Talon 6 cm', 'Cuir végétal'] });

  /* ===== SPARTIATE (sous-marque militaire / camouflage) ===== */
  P('tshirt', 'spartiate', 'homme', '01', 'T-shirt Spartiate Camo', 'vert',
    'Le T-shirt camouflage dont les motifs changent de teinte selon le terrain.',
    'T-shirt à col rond et manches courtes, motif camouflage en taches de vert clair, vert moyen et vert foncé, coupe droite',
    { features: ['Motif camouflage', 'Résistant'] });
  P('pantalon', 'spartiate', 'homme', '01', 'Treillis Spartiate', 'vert',
    'Treillis robuste en ripstop, poches cargo, renforts aux genoux et chevilles ajustables.',
    'Pantalon treillis à motif camouflage, poches cargo à rabat, renforts aux genoux, chevilles ajustables par cordon',
    { features: ['Ripstop', 'Renforts genoux'] });
  P('veste', 'spartiate', 'unisexe', '01', 'Veste Field Spartiate', 'vert',
    'Veste de terrain à quatre poches à rabat, zip et pressions, camouflage adaptatif.',
    'Veste de terrain à motif camouflage, col montant, quatre poches à rabat, fermeture zip et pressions',
    { price: 109.90, features: ['4 poches', 'Ripstop'] });
  P('veste', 'spartiate', 'homme', '01', 'Parka Spartiate Hiver', 'vert',
    'Parka longue doublée à capuche : chaude, robuste et camouflée.',
    'Parka longue à capuche, motif camouflage, doublure matelassée, poches à rabat, fermeture zip et pressions',
    { price: 129, badge: 'Nouveau', features: ['Doublée', 'Capuche'] });
  P('chaussures', 'spartiate', 'unisexe', '01', 'Rangers Spartiate', 'vert',
    'Rangers montantes en toile camouflage et cuir, semelle crantée pour tous les terrains.',
    'Rangers montantes en toile camouflage et cuir, lacets, semelle crantée épaisse, vue de trois quarts',
    { price: 169.90, features: ['Semelle crantée', 'Montantes'] });
  P('chemise', 'spartiate', 'homme', '01', 'Chemise Tactique Spartiate', 'vert',
    'Chemise tactique à manches retroussables et poches poitrine à rabat.',
    'Chemise tactique à manches longues, motif camouflage, poches poitrine à rabat, manches retroussables avec patte',
    { features: ['Manches retroussables', 'Ripstop'] });
  P('ceinture', 'spartiate', 'unisexe', '01', 'Ceinturon Tactique Spartiate', 'vert',
    'Ceinturon en sangle avec boucle à dégagement rapide.',
    'Ceinturon tactique en sangle camouflage avec boucle à dégagement rapide, présenté enroulé',
    { price: 44.90, features: ['Boucle rapide', 'Sangle renforcée'] });

  /* ===== CHROMINI (enfants et bébés) — proposition pour le « ? » du PDF ===== */
  P('tshirt', 'chromini', 'enfant', '01', 'T-shirt Chromini Arc-en-Ciel', 'orange',
    'Le T-shirt enfant qui change de couleur : doux, solide et très amusant.',
    'T-shirt enfant (taille 6-8 ans) à col rond et manches courtes, coupe droite, jersey de coton doux',
    { price: 35, badge: 'Best-seller', featured: true, features: ['Coton bio doux', 'Résistant aux jeux'] });
  P('tshirt', 'chromini', 'enfant', '02', 'T-shirt Chromini Explorateur', 'ciel',
    'Pour les petits aventuriers : coupe confortable et coutures plates.',
    'T-shirt enfant (taille 6-8 ans) à col rond et manches courtes, coupe confortable, coutures plates',
    { price: 35, features: ['Coutures plates', 'Coton bio doux'] });
  P('tshirt', 'chromini', 'enfant', '03', 'Body Bébé Chromini', 'jaune',
    'Body bébé doux à col américain et boutons-pression, certifié sans substance irritante.',
    'Body de bébé à manches courtes, col américain croisé, boutons-pression entre les jambes, coton très doux',
    { price: 29.90, features: ['Boutons-pression', '0-24 mois'] });
  P('pantalon', 'chromini', 'enfant', '01', 'Jogger Chromini', 'vert',
    'Jogger souple à taille élastique, il suit les enfants partout.',
    'Pantalon jogger enfant (taille 6-8 ans) à taille élastique et bas resserré, poches latérales',
    { price: 59.90, features: ['Taille élastique', 'Poches'] });
  P('pantalon', 'chromini', 'enfant', '02', 'Short Chromini Été', 'rose',
    'Short léger pour les journées ensoleillées et les récrés colorées.',
    'Short enfant (taille 6-8 ans) léger à ceinture élastique, poches latérales, au-dessus du genou',
    { price: 44.90, features: ['Léger', 'Taille élastique'] });
  P('chaussures', 'chromini', 'enfant', '01', 'Baskets Chromini', 'violet',
    'Baskets à scratch faciles à enfiler, semelle souple et antidérapante.',
    'Baskets enfant à scratch, tige en toile, semelle souple antidérapante, vue de trois quarts',
    { price: 89.90, features: ['Scratch', 'Semelle antidérapante'] });
  P('veste', 'chromini', 'enfant', '01', 'Blouson Chromini', 'rouge',
    'Un blouson zippé léger et résistant pour toutes les saisons.',
    'Blouson enfant (taille 6-8 ans) zippé, col côtelé, deux poches latérales, doublure légère',
    { price: 59.90, features: ['Zippé', 'Doublure légère'] });
  P('chemise', 'chromini', 'enfant', '01', 'Chemise Chromini', 'ciel',
    'Une chemise enfant facile à porter, pour les jours de fête.',
    'Chemise enfant (taille 6-8 ans) à manches longues, col classique, boutons, coton doux',
    { price: 49.90, features: ['Coton doux', 'Col classique'] });

  /* ---------- Tailles ---------- */
  function range(a, b, step) { const r = []; for (let i = a; i <= b; i += (step || 1)) r.push(String(i)); return r; }
  function sizesFor(p) {
    if (p.category === 'cravate') return ['Taille unique'];
    if (p.gender === 'enfant') {
      if (p.id.indexOf('chromini-enfant-03') > -1 && p.category === 'tshirt') return ['3 mois', '6 mois', '12 mois', '18 mois', '24 mois'];
      if (p.category === 'chaussures') return range(28, 38);
      return ['4 ans', '6 ans', '8 ans', '10 ans', '12 ans', '14 ans'];
    }
    if (p.category === 'ceinture') return ['85 cm', '90 cm', '95 cm', '100 cm', '105 cm', '110 cm', '115 cm'];
    if (p.category === 'chaussures') {
      if (p.gender === 'homme') return range(39, 46);
      if (p.gender === 'femme') return range(36, 42);
      return range(36, 46);
    }
    if (p.category === 'costume') return p.gender === 'femme' ? range(34, 46, 2) : range(46, 58, 2);
    if (p.category === 'pantalon') {
      if (p.gender === 'homme') return range(38, 50, 2);
      if (p.gender === 'femme') return range(34, 46, 2);
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    }
    return p.gender === 'femme' ? ['XS', 'S', 'M', 'L', 'XL'] : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  }
  PRODUCTS.forEach(function (p) { p.sizes = sizesFor(p); });

  /* ---------- Avis fictifs (générés de façon déterministe) ---------- */
  const REVIEW_NAMES = ['Camille D.', 'Yanis B.', 'Léa M.', 'Hugo R.', 'Inès K.', 'Maxime T.', 'Sarah L.', 'Thomas P.', 'Emma V.', 'Nathan C.', 'Chloé F.', 'Lucas G.'];
  const REVIEW_TEXTS = [
    ['Super concept !', 'Je n’y croyais pas trop, mais le changement de couleur est vraiment bluffant. Tissu épais et agréable.'],
    ['Très bonne qualité', 'Les coutures sont solides et la matière est douce. Après plusieurs lavages, la couleur tient toujours.'],
    ['Je recommande', 'Taille conforme, confortable toute la journée. Mes amis m’ont tous demandé où je l’avais acheté.'],
    ['Original et pratique', 'Un seul vêtement pour plusieurs looks, c’est parfait pour voyager léger.'],
    ['Joli rendu', 'Les couleurs sont éclatantes. J’aurais aimé une teinte de plus, mais je suis très content(e).'],
    ['Plaisir à porter', 'Coupe agréable, livraison rapide. Le prix est correct vu la technologie.'],
    ['Au top', 'Une vraie alternative à la fast-fashion. Je vais compléter ma garde-robe petit à petit.'],
    ['Bonne surprise', 'Le tissu est plus épais que prévu, ça fait vraiment qualité. Je prendrai d’autres modèles.']
  ];
  function hash(str) { let h = 0; for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; } return Math.abs(h); }
  function reviewsFor(p) {
    const h = hash(p.id);
    const out = [];
    for (let i = 0; i < 3; i++) {
      const t = REVIEW_TEXTS[(h + i * 3) % REVIEW_TEXTS.length];
      out.push({
        author: REVIEW_NAMES[(h + i * 5) % REVIEW_NAMES.length],
        rating: i === 2 ? 4 : 5,
        title: t[0],
        text: t[1],
        date: ['12/10/2026', '03/11/2026', '18/11/2026'][i]
      });
    }
    return out;
  }
  PRODUCTS.forEach(function (p) {
    const h = hash(p.id);
    p.rating = Math.round((4.2 + (h % 8) / 10) * 10) / 10; // 4,2 à 4,9
    p.reviewCount = 12 + (h % 230);
    p.reviews = reviewsFor(p);
  });

  /* ---------- Utilitaires ---------- */
  function getProduct(id) { return PRODUCTS.find(function (p) { return p.id === id; }) || null; }

  /** Produits associés : même gamme d'abord, puis même catégorie. */
  function relatedProducts(p, n) {
    n = n || 4;
    const same = PRODUCTS.filter(function (q) { return q.id !== p.id && q.line === p.line && q.category !== p.category; });
    const cat = PRODUCTS.filter(function (q) { return q.id !== p.id && q.category === p.category && q.line !== p.line; });
    return same.concat(cat).slice(0, n);
  }

  function formatPrice(v) {
    return v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  }

  /** Total des pièces séparées (chemise + pantalon + veste) vs costume : argument de vente du PDF. */
  function costumeSaving() {
    const separate = CATEGORIES.chemise.price + CATEGORIES.pantalon.price + CATEGORIES.veste.price;
    return { separate: separate, costume: CATEGORIES.costume.price, saving: Math.round((separate - CATEGORIES.costume.price) * 100) / 100 };
  }

  global.CMData = {
    COLORS: COLORS, LINES: LINES, CATEGORIES: CATEGORIES, GENDERS: GENDERS, PRODUCTS: PRODUCTS,
    getProduct: getProduct, relatedProducts: relatedProducts, colorFilter: colorFilter,
    formatPrice: formatPrice, costumeSaving: costumeSaving, hexToHue: hexToHue
  };
})(window);
