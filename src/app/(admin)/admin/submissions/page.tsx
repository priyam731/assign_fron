"use client";

import { SubmissionsScreen } from "@/features/submissions/components/submissions-screen";

export default function AdminSubmissionsPage() {
  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review and manage worker submissions across all tasks
        </p>
      </div>
      <SubmissionsScreen />
    </div>
  );
}
