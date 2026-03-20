"use client";

import React from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { WorkerNavbar } from "@/components/shared/worker-navbar";
import { UserRole } from "@/types";

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole={UserRole.WORKER}>
      <div className="min-h-screen flex flex-col">
        <WorkerNavbar />
        <main className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
