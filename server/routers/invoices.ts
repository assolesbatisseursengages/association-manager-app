import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

export const invoicesRouter = router({
  list: protectedProcedure
    .input(z.object({ status: z.string().optional(), limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const statusFilter = input?.status ? `AND status = '${input.status}'` : "";
        const limit = input?.limit || 50;
        const result = await (db as any).$client.query(`
          SELECT id, invoiceNumber, invoiceDate, dueDate, totalAmount, paidAmount, status, createdAt
          FROM invoices
          WHERE 1=1 ${statusFilter}
          ORDER BY invoiceDate DESC
          LIMIT ${limit}
        `);
        return result?.[0] || [];
      } catch (error) {
        console.error("[Invoices] Error listing:", error);
        return [];
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        invoiceNumber: z.string(),
        invoiceDate: z.string(),
        dueDate: z.string(),
        totalAmount: z.number(),
        description: z.string().optional(),
        supplierId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const result = await (db as any).$client.query(`
          INSERT INTO invoices (invoiceNumber, invoiceDate, dueDate, totalAmount, description, supplierId, createdBy, status)
          VALUES ('${input.invoiceNumber}', '${input.invoiceDate}', '${input.dueDate}', ${input.totalAmount}, 
                  '${input.description || ""}', ${input.supplierId || null}, ${ctx.user?.id || 1}, 'draft')
        `);
        return { success: true, id: result?.[0]?.insertId };
      } catch (error) {
        console.error("[Invoices] Error creating:", error);
        throw error;
      }
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await (db as any).$client.query(`UPDATE invoices SET status = '${input.status}' WHERE id = ${input.id}`);
        return { success: true };
      } catch (error) {
        console.error("[Invoices] Error updating status:", error);
        throw error;
      }
    }),
});
