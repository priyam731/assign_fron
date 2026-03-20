"use client";

import { WorkerTaskFeed } from "@/features/tasks/components/worker-task-feed";

export default function WorkerFeedPage() {
  return (
    <div className="space-y-4 fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tasks Feed</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse available tasks and start earning
        </p>
      </div>
      <WorkerTaskFeed />
    </div>
  );
}
