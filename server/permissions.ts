import { TRPCError } from "@trpc/server";
import type { User } from "../drizzle/schema";

/**
 * Role-based permissions system
 * 
 * Admin: Full access to all features
 * Gestionnaire: Can add and modify data, but cannot delete
 * Lecteur: Read-only access
 */

export type UserRole = "admin" | "gestionnaire" | "lecteur";

export interface Permission {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canDownload: boolean;
  canManageUsers: boolean;
  canAccessSettings: boolean;
}

export const rolePermissions: Record<UserRole, Permission> = {
  admin: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canDownload: true,
    canManageUsers: true,
    canAccessSettings: true,
  },
  gestionnaire: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: false,
    canDownload: true,
    canManageUsers: false,
    canAccessSettings: false,
  },
  lecteur: {
    canCreate: false,
    canRead: true,
    canUpdate: false,
    canDelete: false,
    canDownload: true,
    canManageUsers: false,
    canAccessSettings: false,
  },
};

/**
 * Check if user has permission to perform action
 */
export function checkPermission(user: User | null, permission: keyof Permission): boolean {
  if (!user) return false;
  
  const userRole = (user.role as UserRole) || "lecteur";
  const permissions = rolePermissions[userRole];
  
  return permissions[permission] === true;
}

/**
 * Throw error if user doesn't have permission
 */
export function requirePermission(user: User | null, permission: keyof Permission, action: string): void {
  if (!checkPermission(user, permission)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `You don't have permission to ${action}. Required role: admin or gestionnaire`,
    });
  }
}

/**
 * Throw error if user is not admin
 */
export function requireAdmin(user: User | null): void {
  if (!user || user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only administrators can perform this action",
    });
  }
}

/**
 * Throw error if user cannot read
 */
export function requireRead(user: User | null): void {
  requirePermission(user, "canRead", "read this data");
}

/**
 * Throw error if user cannot create
 */
export function requireCreate(user: User | null): void {
  requirePermission(user, "canCreate", "create this data");
}

/**
 * Throw error if user cannot update
 */
export function requireUpdate(user: User | null): void {
  requirePermission(user, "canUpdate", "update this data");
}

/**
 * Throw error if user cannot delete
 */
export function requireDelete(user: User | null): void {
  requirePermission(user, "canDelete", "delete this data");
}

/**
 * Throw error if user cannot download
 */
export function requireDownload(user: User | null): void {
  requirePermission(user, "canDownload", "download this data");
}

/**
 * Throw error if user cannot manage users
 */
export function requireManageUsers(user: User | null): void {
  requirePermission(user, "canManageUsers", "manage users");
}

/**
 * Throw error if user cannot access settings
 */
export function requireAccessSettings(user: User | null): void {
  requirePermission(user, "canAccessSettings", "access settings");
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    admin: "Administrateur Principal",
    gestionnaire: "Gestionnaire",
    lecteur: "Lecteur",
  };
  return names[role] || role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    admin: "Accès complet à tous les modules et fonctionnalités. Peut gérer les utilisateurs et les paramètres.",
    gestionnaire: "Peut ajouter et modifier les données, mais ne peut pas les supprimer. Accès en lecture à tous les documents.",
    lecteur: "Accès en lecture seule. Peut visualiser et télécharger les documents.",
  };
  return descriptions[role] || "";
}
