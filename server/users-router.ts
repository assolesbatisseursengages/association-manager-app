import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { appUsers } from "../drizzle/schema";
import { desc } from "drizzle-orm";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";

export const usersRouter = router({
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      const users = await db
        .select({
          id: appUsers.id,
          email: appUsers.email,
          role: appUsers.role,
          isActive: appUsers.isActive,
          createdAt: appUsers.createdAt,
          fullName: appUsers.fullName,
        })
        .from(appUsers)
        .orderBy(desc(appUsers.createdAt));

      return users;
    } catch (error) {
      console.error("[Users] Failed to list users:", error);
      return [];
    }
  }),

  create: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["admin", "membre"]).default("membre"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Check if user already exists
        const existingUser = await db
          .select()
          .from(appUsers)
          .where(eq(appUsers.email, input.email))
          .limit(1);

        if (existingUser.length > 0) {
          throw new Error("Cet email existe déjà");
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(input.password, 10);

        // Create user
        await db.insert(appUsers).values({
          email: input.email,
          password: hashedPassword,
          role: input.role as "admin" | "membre",
          isActive: true,
        });

        return { success: true, message: "Utilisateur créé avec succès" };
      } catch (error: any) {
        console.error("[Users] Failed to create user:", error);
        throw new Error(error.message || "Erreur lors de la création");
      }
    }),

  updateRole: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["admin", "membre"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db
          .update(appUsers)
          .set({ role: input.role as "admin" | "membre" })
          .where(eq(appUsers.id, input.userId));

        return { success: true, message: "Rôle mis à jour avec succès" };
      } catch (error: any) {
        console.error("[Users] Failed to update role:", error);
        throw new Error("Erreur lors de la mise à jour du rôle");
      }
    }),

  delete: publicProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db.delete(appUsers).where(eq(appUsers.id, input.userId));

        return { success: true, message: "Utilisateur supprimé avec succès" };
      } catch (error: any) {
        console.error("[Users] Failed to delete user:", error);
        throw new Error("Erreur lors de la suppression");
      }
    }),

  updatePassword: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const hashedPassword = await bcryptjs.hash(input.newPassword, 10);

        await db
          .update(appUsers)
          .set({ password: hashedPassword })
          .where(eq(appUsers.id, input.userId));

        return { success: true, message: "Mot de passe mis à jour avec succès" };
      } catch (error: any) {
        console.error("[Users] Failed to update password:", error);
        throw new Error("Erreur lors de la mise à jour du mot de passe");
      }
    }),

  toggleActive: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db
          .update(appUsers)
          .set({ isActive: input.isActive })
          .where(eq(appUsers.id, input.userId));

        return {
          success: true,
          message: input.isActive
            ? "Utilisateur activé"
            : "Utilisateur désactivé",
        };
      } catch (error: any) {
        console.error("[Users] Failed to toggle active:", error);
        throw new Error("Erreur lors de la mise à jour");
      }
    }),
});
