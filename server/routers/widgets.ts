import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { dashboardWidgets, widgetTemplates } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const widgetsRouter = router({
  /**
   * Get all available widget templates
   */
  getTemplates: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const templates = await db.select().from(widgetTemplates).where(eq(widgetTemplates.isActive, true));
    return templates;
  }),

  /**
   * Get user's dashboard widgets
   */
  getUserWidgets: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const widgets = await db
      .select()
      .from(dashboardWidgets)
      .where(and(eq(dashboardWidgets.userId, ctx.user.id), eq(dashboardWidgets.isVisible, true)))
      .orderBy(dashboardWidgets.position);

    return widgets;
  }),

  /**
   * Add a new widget to dashboard
   */
  addWidget: protectedProcedure
    .input(
      z.object({
        widgetType: z.string(),
        title: z.string(),
        description: z.string().optional(),
        size: z.enum(["small", "medium", "large"] as const).default("medium"),
        config: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get the next position
      const lastWidget = await db
        .select({ position: dashboardWidgets.position })
        .from(dashboardWidgets)
        .where(eq(dashboardWidgets.userId, ctx.user.id))
        .limit(1);

      const nextPosition = lastWidget.length > 0 ? Math.max(...lastWidget.map(w => w.position)) + 1 : 0;

      await db.insert(dashboardWidgets).values({
        userId: ctx.user.id,
        widgetType: input.widgetType,
        title: input.title,
        description: input.description,
        position: nextPosition,
        size: input.size,
        config: input.config || {},
      });

      return { position: nextPosition };
    }),

  /**
   * Update widget configuration
   */
  updateWidget: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        size: z.enum(["small", "medium", "large"] as const).optional(),
        config: z.record(z.string(), z.any()).optional(),
        isVisible: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: Record<string, any> = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.size !== undefined) updateData.size = input.size;
      if (input.config !== undefined) updateData.config = input.config;
      if (input.isVisible !== undefined) updateData.isVisible = input.isVisible;

      await db
        .update(dashboardWidgets)
        .set(updateData)
        .where(and(eq(dashboardWidgets.id, input.id), eq(dashboardWidgets.userId, ctx.user.id)));
      
      return { success: true };
    }),

  /**
   * Reorder widgets
   */
  reorderWidgets: protectedProcedure
    .input(
      z.object({
        widgets: z.array(
          z.object({
            id: z.number(),
            position: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Update all widgets positions
      for (const widget of input.widgets) {
        await db
          .update(dashboardWidgets)
          .set({ position: widget.position })
          .where(and(eq(dashboardWidgets.id, widget.id), eq(dashboardWidgets.userId, ctx.user.id)))
          .limit(1);
      }

      return { success: true };
    }),

  /**
   * Remove widget from dashboard
   */
  removeWidget: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(dashboardWidgets)
        .where(and(eq(dashboardWidgets.id, input.id), eq(dashboardWidgets.userId, ctx.user.id)));

      return { success: true };
    }),

  /**
   * Reset dashboard to default widgets
   */
  resetDashboard: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Delete all user's widgets
    await db.delete(dashboardWidgets).where(eq(dashboardWidgets.userId, ctx.user.id));

    // Add default widgets
    const defaultWidgets = [
      {
        userId: ctx.user.id,
        widgetType: "kpi",
        title: "Statistiques Clés",
        position: 0,
        size: "large" as const,
        config: { metrics: ["members", "finances", "documents"] },
      },
      {
        userId: ctx.user.id,
        widgetType: "chart",
        title: "Graphique Finances",
        position: 1,
        size: "medium" as const,
        config: { type: "bar", period: "month" },
      },
      {
        userId: ctx.user.id,
        widgetType: "activity",
        title: "Activité Récente",
        position: 2,
        size: "medium" as const,
        config: { limit: 10 },
      },
    ];

    await db.insert(dashboardWidgets).values(defaultWidgets);

    return { success: true };
  }),
});
