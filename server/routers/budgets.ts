import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { budgets, budgetLines } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const budgetsRouter = router({
  list: protectedProcedure
    .input(z.object({ year: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        let query = db.select().from(budgets);
        if (input?.year) {
          query = query.where(eq(budgets.year, input.year));
        }
        return await query;
      } catch (error) {
        console.error("Error fetching budgets:", error);
        return [];
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const result = await db.select().from(budgets).where(eq(budgets.id, input.id)).limit(1);
        return result[0] || null;
      } catch (error) {
        console.error("Error fetching budget:", error);
        return null;
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        year: z.number(),
        totalAmount: z.number(),
        categoryId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        const result = await db.insert(budgets).values({
          name: input.name,
          description: input.description,
          year: input.year,
          totalAmount: String(input.totalAmount),
          categoryId: input.categoryId,
          createdBy: ctx.user?.id,
          status: "draft",
        });

        return { id: result[0].insertId, ...input };
      } catch (error) {
        console.error("Error creating budget:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create budget" });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        totalAmount: z.number().optional(),
        status: z.enum(["draft", "approved", "active", "closed"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        const updateData: any = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.totalAmount !== undefined) updateData.totalAmount = String(input.totalAmount);
        if (input.status !== undefined) updateData.status = input.status;

        await db.update(budgets).set(updateData).where(eq(budgets.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("Error updating budget:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update budget" });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        await db.delete(budgets).where(eq(budgets.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("Error deleting budget:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete budget" });
      }
    }),

  getLines: protectedProcedure
    .input(z.object({ budgetId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        return await db.select().from(budgetLines).where(eq(budgetLines.budgetId, input.budgetId));
      } catch (error) {
        console.error("Error fetching budget lines:", error);
        return [];
      }
    }),

  addLine: protectedProcedure
    .input(
      z.object({
        budgetId: z.number(),
        lineNumber: z.number(),
        description: z.string(),
        amount: z.number(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        const result = await db.insert(budgetLines).values({
          budgetId: input.budgetId,
          lineNumber: input.lineNumber,
          description: input.description,
          amount: String(input.amount),
          category: input.category,
        });

        return { id: result[0].insertId, ...input };
      } catch (error) {
        console.error("Error adding budget line:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add budget line" });
      }
    }),
});
