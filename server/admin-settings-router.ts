import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import {
  getAppSetting,
  getAllAppSettings,
  updateAppSetting,
  deleteAppSetting,
} from "./db";
import { logAudit } from "./audit";
import { TRPCError } from "@trpc/server";

export const adminSettingsRouter = router({
  // Get all settings
  getAll: adminProcedure.query(async () => {
    return await getAllAppSettings();
  }),

  // Get a specific setting
  get: adminProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      return await getAppSetting(input.key);
    }),

  // Update a setting
  update: adminProcedure
    .input(z.object({
      key: z.string().min(1),
      value: z.string().min(1),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const setting = await updateAppSetting(
          input.key,
          input.value,
          ctx.user.id,
          input.description
        );

        await logAudit({
          userId: ctx.user.id,
          action: "UPDATE",
          entityType: "app_setting",
          entityName: input.key,
          description: `Updated app setting: ${input.key} = ${input.value}`,
          status: "success",
        });

        return setting;
      } catch (error) {
        await logAudit({
          userId: ctx.user.id,
          action: "UPDATE",
          entityType: "app_setting",
          entityName: input.key,
          description: `Failed to update app setting: ${input.key}`,
          status: "failed",
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update setting",
        });
      }
    }),

  // Delete a setting
  delete: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        await deleteAppSetting(input.key);

        await logAudit({
          userId: ctx.user.id,
          action: "DELETE",
          entityType: "app_setting",
          entityName: input.key,
          description: `Deleted app setting: ${input.key}`,
          status: "success",
        });

        return { success: true };
      } catch (error) {
        await logAudit({
          userId: ctx.user.id,
          action: "DELETE",
          entityType: "app_setting",
          entityName: input.key,
          description: `Failed to delete app setting: ${input.key}`,
          status: "failed",
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete setting",
        });
      }
    }),

  // Batch update settings
  updateBatch: adminProcedure
    .input(z.array(z.object({
      key: z.string(),
      value: z.string(),
      description: z.string().optional(),
    })))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const results = [];
      for (const setting of input) {
        try {
          const result = await updateAppSetting(
            setting.key,
            setting.value,
            ctx.user.id,
            setting.description
          );
          results.push({ key: setting.key, success: true, result });
        } catch (error) {
          results.push({ key: setting.key, success: false, error: String(error) });
        }
      }

      await logAudit({
        userId: ctx.user.id,
        action: "UPDATE",
        entityType: "app_settings",
        entityName: "batch_update",
        description: `Batch updated ${input.length} app settings`,
        status: "success",
      });

      return results;
    }),
});
