"use client";

import React from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { UserRole } from "@/types";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole={UserRole.ADMIN}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 min-w-0">
          <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
