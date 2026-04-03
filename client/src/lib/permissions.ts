/**
 * Système de rôles et permissions pour l'application
 */

export type UserRole = "admin" | "membre";

export interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface RolePermissions {
  documents: Permission;
  categories: Permission;
  members: Permission;
  finance: Permission;
  campaigns: Permission;
  adhesions: Permission;
  events: Permission;
  settings: Permission;
  activity: Permission;
  archives: Permission;
}

/**
 * Permissions par rôle
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    documents: { create: true, read: true, update: true, delete: true },
    categories: { create: true, read: true, update: true, delete: true },
    members: { create: true, read: true, update: true, delete: true },
    finance: { create: true, read: true, update: true, delete: true },
    campaigns: { create: true, read: true, update: true, delete: true },
    adhesions: { create: true, read: true, update: true, delete: true },
    events: { create: true, read: true, update: true, delete: true },
    settings: { create: true, read: true, update: true, delete: true },
    activity: { create: false, read: true, update: false, delete: false },
    archives: { create: false, read: true, update: false, delete: false },
  },
  membre: {
    documents: { create: false, read: true, update: false, delete: false },
    categories: { create: false, read: true, update: false, delete: false },
    members: { create: false, read: true, update: false, delete: false },
    finance: { create: false, read: true, update: false, delete: false },
    campaigns: { create: false, read: true, update: false, delete: false },
    adhesions: { create: false, read: true, update: false, delete: false },
    events: { create: false, read: true, update: false, delete: false },
    settings: { create: false, read: false, update: false, delete: false },
    activity: { create: false, read: true, update: false, delete: false },
    archives: { create: false, read: true, update: false, delete: false },
  },
};

/**
 * Descriptions des rôles
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Administrateur - Accès complet à toutes les fonctionnalités",
  membre: "Membre - Accès en lecture seule, pas de modifications",
};

/**
 * Vérifier si un rôle a une permission spécifique
 */
export function hasPermission(
  role: UserRole,
  feature: keyof RolePermissions,
  action: keyof Permission
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions[feature]?.[action] ?? false;
}

/**
 * Vérifier si un rôle peut effectuer une action CRUD
 */
export function canPerformAction(
  role: UserRole,
  feature: keyof RolePermissions,
  action: "create" | "read" | "update" | "delete"
): boolean {
  return hasPermission(role, feature, action);
}

/**
 * Obtenir toutes les permissions d'un rôle
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

/**
 * Vérifier si un rôle est admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}

/**
 * Vérifier si un rôle est membre
 */
export function isMember(role: UserRole): boolean {
  return role === "membre";
}
