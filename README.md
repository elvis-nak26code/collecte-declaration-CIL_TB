# Tableau de bord CIL — SOFITEX

Projet Vite + React contenant uniquement le tableau de bord CIL (accès externe
par clé API, sans login) qui appelle `/api/cil-externe/**` sur le back-end
Spring Boot.

## Installation

```bash
npm install
```

## Lancement en développement

```bash
npm run dev
```

Le site s'ouvre sur http://localhost:5173. Le back-end est attendu sur
`http://localhost:8080` (voir la constante `BASE` dans `src/Tb_CIL.jsx`).

## Build de production

```bash
npm run build
npm run preview
```

## Clé API

Aucune clé n'est codée en dur dans le projet. Au premier lancement, l'écran
de connexion demande de coller la clé (`cil_live_...`) : elle reste en
mémoire (état React) le temps de la session et n'est jamais persistée
(pas de localStorage, pas de fichier).

## CORS

Le back-end doit autoriser l'origine `http://localhost:5173` pour les
routes `/api/cil-externe/**` (en-tête `X-API-KEY`), sinon les appels
`fetch` échoueront avec une erreur CORS dans la console du navigateur.
