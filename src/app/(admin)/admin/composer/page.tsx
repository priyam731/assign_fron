"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TaskComposerForm } from "@/features/composer/task-composer-form";
import { BulkUploadDialog } from "@/features/composer/bulk-upload-dialog";
import { useTask } from "@/features/tasks/hooks/use-tasks";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PenSquare, Upload } from "lucide-react";

function ComposerContent() {
  const params = useSearchParams();
  const taskId = params.get("taskId");
  const { data: task, isLoading } = useTask(taskId ?? "");
  const [bulkOpen, setBulkOpen] = useState(false);

  const isEdit = !!taskId;

  return (
    <div className="space-y-6 fade-in max-w-2xl">
      <div className="flex items-start justify-between gap-4">
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
              : "Create a new task. The form resets after each creation so you can quickly add more."}
          </p>
        </div>

        {/* Bulk upload — only in create mode */}
        {!isEdit && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={() => setBulkOpen(true)}
          >
            <Upload className="h-3.5 w-3.5" />
            Bulk Upload
          </Button>
        )}
      </div>

      {isEdit && isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : (
        <TaskComposerForm task={isEdit ? task ?? undefined : undefined} />
      )}

      <BulkUploadDialog open={bulkOpen} onClose={() => setBulkOpen(false)} />
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
