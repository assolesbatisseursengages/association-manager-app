import { useState, useEffect } from "react";

const SESSION_KEY = "app_session_token";
const USERS_STORAGE_KEY = "batisseurs_users";

// Utilisateurs par défaut
const DEFAULT_USERS = [
  {
    id: 1,
    email: "admin@batisseurs-engages.fr",
    password: "Admin123!",
    fullName: "Administrateur",
    role: "admin" as const,
    isActive: true,
    createdAt: new Date("2025-01-01").toISOString(),
  },
  {
    id: 2,
    email: "marie.dupont@batisseurs-engages.fr",
    password: "Marie123!",
    fullName: "Marie Dupont",
    role: "membre" as const,
    isActive: true,
    createdAt: new Date("2025-01-15").toISOString(),
  },
];

export function usePasswordAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Charger les utilisateurs depuis localStorage ou utiliser les valeurs par défaut
  const getUsers = () => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_USERS;
      }
    }
    return DEFAULT_USERS;
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const token = sessionStorage.getItem(SESSION_KEY);
    const userEmail = sessionStorage.getItem("current_user_email");
    if (token && userEmail) {
      const users = getUsers();
      const user = users.find((u: any) => u.email === userEmail);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    }
    setIsLoading(false);
  }, []);

  // Fonction de connexion
  const login = (email: string, password: string): boolean => {
    setError(null);
    
    if (!email || !password) {
      setError("Veuillez entrer votre email et votre mot de passe");
      return false;
    }

    // Valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Veuillez entrer une adresse email valide");
      return false;
    }

    const users = getUsers();
    const user = users.find((u: any) => u.email === email);

    if (user && user.password === password) {
      if (!user.isActive) {
        setError("Ce compte est désactivé. Contactez l'administrateur.");
        return false;
      }
      
      const token = Math.random().toString(36).substring(2);
      sessionStorage.setItem(SESSION_KEY, token);
      sessionStorage.setItem("current_user_email", email);
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    } else {
      setError("Email ou mot de passe incorrect");
      return false;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("current_user_email");
    setIsAuthenticated(false);
    setError(null);
    setCurrentUser(null);
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    currentUser,
    login,
    logout,
  };
}
