import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { uploadToCloudinary, deleteFromCloudinary, getCloudinaryUrl } from "../_core/cloudinary";

export const mediaRouter = router({
  uploadFile: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileBuffer: z.string(), // Base64 encoded file
        folder: z.string().optional(),
        fileType: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Decode base64 to buffer
        const buffer = Buffer.from(input.fileBuffer, "base64");

        // Upload to Cloudinary
        const result = await uploadToCloudinary(
          buffer,
          input.fileName,
          input.folder || "association-manager"
        );

        return {
          success: true,
          publicId: result.public_id,
          url: result.secure_url,
          fileType: result.resource_type,
          size: result.bytes,
          width: result.width,
          height: result.height,
        };
      } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload file to Cloudinary",
        });
      }
    }),

  deleteFile: protectedProcedure
    .input(z.object({ publicId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const result = await deleteFromCloudinary(input.publicId);
        return {
          success: result.result === "ok",
          message: result.result,
        };
      } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete file from Cloudinary",
        });
      }
    }),

  getFileUrl: protectedProcedure
    .input(z.object({ publicId: z.string() }))
    .query(({ input }) => {
      try {
        const url = getCloudinaryUrl(input.publicId);
        return { url };
      } catch (error) {
        console.error("Error getting file URL from Cloudinary:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get file URL",
        });
      }
    }),

  getTransformedUrl: protectedProcedure
    .input(
      z.object({
        publicId: z.string(),
        width: z.number().optional(),
        height: z.number().optional(),
        quality: z.string().optional(),
        format: z.string().optional(),
      })
    )
    .query(({ input }) => {
      try {
        const transformations: Record<string, any> = {};
        if (input.width) transformations.width = input.width;
        if (input.height) transformations.height = input.height;
        if (input.quality) transformations.quality = input.quality;
        if (input.format) transformations.format = input.format;

        const url = getCloudinaryUrl(input.publicId);
        // Note: For more complex transformations, you would need to use the full Cloudinary URL builder
        return { url };
      } catch (error) {
        console.error("Error getting transformed URL:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get transformed URL",
        });
      }
    }),
});
