'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { http, tokenStore } from '@/api/client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  locale?: string;
  timezone?: string;
  status?: string;
  roles?: string[];
  mfaEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  refreshUser: async () => null,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const router = useRouter();

  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    const token = tokenStore.access;
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      if (!user) setLoading(true);
      const userData = await http.get<User>('/auth/me');
      if (userData && userData.email) {
        setUser(userData);
        return userData;
      } else {
        setUser(null);
        return null;
      }
    } catch (_err) {
      // If token is invalid or backend request fails, clear session cleanly
      tokenStore.clear();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    queryClient.clear();
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
      window.sessionStorage.clear();
    }
    router.push('/login');
  }, [queryClient, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        refreshUser: fetchCurrentUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
