"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Play,
  Pause,
  RotateCcw,
  Layers,
  Droplets,
  ChevronRight,
  Clock,
  Users,
  DollarSign,
  Check,
  TimerReset,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTasks, useUpdateTask } from "@/features/tasks/hooks/use-tasks";
import { Task, DripFeedState, DripFeedConfig } from "@/types";
import { DRIP_INTERVAL_OPTIONS } from "@/lib/constants";
import { format, formatDistanceToNow } from "date-fns";

// ── Drip Feed Admin Panel ────────────────────────────────────────────────────

interface DripFeedPanelProps {
  task: Task;
}

export function DripFeedPanel({ task }: DripFeedPanelProps) {
  const updateTask = useUpdateTask();
  const drip = task.dripFeed;

  if (!drip?.enabled) return null;

  const totalReleased = drip.releasedSlots;
  const pct = Math.round((totalReleased / task.amount) * 100);

  const toggleState = async () => {
    const newState =
      drip.state === DripFeedState.ACTIVE
        ? DripFeedState.WAITING
        : DripFeedState.ACTIVE;
    await updateTask.mutateAsync({
      id: task.id,
      data: {
        dripFeed: {
          enabled: true,
          drip_amount: drip.drip_amount,
          drip_interval: drip.drip_interval,
        },
      },
    });
    toast.success(
      newState === DripFeedState.ACTIVE
        ? "Drip feed resumed"
        : "Drip feed paused"
    );
  };

  const triggerDrip = async () => {
    // Simulate releasing next batch
    toast.success(
      `Released ${drip.drip_amount} new slots! Next drip in ${drip.drip_interval}h`
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          Drip Feed
          <span
            className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
              drip.state === DripFeedState.ACTIVE
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
            }`}
          >
            {drip.state === DripFeedState.ACTIVE ? "Active" : "Paused"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Batch size</p>
            <p className="font-semibold">{drip.drip_amount} slots</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Interval</p>
            <p className="font-semibold">{drip.drip_interval}h</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Slots released</span>
            <span className="font-medium">
              {totalReleased} / {task.amount} ({pct}%)
            </span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Last drip:{" "}
          {drip.lastDripAt
            ? formatDistanceToNow(new Date(drip.lastDripAt), { addSuffix: true })
            : "Never"}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={toggleState}
            disabled={updateTask.isPending}
          >
            {drip.state === DripFeedState.ACTIVE ? (
              <><Pause className="h-3.5 w-3.5 mr-1.5" />Pause</>
            ) : (
              <><Play className="h-3.5 w-3.5 mr-1.5" />Resume</>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={triggerDrip}
          >
            <TimerReset className="h-3.5 w-3.5 mr-1.5" />
            Trigger Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Task Phases Display Panel ─────────────────────────────────────────────────

interface TaskPhasesPanelProps {
  task: Task;
}

export function TaskPhasesPanel({ task }: TaskPhasesPanelProps) {
  const updateTask = useUpdateTask();

  if (!task.phases?.length) return null;

  const advancePhase = async () => {
    const nextIndex = (task.activePhaseIndex ?? 0) + 1;
    if (nextIndex >= task.phases!.length) {
      toast.info("All phases are already completed");
      return;
    }
    await updateTask.mutateAsync({
      id: task.id,
      data: { activePhaseIndex: nextIndex } as Record<string, unknown> as never,
    });
    toast.success(`Advanced to ${task.phases![nextIndex].phase_name}`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Layers className="h-4 w-4 text-purple-500" />
          Task Phases
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.phases.map((phase, idx) => {
          const isActive = task.activePhaseIndex === idx;
          const isDone = (task.activePhaseIndex ?? 0) > idx;
          const pct = phase.slots > 0 ? Math.round((phase.filledSlots / phase.slots) * 100) : 0;

          return (
            <div
              key={phase.id}
              className={`border rounded-xl p-3 space-y-2 ${
                isActive
                  ? "border-primary bg-primary/5"
                  : isDone
                  ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10"
                  : "opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isDone
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? <Check className="h-3 w-3" /> : idx + 1}
                  </div>
                  <p className="text-sm font-medium">{phase.phase_name}</p>
                  {isActive && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium">${phase.reward.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">{phase.filledSlots}/{phase.slots}</p>
                </div>
              </div>
              <Progress value={pct} className="h-1.5" />
              {phase.instructions && (
                <p className="text-xs text-muted-foreground line-clamp-2">{phase.instructions}</p>
              )}
            </div>
          );
        })}

        {(task.activePhaseIndex ?? 0) < task.phases.length - 1 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={advancePhase}
            disabled={updateTask.isPending}
          >
            <ChevronRight className="h-3.5 w-3.5 mr-1.5" />
            Advance to Next Phase
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ── Phase 2 Admin Dashboard Page ──────────────────────────────────────────────

export function Phase2AdminDashboard() {
  const { data: tasks = [], isLoading } = useTasks();

  const tasksWithDrip = tasks.filter((t) => t.dripFeed?.enabled);
  const tasksWithPhases = tasks.filter((t) => t.phases && t.phases.length > 0);

  if (isLoading) return null;

  if (tasksWithDrip.length === 0 && tasksWithPhases.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Layers className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">
          No tasks with phases or drip feed configured.
          <br />
          <span className="text-xs opacity-70">Use the Task Composer to enable these.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tasksWithPhases.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Phased Tasks
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {tasksWithPhases.map((task) => (
              <div key={task.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{task.title}</p>
                </div>
                <TaskPhasesPanel task={task} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tasksWithDrip.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Drip Feed Tasks
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {tasksWithDrip.map((task) => (
              <div key={task.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{task.title}</p>
                </div>
                <DripFeedPanel task={task} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
