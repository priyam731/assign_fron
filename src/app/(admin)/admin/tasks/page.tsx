"use client";

import { TaskManagementTable } from "@/features/tasks/components/task-management-table";

export default function AdminTasksPage() {
  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage all tasks, track submissions, and monitor progress
        </p>
      </div>
      <TaskManagementTable />
    </div>
  );
}
