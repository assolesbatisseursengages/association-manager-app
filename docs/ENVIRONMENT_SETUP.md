# Configuration des Variables d'Environnement

Ce document explique comment configurer les variables d'environnement pour le déploiement sur Vercel ou tout autre plateforme.

## Variables Requises

### Base de Données
- **DATABASE_URL**: Chaîne de connexion MySQL au format `mysql://user:password@host:port/database_name`

### Authentification
- **JWT_SECRET**: Clé secrète pour signer les tokens JWT (générer une chaîne aléatoire forte)
- **OAUTH_SERVER_URL**: URL du serveur OAuth (ex: `https://api.manus.im`)
- **VITE_OAUTH_PORTAL_URL**: URL du portail OAuth (ex: `https://oauth.manus.im`)

### Configuration OAuth
- **VITE_APP_ID**: ID de l'application OAuth fourni par le fournisseur
- **OWNER_OPEN_ID**: OpenID du propriétaire de l'application
- **OWNER_NAME**: Nom du propriétaire

### APIs Externes
- **BUILT_IN_FORGE_API_URL**: URL de l'API Forge (ex: `https://api.manus.im`)
- **BUILT_IN_FORGE_API_KEY**: Clé API pour l'accès serveur
- **VITE_FRONTEND_FORGE_API_URL**: URL de l'API Forge pour le frontend
- **VITE_FRONTEND_FORGE_API_KEY**: Clé API pour l'accès frontend

### Branding
- **VITE_APP_TITLE**: Titre de l'application (ex: `Association Manager`)
- **VITE_APP_LOGO**: URL du logo de l'application

### Analytics (Optionnel)
- **VITE_ANALYTICS_ENDPOINT**: URL du service d'analytics
- **VITE_ANALYTICS_WEBSITE_ID**: ID du site pour le tracking

## Configuration pour Vercel

### Méthode 1: Interface Web Vercel

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. Cliquer sur "Settings" → "Environment Variables"
4. Ajouter chaque variable avec sa valeur
5. Sélectionner les environnements (Production, Preview, Development)
6. Cliquer sur "Save"

### Méthode 2: Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Ajouter une variable d'environnement
vercel env add DATABASE_URL
# Entrer la valeur quand demandé

# Lister les variables
vercel env ls
```

### Méthode 3: Fichier .env.local (Développement)

```bash
# Créer le fichier
cp .env.example .env.local

# Éditer avec vos valeurs
nano .env.local
```

## Exemple de Configuration

```env
# Database
DATABASE_URL=mysql://admin:password123@db.example.com:3306/association_db

# JWT
JWT_SECRET=your_very_secure_random_string_here_min_32_chars

# OAuth
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=your_app_id_from_oauth_provider
OWNER_OPEN_ID=owner_open_id_value
OWNER_NAME=Administrator

# APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key_here
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_api_key

# Branding
VITE_APP_TITLE=Association Manager
VITE_APP_LOGO=https://example.com/logo.png

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=website_id_123
```

## Générer des Valeurs Sécurisées

### Générer JWT_SECRET

```bash
# Sur Linux/Mac
openssl rand -base64 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Générer une clé API forte

```bash
# Sur Linux/Mac
openssl rand -hex 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Vérification de la Configuration

Après avoir configuré les variables:

1. **Localement**:
   ```bash
   pnpm dev
   # Vérifier que l'application démarre sans erreurs
   ```

2. **Sur Vercel**:
   - Vérifier les logs de build: `vercel logs --follow`
   - Vérifier que l'application démarre: visiter l'URL de production
   - Vérifier les erreurs: ouvrir la console du navigateur

## Dépannage

### Erreur: "Cannot connect to database"
- Vérifier le format de `DATABASE_URL`
- Vérifier que la base de données est accessible depuis Vercel
- Vérifier les pare-feu et les règles d'accès

### Erreur: "Invalid JWT"
- Vérifier que `JWT_SECRET` est configuré et identique en dev et prod
- Régénérer `JWT_SECRET` si nécessaire

### Erreur: "OAuth failed"
- Vérifier `VITE_APP_ID` et `OWNER_OPEN_ID`
- Vérifier les URLs OAuth (`OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`)

### Erreur: "API Key invalid"
- Vérifier `BUILT_IN_FORGE_API_KEY` et `VITE_FRONTEND_FORGE_API_KEY`
- Vérifier les URLs des APIs

## Sécurité

⚠️ **Important**: 
- Ne jamais commiter les fichiers `.env` ou `.env.local`
- Ne jamais partager les clés API ou secrets
- Utiliser des valeurs différentes pour dev et production
- Régulièrement rotationner les clés API
- Utiliser des variables d'environnement pour tous les secrets

## Ressources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Drizzle ORM Connection Strings](https://orm.drizzle.team/docs/get-started-mysql)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
