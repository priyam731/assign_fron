"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TaskComposerForm } from "@/features/composer/task-composer-form";
import { useTask } from "@/features/tasks/hooks/use-tasks";
import { Skeleton } from "@/components/ui/skeleton";
import { PenSquare } from "lucide-react";

function ComposerContent() {
  const params = useSearchParams();
  const taskId = params.get("taskId");
  const { data: task, isLoading } = useTask(taskId ?? "");

  const isEdit = !!taskId;

  return (
    <div className="space-y-6 fade-in max-w-2xl">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <PenSquare className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? "Edit Task" : "Task Composer"}
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          {isEdit
            ? "Update task details, configuration, and rewards"
            : "Create a new task. After submission, the form clears so you can quickly add more."}
        </p>
      </div>

      {isEdit && isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : (
        <TaskComposerForm task={isEdit ? task ?? undefined : undefined} />
      )}
    </div>
  );
}

export default function ComposerPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 max-w-2xl">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
    >
      <ComposerContent />
    </Suspense>
  );
}
