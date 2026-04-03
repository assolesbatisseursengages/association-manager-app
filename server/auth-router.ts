import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { loginSchema, registerSchema, changePasswordSchema } from "@shared/auth-schemas";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getSessionCookieOptions } from "./_core/cookies";
import {
  findUserByEmail,
  findUserById,
  createAppUser,
  verifyPassword,
  updateLastLogin,
  changePassword as changeUserPassword,
} from "./auth-db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Créer un token JWT
 */
function createToken(userId: number, email: string) {
  return jwt.sign({ userId, email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * Vérifier un token JWT
 */
function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
  } catch (error) {
    return null;
  }
}

export const authRouter = router({
  /**
   * Obtenir l'utilisateur actuellement connecté
   */
  me: publicProcedure.query(opts => opts.ctx.user),

  /**
   * Login avec email et mot de passe
   */
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Trouver l'utilisateur par email
        const user = await findUserByEmail(input.email);
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou mot de passe incorrect",
          });
        }

        // Vérifier que l'utilisateur est actif
        if (!user.isActive) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cet utilisateur a été désactivé",
          });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await verifyPassword(input.password, user.password);
        if (!isPasswordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou mot de passe incorrect",
          });
        }

        // Mettre à jour le dernier login
        await updateLastLogin(user.id);

        // Créer un token JWT
        const token = createToken(user.id, user.email!);

        // Définir le cookie de session
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: SESSION_DURATION,
        });

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la connexion",
        });
      }
    }),

  /**
   * Register avec email, mot de passe et nom complet
   */
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Créer l'utilisateur
        const user = await createAppUser({
          email: input.email,
          password: input.password,
          fullName: input.fullName,
          role: "membre",
        });

        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de la création du compte",
          });
        }

        // Créer un token JWT
        const token = createToken(user.id, user.email!);

        // Définir le cookie de session
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: SESSION_DURATION,
        });

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        const message = error instanceof Error ? error.message : "Erreur lors de l'inscription";
        throw new TRPCError({
          code: "BAD_REQUEST",
          message,
        });
      }
    }),

  /**
   * Changer le mot de passe
   */
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Vous devez être connecté",
          });
        }

        await changeUserPassword(ctx.user.id, input.oldPassword, input.newPassword);

        return {
          success: true,
          message: "Mot de passe changé avec succès",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        const message = error instanceof Error ? error.message : "Erreur lors du changement de mot de passe";
        throw new TRPCError({
          code: "BAD_REQUEST",
          message,
        });
      }
    }),

  /**
   * Logout
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),
});
