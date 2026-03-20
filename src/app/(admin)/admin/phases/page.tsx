"use client";

import { Phase2AdminDashboard } from "@/features/tasks/components/phase2-controls";

export default function AdminPhasesPage() {
  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Phases & Drip Feed</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor and control task phase advancement and drip feed release schedules
        </p>
      </div>
      <Phase2AdminDashboard />
    </div>
  );
}
