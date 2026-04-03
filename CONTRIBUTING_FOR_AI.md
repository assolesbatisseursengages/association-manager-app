# Guide de Contribution pour les IA (Claude, GPT, etc.)

Bienvenue! Ce document explique comment travailler sur cette application de gestion d'association via GitHub et la déployer sur Vercel.

## Vue d'ensemble du projet

**Association Manager App** est une application complète de gestion administrative pour les associations, construite avec:
- **Frontend**: React 19 + Tailwind CSS 4 + TypeScript
- **Backend**: Express 4 + tRPC 11 + Drizzle ORM
- **Database**: MySQL/TiDB
- **Hosting**: Vercel (pour ce déploiement)

## Architecture

```
association-manager-app/
├── client/                 # Application React (frontend)
│   ├── src/
│   │   ├── pages/         # Pages de l'application
│   │   ├── components/    # Composants réutilisables
│   │   ├── lib/           # Utilitaires et configuration tRPC
│   │   └── App.tsx        # Routeur principal
│   └── index.html
├── server/                # Backend Express
│   ├── routers/           # Procédures tRPC
│   ├── db.ts              # Helpers de base de données
│   ├── routers.ts         # Configuration tRPC
│   └── _core/             # Infrastructure (auth, context, etc.)
├── drizzle/               # Schéma et migrations
│   └── schema.ts          # Définition des tables
├── shared/                # Code partagé client/server
├── package.json
├── vercel.json            # Configuration Vercel
└── todo.md                # Tâches du projet
```

## Démarrage local

### Prérequis
- Node.js 22+
- pnpm (package manager)
- MySQL/TiDB accessible

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/djimax/association-manager-app.git
cd association-manager-app

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs (DATABASE_URL, JWT_SECRET, etc.)

# Générer et appliquer les migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Démarrer le serveur de développement
pnpm dev
```

L'application sera accessible à `http://localhost:5173` (client) et `http://localhost:3000` (server).

## Workflow de développement

### 1. Créer une nouvelle fonctionnalité

**Étape 1: Mettre à jour le schéma de base de données**
```bash
# Éditer drizzle/schema.ts pour ajouter/modifier les tables
# Puis générer la migration:
pnpm drizzle-kit generate

# Vérifier le fichier SQL généré dans drizzle/
# Appliquer la migration:
pnpm drizzle-kit migrate
```

**Étape 2: Ajouter les helpers de base de données**
```typescript
// Dans server/db.ts, ajouter des fonctions pour interroger les données:
export async function getMyData(id: number) {
  const db = await getDb();
  return db.select().from(myTable).where(eq(myTable.id, id));
}
```

**Étape 3: Créer les procédures tRPC**
```typescript
// Dans server/routers.ts ou server/routers/feature.ts:
export const myRouter = router({
  list: publicProcedure.query(async () => {
    return getMyData();
  }),
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      // Créer la ressource
    }),
});
```

**Étape 4: Créer l'interface utilisateur**
```typescript
// Dans client/src/pages/MyFeature.tsx:
import { trpc } from "@/lib/trpc";

export default function MyFeature() {
  const { data, isLoading } = trpc.myRouter.list.useQuery();
  const createMutation = trpc.myRouter.create.useMutation();
  
  // Implémenter l'UI avec shadcn/ui components
}
```

**Étape 5: Ajouter les tests**
```typescript
// Dans server/my-feature.test.ts:
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("myRouter", () => {
  it("should list items", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.myRouter.list();
    expect(Array.isArray(result)).toBe(true);
  });
});
```

Exécuter les tests:
```bash
pnpm test
```

**Étape 6: Mettre à jour todo.md**
```markdown
## Phase X - Ma Nouvelle Fonctionnalité
- [x] Ajouter la table à la base de données
- [x] Créer les helpers db
- [x] Implémenter les procédures tRPC
- [x] Créer l'interface utilisateur
- [x] Ajouter les tests
```

### 2. Committer et pousser vers GitHub

```bash
# Ajouter les changements
git add -A

# Committer avec un message descriptif
git commit -m "Ajout de la fonctionnalité X avec tests"

# Pousser vers main
git push origin main
```

### 3. Déployer sur Vercel

#### Option A: Déploiement automatique (recommandé)
1. Connecter le dépôt GitHub à Vercel
2. Configurer les variables d'environnement dans les paramètres Vercel
3. Chaque push vers `main` déclenche un déploiement automatique

#### Option B: Déploiement manuel
```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel
```

## Variables d'environnement pour Vercel

Configurer les variables suivantes dans les paramètres Vercel:

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | Chaîne de connexion MySQL | `mysql://user:pass@host/db` |
| `JWT_SECRET` | Clé secrète pour les sessions | `your_secret_key_here` |
| `OAUTH_SERVER_URL` | URL du serveur OAuth | `https://api.manus.im` |
| `VITE_APP_ID` | ID de l'application OAuth | `your_app_id` |
| `VITE_OAUTH_PORTAL_URL` | URL du portail OAuth | `https://oauth.manus.im` |
| `OWNER_NAME` | Nom du propriétaire | `Administrator` |
| `OWNER_OPEN_ID` | OpenID du propriétaire | `owner_id` |
| `BUILT_IN_FORGE_API_URL` | URL de l'API Forge | `https://api.manus.im` |
| `BUILT_IN_FORGE_API_KEY` | Clé API Forge | `your_api_key` |
| `VITE_FRONTEND_FORGE_API_URL` | URL API Forge (frontend) | `https://api.manus.im` |
| `VITE_FRONTEND_FORGE_API_KEY` | Clé API Forge (frontend) | `your_frontend_key` |
| `VITE_APP_TITLE` | Titre de l'application | `Association Manager` |
| `VITE_APP_LOGO` | URL du logo | `https://example.com/logo.png` |

## Commandes utiles

```bash
# Développement
pnpm dev              # Démarrer le serveur de développement
pnpm build            # Construire pour la production
pnpm start            # Démarrer le serveur de production
pnpm test             # Exécuter les tests

# Base de données
pnpm drizzle-kit generate    # Générer les migrations
pnpm drizzle-kit migrate     # Appliquer les migrations
pnpm drizzle-kit push        # Pousser les changements de schéma

# Linting et formatage
pnpm format           # Formater le code avec Prettier
pnpm check            # Vérifier les types TypeScript
```

## Structure des tables principales

### users
Table des utilisateurs OAuth Manus. Chaque utilisateur a un rôle (admin, gestionnaire, lecteur).

### members
Adhérents de l'association avec statut, rôle et groupe d'appartenance.

### member_groups
Groupes/antennes locales (N'Djaména, Moundou, Cameroun, etc.). Chaque groupe a un responsable.

### documents
Documents de l'association organisés par catégories.

### cotisations, dons, depenses, transactions
Données financières de l'association.

### projects, tasks
Gestion de projets et tâches.

### crm_contacts, crm_activities
Module CRM pour gérer les contacts et activités.

## Bonnes pratiques

1. **Toujours écrire des tests** - Chaque nouvelle fonctionnalité doit avoir des tests vitest
2. **Utiliser les types TypeScript** - Éviter `any`, utiliser les types stricts
3. **Mettre à jour todo.md** - Tracker l'état de chaque fonctionnalité
4. **Commiter régulièrement** - Petits commits avec messages clairs
5. **Tester localement** - Vérifier que tout fonctionne avant de pousser
6. **Documenter les changements** - Ajouter des commentaires pour les logiques complexes

## Dépannage

### Erreur: "Table doesn't exist"
- Vérifier que les migrations ont été appliquées: `pnpm drizzle-kit migrate`
- Vérifier la variable `DATABASE_URL`

### Erreur: "Cannot find module"
- Réinstaller les dépendances: `pnpm install`
- Vérifier les imports (chemins relatifs vs alias `@/`)

### Erreur de compilation TypeScript
- Exécuter `pnpm check` pour voir tous les erreurs
- Vérifier les types des variables et fonctions

### Déploiement Vercel échoue
- Vérifier les variables d'environnement dans Vercel
- Vérifier les logs de build: `vercel logs`
- Vérifier que le `DATABASE_URL` est accessible depuis Vercel

## Ressources

- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vercel Documentation](https://vercel.com/docs)

## Support

Pour toute question ou problème, consultez le fichier `todo.md` pour voir les tâches en cours et les améliorations prévues.

---

Bon développement! 🚀
