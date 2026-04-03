import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

export const budgetsRouter = router({
  list: protectedProcedure
    .input(z.object({ year: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const year = input?.year || new Date().getFullYear();
        const result = await (db as any).$client.query(`
          SELECT id, name, description, year, totalAmount, status, createdAt, updatedAt 
          FROM budgets 
          WHERE year = ${year}
          ORDER BY createdAt DESC
        `);
        return result?.[0] || [];
      } catch (error) {
        console.error("[Budgets] Error listing:", error);
        return [];
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const result = await (db as any).$client.query(`SELECT * FROM budgets WHERE id = ${input.id}`);
        if (!result?.[0] || result[0].length === 0) return null;

        const linesResult = await (db as any).$client.query(`
          SELECT * FROM budget_lines WHERE budgetId = ${input.id} ORDER BY lineNumber
        `);

        return { ...result[0][0], lines: linesResult?.[0] || [] };
      } catch (error) {
        console.error("[Budgets] Error getting by ID:", error);
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
      if (!db) throw new Error("Database not available");

      try {
        const result = await (db as any).$client.query(`
          INSERT INTO budgets (name, description, year, totalAmount, categoryId, createdBy, status)
          VALUES ('${input.name}', '${input.description || ""}', ${input.year}, ${input.totalAmount}, 
                  ${input.categoryId || null}, ${ctx.user?.id || 1}, 'draft')
        `);
        return { success: true, id: result?.[0]?.insertId };
      } catch (error) {
        console.error("[Budgets] Error creating:", error);
        throw error;
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
      if (!db) throw new Error("Database not available");

      try {
        const updates = [];
        if (input.name) updates.push(`name = '${input.name}'`);
        if (input.totalAmount) updates.push(`totalAmount = ${input.totalAmount}`);
        if (input.status) updates.push(`status = '${input.status}'`);

        if (updates.length === 0) return { success: false };

        await (db as any).$client.query(`UPDATE budgets SET ${updates.join(", ")} WHERE id = ${input.id}`);
        return { success: true };
      } catch (error) {
        console.error("[Budgets] Error updating:", error);
        throw error;
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await (db as any).$client.query(`DELETE FROM budgets WHERE id = ${input.id}`);
        return { success: true };
      } catch (error) {
        console.error("[Budgets] Error deleting:", error);
        throw error;
      }
    }),
});
