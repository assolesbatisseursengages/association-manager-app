# Les Bâtisseurs Engagés - Application de Gestion Associative

Application web complète pour la gestion d'associations, développée avec React, Node.js et TypeScript.

## 🚀 Déploiement sur Render.com

### Prérequis
- Compte Render.com
- Repository GitHub avec le code
- Base de données PostgreSQL (incluse dans Render)

### Étapes de déploiement

1. **Push sur GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Créer un service sur Render**
   - Connectez-vous à [Render.com](https://render.com)
   - Cliquez sur "New +" → "Web Service"
   - Connectez votre repository GitHub
   - Configurez le service avec les paramètres ci-dessous

### Configuration du Service Render

| Paramètre | Valeur |
|-----------|--------|
| **Name** | `les-batisseurs-engages` |
| **Environment** | `Node` |
| **Build Command** | `pnpm install && pnpm run build` |
| **Start Command** | `pnpm run start` |
| **Instance Type** | `Free` ou `Starter` |
| **Plan** | `Free` (pour commencer) |

### Variables d'Environnement sur Render

Dans le dashboard Render → Service → Environment, ajoutez :

```env
NODE_ENV=production
DATABASE_URL=postgresql://votre_db_render
JWT_SECRET=votre-secret-unique
CLOUDINARY_CLOUD_NAME=dcdioojkn
CLOUDINARY_API_KEY=549385714331523
CLOUDINARY_API_SECRET=LiLeFwu8nPP6US8mVGK-zwBPtCc
VITE_APP_ID=render-app-id
OWNER_NAME=Les Bâtisseurs Engagés
VITE_APP_TITLE=Les Bátisseurs Engagés
PORT=10000
```

### Base de Données

1. **Créer une base de données PostgreSQL** sur Render
2. **Copier la connection string** depuis le dashboard
3. **Ajouter la DATABASE_URL** dans les variables d'environnement

### Déploiement Automatique

Render déploiera automatiquement votre application à chaque push sur la branche configurée.

## 🌐 Accès à l'Application

Une fois déployée, votre application sera accessible à l'URL :
`https://les-batisseurs-engages.onrender.com`

## 🔧 Dépannage

- **Build échoue** : Vérifiez les logs dans le dashboard Render
- **Base de données** : Assurez-vous que la DATABASE_URL est correcte
- **Variables d'environnement** : Vérifiez que toutes les clés requises sont présentes

## 📱 Fonctionnalités

- Gestion des membres et adhésions
- Gestion financière et budget
- CRM et communication
- Gestion des documents
- Tableaux de bord personnalisables
