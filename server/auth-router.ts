/**
 * AUTH ROUTER UNIFIÉ
 *
 * Source de vérité unique : users + users_local + user_sessions
 * Supprime la dépendance à app_users et aux JWT cookie.
 *
 * Flux :
 *   login / register → users_local (bcrypt) → user_sessions (token opaque) → cookie session_token
 *   auth.me          → context.ts lit cookie session_token → getUserSessionByToken → users
 *   logout           → deleteUserSession + clear cookie
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { loginSchema, registerSchema, changePasswordSchema } from "@shared/auth-schemas";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getLocalUserByEmail,
  createLocalUser,
  updateLastLoginTime,
  updateLocalUserPassword,
  getLocalUserByUserId,
  createUserSession,
  deleteUserSession,
  getDb,
} from "./db";
import { hashPassword, verifyPassword, generateToken, validatePassword } from "./auth-local";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Durée cookie : 7 jours en ms
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

function setSessionCookie(res: any, token: string) {
  const maxAge = SESSION_MS / 1000; // secondes
  const secure = process.env.NODE_ENV === "production";
  res.cookie("session_token", token, {
    httpOnly: true,       // inaccessible au JS (protection XSS)
    sameSite: "lax",
    secure,
    maxAge: maxAge * 1000, // Express attend des ms
    path: "/",
  });
}

function clearSessionCookie(res: any) {
  res.clearCookie("session_token", { path: "/" });
}

export const authRouter = router({
  /**
   * Utilisateur connecté — lu depuis ctx (context.ts)
   * Retourne null si non authentifié (pas d'erreur → le frontend gère le redirect)
   */
  me: publicProcedure.query((opts) => opts.ctx.user ?? null),

  /**
   * Connexion email + mot de passe
   */
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      // 1. Chercher dans users_local
      const localUser = await getLocalUserByEmail(input.email);
      if (!localUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou mot de passe incorrect",
        });
      }

      // 2. Vérifier le mot de passe bcrypt
      const valid = await verifyPassword(input.password, localUser.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou mot de passe incorrect",
        });
      }

      // 3. Charger le profil complet depuis users
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB indisponible" });

      const userRecord = await db.select().from(users).where(eq(users.id, localUser.userId)).limit(1);
      const user = userRecord[0];
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profil utilisateur introuvable" });
      }

      // 4. Créer une session
      await updateLastLoginTime(localUser.userId);
      const token = generateToken();
      await createUserSession(
        localUser.userId,
        token,
        ctx.req.headers["user-agent"],
        ctx.req.ip,
      );

      // 5. Poser le cookie HttpOnly (+ header pour le client)
      setSessionCookie(ctx.res, token);

      return {
        success: true,
        sessionToken: token, // gardé pour la compatibilité Login.tsx → cookie
        userId: user.id,
        email: user.email,
        name: user.name ?? user.email,
        role: user.role,
      };
    }),

  /**
   * Inscription — crée users + users_local
   */
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      // 1. Vérifier doublon
      const existing = await getLocalUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Un compte existe déjà avec cet email" });
      }

      // 2. Valider la force du mot de passe
      const pwCheck = validatePassword(input.password);
      if (!pwCheck.isValid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: pwCheck.errors.join(", ") });
      }

      // 3. Hash + création
      const passwordHash = await hashPassword(input.password);
      const localUser = await createLocalUser(input.email, passwordHash);

      // 4. Mettre à jour le nom dans users
      const db = await getDb();
      if (db) {
        await db.update(users).set({ name: input.fullName }).where(eq(users.id, localUser.userId));
      }

      // 5. Session
      const token = generateToken();
      await createUserSession(localUser.userId, token, ctx.req.headers["user-agent"], ctx.req.ip);
      setSessionCookie(ctx.res, token);

      return {
        success: true,
        sessionToken: token,
        userId: localUser.userId,
        email: localUser.email,
        name: input.fullName,
      };
    }),

  /**
   * Déconnexion
   */
  logout: publicProcedure.mutation(async ({ ctx }) => {
    // Lire le token depuis le cookie
    const cookieHeader = ctx.req.headers.cookie ?? "";
    const match = cookieHeader.match(/session_token=([^;]+)/);
    const token = match?.[1];

    if (token) {
      try {
        await deleteUserSession(token);
      } catch {
        // Session déjà expirée — pas grave
      }
    }

    clearSessionCookie(ctx.res);
    return { success: true };
  }),

  /**
   * Changement de mot de passe (utilisateur connecté)
   */
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const localUser = await getLocalUserByUserId(ctx.user.id);
      if (!localUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Compte local introuvable" });
      }

      const valid = await verifyPassword(input.oldPassword, localUser.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Ancien mot de passe incorrect" });
      }

      const pwCheck = validatePassword(input.newPassword);
      if (!pwCheck.isValid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: pwCheck.errors.join(", ") });
      }

      const newHash = await hashPassword(input.newPassword);
      await updateLocalUserPassword(ctx.user.id, newHash);

      return { success: true, message: "Mot de passe modifié avec succès" };
    }),
});
