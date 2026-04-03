import { z } from "zod";

/**
 * Schémas de validation pour l'authentification email/mot de passe
 */

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[!@#$%^&*]/, "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)"),
  fullName: z.string().min(2, "Le nom complet est requis"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "L'ancien mot de passe est requis"),
  newPassword: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[!@#$%^&*]/, "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const appUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  fullName: z.string().nullable(),
  role: z.enum(["admin", "membre"]),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AppUserResponse = z.infer<typeof appUserSchema>;
