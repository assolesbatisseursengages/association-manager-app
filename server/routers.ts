import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { emailRouter } from "./email-router";
import { adminSettingsRouter } from "./admin-settings-router";
import { crmRouter } from "./crm-router";
import { authRouter } from "./auth-router";
import { usersRouter as usersRouterOld } from "./users-router";
import { usersRouter } from "./routers/users";
import { budgetsRouter } from "./routers/budgets";
import { invoicesRouter } from "./routers/invoices";
import { membershipsRouter } from "./routers/memberships";
import { notificationsRouter } from "./routers/notifications";
import { projectsRouter } from "./routers/projects";
import { tasksRouter } from "./routers/tasks";
import { associationSettingsRouter } from "./routers/association-settings";
import { exportsRouter } from "./routers/exports";
import { demoDataRouter } from "./routers/demo-data";
import { localAuthRouter } from "./routers/local-auth";
import { reportsRouter } from "./routers/reports";
import { widgetsRouter } from "./routers/widgets";
import { memberGroupsRouter } from "./routers/member-groups";
import { mediaRouter } from "./routers/media";

import { z } from "zod";
import { 
  getAllCategories, getCategoryById, createCategory,
  getAllDocuments, getDocumentById, createDocument, updateDocument, deleteDocument, getDocumentStats,
  getNotesByDocumentId, createNote, deleteNote,
  getAllMembers, getMemberById, createMember, updateMember, deleteMember,
  logActivity, getRecentActivity,
  createCotisation, getCotisations, getCotisationsByMember, updateCotisation,
  createDon, getDons,
  createDepense, getDepenses,
  createTransaction, getTransactions,
  getFinancialStats,
  getGlobalSettings, updateGlobalSettings,
  getDb
} from "./db";
import { roles, permissions, auditLogs, emailTemplates, emailHistory, emailRecipients } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { logAudit } from "./audit";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  email: emailRouter,
  adminSettings: adminSettingsRouter,
  crm: crmRouter,
  auth: authRouter,
  localAuth: localAuthRouter,
  users: usersRouter,
  budgets: budgetsRouter,
  invoices: invoicesRouter,
  memberships: membershipsRouter,
  notifications: notificationsRouter,
  projects: projectsRouter,
  tasks: tasksRouter,
  associationSettings: associationSettingsRouter,
  exports: exportsRouter,
  demoData: demoDataRouter,
  reports: reportsRouter,
  widgets: widgetsRouter,
  memberGroups: memberGroupsRouter,
  media: mediaRouter,

  // ============ CATEGORIES ============
  categories: router({
    list: protectedProcedure.query(async () => {
      return getAllCategories();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getCategoryById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createCategory(input);
        await logActivity({
          userId: ctx.user.id,
          action: "create",
          entityType: "category",
          entityId: result.id as number,
          details: `Catégorie "${input.name}" créée`,
        });
        return result;
      }),
  }),

  // ============ DOCUMENTS ============
  documents: router({
    list: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        search: z.string().optional(),
        isArchived: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getAllDocuments(input);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getDocumentById(input.id)),
    
    stats: protectedProcedure.query(async () => {
      return getDocumentStats();
    }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        categoryId: z.number(),
        status: z.enum(["pending", "in-progress", "completed"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createDocument({
          ...input,
          createdBy: ctx.user.id,
        });
        await logActivity({
          userId: ctx.user.id,
          action: "create",
          entityType: "document",
          entityId: result.id as number,
          details: `Document "${input.title}" créé`,
        });
        await notifyOwner({
          title: "Nouveau document créé",
          content: `Le document "${input.title}" a été créé par ${ctx.user.name || "un utilisateur"}.`,
        });
        return result;
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        categoryId: z.number().optional(),
        status: z.enum(["pending", "in-progress", "completed"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        dueDate: z.date().nullable().optional(),
        isArchived: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const result = await updateDocument(id, { ...data, updatedBy: ctx.user.id });
        await logActivity({
          userId: ctx.user.id,
          action: "update",
          entityType: "document",
          entityId: id,
          details: `Document mis à jour`,
        });
        return result;
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deleteDocument(input.id);
        await logActivity({
          userId: ctx.user.id,
          action: "delete",
          entityType: "document",
          entityId: input.id,
          details: `Document supprimé`,
        });
        return { success: true };
      }),
    
    uploadFile: protectedProcedure
      .input(z.object({
        documentId: z.number(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        fileBase64: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { documentId, fileName, fileType, fileSize, fileBase64 } = input;
        const fileBuffer = Buffer.from(fileBase64, "base64");
        const fileKey = `documents/${documentId}/${nanoid()}-${fileName}`;
        const { url } = await storagePut(fileKey, fileBuffer, fileType);
        await updateDocument(documentId, {
          fileUrl: url,
          fileKey,
          fileName,
          fileType,
          fileSize,
          updatedBy: ctx.user.id,
        });
        await logActivity({
          userId: ctx.user.id,
          action: "upload",
          entityType: "document",
          entityId: documentId,
          details: `Fichier "${fileName}" uploadé`,
        });
        await notifyOwner({
          title: "Fichier uploadé",
          content: `Le fichier "${fileName}" a été uploadé par ${ctx.user.name || "un utilisateur"}.`,
        });
        return { success: true, url, fileKey };
      }),
    
    removeFile: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await updateDocument(input.documentId, {
          fileUrl: null,
          fileKey: null,
          fileName: null,
          fileType: null,
          fileSize: null,
          updatedBy: ctx.user.id,
        });
        await logActivity({
          userId: ctx.user.id,
          action: "remove_file",
          entityType: "document",
          entityId: input.documentId,
          details: `Fichier supprimé du document`,
        });
        return { success: true };
      }),
    
    exportReport: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        status: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const docs = await getAllDocuments(input);
        const cats = await getAllCategories();
        const stats = await getDocumentStats();
        const catMap = Object.fromEntries(cats.map(c => [c.id, c.name]));
        const reportData = docs.map(doc => ({
          id: doc.id,
          title: doc.title,
          description: doc.description || "",
          category: catMap[doc.categoryId] || "Non catégorisé",
          status: doc.status === "completed" ? "Complété" : doc.status === "in-progress" ? "En cours" : "En attente",
          priority: doc.priority === "urgent" ? "Urgent" : doc.priority === "high" ? "Haute" : doc.priority === "medium" ? "Moyenne" : "Basse",
          hasFile: !!doc.fileUrl,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        }));
        return { documents: reportData, stats, categories: cats, generatedAt: new Date() };
      }),
    
    archived: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getAllDocuments({ ...input, isArchived: true });
      }),
    
    archive: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const result = await updateDocument(input.id, { isArchived: true, updatedBy: ctx.user.id });
        await logActivity({
          userId: ctx.user.id,
          action: "archive",
          entityType: "document",
          entityId: input.id,
          details: "Document archivé",
        });
        await notifyOwner({
          title: "Document archivé",
          content: `Le document a été archivé par ${ctx.user.name || "un utilisateur"}.`,
        });
        return result;
      }),
    
    restore: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const result = await updateDocument(input.id, { isArchived: false, updatedBy: ctx.user.id });
        await logActivity({
          userId: ctx.user.id,
          action: "restore",
          entityType: "document",
          entityId: input.id,
          details: "Document restauré",
        });
        return result;
      }),
  }),

  // ============ NOTES ============
  notes: router({
    listByDocument: publicProcedure
      .input(z.object({ documentId: z.number() }))
      .query(async ({ input }) => getNotesByDocumentId(input.documentId)),
    
    create: protectedProcedure
      .input(z.object({
        documentId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createNote({
          documentId: input.documentId,
          userId: ctx.user.id,
          content: input.content,
        });
        await logActivity({
          userId: ctx.user.id,
          action: "create",
          entityType: "note",
          entityId: result.id as number,
          details: `Note ajoutée au document #${input.documentId}`,
        });
        return result;
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deleteNote(input.id);
        await logActivity({
          userId: ctx.user.id,
          action: "delete",
          entityType: "note",
          entityId: input.id,
          details: `Note supprimée`,
        });
        return { success: true };
      }),
  }),

  // ============ MEMBERS ============
  members: router({
    list: protectedProcedure.query(async () => getAllMembers()),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getMemberById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        role: z.string().optional(),
        function: z.string().optional(),
        status: z.enum(["active", "inactive", "pending"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createMember(input);
        await logActivity({
          userId: ctx.user.id,
          action: "create",
          entityType: "member",
          entityId: result.id as number,
          details: `Membre "${input.firstName} ${input.lastName}" ajouté`,
        });
        await notifyOwner({
          title: "Nouveau membre ajouté",
          content: `${input.firstName} ${input.lastName} a été ajouté comme membre.`,
        });
        return result;
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        role: z.string().optional(),
        function: z.string().optional(),
        status: z.enum(["active", "inactive", "pending"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const result = await updateMember(id, data);
        await logActivity({
          userId: ctx.user.id,
          action: "update",
          entityType: "member",
          entityId: id,
          details: `Membre mis à jour`,
        });
        return result;
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deleteMember(input.id);
        await logActivity({
          userId: ctx.user.id,
          action: "delete",
          entityType: "member",
          entityId: input.id,
          details: `Membre supprimé`,
        });
        return { success: true };
      }),
    
    exportList: protectedProcedure.query(async () => {
      const membersList = await getAllMembers();
      return {
        members: membersList.map(m => ({
          id: m.id,
          fullName: `${m.firstName} ${m.lastName}`,
          email: m.email || "",
          phone: m.phone || "",
          role: m.role || "Membre",
          function: m.function || "",
          status: m.status === "active" ? "Actif" : m.status === "inactive" ? "Inactif" : "En attente",
          joinedAt: m.joinedAt,
        })),
        total: membersList.length,
        generatedAt: new Date(),
      };
    }),
  }),

  // ============ ACTIVITY ============
  activity: router({
    recent: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => getRecentActivity(input?.limit || 20)),
  }),

  // ============ FINANCES ============
  finances: router({
    stats: protectedProcedure.query(async () => getFinancialStats()),
  }),

  // ============ ADMIN ============
  admin: router({
    runMigrations: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") throw new Error("Only admins can run migrations");
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection not available");
        const fs = await import('fs');
        const path = await import('path');
        const sqlFile = path.join(process.cwd(), "drizzle", "migrations_clean.sql");
        if (!fs.existsSync(sqlFile)) throw new Error("Migration SQL file not found");
        const sql = fs.readFileSync(sqlFile, "utf8");
        const statements = sql.split(";").map((s: string) => s.trim()).filter((s: string) => s.length > 0 && !s.startsWith("--"));
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];
        for (const statement of statements) {
          try {
            await db.execute(statement);
            successCount++;
          } catch (error: any) {
            if (error.code === "ER_TABLE_EXISTS_ERROR") { successCount++; }
            else { errorCount++; errors.push(`${error.message}`); }
          }
        }
        return { success: true, message: `Migrations completed: ${successCount} successful, ${errorCount} failed`, successCount, errorCount, errors: errors.slice(0, 5) };
      } catch (error: any) {
        throw new Error(`Migration failed: ${error.message}`);
      }
    }),

    getRoles: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      try { return await db.select().from(roles); }
      catch (error) { console.error("Failed to get roles:", error); return []; }
    }),

    getPermissions: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      try { return await db.select().from(permissions); }
      catch (error) { console.error("Failed to get permissions:", error); return []; }
    }),

    createRole: protectedProcedure
      .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        try {
          const result = await db.insert(roles).values({ name: input.name, description: input.description, isSystem: false });
          await logAudit({ userId: ctx.user?.id, action: "CREATE", entityType: "roles", entityName: input.name, description: `Created role: ${input.name}`, status: "success" });
          return result;
        } catch (error) { console.error("Failed to create role:", error); throw error; }
      }),

    // Corrigé : filtrage et pagination en SQL
    getAuditLogs: protectedProcedure
      .input(z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
        entityType: z.string().optional(),
        userId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        try {
          const conditions = [];
          if (input.entityType) conditions.push(eq(auditLogs.entityType, input.entityType));
          if (input.userId) conditions.push(eq(auditLogs.userId, input.userId));

          const query = db.select().from(auditLogs);
          const filtered = conditions.length > 0 ? query.where(and(...conditions)) : query;

          return filtered
            .orderBy(desc(auditLogs.createdAt))
            .limit(input.limit)
            .offset(input.offset);
        } catch (error) {
          console.error("Failed to get audit logs:", error);
          return [];
        }
      }),
  }),

  // ============ GLOBAL SETTINGS ============
  globalSettings: router({
    get: publicProcedure.query(async () => {
      return getGlobalSettings();
    }),

update: adminProcedure
  .input(z.object({
    associationName: z.string().optional(),
    ...
  }))
  .mutation(async ({ input, ctx }) => {
        const result = await updateGlobalSettings({ ...input, updatedBy: ctx.user?.id });
        await logAudit({ userId: ctx.user?.id, action: "UPDATE", entityType: "globalSettings", entityName: "Global Settings", description: "Updated global settings", status: "success" });
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;