import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';

interface User {
  userId: number;
  email: string;
  name: string;
  role?: string;
}

interface UseLocalAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

/**
 * Hook to manage local authentication
 */
export function useLocalAuth(): UseLocalAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('sessionToken');
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const userRole = localStorage.getItem('userRole');

      if (token && userId) {
        setSessionToken(token);
        setUser({
          userId: parseInt(userId),
          email: userEmail || 'unknown@example.com',
          name: userName || 'Utilisateur',
          role: userRole || 'user',
        });
      }
    } catch (error) {
      console.error('[useLocalAuth] Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/trpc/localAuth.login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { email, password },
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const result = data.result?.data;

      if (result?.success) {
        localStorage.setItem('sessionToken', result.sessionToken);
        localStorage.setItem('userId', result.userId.toString());
        localStorage.setItem('userName', result.name);
        localStorage.setItem('userEmail', result.email);

        setSessionToken(result.sessionToken);
        setUser({
          userId: result.userId,
          email: result.email,
          name: result.name,
        });

        setLocation('/');
      }
    } catch (error) {
      console.error('[useLocalAuth] Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setLocation]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/trpc/localAuth.register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { name, email, password },
        }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      const result = data.result?.data;

      if (result?.success) {
        localStorage.setItem('sessionToken', result.sessionToken);
        localStorage.setItem('userId', result.userId.toString());
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);

        setSessionToken(result.sessionToken);
        setUser({
          userId: result.userId,
          email,
          name,
        });

        setLocation('/');
      }
    } catch (error) {
      console.error('[useLocalAuth] Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setLocation]);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('sessionToken');
      if (token) {
        await fetch('/api/trpc/localAuth.logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { sessionToken: token },
          }),
        });
      }

      // Clear local storage
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');

      setUser(null);
      setSessionToken(null);
      setLocation('/login');
    } catch (error) {
      console.error('[useLocalAuth] Logout error:', error);
      // Still clear local state even if logout request fails
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      setUser(null);
      setSessionToken(null);
      setLocation('/login');
    }
  }, [setLocation]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !!sessionToken,
    sessionToken,
    login,
    register,
    logout,
    checkAuth,
  };
}
