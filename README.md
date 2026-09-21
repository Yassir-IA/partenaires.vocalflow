# Partenaires VocalFlow — page courte (marque blanche)

Site statique (HTML / CSS / JS vanilla, **zéro build**) implémentant la maquette Claude Design
`design-source/Partenaires VocalFlow.dc.html` (projet Claude Design `abb2c831-3675-422e-83d5-17e1c4adf299`).
Prêt pour GitHub + Vercel, sur le même modèle que le dossier voisin `Landing Page - VocalFlow`.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | La page (4 sections : hero, test en direct, témoignages, accès partenaire + pied de page) |
| `styles.css` | Styles : jetons de couleur dans `:root`, `@font-face` Inter, animations, responsive, pages légales et 404 |
| `main.js` | Halo qui suit la souris, démo en 3 étapes (agent → formulaire → numéro), lien Calendly centralisé, webhook de leads (optionnel) |
| `mentions-legales.html` | Mentions légales |
| `politique-confidentialite.html` | Politique de confidentialité (RGPD), adaptée à cette page (prénom + email + appels à l'agent + Calendly + Gumlet) |
| `404.html` | Page introuvable (Vercel la sert automatiquement) |
| `assets/fonts/inter.woff2` | Inter variable (400–800, sous-ensemble latin) auto-hébergée, licence OFL jointe |
| `assets/vocalflow-logo*.png/webp` | Logo recadré : 240 px (hero, pied de page, nav des pages légales) et 1600 px (JSON-LD) |
| `assets/og.jpg` | Aperçu 1200×630 pour LinkedIn / WhatsApp |
| `assets/icons/`, `favicon.ico`, `site.webmanifest` | Favicon multi-tailles, icônes 192/512, apple-touch-icon |
| `vercel.json` | `cleanUrls`, en-têtes de sécurité (CSP, HSTS, Permissions-Policy…), cache des assets |
| `.vercelignore` | Exclut du déploiement `design-source/`, ce README et les fichiers Git |
| `robots.txt`, `sitemap.xml` | Indexation (domaine `partenaires.vocal-flow.fr`, voir « Domaine ») |
| `design-source/` | Bundle Claude Design d'origine — référence pour les mises à jour, non déployée |

Tous les chemins sont absolus (`/styles.css`, `/assets/…`) : les pages fonctionnent à la racine comme en URL propre.

## Mettre à jour depuis Claude Design

La maquette Claude Design est la **source de vérité**. Quand elle change :

1. Demander à Claude Code de « mettre à jour la page depuis Claude Design ». Il relit le projet via DesignSync,
   compare avec `design-source/Partenaires VocalFlow.dc.html`, puis reporte les changements dans `index.html` /
   `styles.css` / `main.js` et remplace la copie dans `design-source/`.
2. Si DesignSync renvoie une erreur d'autorisation : lancer une fois `/design-login` dans un Claude Code interactif
   (terminal). Sans la commande `claude` installée, le binaire de l'extension Cursor fonctionne :
   `"%USERPROFILE%\.cursor\extensions\anthropic.claude-code-<version>-win32-x64\resources\native-binary\claude.exe"`.

## Prévisualiser en local

Les chemins étant absolus, ouvrir `index.html` en double-clic ne charge pas les styles : il faut un petit serveur HTTP à la racine.

```bash
npx --yes serve .            # http://localhost:3000 — gère aussi les URL propres (/mentions-legales)
# ou
python -m http.server 8000   # http://localhost:8000 — utiliser /mentions-legales.html
```

## Mettre en ligne (GitHub → Vercel)

> ⚠️ Ce dossier est dans OneDrive. Git + OneDrive cohabitent mal (fichiers verrouillés, conflits de synchro sur `.git`).
> Recommandé : copier le projet **hors** de OneDrive avant de travailler avec Git, ou exclure le dossier de la synchro.

```bash
git init -b main
git add -A
git commit -m "Page partenaires VocalFlow"
# Créer un dépôt vide sur GitHub (ex. Yassir-IA/Partenaires_vocalflow), puis :
git remote add origin https://github.com/<compte>/<depot>.git
git push -u origin main
```

Sur [vercel.com](https://vercel.com) → **Add New… → Project** → importer le dépôt.
Framework Preset : **Other**, aucune commande de build, Output Directory vide (racine). Déployer.
Chaque `git push` sur `main` redéploie automatiquement ; chaque branche/PR a son URL de prévisualisation.

Après le premier déploiement, vérifier (Git Bash) :

```bash
curl -sI https://<domaine>/ | grep -i content-security-policy        # attendu : la CSP de vercel.json
curl -sI https://<domaine>/assets/fonts/inter.woff2 | grep -i cache   # attendu : max-age=31536000, immutable
curl -sI https://<domaine>/mentions-legales | head -1                 # attendu : HTTP/2 200 (cleanUrls)
```

## Domaine

Les URLs absolues supposent **https://partenaires.vocal-flow.fr** (hypothèse : sous-domaine du site principal — **à confirmer**).
Si le domaine est différent : remplacer `partenaires.vocal-flow.fr` dans `index.html` (canonical, `og:url`, `og:image`, JSON-LD),
`mentions-legales.html`, `politique-confidentialite.html` (canonical), `robots.txt` et `sitemap.xml`.

```bash
grep -rl "partenaires.vocal-flow.fr" --include=*.html --include=*.txt --include=*.xml .
```

Dans Vercel : *Settings → Domains* → ajouter le domaine ; Vercel gère HTTPS. Pour un sous-domaine, ajouter chez le registrar
un enregistrement CNAME `partenaires` → `cname.vercel-dns.com` (Vercel affiche la valeur exacte).

## À personnaliser

- **Lien Calendly** : `CALENDLY_URL` dans `main.js` (`https://calendly.com/contact-vocal-flow/appel-d-acces-vocalflow`).
  L'iframe d'`index.html` a aussi l'URL en dur (repli sans JS). Les paramètres de couleur (`background_color`, `text_color`,
  `primary_color`) sont ceux de la maquette.
- **Démo en direct** : le bouton « Lancer l'appel » affiche un formulaire prénom + email, puis le numéro `+33 1 89 31 60 89`
  (lien `tel:` dans `index.html`). Chaque lead est gardé dans le `localStorage` du visiteur (clé `vocalflow_leads`).
- **Webhook de leads** : `LEAD_WEBHOOK` dans `main.js` pointe vers le workflow n8n « VocalFlow — Leads démo partenaires (page marque blanche) »
  (`https://n8n.srv959719.hstgr.cloud/webhook/partenaires-demo-lead`). Chaque lead `{ prenom, email, date, source }` est validé (syntaxe), dédoublonné (30 jours), vérifié par
  Bouncer (usebouncer.com, identifiant n8n « Bouncer », en-tête x-api-key), ajouté au Google Sheet « Leads VocalFlow - Landing page » (onglet « Liste leads : Partenaires Marque blanches », colonnes Date, Prénom, Email, Source, Bouncer (validé ou non)) et signalé par
  email à contact@vocal-flow.fr. Tous les leads vont dans le Sheet ; la colonne Bouncer vaut ✅ (deliverable), ❌ (undeliverable, risky, unknown) ou ❔ (API indisponible), et l'alerte reprend ce verdict. L'origine n8n est autorisée dans `connect-src` (`vercel.json`) ; changer d'URL impose de mettre à jour les deux.
- **Témoignages** : un seul pour l'instant (Déyann Geraldes, Alloconduite, vidéo Gumlet). Pour en ajouter, dupliquer
  l'`<article class="temo__card">` dans `index.html` : la grille passe automatiquement en 2 puis 3 colonnes. À partir de 2
  témoignages, retirer le bloc `.temo__soon` (« D'autres agences partenaires témoignent bientôt »), comme le fait la maquette.
  Une nouvelle plateforme vidéo doit être ajoutée à `frame-src` dans `vercel.json`.
- **Identité légale** (SIRET, adresse, TVA) : `mentions-legales.html` et `politique-confidentialite.html`.
- **Logo** : la maquette affiche un PNG 400 × 400 dont le glyphe occupe 54,5 % de la hauteur ; le site utilise un PNG recadré,
  donc les hauteurs CSS valent 0,545 × celles de la maquette (44 → 24 px dans le hero, 28 → 15 px au pied de page).

## Écarts assumés avec la maquette

- **Responsive** : la maquette définit ses règles mobile sous 768 px (bloc `@media` + attributs `data-m`) ; elles sont reportées
  telles quelles dans `styles.css` (hero compact, titres 30/38 px, grilles sur une colonne, coches empilées, numéro 34 px, Calendly 760 px).
- **Police** : Inter est servie depuis le site au lieu de Google Fonts (RGPD, pas d'appel tiers).
- **Pied de page** : liens « Mentions légales » et « Confidentialité » ajoutés (obligatoires en France) ; la maquette n'a que le logo et le copyright.
- **Accessibilité ajoutée** : labels invisibles sur les champs, focus déplacé vers le formulaire puis vers le numéro révélé,
  `role="list"` sur les listes stylées, lien d'évitement.
- **Mouvement réduit** : non géré volontairement. Si Windows a « Effets d'animation » désactivé, les animations jouent quand même, comme dans Claude Design.
- **Contraste** : les gris de la maquette `#77748f` / `#6d6a85` (petits textes) sont sous le seuil AA 4,5:1 ; conservés par fidélité.

## Sécurité / vie privée

- La CSP de `vercel.json` n'autorise que le site lui-même + les iframes `calendly.com` et `play.gumlet.io` (témoignage vidéo).
  **Tout nouveau script, police, iframe ou webhook externe** doit y être ajouté, sinon il sera bloqué silencieusement.
  Pas de style inline dans le HTML (`style-src 'self'`) : les styles dynamiques passent par des classes ou `element.style` en JS.
- `Permissions-Policy` refuse caméra, micro, géolocalisation, paiement et USB (la démo passe par un appel téléphonique, pas par le navigateur).
- HSTS est envoyé sans `preload`. À ajouter seulement après confirmation du domaine et inscription volontaire sur hstspreload.org.
- Le calendrier Calendly et la vidéo Gumlet posent leurs propres cookies : mentionné dans la politique de confidentialité.
