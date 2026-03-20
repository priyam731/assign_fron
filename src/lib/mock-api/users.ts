// ============================================
// Mock API — User operations
// ============================================

import { User } from "@/types";
import { STORAGE_KEYS, FETCH_DELAY } from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage";
import { delay } from "./delay";

export async function fetchUsers(): Promise<User[]> {
  await delay(FETCH_DELAY.min, FETCH_DELAY.max);
  return getItem<User[]>(STORAGE_KEYS.USERS) || [];
}

export async function fetchUser(id: string): Promise<User | null> {
  await delay(FETCH_DELAY.min, FETCH_DELAY.max);
  const users = getItem<User[]>(STORAGE_KEYS.USERS) || [];
  return users.find((u) => u.id === id) || null;
}

export function getCurrentUser(): User | null {
  return getItem<User>(STORAGE_KEYS.CURRENT_USER);
}

export function setCurrentUser(user: User): void {
  setItem(STORAGE_KEYS.CURRENT_USER, user);
}

export function clearCurrentUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// Refresh user data from storage (for balance / earnings changes)
export async function refreshCurrentUser(): Promise<User | null> {
  const current = getCurrentUser();
  if (!current) return null;
  const users = getItem<User[]>(STORAGE_KEYS.USERS) || [];
  const updated = users.find((u) => u.id === current.id);
  if (updated) {
    setCurrentUser(updated);
  }
  return updated || null;
}
