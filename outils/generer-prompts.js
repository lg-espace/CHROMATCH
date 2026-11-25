#!/usr/bin/env node
/* ==========================================================================
   Outil optionnel (non nécessaire à la mise en ligne du site)
   Génère prompts_images.txt à partir du catalogue js/products.js, afin que les
   noms de fichiers des prompts correspondent EXACTEMENT à ceux utilisés par le site.

   Utilisation (Node.js 16+) :   node outils/generer-prompts.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'js', 'products.js'), 'utf8'), sandbox);
const D = sandbox.window.CMData;

/* ---------- Bloc de style commun (identique pour TOUTES les images) ---------- */
const STYLE = [
  'STYLE COMMUN (à respecter exactement) : photographie e-commerce haut de gamme d’un vêtement ou accessoire,',
  'vue de face strictement frontale (exception : chaussures en vue de trois quarts, toujours du même angle),',
  'produit présenté sur mannequin invisible « ghost mannequin » ou à plat (aucun corps, aucune tête, aucune main, aucun visage visible),',
  'produit centré, cadrage CARRÉ 1:1 (1024 x 1024 px) avec une marge d’environ 10 % autour du produit,',
  'fond uni gris très clair / blanc cassé (#F4F4F1), sans dégradé, sans sol ni décor,',
  'éclairage studio doux et diffus, venant de face et légèrement du dessus, ombre portée très légère sous le produit,',
  'netteté élevée, texture du tissu visible, réalisme photographique, mêmes proportions et même taille apparente pour tous les produits,',
  'aucun texte, aucun filigrane, aucune étiquette ni cintre visible, aucun accessoire parasite.'
].join(' ');

const GAMME_STYLE = {
  casual: 'Ambiance décontractée et urbaine, finitions soignées.',
  olympus: 'Esprit sportif et technique : lignes dynamiques, matières techniques respirantes, coutures plates.',
  corporate: 'Esprit élégant et professionnel : coupe nette, finitions impeccables, tissu tombant.',
  spartiate: 'Esprit militaire / terrain : matière robuste (ripstop), détails fonctionnels.',
  chromini: 'Vêtement pour enfant ou bébé, taille enfant, matières douces, aspect joyeux mais sobre.'
};

const LOGO_TEXT = 'LOGO DE LA MARQUE à reproduire fidèlement d’après l’image jointe : le logo Chromatch est petit, net et placé à hauteur du cœur, côté gauche de la poitrine du porteur (donc à DROITE sur l’image vue de face), comme sur un polo de marque, taille d’environ 5 cm. Il se compose d’un « C » noir entouré de rayons arrondis multicolores (rouge, orange, jaune, vert, bleu clair, bleu foncé, violet, rose). Aucun autre texte ni motif sur le vêtement.';

function colorText(p) {
  const c = D.COLORS[p.baseColor];
  if (p.line === 'spartiate' && p.category !== 'ceinture' || p.id.indexOf('spartiate') > -1) {
    return 'COULEUR AFFICHÉE : motif camouflage dominé par un vert clair vif (' + c.hex + '), avec des taches de vert moyen et de vert foncé ; teintes nettes et saturées.';
  }
  return 'COULEUR AFFICHÉE : ' + c.label.toLowerCase() + ' (' + c.hex + '), une teinte vive, saturée et uniforme sur tout le produit (les éléments neutres comme semelles, boutons ou boucle restent blancs, noirs ou métalliques).';
}

const cats = D.CATEGORIES, lines = D.LINES, genders = D.GENDERS;
let out = '';
out += '################################################################################\n';
out += '# PROMPTS D’IMAGES — CHROMATCH (' + D.PRODUCTS.length + ' images)\n';
out += '# À donner à ChatGPT (génération d’images). Fichier généré par outils/generer-prompts.js\n';
out += '################################################################################\n#\n';
out += '# CONSEILS D’UTILISATION\n';
out += '# 1. Ouvrez une NOUVELLE conversation par lot (par exemple une conversation par gamme : Casual, Olympus,\n';
out += '#    Corporate, Spartiate, Chromini). Cela garde le style homogène.\n';
out += '# 2. Au début de chaque lot, joignez logo1.png (et/ou logo2.png), surtout pour les T-SHIRTS : ChatGPT doit\n';
out += '#    voir le vrai logo pour le reproduire fidèlement (un « C » noir entouré de rayons arrondis multicolores).\n';
out += '# 3. Copiez-collez UN prompt à la fois (de « PROMPT : » jusqu’au prochain « # NOM DU FICHIER »). Chaque\n';
out += '#    prompt contient déjà le bloc de style commun ; vous pouvez aussi le coller seul au début de la conversation.\n';
out += '# 4. Après la 1re image, ajoutez pour les suivantes : « Même style, même fond, même éclairage, même cadrage\n';
out += '#    que l’image précédente ». Régénérez si le fond, l’angle, la taille ou la couleur ne sont pas homogènes.\n';
out += '# 5. ChatGPT ne sait pas nommer les fichiers : RENOMMEZ chaque image avec le NOM EXACT indiqué dans la ligne\n';
out += '#    « # NOM DU FICHIER », au format PNG, puis placez-la dans le dossier images/products/ du site.\n';
out += '#    (S’il vous donne du .webp ou du .jpg, convertissez en .png ou renommez soigneusement l’extension.)\n';
out += '# 6. Le site change la couleur d’affichage par filtre CSS à partir de la couleur de base de chaque image :\n';
out += '#    respectez donc bien la couleur demandée (teinte vive et saturée), c’est elle qui sert de référence.\n';
out += '# 7. Tant qu’une image est absente, le site affiche automatiquement un placeholder propre.\n#\n';
out += '# BLOC DE STYLE COMMUN (déjà inclus dans chaque prompt ci-dessous) :\n';
out += '# ' + STYLE.replace(/(.{1,100})(\s|$)/g, '$1\n# ').trim() + '\n#\n';
out += '################################################################################\n\n';

const order = ['casual', 'olympus', 'corporate', 'spartiate', 'chromini'];
order.forEach(function (line) {
  out += '################################################################################\n';
  out += '# GAMME ' + lines[line].label.toUpperCase() + ' — ' + lines[line].tagline + '\n';
  out += '################################################################################\n\n';
  D.PRODUCTS.filter(function (p) { return p.line === line; }).forEach(function (p) {
    const file = p.id + '.png';
    out += '# NOM DU FICHIER : ' + file + '\n';
    if (p.category === 'tshirt') {
      out += '# RAPPEL : joignez logo1.png ou logo2.png dans ChatGPT pour qu’il reproduise fidèlement le logo sur la poitrine (côté cœur).\n';
    }
    out += '# (' + p.name + ' — ' + cats[p.category].single + ' ' + genders[p.gender].toLowerCase() + ', gamme ' + lines[line].label + ')\n';
    out += 'PROMPT :\n';
    let prompt = STYLE + '\n';
    prompt += 'PRODUIT : ' + cats[p.category].single + ' « ' + p.name + ' » de la gamme ' + lines[line].label + ' (' + genders[p.gender].toLowerCase() + '). ';
    prompt += 'DESCRIPTION : ' + p.visual + '. ';
    prompt += 'MATIÈRE : ' + p.material.split(', traitement')[0].split(', pigments')[0].split(', impression')[0] + ' (aspect tissu réaliste). ';
    prompt += GAMME_STYLE[line] + '\n';
    prompt += colorText(p) + '\n';
    if (p.category === 'tshirt') prompt += LOGO_TEXT + '\n';
    else prompt += 'Aucun logo ni texte visible sur le produit.\n';
    out += prompt + '\n';
  });
});

out += '################################################################################\n';
out += '# CHECKLIST DES ' + D.PRODUCTS.length + ' FICHIERS À OBTENIR (dossier images/products/)\n';
out += '################################################################################\n';
D.PRODUCTS.forEach(function (p) { out += '#  [ ] ' + p.id + '.png\n'; });

fs.writeFileSync(path.join(root, 'prompts_images.txt'), out);
console.log('prompts_images.txt généré :', D.PRODUCTS.length, 'prompts,', out.length, 'caractères');
