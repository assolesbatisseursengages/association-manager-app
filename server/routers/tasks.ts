import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";

export const tasksRouter = router({
  list: protectedProcedure
    .input(z.object({ projectId: z.number(), status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const projectFilter = input?.projectId ? `AND projectId = ${input.projectId}` : "";
        const statusFilter = input?.status ? `AND status = '${input.status}'` : "";
        
        const result = await (db as any).$client.query(`
          SELECT id, title, description, status, priority, dueDate, assignedTo, progress, createdAt, projectId
          FROM tasks
          WHERE 1=1 ${projectFilter} ${statusFilter}
          ORDER BY priority DESC, dueDate ASC
        `);
        return result?.[0] || [];
      } catch (error) {
        console.error("[Tasks] Error listing:", error);
        return [];
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const result = await (db as any).$client.query(`
          SELECT * FROM tasks WHERE id = ${input.id}
        `);
        if (!result?.[0] || result[0].length === 0) return null;
        return result[0][0];
      } catch (error) {
        console.error("[Tasks] Error getting by ID:", error);
        return null;
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string().min(1, "Le titre est requis"),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        dueDate: z.string().optional(),
        assignedTo: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const escapedTitle = input.title.replace(/'/g, "''");
        const escapedDesc = (input.description || "").replace(/'/g, "''");

        const result = await (db as any).$client.query(`
          INSERT INTO tasks (projectId, title, description, priority, dueDate, assignedTo, status, createdBy, createdAt)
          VALUES (${input.projectId}, '${escapedTitle}', '${escapedDesc}', 
                  '${input.priority || "medium"}', '${input.dueDate || null}', ${input.assignedTo || null}, 'todo', ${ctx.user?.id || 1}, NOW())
        `);
        return { success: true, id: result?.[0]?.insertId };
      } catch (error) {
        console.error("[Tasks] Error creating:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la création de la tâche" });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        dueDate: z.string().optional(),
        assignedTo: z.number().optional(),
        progress: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const updates: string[] = [];
        if (input.title) updates.push(`title = '${input.title.replace(/'/g, "''")}'`);
        if (input.description !== undefined) updates.push(`description = '${(input.description || "").replace(/'/g, "''")}'`);
        if (input.priority) updates.push(`priority = '${input.priority}'`);
        if (input.dueDate !== undefined) updates.push(`dueDate = '${input.dueDate || null}'`);
        if (input.assignedTo !== undefined) updates.push(`assignedTo = ${input.assignedTo || null}`);
        if (input.progress !== undefined) updates.push(`progress = ${input.progress}`);

        if (updates.length === 0) return { success: true };

        await (db as any).$client.query(`
          UPDATE tasks
          SET ${updates.join(", ")}, updatedAt = NOW()
          WHERE id = ${input.id}
        `);

        return { success: true };
      } catch (error) {
        console.error("[Tasks] Error updating:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la modification de la tâche" });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await (db as any).$client.query(`DELETE FROM tasks WHERE id = ${input.id}`);
        return { success: true };
      } catch (error) {
        console.error("[Tasks] Error deleting:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la suppression de la tâche" });
      }
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["todo", "in-progress", "review", "done", "blocked"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await (db as any).$client.query(`UPDATE tasks SET status = '${input.status}', updatedAt = NOW() WHERE id = ${input.id}`);
        return { success: true };
      } catch (error) {
        console.error("[Tasks] Error updating status:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour du statut" });
      }
    }),

  updateProgress: protectedProcedure
    .input(z.object({ id: z.number(), progress: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await (db as any).$client.query(`UPDATE tasks SET progress = ${input.progress}, updatedAt = NOW() WHERE id = ${input.id}`);
        return { success: true };
      } catch (error) {
        console.error("[Tasks] Error updating progress:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la mise à jour de la progression" });
      }
    }),
});
