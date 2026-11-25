# Chromatch — site vitrine / boutique en ligne (projet fictif)

> **Site de démonstration** réalisé pour un atelier marketing scolaire : la marque, les produits, les prix, les boutiques et les avis sont inventés. Aucune donnée n'est enregistrée ni envoyée, aucun paiement n'est réel.

Site 100 % statique : **HTML + CSS + JavaScript pur**, sans framework, sans build, sans backend. Il fonctionne tel quel sur **GitHub Pages**.

## Arborescence

```
index.html                 Accueil
404.html                   Page d'erreur 404 (GitHub Pages la sert automatiquement)
prompts_images.txt         Prompts pour générer les images produits (à donner à ChatGPT)
css/style.css              Feuille de style unique
js/
  products.js              Catalogue (53 produits), palette, gammes, avis fictifs
  stores.js                20 boutiques fictives (+10 au n° de rue), GPS, formule de Haversine
  cart.js                  Panier, codes promo, mois dynamique, totaux (localStorage)
  components.js            Header, footer, mini-panier, pop-up cookies et promo (injectés partout)
  main.js                  Utilitaires, cartes produit, héros animé, accueil
  shop.js                  Boutique : filtres, tri, recherche
  product.js               Fiche produit
  cart-page.js             Page panier
  checkout.js              Tunnel de paiement fictif (Luhn, expiration, Apple Pay factice)
  confirmation.js          Page de confirmation
  forms.js                 Compte fictif, connexion fictive, contact fictif
  stores-page.js           Leaflet + OpenStreetMap + Nominatim (boutique la plus proche)
  pages.js                 Promo, gammes, fidélité, simulateur de chaleur, lookbook
images/
  logo1.png, logo2.png     Logos d'origine (non modifiés)
  logo1-trim.png …         Versions recadrées / fond transparent utilisées par le site
  favicon.png
  products/                Images produits (nom = identifiant du produit) + placeholder.svg
pages/                     boutique, produit, panier, commande, confirmation, compte, connexion,
                           boutiques, promo, technologie, ecologie, fidelite, gammes, a-propos,
                           contact, faq, lookbook, mentions-legales, cgv, confidentialite
outils/generer-prompts.js  (optionnel) régénère prompts_images.txt depuis js/products.js
```

Tous les liens sont **relatifs**. L'en-tête, le pied de page et les pop-ups sont écrits une seule fois (`js/components.js`) et injectés sur chaque page.

## Tester en local

Ouvrez un terminal dans le dossier du site, puis :

```bash
python3 -m http.server 8000      # ou : npx serve .
```

et allez sur <http://localhost:8000>. (Évitez le double-clic sur `index.html` : certaines fonctions, comme la géolocalisation, demandent http/https.)

Pour revoir la fenêtre de cookies, effacez le stockage local du site (outils de développement → Application → Stockage local) ou utilisez le lien « Gérer les cookies » du pied de page.

## Mettre en ligne sur GitHub Pages

1. Créez un compte sur <https://github.com> puis un nouveau dépôt **public** (par exemple `chromatch`).
2. Envoyez-y **tout le contenu** du dossier (le fichier `index.html` doit être à la racine du dépôt) : bouton *Add file → Upload files*, ou avec git :
   ```bash
   git init && git add . && git commit -m "Site Chromatch"
   git branch -M main
   git remote add origin https://github.com/VOTRE-PSEUDO/chromatch.git
   git push -u origin main
   ```
3. Dans le dépôt : **Settings → Pages → Build and deployment → Source : « Deploy from a branch »**, branche `main`, dossier `/ (root)` → **Save**.
4. Après 1 à 2 minutes, le site est disponible sur `https://VOTRE-PSEUDO.github.io/chromatch/`.

Page 404 : si votre dépôt s'appelle `VOTRE-PSEUDO.github.io` (site à la racine), ouvrez `404.html` et mettez `var BASE = '/';` pour que les liens fonctionnent depuis n'importe quelle adresse inexistante.

## Ajouter les images produits

1. Générez les images avec `prompts_images.txt` (une conversation ChatGPT par gamme, logos joints pour les T-shirts).
2. **Renommez** chaque image avec le nom exact indiqué (ex. `tshirt-casual-homme-01.png`) et déposez-la dans `images/products/`.
3. Tant qu'une image est absente, un placeholder propre s'affiche (le filtre de couleur fonctionne aussi dessus).

La couleur affichée est modifiée par filtre CSS (`hue-rotate`) à partir de la **couleur de base** de chaque image (indiquée dans le prompt) : respectez donc cette couleur.

## Personnalisation rapide

- **Mois à thème (juin = Mois des fiertés, octobre = Octobre rose)** : pour les désactiver, ajoutez `window.CM_THEMED_MONTHS = false;` avant le chargement de `cart.js`, ou modifiez `monthInfo()` dans `js/cart.js`.
- **Seuil de livraison offerte, frais, TVA, codes promo** : `js/cart.js` (constantes `SHIPPING`, `VAT_RATE`, fonction `findPromo`).
- **Produits, prix, couleurs, tailles** : `js/products.js` (une ligne `P(...)` par produit).
- **Boutiques** : `js/stores.js`.

Codes promo fictifs : `COLOR` + nom du mois en majuscules (ex. `COLORNOVEMBRE`, −15 %), `BIENVENUE10` (−10 %), `LIVRAISON` (livraison offerte).

## Services externes (CDN)

Google Fonts (Montserrat), Leaflet 1.9.4 (unpkg) et tuiles OpenStreetMap, API Nominatim (géocodage d'adresse, côté client). Rien d'autre.

## Accessibilité

Lien d'évitement, libellés de formulaire, messages d'erreur annoncés (`aria-live`), navigation clavier et focus visible, fenêtres modales avec piège de focus, `prefers-reduced-motion` respecté, contrastes élevés.
