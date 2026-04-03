import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";

export const projectsRouter = router({
  // ============ PROJECTS CRUD ============
  list: protectedProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const statusFilter = input?.status ? `AND status = '${input.status}'` : "";
        const result = await (db as any).$client.query(`
          SELECT id, name, description, startDate, endDate, budget, status, progress, priority, createdAt, createdBy
          FROM projects
          WHERE 1=1 ${statusFilter}
          ORDER BY startDate DESC
        `);
        return result?.[0] || [];
      } catch (error) {
        console.error("[Projects] Error listing:", error);
        return [];
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const result = await (db as any).$client.query(`SELECT * FROM projects WHERE id = ${input.id}`);
        if (!result?.[0] || result[0].length === 0) return null;

        const project = result[0][0];

        // Récupérer les tâches
        const tasks = await (db as any).$client.query(`
          SELECT id, title, description, status, priority, dueDate, assignedTo, progress, createdAt
          FROM tasks
          WHERE projectId = ${input.id}
          ORDER BY priority DESC, dueDate ASC
        `);

        // Récupérer les membres assignés
        const members = await (db as any).$client.query(`
          SELECT DISTINCT u.id, u.name, u.email, pm.role, pm.joinedAt
          FROM project_members pm
          JOIN users u ON pm.userId = u.id
          WHERE pm.projectId = ${input.id}
          ORDER BY pm.joinedAt DESC
        `);

        // Récupérer les dépenses
        const expenses = await (db as any).$client.query(`
          SELECT id, description, amount, category, date, createdBy
          FROM project_expenses
          WHERE projectId = ${input.id}
          ORDER BY date DESC
        `);

        // Récupérer l'historique
        const history = await (db as any).$client.query(`
          SELECT id, action, changedBy, changedAt, details
          FROM project_history
          WHERE projectId = ${input.id}
          ORDER BY changedAt DESC
          LIMIT 20
        `);

        return {
          ...project,
          tasks: tasks?.[0] || [],
          members: members?.[0] || [],
          expenses: expenses?.[0] || [],
          history: history?.[0] || [],
        };
      } catch (error) {
        console.error("[Projects] Error getting by ID:", error);
        return null;
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Le nom du projet est requis"),
        description: z.string().optional(),
        startDate: z.string(),
        endDate: z.string().optional(),
        budget: z.number().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const escapedName = input.name.replace(/'/g, "''");
        const escapedDesc = (input.description || "").replace(/'/g, "''");

        const result = await (db as any).$client.query(`
          INSERT INTO projects (name, description, startDate, endDate, budget, priority, status, createdBy, createdAt)
          VALUES ('${escapedName}', '${escapedDesc}', '${input.startDate}', 
                  '${input.endDate || null}', ${input.budget || null}, '${input.priority || "medium"}', 'planning', ${ctx.user?.id || 1}, NOW())
        `);

        const projectId = result?.[0]?.insertId;

        // Ajouter l'entrée dans l'historique
        if (projectId) {
          await (db as any).$client.query(`
            INSERT INTO project_history (projectId, action, changedBy, changedAt, details)
            VALUES (${projectId}, 'created', ${ctx.user?.id || 1}, NOW(), 'Projet créé')
          `);
        }

        return { success: true, id: projectId };
      } catch (error) {
        console.error("[Projects] Error creating:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la création du projet" });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        budget: z.number().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        progress: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const updates: string[] = [];
        if (input.name) updates.push(`name = '${input.name.replace(/'/g, "''")}'`);
        if (input.description !== undefined) updates.push(`description = '${(input.description || "").replace(/'/g, "''")}'`);
        if (input.startDate) updates.push(`startDate = '${input.startDate}'`);
        if (input.endDate) updates.push(`endDate = '${input.endDate}'`);
        if (input.budget !== undefined) updates.push(`budget = ${input.budget}`);
        if (input.priority) updates.push(`priority = '${input.priority}'`);
        if (input.progress !== undefined) updates.push(`progress = ${input.progress}`);

        if (updates.length === 0) return { success: true };

        await (db as any).$client.query(`
          UPDATE projects
          SET ${updates.join(", ")}, updatedAt = NOW()
          WHERE id = ${input.id}
        `);

        // Ajouter l'entrée dans l'historique
        await (db as any).$client.query(`
          INSERT INTO project_history (projectId, action, changedBy, changedAt, details)
          VALUES (${input.id}, 'updated', ${ctx.user?.id || 1}, NOW(), 'Projet modifié')
        `);

        return { success: true };
      } catch (error) {
        console.error("[Projects] Error updating:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la modification du projet" });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Supprimer les tâches
        await (db as any).$client.query(`DELETE FROM tasks WHERE projectId = ${input.id}`);
        // Supprimer les membres
        await (db as any).$client.query(`DELETE FROM project_members WHERE projectId = ${input.id}`);
        // Supprimer les dépenses
        await (db as any).$client.query(`DELETE FROM project_expenses WHERE projectId = ${input.id}`);
        // Supprimer l'historique
        await (db as any).$client.query(`DELETE FROM project_history WHERE projectId = ${input.id}`);
        // Supprimer le projet
        await (db as any).$client.query(`DELETE FROM projects WHERE id = ${input.id}`);

        return { success: true };
      } catch (error) {
        console.error("[Projects] Error deleting:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la suppression du projet" });
      }
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["planning", "active", "on-hold", "completed", "cancelled"]) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await (db as any).$client.query(`UPDATE projects SET status = '${input.status}', updatedAt = NOW() WHERE id = ${input.id}`);

        // Ajouter l'entrée dans l'historique
        await (db as any).$client.query(`
          INSERT INTO project_history (projectId, action, changedBy, changedAt, details)
          VALUES (${input.id}, 'status_changed', ${ctx.user?.id || 1}, NOW(), 'Statut changé en ${input.status}')
        `);

        return { success: true };
      } catch (error) {
        console.error("[Projects] Error updating status:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour du statut" });
      }
    }),

  // ============ PROJECT MEMBERS ============
  getMembers: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const result = await (db as any).$client.query(`
          SELECT u.id, u.name, u.email, pm.role, pm.joinedAt
          FROM project_members pm
          JOIN users u ON pm.userId = u.id
          WHERE pm.projectId = ${input.projectId}
          ORDER BY pm.joinedAt DESC
        `);
        return result?.[0] || [];
      } catch (error) {
        console.error("[Projects] Error getting members:", error);
        return [];
      }
    }),

  addMember: protectedProcedure
    .input(z.object({ projectId: z.number(), userId: z.number(), role: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await (db as any).$client.query(`
          INSERT INTO project_members (projectId, userId, role, joinedAt)
          VALUES (${input.projectId}, ${input.userId}, '${input.role || "member"}', NOW())
          ON DUPLICATE KEY UPDATE role = '${input.role || "member"}'
        `);

        // Ajouter l'entrée dans l'historique
        await (db as any).$client.query(`
          INSERT INTO project_history (projectId, action, changedBy, changedAt, details)
          VALUES (${input.projectId}, 'member_added', ${ctx.user?.id || 1}, NOW(), 'Membre ajouté')
        `);

        return { success: true };
      } catch (error) {
        console.error("[Projects] Error adding member:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de l'ajout du membre" });
      }
    }),

  removeMember: protectedProcedure
    .input(z.object({ projectId: z.number(), userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await (db as any).$client.query(`
          DELETE FROM project_members
          WHERE projectId = ${input.projectId} AND userId = ${input.userId}
        `);

        // Ajouter l'entrée dans l'historique
        await (db as any).$client.query(`
          INSERT INTO project_history (projectId, action, changedBy, changedAt, details)
          VALUES (${input.projectId}, 'member_removed', ${ctx.user?.id || 1}, NOW(), 'Membre supprimé')
        `);

        return { success: true };
      } catch (error) {
        console.error("[Projects] Error removing member:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la suppression du membre" });
      }
    }),

  // ============ PROJECT EXPENSES ============
  getExpenses: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const result = await (db as any).$client.query(`
          SELECT id, description, amount, category, date, createdBy, createdAt
          FROM project_expenses
          WHERE projectId = ${input.projectId}
          ORDER BY date DESC
        `);
        return result?.[0] || [];
      } catch (error) {
        console.error("[Projects] Error getting expenses:", error);
        return [];
      }
    }),

  addExpense: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        description: z.string(),
        amount: z.number(),
        category: z.string().optional(),
        date: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const escapedDesc = input.description.replace(/'/g, "''");
        const result = await (db as any).$client.query(`
          INSERT INTO project_expenses (projectId, description, amount, category, date, createdBy, createdAt)
          VALUES (${input.projectId}, '${escapedDesc}', ${input.amount}, '${input.category || "other"}', '${input.date}', ${ctx.user?.id || 1}, NOW())
        `);

        return { success: true, id: result?.[0]?.insertId };
      } catch (error) {
        console.error("[Projects] Error adding expense:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de l'ajout de la dépense" });
      }
    }),

  deleteExpense: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await (db as any).$client.query(`DELETE FROM project_expenses WHERE id = ${input.id}`);
        return { success: true };
      } catch (error) {
        console.error("[Projects] Error deleting expense:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la suppression de la dépense" });
      }
    }),

  // ============ PROJECT STATISTICS ============
  getStats: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        // Récupérer les infos du projet
        const projectResult = await (db as any).$client.query(`
          SELECT budget, progress FROM projects WHERE id = ${input.projectId}
        `);

        if (!projectResult?.[0] || projectResult[0].length === 0) return null;

        const project = projectResult[0][0];

        // Calculer les dépenses totales
        const expensesResult = await (db as any).$client.query(`
          SELECT SUM(amount) as total FROM project_expenses WHERE projectId = ${input.projectId}
        `);

        const totalExpenses = expensesResult?.[0]?.[0]?.total || 0;

        // Compter les tâches
        const tasksResult = await (db as any).$client.query(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as inProgress
          FROM tasks WHERE projectId = ${input.projectId}
        `);

        const tasks = tasksResult?.[0]?.[0] || { total: 0, completed: 0, inProgress: 0 };

        // Compter les membres
        const membersResult = await (db as any).$client.query(`
          SELECT COUNT(*) as total FROM project_members WHERE projectId = ${input.projectId}
        `);

        const members = membersResult?.[0]?.[0]?.total || 0;

        return {
          budget: project.budget || 0,
          spent: totalExpenses,
          remaining: (project.budget || 0) - totalExpenses,
          progress: project.progress || 0,
          tasks: {
            total: tasks.total,
            completed: tasks.completed,
            inProgress: tasks.inProgress,
            pending: tasks.total - tasks.completed - tasks.inProgress,
          },
          members,
        };
      } catch (error) {
        console.error("[Projects] Error getting stats:", error);
        return null;
      }
    }),
});
