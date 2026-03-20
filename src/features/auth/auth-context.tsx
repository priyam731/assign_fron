"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, UserRole } from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";
import { getItem, setItem, removeItem } from "@/lib/storage";
import { seedData } from "@/lib/mock-api/seed";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (userId: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isWorker: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Seed data on mount
  useEffect(() => {
    seedData();
    const stored = getItem<User>(STORAGE_KEYS.CURRENT_USER);
    if (stored) {
      // Refresh from users list in case balance changed
      const users = getItem<User[]>(STORAGE_KEYS.USERS) || [];
      const fresh = users.find((u) => u.id === stored.id);
      setUser(fresh || stored);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userId: string) => {
    const users = getItem<User[]>(STORAGE_KEYS.USERS) || [];
    const found = users.find((u) => u.id === userId);
    if (found) {
      setUser(found);
      setItem(STORAGE_KEYS.CURRENT_USER, found);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeItem(STORAGE_KEYS.CURRENT_USER);
  }, []);

  const isAdmin = user?.role === UserRole.ADMIN;
  const isWorker = user?.role === UserRole.WORKER;

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin, isWorker }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
