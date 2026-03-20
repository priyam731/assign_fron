"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { seedData, resetSeedData } from "@/lib/mock-api";
import { STORAGE_KEYS } from "@/lib/constants";
import { getItem } from "@/lib/storage";
import { User, UserRole } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure seed has run
    seedData();
    const stored = getItem<User[]>(STORAGE_KEYS.USERS) || [];
    setUsers(stored);
    setIsReady(true);
  }, []);

  const handleLogin = async (userId: string, role: UserRole) => {
    if (loadingId) return;
    setLoadingId(userId);
    await new Promise((resolve) => setTimeout(resolve, 600));
    login(userId);
    router.push(role === UserRole.ADMIN ? "/admin/tasks" : "/worker/feed");
  };

  const handleReset = async () => {
    setIsResetting(true);
    await new Promise((r) => setTimeout(r, 300));
    resetSeedData();
    const stored = getItem<User[]>(STORAGE_KEYS.USERS) || [];
    setUsers(stored);
    setIsResetting(false);
    toast.success("Demo data reset successfully!");
  };

  const admins = users.filter((u) => u.role === UserRole.ADMIN);
  const workers = users.filter((u) => u.role === UserRole.WORKER);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2 ring-1 ring-primary/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" className="fill-primary" />
              <path d="M2 17L12 22L22 17" className="stroke-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" className="stroke-primary/70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">MicroTask</h1>
          <p className="text-muted-foreground text-sm">
            Internal freelancing platform — select a profile to continue
          </p>
        </div>

        {!isReady ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Admin accounts */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Admin
              </p>
              {admins.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  loading={loadingId === u.id}
                  disabled={!!loadingId}
                  onSelect={handleLogin}
                />
              ))}
            </div>

            {/* Worker accounts */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Workers
              </p>
              {workers.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  loading={loadingId === u.id}
                  disabled={!!loadingId}
                  onSelect={handleLogin}
                />
              ))}
            </div>
          </>
        )}

        {/* Footer + dev reset */}
        <div className="flex items-center gap-3 pt-2">
          <p className="flex-1 text-xs text-muted-foreground">
            Demo accounts — no password required
          </p>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5 text-muted-foreground"
            onClick={handleReset}
            disabled={isResetting}
          >
            {isResetting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            Reset Demo Data
          </Button>
        </div>
      </div>
    </div>
  );
}

function UserCard({
  user,
  loading,
  disabled,
  onSelect,
}: {
  user: User;
  loading: boolean;
  disabled: boolean;
  onSelect: (id: string, role: UserRole) => void;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/40 ${
        loading ? "border-primary shadow-md" : ""
      } ${disabled && !loading ? "opacity-60 cursor-not-allowed" : ""}`}
      onClick={() => !disabled && onSelect(user.id, user.role)}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar className="h-11 w-11 ring-2 ring-background shadow-sm shrink-0">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
            {user.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          {user.role === UserRole.WORKER && (
            <p className="text-xs text-primary/70 font-medium tabular-nums mt-0.5">
              ${user.balance.toFixed(2)} balance
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={user.role === UserRole.ADMIN ? "default" : "secondary"}
            className="text-xs capitalize"
          >
            {user.role}
          </Badge>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>
      </CardContent>
    </Card>
  );
}
