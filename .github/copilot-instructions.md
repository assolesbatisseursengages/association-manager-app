# GitHub Copilot Instructions — Association Manager App

## Project Overview

**Association Manager App** is a full-stack web application for managing associations administratively. Built with React 19 + TypeScript + Tailwind CSS (frontend), Express 4 + tRPC 11 + Drizzle ORM (backend), and MySQL/TiDB (database), deployed on Vercel.

**Key Links:**
- [CONTRIBUTING_FOR_AI.md](../CONTRIBUTING_FOR_AI.md) — Complete contribution guide
- [SETUP_LOCAL.md](../SETUP_LOCAL.md) — Local development setup
- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md) — Roadmap for new features

## Quick Start Commands

```bash
pnpm install              # Install dependencies
pnpm dev                  # Start dev server (auto-rebuild)
pnpm check                # Type check (tsc strict mode)
pnpm test                 # Run tests
pnpm build                # Production bundle
pnpm start                # Run production build
pnpm db:push              # Apply schema to database
pnpm db:generate          # Create migration files
pnpm db:reset             # Full database reset (dev only)
```

**Dev Workflow:** `pnpm dev` runs both client (Vite on 5173) and server (Express on 3000) in watch mode.

---

## Architecture & Patterns

### Folder Structure
```
association-manager-app/
├── server/            # Express + tRPC backend
│   ├── _core/         # tRPC init, auth, middleware, cookies
│   ├── routers/       # Domain routers (budgets, users, projects, etc.)
│   ├── routers.ts     # Main appRouter combining all
│   └── db.ts          # Database queries & types
├── client/src/        # React frontend
│   ├── _core/         # Hooks, trpc client, auth utilities
│   ├── pages/         # Page components
│   ├── components/    # Reusable UI components (forms, tables)
│   ├── lib/           # Utilities & trpc configuration
│   └── contexts/      # React contexts
├── shared/            # Shared code (Zod schemas, types, constants)
├── drizzle/           # Schema & migrations
│   └── schema.ts      # All 20+ tables defined here
└── docs/              # Additional documentation
```

### tRPC Router Pattern

All routers follow this structure:

```typescript
// server/routers/feature.ts
export const featureRouter = router({
  list: protectedProcedure
    .input(z.object({ /* optional filters */ }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db.select().from(featureTable).where(/* filter */);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const item = await db.select().from(featureTable).where(eq(featureTable.id, input.id));
      if (!item.length) throw new TRPCError({ code: "NOT_FOUND" });
      return item[0];
    }),

  create: protectedProcedure
    .input(featureSchema)
    .mutation(async ({ input, ctx }) => {
      // Check permissions: role-based or user-based
      if (ctx.user?.role !== "admin" && ctx.user?.id !== input.ownerId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [result] = await db.insert(featureTable).values(input);
      return result;
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), ...featureSchema.shape }))
    .mutation(async ({ input, ctx }) => {
      // Check ownership/permission first
      const existing = await getFeatureById(input.id);
      if (existing.createdBy !== ctx.user?.id && ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [updated] = await db.update(featureTable).set(input).where(eq(featureTable.id, input.id));
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Check ownership/permission first
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(featureTable).where(eq(featureTable.id, input.id));
      return { success: true };
    }),
});

// server/routers.ts - register the router
export const appRouter = router({
  feature: featureRouter,
  // ... other routers
});
```

### Authentication & Authorization

**Session Flow:**
1. User logs in → backend verifies bcrypt hash → creates `session_token` (random string)
2. Token stored in `user_sessions` table with 7-day expiry
3. Token set as HttpOnly cookie: `session_token`
4. On each request, middleware extracts cookie → looks up session → injects `ctx.user`

**Procedures:**
- `publicProcedure` — No auth required
- `protectedProcedure` — Requires `ctx.user` to exist
- `adminProcedure` — Requires `ctx.user?.role === "admin"`

**Example: Check user role in mutation**
```typescript
create: protectedProcedure
  .input(budgetSchema)
  .mutation(async ({ input, ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create budgets" });
    }
    // proceed with creation
  }),
```

**Roles:** `"admin"` | `"gestionnaire"` | `"lecteur"` (defined in schema as enum)

### Database (Drizzle ORM + MySQL)

**Schema Definition** ([drizzle/schema.ts](../drizzle/schema.ts)):
- All tables in one file for clarity
- Auto type inference: `type User = typeof users.$inferSelect`
- Timestamps auto-managed: `.defaultNow()`, `.$onUpdate(() => new Date())`
- Enums: `mysqlEnum("role", ["admin", "gestionnaire", "lecteur"])`

**Pattern: Query in db.ts, then use in router**
```typescript
// server/db.ts
export async function getUserWithSessions(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: { sessions: true },
  });
  return user;
}

// server/routers/users.ts
getWithSessions: protectedProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    return getUserWithSessions(input.id);
  }),
```

**Migrations:**
```bash
# After modifying drizzle/schema.ts
pnpm db:generate   # Creates migration file in drizzle/migrations/
pnpm db:push       # Applies migration to DB
```

### Validation (Zod)

**Pattern:** Define schemas in `shared/` (used on both client & server)

```typescript
// shared/schemas.ts
export const budgetSchema = z.object({
  year: z.number().int().min(2000),
  amount: z.number().positive(),
  description: z.string().min(1).max(500),
});

// server/routers/budgets.ts
create: protectedProcedure
  .input(budgetSchema)
  .mutation(async ({ input, ctx }) => { /* ... */ }),

// client/src/components/BudgetForm.tsx
const form = useForm({ resolver: zodResolver(budgetSchema) });
```

---

## Code Conventions

### TypeScript & Naming

| Element | Convention | Example |
|---------|-----------|---------|
| **Files** | kebab-case | `user-auth.ts`, `budget-router.ts` |
| **Exports** | PascalCase for types, camelCase for functions | `type User`, `getUserById()` |
| **Interfaces/Types** | PascalCase | `type User = {}`, `interface BudgetFormProps {}` |
| **Constants** | UPPER_SNAKE_CASE (enums can be PascalCase) | `const MAX_ITEMS = 100` |
| **React Components** | PascalCase | `<BudgetForm />`, `<UserTable />` |
| **Hooks** | camelCase, prefix with `use` | `useAuth()`, `useFetchBudgets()` |

### Error Handling

**Always use `TRPCError` on backend**, never plain `Error`:

```typescript
// ✅ Good
throw new TRPCError({ 
  code: "UNAUTHORIZED", 
  message: "User is not authenticated" 
});

// ✅ Good with context
throw new TRPCError({ 
  code: "NOT_FOUND", 
  message: `Budget with ID ${id} not found` 
});

// ❌ Bad
throw new Error("Something went wrong");
```

**Error Codes to Use:**
- `UNAUTHORIZED` — No auth or invalid token
- `FORBIDDEN` — Auth but insufficient permissions
- `NOT_FOUND` — Resource doesn't exist
- `BAD_REQUEST` — Invalid input (validation failed)
- `INTERNAL_SERVER_ERROR` — Unexpected server error
- `CONFLICT` — E.g., duplicate key

**Frontend Error Handling:**
```typescript
const { data, isLoading, error } = trpc.budgets.list.useQuery();

if (error?.data?.code === "UNAUTHORIZED") {
  // Redirect to login
} else if (error?.data?.code === "FORBIDDEN") {
  // Show "Access Denied"
} else if (error) {
  // Show generic error toast
}
```

### Database Null Checks

**Always check `getDb()` result:**

```typescript
// ✅ Good
const db = await getDb();
if (!db) {
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
}
const users = await db.select().from(usersTable);

// ❌ Bad - crashes if db is null
const users = await (await getDb()).select().from(usersTable);
```

### Logging & Auditing

- Use `console.error()` for errors
- Use `logAudit()` for sensitive actions (logins, deletions, permission changes)
- Prefix logs with feature: `[BudgetRouter]`, `[AuthMiddleware]`

```typescript
console.error("[BudgetRouter] Failed to create budget:", error.message);
await logAudit({ action: "BUDGET_CREATED", userId: ctx.user.id, resourceId: result.id });
```

---

## Development Workflow

### Adding a New Feature

1. **Define Database Schema** (if needed)
   ```typescript
   // drizzle/schema.ts
   export const newFeatures = mysqlTable("new_features", {
     id: int("id").primaryKey().autoincrement(),
     title: varchar("title", { length: 255 }).notNull(),
     createdBy: int("created_by").notNull().references(() => users.id),
     createdAt: timestamp("created_at").defaultNow().notNull(),
   });
   ```
   
   Then run:
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

2. **Create Validation Schema** in `shared/schemas.ts`
   ```typescript
   export const newFeatureSchema = z.object({
     title: z.string().min(1).max(255),
   });
   ```

3. **Create tRPC Router** in `server/routers/new-feature.ts`
   - Follow the pattern above (list, getById, create, update, delete)
   - Add role checks where appropriate
   - Import schema from `shared/schemas.ts`

4. **Register Router** in `server/routers.ts`
   ```typescript
   import { newFeatureRouter } from "./routers/new-feature.js";
   
   export const appRouter = router({
     // ... existing routers
     newFeature: newFeatureRouter,
   });
   ```

5. **Create Frontend Components**
   - `client/src/components/NewFeatureForm.tsx` — Form component
   - `client/src/pages/NewFeatures.tsx` — List/detail page
   - Use `trpc.newFeature.list.useQuery()`, `trpc.newFeature.create.useMutation()`, etc.

6. **Test Locally**
   ```bash
   pnpm dev
   # Client at http://localhost:5173
   # Server at http://localhost:3000
   ```

### Common Tasks

**Running Tests:**
```bash
pnpm test                    # All tests
pnpm test --run              # No watch mode
pnpm test -- src/specific.ts # Single file
```

**Type Checking:**
```bash
pnpm check       # Non-blocking type check
```

**Database Operations:**
```bash
pnpm db:push             # Apply schema changes
pnpm db:generate         # Create migration file
pnpm db:reset            # Full reset (dev only!)
pnpm db:seed             # Load seed data
```

**Building for Production:**
```bash
pnpm build       # Creates dist/
pnpm start       # Runs dist/ (production mode)
```

---

## Anti-Patterns & What to Avoid

| ❌ Don't | ✅ Do Instead | Why |
|---------|--------------|-----|
| Use `localStorage` for auth token | Set HttpOnly cookie in middleware | Browser can't access; prevents XSS theft |
| Throw plain `Error` in tRPC | Throw `TRPCError` with code | Client can distinguish error types |
| Direct SQL queries | Use Drizzle ORM + schema | Type safety, migrations, consistency |
| Skip `getDb()` null check | Always check `if (!db)` | Graceful error handling |
| Hardcoded role checks | Use `adminProcedure` or check in middleware | Reusability & centralized logic |
| Mix OAuth + local auth in same flow | Keep flows separate (oauth-router vs auth-router) | Clearer logic, fewer bugs |
| Expose user ID in response | Return only necessary fields | Prevents data leaks |
| Missing input validation | Always use Zod schema | Type safety on both ends |
| Silently failing queries | Log & throw errors | Debuggability |

---

## Key Files Reference

**Learn these patterns by reading:**
- [server/_core/trpc.ts](../server/_core/trpc.ts) — How procedures & middleware work
- [server/_core/context.ts](../server/_core/context.ts) — Auth context extraction from cookies
- [server/auth-router.ts](../server/auth-router.ts) — Login/password/session flow
- [server/routers/budgets.ts](../server/routers/budgets.ts) — Complete CRUD example
- [drizzle/schema.ts](../drizzle/schema.ts) — All table definitions & type inference
- [client/src/lib/trpc.ts](../client/src/lib/trpc.ts) — Frontend tRPC client setup

---

## Environment Variables

**Required for local development** (create `.env.local` in root):

```env
# Database (MySQL)
DATABASE_URL=mysql://user:password@localhost:3306/batisseurs_db

# Auth
JWT_SECRET=generate-a-random-string-here

# OAuth (Manus provider - can be dummy for local dev)
VITE_APP_ID=dev-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# App Info
OWNER_NAME=My Association Name
```

For Vercel/production secrets, see [docs/ENVIRONMENT_SETUP.md](../docs/ENVIRONMENT_SETUP.md).

---

## Deployment Notes

- **Hosting:** Vercel (see [docs/VERCEL_DEPLOYMENT.md](../docs/VERCEL_DEPLOYMENT.md))
- **Database:** TiDB (MySQL-compatible) or remote MySQL
- **Build:** `pnpm build` produces `dist/` folder
- **Start:** Vercel runs `node dist/index.js`
- **Secrets:** Set DATABASE_URL, JWT_SECRET, OAuth env vars in Vercel dashboard

---

## For More Information

- **Architecture & API Design:** [PLAN.md](../PLAN.md)
- **Contribution Workflow:** [CONTRIBUTING_FOR_AI.md](../CONTRIBUTING_FOR_AI.md)
- **Local Setup:** [SETUP_LOCAL.md](../SETUP_LOCAL.md)
- **Planned Features:** [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md)
- **Refonte Report:** [REFONTE_REPORT.md](../REFONTE_REPORT.md) — Recent refactoring notes
