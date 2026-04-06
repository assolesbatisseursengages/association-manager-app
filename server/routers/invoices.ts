import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { invoices } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const invoicesRouter = router({
  list: protectedProcedure
    .input(z.object({ status: z.string().optional(), limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        let query = db.select().from(invoices);
        if (input?.status) {
          query = query.where(eq(invoices.status, input.status as any));
        }
        if (input?.limit) {
          query = query.limit(input.limit);
        }
        return await query;
      } catch (error) {
        console.error("Error fetching invoices:", error);
        return [];
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const result = await db.select().from(invoices).where(eq(invoices.id, input.id)).limit(1);
        return result[0] || null;
      } catch (error) {
        console.error("Error fetching invoice:", error);
        return null;
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
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        const result = await db.insert(invoices).values({
          invoiceNumber: input.invoiceNumber,
          invoiceDate: new Date(input.invoiceDate),
          dueDate: new Date(input.dueDate),
          totalAmount: String(input.totalAmount),
          description: input.description,
          supplierId: input.supplierId,
          createdBy: ctx.user?.id,
          status: "draft",
        });

        return { id: result[0].insertId, ...input };
      } catch (error) {
        console.error("Error creating invoice:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create invoice" });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        invoiceNumber: z.string().optional(),
        totalAmount: z.number().optional(),
        paidAmount: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        const updateData: any = {};
        if (input.invoiceNumber !== undefined) updateData.invoiceNumber = input.invoiceNumber;
        if (input.totalAmount !== undefined) updateData.totalAmount = String(input.totalAmount);
        if (input.paidAmount !== undefined) updateData.paidAmount = String(input.paidAmount);
        if (input.description !== undefined) updateData.description = input.description;

        await db.update(invoices).set(updateData).where(eq(invoices.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("Error updating invoice:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update invoice" });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        await db.delete(invoices).where(eq(invoices.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("Error deleting invoice:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete invoice" });
      }
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        await db.update(invoices).set({ status: input.status }).where(eq(invoices.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("Error updating invoice status:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update invoice status" });
      }
    }),
});
