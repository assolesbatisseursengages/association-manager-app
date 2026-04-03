import { useContext } from "react";
import { RoleContext } from "@/contexts/RoleContext";
import { UserRole, hasPermission, canPerformAction, getRolePermissions, isAdmin, isMember, RolePermissions } from "@/lib/permissions";

export function useRole() {
  const context = useContext(RoleContext);
  
  if (!context) {
    throw new Error("useRole doit être utilisé dans un RoleProvider");
  }

  return {
    currentRole: context.currentRole,
    switchRole: context.switchRole,
    isAdmin: isAdmin(context.currentRole),
    isMember: isMember(context.currentRole),
  };
}

export function usePermission() {
  const context = useContext(RoleContext);
  
  if (!context) {
    throw new Error("usePermission doit être utilisé dans un RoleProvider");
  }

  return {
    hasPermission: (feature: any, action: any) => hasPermission(context.currentRole, feature, action),
    canPerformAction: (feature: any, action: any) => canPerformAction(context.currentRole, feature, action),
    getPermissions: () => getRolePermissions(context.currentRole),
    currentRole: context.currentRole,
  };
}

export function useCanAccess(feature: keyof RolePermissions, action: "create" | "read" | "update" | "delete" = "read") {
  const { canPerformAction: can } = usePermission();
  return can(feature, action);
}
