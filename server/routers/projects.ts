import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { projects, projectMembers, projectExpenses, tasks } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const projectsRouter = router({
  list: protectedProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        let query = db.select().from(projects);
        if (input?.status) {
          query = query.where(eq(projects.status, input.status as any));
        }
        return await query;
      } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const result = await db.select().from(projects).where(eq(projects.id, input.id)).limit(1);
        return result[0] || null;
      } catch (error) {
        console.error("Error fetching project:", error);
        return null;
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Le nom du projet est requis"),
        description: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        budget: z.number().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        const result = await db.insert(projects).values({
          name: input.name,
          description: input.description,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          budget: input.budget ? String(input.budget) : undefined,
          priority: input.priority || "medium",
          createdBy: ctx.user?.id,
        });

        return { id: result[0].insertId, ...input };
      } catch (error) {
        console.error("Error creating project:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create project" });
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
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        const updateData: any = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.startDate !== undefined) updateData.startDate = new Date(input.startDate);
        if (input.endDate !== undefined) updateData.endDate = new Date(input.endDate);
        if (input.budget !== undefined) updateData.budget = String(input.budget);
        if (input.priority !== undefined) updateData.priority = input.priority;
        if (input.progress !== undefined) updateData.progress = input.progress;

        await db.update(projects).set(updateData).where(eq(projects.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("Error updating project:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update project" });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        await db.delete(projects).where(eq(projects.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("Error deleting project:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete project" });
      }
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["planning", "active", "on-hold", "completed", "cancelled"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        await db.update(projects).set({ status: input.status }).where(eq(projects.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("Error updating project status:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update project status" });
      }
    }),

  getMembers: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        return await db.select().from(projectMembers).where(eq(projectMembers.projectId, input.projectId));
      } catch (error) {
        console.error("Error fetching project members:", error);
        return [];
      }
    }),

  addMember: protectedProcedure
    .input(z.object({ projectId: z.number(), userId: z.number(), role: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        const result = await db.insert(projectMembers).values({
          projectId: input.projectId,
          userId: input.userId,
          role: input.role || "member",
        });
        return { id: result[0].insertId, ...input };
      } catch (error) {
        console.error("Error adding project member:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add project member" });
      }
    }),

  removeMember: protectedProcedure
    .input(z.object({ projectId: z.number(), userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        await db.delete(projectMembers).where(
          and(eq(projectMembers.projectId, input.projectId), eq(projectMembers.userId, input.userId))
        );
        return { success: true };
      } catch (error) {
        console.error("Error removing project member:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to remove project member" });
      }
    }),

  getExpenses: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        return await db.select().from(projectExpenses).where(eq(projectExpenses.projectId, input.projectId));
      } catch (error) {
        console.error("Error fetching project expenses:", error);
        return [];
      }
    }),

  addExpense: protectedProcedure
    .input(z.object({ projectId: z.number(), description: z.string(), amount: z.number(), category: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        const result = await db.insert(projectExpenses).values({
          projectId: input.projectId,
          description: input.description,
          amount: String(input.amount),
          category: input.category,
          createdBy: ctx.user?.id,
        });
        return { id: result[0].insertId, ...input };
      } catch (error) {
        console.error("Error adding project expense:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add project expense" });
      }
    }),

  deleteExpense: protectedProcedure
    .input(z.object({ expenseId: z.number(), projectId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        await db.delete(projectExpenses).where(eq(projectExpenses.id, input.expenseId));
        return { success: true };
      } catch (error) {
        console.error("Error deleting project expense:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete project expense" });
      }
    }),

  getStats: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { tasks: 0, members: 0, expenses: 0, totalExpenses: 0 };

      try {
        const taskCount = await db.select().from(tasks).where(eq(tasks.projectId, input.projectId));
        const memberCount = await db.select().from(projectMembers).where(eq(projectMembers.projectId, input.projectId));
        const expenseList = await db.select().from(projectExpenses).where(eq(projectExpenses.projectId, input.projectId));

        const totalExpenses = expenseList.reduce((sum, exp) => sum + parseFloat(exp.amount as any), 0);

        return {
          tasks: taskCount.length,
          members: memberCount.length,
          expenses: expenseList.length,
          totalExpenses,
        };
      } catch (error) {
        console.error("Error fetching project stats:", error);
        return { tasks: 0, members: 0, expenses: 0, totalExpenses: 0 };
      }
    }),
});
