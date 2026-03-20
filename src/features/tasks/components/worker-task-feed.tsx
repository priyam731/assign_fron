"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { Task, TaskType } from "@/types";
import { TASK_TYPE_LABELS } from "@/lib/constants";
import { TaskTypeBadge } from "@/components/shared/badges";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskSubmitSheet } from "@/features/tasks/components/task-submit-sheet";
import {
  ArrowUpDown,
  Search,
  ChevronRight,
  Clock,
  DollarSign,
  Users,
  Inbox,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "reward", label: "Highest Reward" },
];

const TYPE_TABS = [
  { value: "all", label: "All Tasks" },
  { value: TaskType.SOCIAL_MEDIA_POSTING, label: "Posting" },
  { value: TaskType.EMAIL_SENDING, label: "Email" },
  { value: TaskType.SOCIAL_MEDIA_LIKING, label: "Liking" },
];

const CARD_HEIGHT = 88;

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

function TaskCard({ task, onClick }: TaskCardProps) {
  const slotsLeft = task.amount - task.filledAmount;
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 bg-card border rounded-xl hover-card cursor-pointer active:scale-[0.99] transition-all"
      onClick={() => onClick(task)}
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <TaskTypeBadge type={task.task_type} />
          {slotsLeft <= 5 && slotsLeft > 0 && (
            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
              Only {slotsLeft} left
            </span>
          )}
        </div>
        <p className="text-sm font-medium leading-tight truncate">{task.title}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {task.filledAmount}/{task.amount}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <p className="text-sm font-bold text-primary tabular-nums">
            ${task.reward.toFixed(2)}
          </p>
          <p className="text-[10px] text-muted-foreground">AUD</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

export function WorkerTaskFeed() {
  const { user } = useAuth();
  const { data: allTasks = [], isLoading } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sort, setSort] = useState<"latest" | "reward">("latest");
  const [activeType, setActiveType] = useState<string>("all");
  const [search, setSearch] = useState("");

  const tasks = useMemo(() => {
    let filtered = allTasks.filter((t) => t.status === "active");

    // Type filter
    if (activeType !== "all") {
      filtered = filtered.filter((t) => t.task_type === activeType);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === "latest") {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      filtered = [...filtered].sort((a, b) => b.reward - a.reward);
    }

    return filtered;
  }, [allTasks, activeType, search, sort]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Search + Sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 h-9"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 border rounded-lg px-1">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setSort(o.value as "latest" | "reward")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  sort === o.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveType(tab.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeType === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.value === "all" && (
                <span className="ml-1.5 text-[10px] opacity-70">{tasks.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Virtualized list */}
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground space-y-2">
            <Inbox className="h-10 w-10 opacity-40" />
            <p className="text-sm">No tasks found</p>
          </div>
        ) : (
          <div
              className="space-y-2 max-h-[70vh] overflow-y-auto pr-1"
              style={{ contain: "layout style" }}
            >
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={setSelectedTask} />
              ))}
            </div>
        )}
      </div>

      {/* Task detail + submit sheet */}
      {selectedTask && (
        <TaskSubmitSheet
          task={selectedTask}
          user={user!}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
}
