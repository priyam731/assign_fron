"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { STORAGE_KEYS } from "@/lib/constants";
import { getItem } from "@/lib/storage";
import { User, UserRole } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const users = getItem<User[]>(STORAGE_KEYS.USERS) || [];

  const handleLogin = async (userId: string, role: UserRole) => {
    setLoadingId(userId);
    // Simulate a small auth delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    login(userId);
    router.push(role === UserRole.ADMIN ? "/admin/tasks" : "/worker/feed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" className="fill-primary" />
              <path d="M2 17L12 22L22 17" className="stroke-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" className="stroke-primary/70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">MicroTask</h1>
          <p className="text-muted-foreground text-sm">
            Select a profile to continue
          </p>
        </div>

        {/* User cards */}
        <div className="space-y-3">
          {users.map((u) => (
            <Card
              key={u.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 ${
                loadingId === u.id ? "border-primary shadow-md" : ""
              }`}
              onClick={() => !loadingId && handleLogin(u.id, u.role)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-11 w-11 ring-2 ring-background shadow-sm">
                  <AvatarImage src={u.avatar} alt={u.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {u.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={u.role === UserRole.ADMIN ? "default" : "secondary"}
                    className="text-xs capitalize"
                  >
                    {u.role}
                  </Badge>
                  {loadingId === u.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          Demo accounts — no password required
        </p>
      </div>
    </div>
  );
}
