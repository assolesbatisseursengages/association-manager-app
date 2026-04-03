import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false } = options ?? {};
  const [, setLocation] = useLocation();

  const [sessionToken, setSessionToken] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("sessionToken") ?? "";
  });

  // Re-sync token from localStorage on focus or storage changes
  useEffect(() => {
    const syncToken = () => {
      const token = localStorage.getItem("sessionToken") ?? "";
      setSessionToken(token);
    };
    window.addEventListener("focus", syncToken);
    window.addEventListener("storage", syncToken);
    syncToken();
    return () => {
      window.removeEventListener("focus", syncToken);
      window.removeEventListener("storage", syncToken);
    };
  }, []);

  const verifyQuery = trpc.localAuth.verifySession.useQuery(
    { sessionToken },
    {
      enabled: Boolean(sessionToken),
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const logoutMutation = trpc.localAuth.logout.useMutation();

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem("sessionToken");
      if (token) {
        await logoutMutation.mutateAsync({ sessionToken: token });
      }
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      setSessionToken("");
      setLocation("/login");
    }
  }, [logoutMutation, setLocation]);

  const user = verifyQuery.data
    ? {
        id: verifyQuery.data.userId,
        name: verifyQuery.data.name ?? "Utilisateur",
        email: verifyQuery.data.email ?? "",
        role: verifyQuery.data.role ?? "lecteur",
        openId: String(verifyQuery.data.userId),
        loginMethod: "local",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      }
    : null;

  const loading = Boolean(sessionToken) && verifyQuery.isLoading;
  const isAuthenticated = Boolean(verifyQuery.data);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (isAuthenticated) return;
    if (!sessionToken) {
      setLocation("/login");
    }
  }, [redirectOnUnauthenticated, loading, isAuthenticated, sessionToken, setLocation]);

  return {
    user,
    loading,
    error: verifyQuery.error ?? null,
    isAuthenticated,
    refresh: () => verifyQuery.refetch(),
    logout,
  };
}
