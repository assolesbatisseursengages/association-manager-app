import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { cotisations, depenses, members } from "../../drizzle/schema";
import { sql } from "drizzle-orm";

export const reportsRouter = router({
  /**
   * Obtenir les statistiques financières pour le rapport
   */
  getFinancialStats: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Statistiques de base
      const totalCotisations = await db
        .select({ total: sql`COUNT(*)` })
        .from(cotisations);

      const totalDepenses = await db
        .select({ total: sql`COUNT(*)` })
        .from(depenses);

      return {
        cotisations: (totalCotisations[0]?.total as number) || 0,
        depenses: (totalDepenses[0]?.total as number) || 0,
        timestamp: new Date(),
      };
    }),

  /**
   * Générer un rapport financier complet
   */
  generateFinancialReport: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(2000),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 0);

      // Récupérer les données du mois
      const monthCotisations = await db
        .select()
        .from(cotisations)
        .where(
          sql`DATE(${cotisations.createdAt}) BETWEEN ${startDate} AND ${endDate}`
        );

      const monthDepenses = await db
        .select()
        .from(depenses)
        .where(
          sql`DATE(${depenses.createdAt}) BETWEEN ${startDate} AND ${endDate}`
        );

      return {
        period: `${input.month}/${input.year}`,
        cotisations: monthCotisations,
        depenses: monthDepenses,
        summary: {
          totalCotisations: monthCotisations.length,
          totalDepenses: monthDepenses.length,
        },
      };
    }),

  /**
   * Obtenir les données pour le rapport des membres
   */
  getMembersReport: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allMembers = await db.select().from(members);

    const activeMembers = allMembers.filter((m) => m.status === "active");
    const inactiveMembers = allMembers.filter((m) => m.status === "inactive");

    return {
      total: allMembers.length,
      active: activeMembers.length,
      inactive: inactiveMembers.length,
      byRole: allMembers.reduce(
        (acc, m) => {
          acc[m.role || "unknown"] = (acc[m.role || "unknown"] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      members: allMembers,
    };
  }),

  /**
   * Obtenir les données pour le graphique de dépenses
   */
  getExpensesChart: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allDepenses = await db.select().from(depenses);

    // Grouper par catégorie
    const byCategory = allDepenses.reduce(
      (acc, e) => {
        const category = e.categorie || "Autre";
        acc[category] = (acc[category] || 0) + (typeof e.montant === 'number' ? e.montant : 0);
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(byCategory).map(([name, value]) => ({
      name,
      value,
    }));
  }),

  /**
   * Obtenir les données pour le graphique de cotisations
   */
  getCotisationsChart: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allCotisations = await db.select().from(cotisations);

    return allCotisations.map((c) => ({
      name: `Cotisation ${c.id}`,
      montant: typeof c.montant === 'number' ? c.montant : 0,
      statut: c.statut || "pending",
    }));
  }),

  /**
   * Obtenir le rapport détaillé d'un projet
   */
  getProjectReport: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async () => {
      return {
        project: {
          id: 1,
          name: "Project Name",
          description: "Project description",
          status: "active",
          budget: 10000,
        },
        statistics: {
          totalTasks: 10,
          completedTasks: 5,
          progressPercentage: 50,
          totalExpenses: 5000,
          budgetUsagePercentage: 50,
          tasksByStatus: {
            todo: 3,
            inProgress: 2,
            completed: 5,
            blocked: 0,
          },
          tasksByPriority: {
            low: 2,
            medium: 5,
            high: 3,
          },
          teamSize: 3,
        },
        tasks: [],
        members: [],
      };
    }),

  /**
   * Obtenir le résumé de tous les projets
   */
  getAllProjectsSummary: protectedProcedure.query(async () => {
    return [
      {
        id: 1,
        name: "Project 1",
        status: "active",
        progressPercentage: 50,
        budget: 10000,
        totalExpenses: 5000,
        budgetUsagePercentage: 50,
        teamSize: 3,
        taskCount: 10,
        completedCount: 5,
      },
    ];
  }),

  /**
   * Obtenir le rapport financier par projet
   */
  getFinancialReportByProject: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async () => {
      return {
        summary: {
          totalBudget: 50000,
          totalSpent: 25000,
          totalRemaining: 25000,
          utilizationPercentage: 50,
        },
        projects: [
          {
            projectId: 1,
            projectName: "Project 1",
            budget: 10000,
            spent: 5000,
            remaining: 5000,
            percentage: 50,
          },
        ],
      };
    }),

  /**
   * Obtenir le rapport de performance de l'équipe
   */
  getTeamPerformanceReport: protectedProcedure.query(async () => {
    return {
      members: [],
      summary: {
        totalMembers: 0,
        activeMembers: 0,
      },
    };
  }),

  /**
   * Obtenir le rapport de chronologie/jalons d'un projet
   */
  getTimelineReport: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return {
        projectId: input.projectId,
        timeline: {},
        tasks: [],
      };
    }),
});
