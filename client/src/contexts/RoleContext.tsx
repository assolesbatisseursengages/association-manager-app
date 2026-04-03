import React, { createContext, useState, useCallback } from "react";
import { UserRole } from "@/lib/permissions";

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
}

export const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: React.ReactNode;
  initialRole?: UserRole;
}

export function RoleProvider({ children, initialRole = "membre" }: RoleProviderProps) {
  const [currentRole, setCurrentRole] = useState<UserRole>(initialRole);

  const switchRole = useCallback((role: UserRole) => {
    setCurrentRole(role);
    // Optionnel : sauvegarder le rôle dans sessionStorage
    sessionStorage.setItem("userRole", role);
  }, []);

  const value: RoleContextType = {
    currentRole,
    setCurrentRole,
    switchRole,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}
