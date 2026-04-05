import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

// Stubs temporaires pour les projets
// Les tables de projets n'existent pas dans le schéma Drizzle actuel
// Cette fonctionnalité sera implémentée dans une version future

const PROJECT_NOT_AVAILABLE = "La gestion des projets sera disponible dans une prochaine version. Les tables de base de données ne sont pas encore créées.";

export const projectsRouter = router({
  list: protectedProcedure
    .input(z.object({ status: z.string().optional() }).optional())
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
        name: z.string().min(1, "Le nom du projet est requis"),
        description: z.string().optional(),
        startDate: z.string(),
        endDate: z.string().optional(),
        budget: z.number().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      })
    )
    .mutation(async () => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: PROJECT_NOT_AVAILABLE,
      });
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
    .mutation(async () => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: PROJECT_NOT_AVAILABLE,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async () => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: PROJECT_NOT_AVAILABLE,
      });
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["planning", "active", "on-hold", "completed", "cancelled"]) }))
    .mutation(async () => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: PROJECT_NOT_AVAILABLE,
      });
    }),

  getMembers: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async () => {
      return [];
    }),

  addMember: protectedProcedure
    .input(z.object({ projectId: z.number(), userId: z.number(), role: z.string().optional() }))
    .mutation(async () => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: PROJECT_NOT_AVAILABLE,
      });
    }),

  removeMember: protectedProcedure
    .input(z.object({ projectId: z.number(), userId: z.number() }))
    .mutation(async () => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: PROJECT_NOT_AVAILABLE,
      });
    }),

  getExpenses: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async () => {
      return [];
    }),

  addExpense: protectedProcedure
    .input(z.object({ projectId: z.number(), description: z.string(), amount: z.number(), category: z.string().optional() }))
    .mutation(async () => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: PROJECT_NOT_AVAILABLE,
      });
    }),

  deleteExpense: protectedProcedure
    .input(z.object({ expenseId: z.number(), projectId: z.number() }))
    .mutation(async () => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: PROJECT_NOT_AVAILABLE,
      });
    }),

  getStats: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async () => {
      return { tasks: 0, members: 0, expenses: 0, totalExpenses: 0 };
    }),
});
