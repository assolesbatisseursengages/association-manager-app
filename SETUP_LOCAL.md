# Configuration de l'Environnement Local

Guide complet pour configurer l'application **Les Bâtisseurs Engagés** sur votre machine locale après téléchargement du ZIP depuis GitHub.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18+) - [Télécharger](https://nodejs.org/)
- **npm** ou **pnpm** (inclus avec Node.js)
- **MySQL** ou une base de données compatible (optionnel pour le développement)
- **Git** (optionnel, pour les mises à jour)

## 🚀 Installation Rapide

### Sur Windows

1. **Extraire le ZIP** dans un dossier de votre choix
2. **Ouvrir PowerShell ou CMD** dans le dossier du projet
3. **Exécuter le script de setup** :
   ```bash
   .\setup.bat
   ```
4. **Suivre les instructions** affichées à l'écran

### Sur macOS/Linux

1. **Extraire le ZIP** dans un dossier de votre choix
2. **Ouvrir un terminal** dans le dossier du projet
3. **Rendre le script exécutable** :
   ```bash
   chmod +x setup.sh
   ```
4. **Exécuter le script de setup** :
   ```bash
   ./setup.sh
   ```
5. **Suivre les instructions** affichées à l'écran

## 🔧 Configuration Manuelle (Si les scripts ne fonctionnent pas)

### Étape 1 : Installer les Dépendances

```bash
# Avec npm
npm install

# Ou avec pnpm (recommandé)
pnpm install
```

### Étape 2 : Créer le Fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
# Database Configuration
DATABASE_URL=mysql://user:password@localhost:3306/batisseurs_db

# Authentication
JWT_SECRET=your-secret-key-here-change-in-production

# OAuth Configuration (from Manus)
VITE_APP_ID=your-app-id-from-manus
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key-from-manus
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key-from-manus

# Owner Information
OWNER_NAME=Your Organization Name
OWNER_OPEN_ID=your-open-id

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# Application Settings
VITE_APP_TITLE=Les Bâtisseurs Engagés
VITE_APP_LOGO=https://your-logo-url.png
```

### Étape 3 : Configurer la Base de Données

#### Option A : Utiliser SQLite (Plus Simple pour le Développement)

SQLite est déjà configuré par défaut. Aucune installation supplémentaire n'est nécessaire.

#### Option B : Utiliser MySQL

1. **Installer MySQL** :
   - Windows : [MySQL Installer](https://dev.mysql.com/downloads/installer/)
   - macOS : `brew install mysql`
   - Linux : `sudo apt-get install mysql-server`

2. **Créer une base de données** :
   ```sql
   CREATE DATABASE batisseurs_db;
   ```

3. **Mettre à jour `.env.local`** :
   ```env
   DATABASE_URL=mysql://root:password@localhost:3306/batisseurs_db
   ```

4. **Exécuter les migrations** :
   ```bash
   npm run db:migrate
   # ou
   pnpm run db:migrate
   ```

### Étape 4 : Obtenir les Identifiants Manus

Pour que l'authentification fonctionne, vous devez obtenir vos identifiants Manus :

1. Allez sur https://manus.im
2. Connectez-vous avec votre compte
3. Allez dans **Settings** → **Secrets** ou **Environment Variables**
4. Copiez les valeurs suivantes dans votre `.env.local` :
   - `VITE_APP_ID`
   - `BUILT_IN_FORGE_API_KEY`
   - `VITE_FRONTEND_FORGE_API_KEY`
   - Autres clés API nécessaires

### Étape 5 : Démarrer le Serveur de Développement

```bash
# Avec npm
npm run dev

# Ou avec pnpm
pnpm run dev
```

Le serveur démarrera sur `http://localhost:5173`

## 📱 Accéder à l'Application

1. **Ouvrir votre navigateur** et aller à `http://localhost:5173`
2. **Se connecter** avec vos identifiants
3. **Commencer à utiliser** l'application

## 🗄️ Commandes Utiles

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Construire pour la production
npm run build

# Exécuter les tests
npm run test

# Exécuter les migrations de base de données
npm run db:migrate

# Générer les migrations de base de données
npm run db:generate

# Vérifier les types TypeScript
npm run type-check

# Formater le code
npm run format

# Linter le code
npm run lint
```

## 🐛 Dépannage

### Erreur : "Port 5173 is already in use"

Le port est déjà utilisé par une autre application. Vous pouvez :

1. **Arrêter l'application** qui utilise le port
2. **Utiliser un autre port** :
   ```bash
   npm run dev -- --port 3000
   ```

### Erreur : "DATABASE_URL not found"

Assurez-vous que le fichier `.env.local` existe et contient `DATABASE_URL`.

### Erreur : "Cannot find module"

Réinstallez les dépendances :

```bash
rm -rf node_modules package-lock.json
npm install
```

### L'authentification ne fonctionne pas

Vérifiez que :
- `VITE_APP_ID` est correct
- `OAUTH_SERVER_URL` est correct
- Vous êtes connecté à internet

## 📚 Documentation Supplémentaire

- [README.md](./README.md) - Vue d'ensemble du projet
- [Template Documentation](./TEMPLATE_README.md) - Documentation du template
- [Manus Documentation](https://manus.im/docs) - Documentation Manus

## 💡 Conseils

1. **Utilisez pnpm** pour des installations plus rapides et plus efficaces
2. **Activez l'authentification Manus** pour accéder à toutes les fonctionnalités
3. **Testez en mode développement** avant de déployer en production
4. **Consultez les logs** en cas de problème (`npm run dev` affiche les erreurs)

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. Consultez les logs du serveur
2. Vérifiez que tous les prérequis sont installés
3. Vérifiez votre fichier `.env.local`
4. Contactez le support Manus : https://help.manus.im

---

**Bon développement ! 🎉**
