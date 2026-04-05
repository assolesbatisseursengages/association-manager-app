import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

// Stubs temporaires pour les factures
// Les tables de factures n'existent pas dans le schéma Drizzle actuel
// Cette fonctionnalité sera implémentée dans une version future

const INVOICES_NOT_AVAILABLE = "La gestion des factures sera disponible dans une prochaine version. Les tables de base de données ne sont pas encore créées.";

export const invoicesRouter = router({
  list: protectedProcedure
    .input(z.object({ status: z.string().optional(), limit: z.number().optional() }).optional())
    .query(async () => {
      return [];
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
    .mutation(async () => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: INVOICES_NOT_AVAILABLE,
      });
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]) }))
    .mutation(async () => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: INVOICES_NOT_AVAILABLE,
      });
    }),
});
