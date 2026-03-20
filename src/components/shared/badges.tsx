"use client";

import { Badge } from "@/components/ui/badge";
import { TaskType, SubmissionStatus } from "@/types";
import { TASK_TYPE_LABELS, TASK_TYPE_COLORS, SUBMISSION_STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface TaskTypeBadgeProps {
  type: TaskType;
  className?: string;
}

export function TaskTypeBadge({ type, className }: TaskTypeBadgeProps) {
  const colors = TASK_TYPE_COLORS[type];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        colors.bg,
        colors.text,
        className
      )}
    >
      {TASK_TYPE_LABELS[type]}
    </span>
  );
}

interface StatusBadgeProps {
  status: SubmissionStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = SUBMISSION_STATUS_COLORS[status] || { bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize",
        colors.bg,
        colors.text,
        className
      )}
    >
      {status}
    </span>
  );
}

interface TaskStatusBadgeProps {
  status: "active" | "completed" | "paused";
  className?: string;
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const map = {
    active: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
    completed: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
    paused: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  };
  const colors = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize",
        colors.bg,
        colors.text,
        className
      )}
    >
      {status}
    </span>
  );
}
