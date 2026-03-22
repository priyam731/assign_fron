"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { Task, TaskType, DripFeedState } from "@/types";
import { TaskTypeBadge } from "@/components/shared/badges";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskSubmitSheet } from "@/features/tasks/components/task-submit-sheet";
import { useWorkerFeedState } from "@/hooks/use-url-state";
import {
  ArrowUpDown,
  Search,
  ChevronRight,
  Clock,
  Users,
  Inbox,
  Droplets,
  Layers,
  Timer,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "reward", label: "Top Reward" },
];

const TYPE_TABS = [
  { value: "all", label: "All" },
  { value: TaskType.SOCIAL_MEDIA_POSTING, label: "Posting" },
  { value: TaskType.EMAIL_SENDING, label: "Email" },
  { value: TaskType.SOCIAL_MEDIA_LIKING, label: "Liking" },
];

// ── Task Card ─────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

function TaskCard({ task, onClick }: TaskCardProps) {
  const drip = task.dripFeed;
  const isDrip = drip?.enabled;
  const isWaiting = isDrip && drip?.state === DripFeedState.WAITING;

  // Effective slots for drip tasks = released slots, not total
  const availableSlots = isDrip ? drip.releasedSlots - task.filledAmount : task.amount - task.filledAmount;
  const displayTotal = isDrip ? drip.releasedSlots : task.amount;

  // Active phase info
  const activePhase = task.phases?.length
    ? task.phases[task.activePhaseIndex ?? 0]
    : null;
  const phaseLabel = task.phases?.length
    ? `Phase ${(task.activePhaseIndex ?? 0) + 1} of ${task.phases.length}`
    : null;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 bg-card border rounded-xl transition-all ${
        isWaiting
          ? "opacity-60 cursor-not-allowed border-dashed"
          : "hover-card cursor-pointer active:scale-[0.99]"
      }`}
      onClick={() => !isWaiting && onClick(task)}
    >
      <div className="flex-1 min-w-0 space-y-1">
        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <TaskTypeBadge type={task.task_type} />

          {isDrip && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
              <Droplets className="h-2.5 w-2.5" />
              Drip
            </span>
          )}
          {phaseLabel && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300 px-1.5 py-0.5 rounded-full">
              <Layers className="h-2.5 w-2.5" />
              {phaseLabel}
            </span>
          )}
          {availableSlots <= 5 && availableSlots > 0 && !isWaiting && (
            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
              Only {availableSlots} left
            </span>
          )}
          {isWaiting && drip && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
              <Timer className="h-2.5 w-2.5" />
              {(() => {
                const nextAt = new Date(drip.lastDripAt).getTime() + drip.drip_interval * 3600 * 1000;
                const diff = nextAt - Date.now();
                if (diff <= 0) return "Next batch any moment";
                const hrs = Math.floor(diff / 3_600_000);
                const mins = Math.floor((diff % 3_600_000) / 60_000);
                return `Next batch in ${hrs > 0 ? `${hrs}h ` : ""}${mins}m`;
              })()}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-sm font-medium leading-tight truncate">{task.title}</p>

        {/* Active phase name if any */}
        {activePhase && (
          <p className="text-xs text-muted-foreground truncate italic">
            {activePhase.phase_name}: {activePhase.instructions.slice(0, 60)}{activePhase.instructions.length > 60 ? "…" : ""}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {task.filledAmount}/{displayTotal}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <p className={`text-sm font-bold tabular-nums ${isWaiting ? "text-muted-foreground" : "text-primary"}`}>
            ${(activePhase?.reward ?? task.reward).toFixed(2)}
          </p>
          <p className="text-[10px] text-muted-foreground">AUD</p>
        </div>
        {!isWaiting && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </div>
    </div>
  );
}

// ── Main feed ─────────────────────────────────────────────────────────────────

export function WorkerTaskFeed() {
  const { user } = useAuth();
  const { data: allTasks = [], isLoading } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // nuqs URL state — filters persist in URL
  const { sort, setSort, typeFilter: activeType, setTypeFilter: setActiveType, search, setSearch } = useWorkerFeedState();

  const tasks = useMemo(() => {
    let filtered = allTasks.filter((t) => t.status === "active");

    // For drip tasks: only show if there are released slots available
    // (or if it's in WAITING state — show it greyed out so worker knows it exists)
    filtered = filtered.filter((t) => {
      if (!t.dripFeed?.enabled) return true; // normal task
      return t.dripFeed.releasedSlots > 0; // drip task — only show if at least one batch released
    });

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

  const totalByType = useMemo(() => {
    const active = allTasks.filter((t) => t.status === "active");
    return Object.fromEntries(
      TYPE_TABS.map((tab) => [
        tab.value,
        tab.value === "all"
          ? active.length
          : active.filter((t) => t.task_type === tab.value).length,
      ])
    );
  }, [allTasks]);

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
          <div className="flex items-center gap-0.5 border rounded-lg px-1">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setSort(o.value)}
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                activeType === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] ${activeType === tab.value ? "opacity-80" : "opacity-60"}`}>
                {totalByType[tab.value] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Task list */}
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground space-y-2">
            <Inbox className="h-10 w-10 opacity-40" />
            <p className="text-sm">No tasks available right now</p>
            {search && (
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => setSearch("")}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div
            className="space-y-2 overflow-y-auto pr-1"
            style={{ contain: "layout style", maxHeight: "calc(100vh - 300px)" }}
          >
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={setSelectedTask} />
            ))}
          </div>
        )}
      </div>

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
