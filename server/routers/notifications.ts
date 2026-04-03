import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

export const notificationsRouter = router({
  list: protectedProcedure
    .input(z.object({ unreadOnly: z.boolean().optional(), limit: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const unreadFilter = input?.unreadOnly ? "AND isRead = FALSE" : "";
        const limit = input?.limit || 20;
        
        const result = await (db as any).$client.query(`
          SELECT id, title, message, type, isRead, createdAt, relatedEntityType, relatedEntityId
          FROM notifications
          WHERE userId = ${ctx.user?.id} ${unreadFilter}
          ORDER BY createdAt DESC
          LIMIT ${limit}
        `);
        return result?.[0] || [];
      } catch (error) {
        console.error("[Notifications] Error listing:", error);
        return [];
      }
    }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await (db as any).$client.query(`
          UPDATE notifications 
          SET isRead = TRUE, readAt = NOW()
          WHERE id = ${input.id} AND userId = ${ctx.user?.id}
        `);
        return { success: true };
      } catch (error) {
        console.error("[Notifications] Error marking as read:", error);
        throw error;
      }
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      await (db as any).$client.query(`
        UPDATE notifications 
        SET isRead = TRUE, readAt = NOW()
        WHERE userId = ${ctx.user?.id} AND isRead = FALSE
      `);
      return { success: true };
    } catch (error) {
      console.error("[Notifications] Error marking all as read:", error);
      throw error;
    }
  }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return 0;

    try {
      const result = await (db as any).$client.query(`
        SELECT COUNT(*) as count FROM notifications
        WHERE userId = ${ctx.user?.id} AND isRead = FALSE
      `);
      return result?.[0]?.[0]?.count || 0;
    } catch (error) {
      console.error("[Notifications] Error getting unread count:", error);
      return 0;
    }
  }),

  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    try {
      const result = await (db as any).$client.query(`
        SELECT * FROM notification_preferences WHERE userId = ${ctx.user?.id}
      `);
      return result?.[0]?.[0] || null;
    } catch (error) {
      console.error("[Notifications] Error getting preferences:", error);
      return null;
    }
  }),

  updatePreferences: protectedProcedure
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        smsNotifications: z.boolean().optional(),
        inAppNotifications: z.boolean().optional(),
        notificationFrequency: z.enum(["immediate", "daily", "weekly", "never"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const updates = [];
        if (input.emailNotifications !== undefined) updates.push(`emailNotifications = ${input.emailNotifications}`);
        if (input.smsNotifications !== undefined) updates.push(`smsNotifications = ${input.smsNotifications}`);
        if (input.inAppNotifications !== undefined) updates.push(`inAppNotifications = ${input.inAppNotifications}`);
        if (input.notificationFrequency) updates.push(`notificationFrequency = '${input.notificationFrequency}'`);

        if (updates.length === 0) return { success: false };

        await (db as any).$client.query(`
          UPDATE notification_preferences
          SET ${updates.join(", ")}
          WHERE userId = ${ctx.user?.id}
        `);
        return { success: true };
      } catch (error) {
        console.error("[Notifications] Error updating preferences:", error);
        throw error;
      }
    }),
});
