import { z } from "zod";
import { eq } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  createCrmContact,
  getCrmContact,
  listCrmContacts,
  updateCrmContact,
  deleteCrmContact,
  createCrmActivity,
  listCrmActivities,
  updateCrmActivity,
  deleteCrmActivity,
  createAdhesionPipeline,
  updateAdhesionPipeline,
  listAdhesionPipeline,
  createCrmReport,
  listCrmReports,
  createCrmEmailIntegration,
  listCrmEmailIntegration,
} from "./db";

export const crmRouter = router({
  // ============ CONTACTS ============
  contacts: router({
    list: protectedProcedure
      .input(z.object({
        segment: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return listCrmContacts(input);
      }),

    get: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getCrmContact(input);
      }),

    create: protectedProcedure
      .input(z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        company: z.string().optional(),
        position: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        birthDate: z.date().optional(),
        joinDate: z.date().optional(),
        segment: z.string().default("general"),
        status: z.enum(["prospect", "active", "inactive", "archived"]).default("prospect"),
        notes: z.string().optional(),
        tags: z.string().optional(),
        createdBy: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }: any) => {
        // Autoriser les gestionnaires et admins
        if (ctx.user?.role !== "admin" && ctx.user?.role !== "gestionnaire") {
          throw new Error("Unauthorized: Admin or Manager only");
        }
        // Dériver createdBy du contexte si non fourni
        const createdBy = input.createdBy || ctx.user?.id || 1;
        return createCrmContact({ ...input, createdBy } as any);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          company: z.string().optional(),
          position: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          postalCode: z.string().optional(),
          country: z.string().optional(),
          birthDate: z.date().optional(),
          joinDate: z.date().optional(),
          segment: z.string().optional(),
          status: z.enum(["prospect", "active", "inactive", "archived"]).optional(),
          notes: z.string().optional(),
          tags: z.string().optional(),
          engagementScore: z.number().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }: any) => {
        if (ctx.user?.role !== "admin" && ctx.user?.role !== "gestionnaire") {
          throw new Error("Unauthorized: Admin or Manager only");
        }
        return updateCrmContact(input.id, input.data as any);
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }: any) => {
        if (ctx.user?.role !== "admin" && ctx.user?.role !== "gestionnaire") {
          throw new Error("Unauthorized: Admin or Manager only");
        }
        await deleteCrmContact(input);
        return { success: true };
      }),
  }),

  // ============ ACTIVITIES ============
  activities: router({
    list: protectedProcedure
      .input(z.number())
      .query(async ({ input }: any) => {
        return listCrmActivities(input);
      }),

    create: protectedProcedure
      .input(z.object({
        contactId: z.number(),
        type: z.enum(["call", "email", "meeting", "task", "note", "event"]),
        title: z.string(),
        description: z.string().optional(),
        status: z.enum(["pending", "completed", "cancelled"]).default("pending"),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        dueDate: z.date().optional(),
        assignedTo: z.number().optional(),
        createdBy: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }: any) => {
        if (ctx.user?.role !== "admin" && ctx.user?.role !== "gestionnaire") {
          throw new Error("Unauthorized: Admin or Manager only");
        }
        const createdBy = input.createdBy || ctx.user?.id || 1;
        return createCrmActivity({ ...input, createdBy } as any);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          status: z.enum(["pending", "completed", "cancelled"]).optional(),
          priority: z.enum(["low", "medium", "high"]).optional(),
          dueDate: z.date().optional(),
          completedDate: z.date().optional(),
          assignedTo: z.number().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }: any) => {
        if (ctx.user?.role !== "admin" && ctx.user?.role !== "gestionnaire") {
          throw new Error("Unauthorized: Admin or Manager only");
        }
        return updateCrmActivity(input.id, input.data as any);
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }: any) => {
        if (ctx.user?.role !== "admin" && ctx.user?.role !== "gestionnaire") {
          throw new Error("Unauthorized: Admin or Manager only");
        }
        await deleteCrmActivity(input);
        return { success: true };
      }),
  }),

  // ============ ADHESION PIPELINE ============
  pipeline: router({
    list: protectedProcedure
      .input(z.object({ stage: z.string().optional() }).optional())
      .query(async ({ input }: any) => {
        return listAdhesionPipeline(input?.stage);
      }),

    create: protectedProcedure
      .input(z.object({
        contactId: z.number(),
        stage: z.enum(["inquiry", "application", "review", "approved", "rejected", "member"]).default("inquiry"),
        applicationDate: z.date().optional(),
        notes: z.string().optional(),
        assignedTo: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }: any) => {
        if (ctx.user?.role !== "admin" && ctx.user?.role !== "gestionnaire") {
          throw new Error("Unauthorized: Admin or Manager only");
        }
        return createAdhesionPipeline(input as any);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        stage: z.enum(["inquiry", "application", "review", "approved", "rejected", "member"]),
        approvalDate: z.date().optional(),
        rejectionReason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }: any) => {
        if (ctx.user?.role !== "admin" && ctx.user?.role !== "gestionnaire") {
          throw new Error("Unauthorized: Admin or Manager only");
        }
        return updateAdhesionPipeline(input.id, {
          stage: input.stage,
          approvalDate: input.approvalDate,
          rejectionReason: input.rejectionReason,
          updatedAt: new Date(),
        } as any);
      }),
  }),

  // ============ REPORTS ============
  reports: router({
    list: protectedProcedure
      .input(z.object({ type: z.string().optional() }).optional())
      .query(async ({ input }: any) => {
        return listCrmReports(input?.type);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        type: z.enum(["engagement", "pipeline", "activity", "segment", "custom"]),
        description: z.string().optional(),
        data: z.any().optional(),
        filters: z.any().optional(),
        generatedBy: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }: any) => {
        if (ctx.user?.role !== "admin" && ctx.user?.role !== "gestionnaire") {
          throw new Error("Unauthorized: Admin or Manager only");
        }
        const generatedBy = input.generatedBy || ctx.user?.id || 1;
        return createCrmReport({ ...input, generatedBy } as any);
      }),

    getEngagementMetrics: protectedProcedure
      .query(async ({ ctx }: any) => {
        // Permettre à tous les utilisateurs authentifiés de voir les métriques
        // Retourner des données de base pour maintenant
        return {
          totalContacts: 0,
          activeContacts: 0,
          engagementRate: 0,
          averageScore: 0,
        };
      }),
  }),

  // ============ EMAIL INTEGRATION ============
  email: router({
    getHistory: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return listCrmEmailIntegration(input);
      }),

    logEmail: protectedProcedure
      .input(z.object({
        contactId: z.number(),
        emailHistoryId: z.number().optional(),
        subject: z.string(),
        content: z.string().optional(),
        direction: z.enum(["sent", "received"]),
        status: z.enum(["sent", "failed", "bounced", "opened", "clicked"]).default("sent"),
        sentBy: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }: any) => {
        if (ctx.user?.role !== "admin" && ctx.user?.role !== "gestionnaire") {
          throw new Error("Unauthorized: Admin or Manager only");
        }
        const sentBy = input.sentBy || ctx.user?.id || 1;
        return createCrmEmailIntegration({ ...input, sentBy } as any);
      }),
  }),
});
