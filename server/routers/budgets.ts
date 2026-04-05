import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

// Stubs temporaires pour les budgets
// Les tables de budgets n'existent pas dans le schéma Drizzle actuel
// Cette fonctionnalité sera implémentée dans une version future

const BUDGETS_NOT_AVAILABLE = "La gestion des budgets sera disponible dans une prochaine version. Les tables de base de données ne sont pas encore créées.";

export const budgetsRouter = router({
  list: protectedProcedure
    .input(z.object({ year: z.number().optional() }).optional())
    .query(async () => {
      return [];
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async () => {
      return null;
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
    .mutation(async () => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: BUDGETS_NOT_AVAILABLE,
      });
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
    .mutation(async () => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: BUDGETS_NOT_AVAILABLE,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async () => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: BUDGETS_NOT_AVAILABLE,
      });
    }),
});
