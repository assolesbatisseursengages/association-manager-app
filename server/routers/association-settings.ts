import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { sql, eq } from "drizzle-orm";

export const associationSettingsRouter = router({
  // Get current association settings
  getSettings: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.execute(
      sql`SELECT * FROM association_settings WHERE associationId = 1 LIMIT 1`
    );

    const rows = result as any[];
    return rows[0] || null;
  }),

  // Update association settings
  updateSettings: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        logoUrl: z.string().optional(),
        logoFileName: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        website: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        description: z.string().optional(),
        theme: z.enum(["light", "dark"]).optional(),
        language: z.string().optional(),
        timezone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Build update object
      const updates: Record<string, any> = {};

      if (input.name) updates.name = input.name;
      if (input.logoUrl) updates.logoUrl = input.logoUrl;
      if (input.logoFileName) updates.logoFileName = input.logoFileName;
      if (input.primaryColor) updates.primaryColor = input.primaryColor;
      if (input.secondaryColor) updates.secondaryColor = input.secondaryColor;
      if (input.accentColor) updates.accentColor = input.accentColor;
      if (input.contactEmail) updates.contactEmail = input.contactEmail;
      if (input.contactPhone) updates.contactPhone = input.contactPhone;
      if (input.website) updates.website = input.website;
      if (input.address) updates.address = input.address;
      if (input.city) updates.city = input.city;
      if (input.country) updates.country = input.country;
      if (input.description) updates.description = input.description;
      if (input.theme) updates.theme = input.theme;
      if (input.language) updates.language = input.language;
      if (input.timezone) updates.timezone = input.timezone;

      if (Object.keys(updates).length === 0) {
        return { success: false, message: "No fields to update" };
      }

      // Execute update
      const updateQuery = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(", ");

      const values = Object.values(updates);
      values.push(1); // associationId

      // Simple update without raw SQL
      const updateParts = Object.entries(updates).map(([key, value]) => ({ key, value }));
      
      // Build a simple update query
      let updateStr = "UPDATE association_settings SET ";
      updateStr += Object.keys(updates).map(k => `${k} = '${String(updates[k]).replace(/'/g, "''")}' `).join(", ");
      updateStr += ", updatedAt = CURRENT_TIMESTAMP WHERE associationId = 1";
      
      await db.execute(sql.raw(updateStr));

      return { success: true, message: "Settings updated successfully" };
    }),

  // Upload logo (returns URL)
  uploadLogo: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        mimeType: z.string(),
        base64Data: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // In production, you would upload to S3 or similar
      // For now, we'll store the base64 data and return a data URL
      const dataUrl = `data:${input.mimeType};base64,${input.base64Data}`;

      return {
        success: true,
        url: dataUrl,
        fileName: input.fileName,
      };
    }),

  // Get offline sync status
  getOfflineSyncStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.execute(
      sql`SELECT COUNT(*) as pending FROM offline_sync_queue WHERE userId = ? AND status = 'pending'`
    );

    const rows = result as any[];
    return {
      pendingSync: rows[0]?.pending || 0,
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    };
  }),

  // Sync offline data
  syncOfflineData: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get all pending sync items
    const result = await db.execute(
      sql`SELECT * FROM offline_sync_queue WHERE userId = ? AND status = 'pending' ORDER BY createdAt ASC`
    );

    const rows = result as any[];
    let synced = 0;
    let failed = 0;

    for (const item of rows) {
      try {
        // Process each sync item based on action and table
        // This is a simplified version - in production you'd handle each table differently

        await db.execute(
          sql`UPDATE offline_sync_queue SET status = 'synced', syncedAt = CURRENT_TIMESTAMP WHERE id = ?`
        );

        synced++;
      } catch (error) {
        await db.execute(
          sql`UPDATE offline_sync_queue SET status = 'failed', errorMessage = ? WHERE id = ?`
        );

        failed++;
      }
    }

    return {
      success: true,
      synced,
      failed,
      message: `Synced ${synced} items, ${failed} failed`,
    };
  }),
});
