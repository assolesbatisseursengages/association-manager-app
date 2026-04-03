import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  createLocalUser,
  getLocalUserByEmail,
  getLocalUserByUserId,
  updateLocalUserPassword,
  updateLastLoginTime,
  createUserSession,
  getUserSessionByToken,
  deleteUserSession,
  getDb,
} from "../db";
import {
  hashPassword,
  verifyPassword,
  validateEmail,
  validatePassword,
  generateToken,
} from "../auth-local";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const localAuthRouter = router({
  /**
   * Register a new user with email and password
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email invalide"),
        password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
        name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Validate email format
        if (!validateEmail(input.email)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Format d'email invalide",
          });
        }

        // Validate password strength
        const passwordValidation = validatePassword(input.password);
        if (!passwordValidation.isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: passwordValidation.errors.join(", "),
          });
        }

        // Check if user already exists
        const existingUser = await getLocalUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Un utilisateur avec cet email existe déjà",
          });
        }

        // Hash password
        const passwordHash = await hashPassword(input.password);

        // Create local user
        const localUser = await createLocalUser(input.email, passwordHash);

        // Update the user's name
        const db = await getDb();
        if (db) {
          await db
            .update(users)
            .set({ name: input.name })
            .where(eq(users.id, localUser.userId));
        }

        // Create session token
        const sessionToken = generateToken();
        await createUserSession(localUser.userId, sessionToken);

        return {
          success: true,
          userId: localUser.userId,
          email: localUser.email,
          sessionToken,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[LocalAuth] Registration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de l'enregistrement",
        });
      }
    }),

  /**
   * Login with email and password
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email invalide"),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Get user by email
        const localUser = await getLocalUserByEmail(input.email);
        if (!localUser) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou mot de passe incorrect",
          });
        }

        // Verify password
        const isPasswordValid = await verifyPassword(input.password, localUser.passwordHash);
        if (!isPasswordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou mot de passe incorrect",
          });
        }

        // Update last login time
        await updateLastLoginTime(localUser.userId);

        // Create session token
        const sessionToken = generateToken();
        await createUserSession(localUser.userId, sessionToken);

        // Get user info
        const db = await getDb();
        let userName = "Utilisateur";
        if (db) {
          const userRecord = await db
            .select()
            .from(users)
            .where(eq(users.id, localUser.userId))
            .limit(1);
          if (userRecord[0]) {
            userName = userRecord[0].name || "Utilisateur";
          }
        }

        return {
          success: true,
          userId: localUser.userId,
          email: localUser.email,
          name: userName,
          sessionToken,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[LocalAuth] Login error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la connexion",
        });
      }
    }),

  /**
   * Verify session token
   */
  verifySession: publicProcedure
    .input(z.object({ sessionToken: z.string() }))
    .query(async ({ input }) => {
      try {
        const session = await getUserSessionByToken(input.sessionToken);
        if (!session) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Session invalide ou expirée",
          });
        }

        // Get user info
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Base de données non disponible",
          });
        }

        const userRecord = await db
          .select()
          .from(users)
          .where(eq(users.id, session.userId))
          .limit(1);

        if (!userRecord[0]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Utilisateur non trouvé",
          });
        }

        return {
          userId: session.userId,
          email: userRecord[0].email,
          name: userRecord[0].name,
          role: userRecord[0].role,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[LocalAuth] Session verification error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la vérification de la session",
        });
      }
    }),

  /**
   * Logout
   */
  logout: publicProcedure
    .input(z.object({ sessionToken: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await deleteUserSession(input.sessionToken);
        return { success: true };
      } catch (error) {
        console.error("[LocalAuth] Logout error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la déconnexion",
        });
      }
    }),

  /**
   * Change password
   */
  changePassword: publicProcedure
    .input(
      z.object({
        sessionToken: z.string(),
        currentPassword: z.string(),
        newPassword: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Verify session
        const session = await getUserSessionByToken(input.sessionToken);
        if (!session) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Session invalide",
          });
        }

        // Get local user
        const localUser = await getLocalUserByUserId(session.userId);
        if (!localUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Utilisateur non trouvé",
          });
        }

        // Verify current password
        const isPasswordValid = await verifyPassword(input.currentPassword, localUser.passwordHash);
        if (!isPasswordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Mot de passe actuel incorrect",
          });
        }

        // Validate new password
        const passwordValidation = validatePassword(input.newPassword);
        if (!passwordValidation.isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: passwordValidation.errors.join(", "),
          });
        }

        // Hash new password
        const newPasswordHash = await hashPassword(input.newPassword);

        // Update password
        await updateLocalUserPassword(session.userId, newPasswordHash);

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[LocalAuth] Change password error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors du changement de mot de passe",
        });
      }
    }),
});
