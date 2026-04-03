# Guide de Déploiement sur Vercel

Ce guide explique comment déployer l'application Association Manager sur Vercel.

## Prérequis

1. Un compte Vercel (https://vercel.com)
2. Un dépôt GitHub avec le code de l'application
3. Les variables d'environnement nécessaires (voir `docs/ENVIRONMENT_SETUP.md`)

## Étape 1: Connecter le dépôt GitHub à Vercel

### Option A: Via l'interface Vercel

1. Aller sur https://vercel.com/dashboard
2. Cliquer sur "Add New..." → "Project"
3. Sélectionner "Import Git Repository"
4. Chercher votre dépôt `association-manager-app`
5. Cliquer sur "Import"

### Option B: Via Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer le projet
vercel --prod
```

## Étape 2: Configurer les Variables d'Environnement

### Via l'interface Vercel

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. Cliquer sur "Settings" → "Environment Variables"
4. Ajouter les variables suivantes:

```
DATABASE_URL = mysql://user:password@host/database
JWT_SECRET = your_jwt_secret_here
OAUTH_SERVER_URL = https://api.manus.im
VITE_OAUTH_PORTAL_URL = https://oauth.manus.im
VITE_APP_ID = your_app_id
OWNER_OPEN_ID = your_owner_id
OWNER_NAME = Administrator
BUILT_IN_FORGE_API_URL = https://api.manus.im
BUILT_IN_FORGE_API_KEY = your_forge_api_key
VITE_FRONTEND_FORGE_API_URL = https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY = your_frontend_forge_api_key
VITE_APP_TITLE = Association Manager
VITE_APP_LOGO = https://example.com/logo.png
```

5. Sélectionner les environnements (Production, Preview, Development)
6. Cliquer sur "Save"

### Via Vercel CLI

```bash
# Ajouter une variable
vercel env add DATABASE_URL

# Ajouter plusieurs variables
vercel env add JWT_SECRET
vercel env add OAUTH_SERVER_URL
# ... etc
```

## Étape 3: Configurer le Build

Vercel devrait détecter automatiquement la configuration grâce au fichier `vercel.json`. Si ce n'est pas le cas:

1. Aller sur "Settings" → "Build & Development Settings"
2. Vérifier que:
   - **Framework**: Vite
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

## Étape 4: Déclencher le Déploiement

### Déploiement Automatique

Une fois connecté à GitHub, chaque push vers `main` déclenche automatiquement un déploiement.

```bash
# Faire des changements
git add -A
git commit -m "Mise à jour de la fonctionnalité X"
git push origin main

# Vercel détecte le push et démarre le build automatiquement
```

### Déploiement Manuel

```bash
# Redéployer manuellement
vercel --prod
```

## Étape 5: Vérifier le Déploiement

1. Aller sur https://vercel.com/dashboard
2. Cliquer sur votre projet
3. Vérifier le statut du déploiement:
   - 🟢 **Ready**: Déploiement réussi
   - 🟡 **Building**: En cours de construction
   - 🔴 **Failed**: Erreur lors du déploiement

4. Cliquer sur "Visit" pour accéder à l'application

## Dépannage

### Erreur: "Build failed"

**Vérifier les logs:**
```bash
vercel logs --follow
```

**Causes courantes:**
- Variables d'environnement manquantes
- Erreurs TypeScript
- Dépendances manquantes

**Solution:**
1. Vérifier les variables d'environnement
2. Exécuter `pnpm build` localement pour tester
3. Corriger les erreurs
4. Pousser les changements

### Erreur: "Cannot connect to database"

**Causes:**
- DATABASE_URL incorrect
- Base de données inaccessible depuis Vercel
- Pare-feu bloquant la connexion

**Solution:**
1. Vérifier le format de DATABASE_URL
2. Vérifier que la base de données accepte les connexions externes
3. Ajouter l'IP de Vercel à la liste blanche (si applicable)

### Erreur: "Module not found"

**Cause:** Dépendances manquantes

**Solution:**
```bash
# Vérifier que package.json est à jour
pnpm install

# Pousser les changements
git add -A
git commit -m "Mise à jour des dépendances"
git push origin main
```

### L'application démarre mais affiche une erreur

1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs JavaScript
3. Vérifier les erreurs réseau (onglet Network)
4. Vérifier les logs Vercel: `vercel logs`

## Monitoring et Logs

### Voir les logs en temps réel

```bash
vercel logs --follow
```

### Voir les logs d'un déploiement spécifique

```bash
vercel logs [deployment-url]
```

### Voir les erreurs de build

```bash
vercel logs --follow --build
```

## Optimisations

### Réduire le temps de build

1. **Utiliser le cache**: Vercel cache automatiquement les dépendances
2. **Optimiser les dépendances**: Supprimer les packages inutilisés
3. **Lazy loading**: Charger les modules à la demande

### Réduire la taille du bundle

```bash
# Analyser la taille du bundle
pnpm build

# Vérifier dist/
ls -lh dist/
```

## Domaine Personnalisé

### Ajouter un domaine personnalisé

1. Aller sur "Settings" → "Domains"
2. Cliquer sur "Add"
3. Entrer votre domaine (ex: `app.example.com`)
4. Suivre les instructions pour configurer les DNS
5. Vercel validera le domaine automatiquement

### Configurer un sous-domaine

```
app.example.com → Vercel
```

Ajouter un enregistrement CNAME dans votre DNS:
```
app CNAME cname.vercel-dns.com
```

## Rollback à une Version Précédente

### Via l'interface Vercel

1. Aller sur "Deployments"
2. Trouver le déploiement précédent
3. Cliquer sur "..." → "Promote to Production"

### Via Vercel CLI

```bash
# Lister les déploiements
vercel list

# Promouvoir un déploiement
vercel promote [deployment-url]
```

## Ressources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Vercel Troubleshooting](https://vercel.com/docs/troubleshooting)

## Support

Pour toute question:
1. Consulter la documentation Vercel
2. Vérifier les logs: `vercel logs --follow`
3. Consulter le fichier `CONTRIBUTING_FOR_AI.md` pour les bonnes pratiques
