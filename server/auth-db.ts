import { eq } from "drizzle-orm";
import { appUsers } from "../drizzle/schema";
import { getDb } from "./db";
import bcrypt from "bcryptjs";

/**
 * Trouver un utilisateur par email
 */
export async function findUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.email, email))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Trouver un utilisateur par ID
 */
export async function findUserById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Créer un nouvel utilisateur
 */
export async function createAppUser(data: {
  email: string;
  password: string;
  fullName: string;
  role?: "admin" | "membre";
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Vérifier si l'utilisateur existe déjà
  const existing = await findUserByEmail(data.email);
  if (existing) {
    throw new Error("Un utilisateur avec cet email existe déjà");
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Créer l'utilisateur
  const result = await db.insert(appUsers).values({
    email: data.email,
    password: hashedPassword,
    fullName: data.fullName,
    role: data.role || "membre",
    isActive: true,
  });

  // Récupérer l'utilisateur créé
  return findUserByEmail(data.email);
}

/**
 * Vérifier le mot de passe d'un utilisateur
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Mettre à jour le dernier login
 */
export async function updateLastLogin(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(appUsers)
    .set({ lastLogin: new Date() })
    .where(eq(appUsers.id, userId));
}

/**
 * Changer le mot de passe d'un utilisateur
 */
export async function changePassword(
  userId: number,
  oldPassword: string,
  newPassword: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Trouver l'utilisateur
  const user = await findUserById(userId);
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  // Vérifier l'ancien mot de passe
  const isValid = await verifyPassword(oldPassword, user.password);
  if (!isValid) {
    throw new Error("L'ancien mot de passe est incorrect");
  }

  // Hasher le nouveau mot de passe
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Mettre à jour le mot de passe
  await db
    .update(appUsers)
    .set({ password: hashedPassword })
    .where(eq(appUsers.id, userId));

  return true;
}

/**
 * Désactiver un utilisateur
 */
export async function deactivateUser(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(appUsers)
    .set({ isActive: false })
    .where(eq(appUsers.id, userId));
}

/**
 * Réactiver un utilisateur
 */
export async function activateUser(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(appUsers)
    .set({ isActive: true })
    .where(eq(appUsers.id, userId));
}
