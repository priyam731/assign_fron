"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  X,
  DollarSign,
  Users,
  Upload,
  CheckCircle,
  Loader2,
  Link,
  Mail,
  Layers,
  ChevronDown,
  ChevronRight,
  Lock,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TaskTypeBadge } from "@/components/shared/badges";
import { useCreateSubmission } from "@/features/submissions/hooks/use-submissions";
import { useSubmissionsByWorker } from "@/features/submissions/hooks/use-submissions";
import { Task, TaskType, User, SubmissionStatus } from "@/types";

// ── Schema factory ──────────────────────────────────────────────────────────

function buildSchema(taskType: TaskType) {
  const base = z.object({ screenshot: z.any().optional() });
  if (taskType === TaskType.EMAIL_SENDING) {
    return base.extend({
      emailContent: z.string().min(20, "Email content must be at least 20 characters"),
    });
  }
  return base.extend({
    postUrl: z.string().url("Please enter a valid URL (https://…)"),
  });
}

// ── Past Phases Section ─────────────────────────────────────────────────────

function PastPhasesSection({
  task,
  workerPastPhaseIds,
}: {
  task: Task;
  workerPastPhaseIds: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  if (!task.phases?.length) return null;

  const activeIdx = task.activePhaseIndex ?? 0;
  const pastPhases = task.phases.filter(
    (p, i) => i < activeIdx && workerPastPhaseIds.has(p.id)
  );

  if (pastPhases.length === 0) return null;

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Past Phases You Submitted ({pastPhases.length})
        </span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open && (
        <div className="p-3 space-y-2">
          {pastPhases.map((phase, i) => (
            <div key={phase.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{phase.phase_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{phase.slots} slots · ${phase.reward.toFixed(2)} AUD</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                Submitted
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

interface TaskSubmitSheetProps {
  task: Task;
  user: User;
  onClose: () => void;
}

export function TaskSubmitSheet({ task, user, onClose }: TaskSubmitSheetProps) {
  const createSubmission = useCreateSubmission();
  const [submitted, setSubmitted] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  // Fetch worker's past submissions for this task — to show past phases
  const { data: workerSubs = [] } = useSubmissionsByWorker(user.id);
  const taskSubs = workerSubs.filter((s) => s.taskId === task.id);
  const workerPastPhaseIds = new Set(
    taskSubs.filter((s) => s.phaseId).map((s) => s.phaseId!)
  );

  // Determine active phase
  const activePhase = task.phases?.length
    ? task.phases[task.activePhaseIndex ?? 0]
    : null;
  const activePhaseIndex = task.activePhaseIndex ?? 0;

  // Effective reward and slots from active phase (or task-level fallback)
  const displayReward = activePhase?.reward ?? task.reward;
  const displaySlots = activePhase
    ? activePhase.slots - activePhase.filledSlots
    : task.amount - task.filledAmount;
  const displayTotal = activePhase?.slots ?? task.amount;
  const displayFilled = activePhase?.filledSlots ?? task.filledAmount;
  const pct = Math.round((displayFilled / displayTotal) * 100);

  // Instructions: prefer active phase, else task details
  const instructions = activePhase?.instructions ?? task.details;

  const schema = buildSchema(task.task_type);
  const form = useForm<any>({
    resolver: zodResolver(schema) as any,
    defaultValues:
      task.task_type === TaskType.EMAIL_SENDING
        ? { emailContent: "", screenshot: null }
        : { postUrl: "", screenshot: null },
  });

  const onSubmit = async (values: any) => {
    await createSubmission.mutateAsync({
      data: {
        taskId: task.id,
        postUrl: values.postUrl,
        emailContent: values.emailContent,
        screenshot: values.screenshot,
        // Pass active phase id so admins can filter per phase
        phaseId: activePhase?.id,
      },
      user,
    });
    setSubmitted(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    form.setValue("screenshot", file as never);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setScreenshotPreview(null);
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className="w-full sm:max-w-lg overflow-y-auto p-0 flex flex-col"
        side="right"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b px-5 py-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <TaskTypeBadge type={task.task_type} />
              {activePhase && (
                <span className="text-[10px] font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Layers className="h-2.5 w-2.5" />
                  Phase {activePhaseIndex + 1} of {task.phases!.length}
                </span>
              )}
            </div>
            <h2 className="font-semibold text-base leading-tight">{task.title}</h2>
            {activePhase && (
              <p className="text-xs text-muted-foreground mt-0.5">{activePhase.phase_name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Task stats — from active phase or task */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Reward
              </p>
              <p className="font-bold text-primary text-lg tabular-nums">
                ${displayReward.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">AUD per completion</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" /> Slots
              </p>
              <p className="font-bold text-lg tabular-nums">{displaySlots}</p>
              <p className="text-xs text-muted-foreground">of {displayTotal} remaining</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{activePhase ? `Phase ${activePhaseIndex + 1} progress` : "Task progress"}</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>

          {/* Instructions */}
          <div className="bg-muted/40 rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {activePhase ? `Phase ${activePhaseIndex + 1} Instructions` : "Instructions"}
            </p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{instructions}</p>
          </div>

          {/* Past phases this worker submitted in */}
          <PastPhasesSection task={task} workerPastPhaseIds={workerPastPhaseIds} />

          <Separator />

          {/* Submission form */}
          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold">Submission Received!</p>
                <p className="text-sm text-muted-foreground">
                  We'll review your submission and notify you once it's approved.
                </p>
                <p className="text-xs text-primary font-medium mt-1">
                  +${displayReward.toFixed(2)} AUD pending
                </p>
              </div>
              <Button variant="outline" onClick={onClose} className="mt-2">
                Back to Feed
              </Button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-sm font-semibold">Submit Your Evidence</p>

              {/* Post URL */}
              {(task.task_type === TaskType.SOCIAL_MEDIA_POSTING ||
                task.task_type === TaskType.SOCIAL_MEDIA_LIKING) && (
                <div className="space-y-1.5">
                  <Label htmlFor="postUrl" className="flex items-center gap-1.5">
                    <Link className="h-3.5 w-3.5" /> Post URL *
                  </Label>
                  <Input
                    id="postUrl"
                    placeholder="https://twitter.com/…"
                    {...form.register("postUrl" as never)}
                  />
                  {(form.formState.errors as Record<string, { message?: string }>).postUrl && (
                    <p className="text-xs text-destructive">
                      {(form.formState.errors as Record<string, { message?: string }>).postUrl?.message}
                    </p>
                  )}
                </div>
              )}

              {/* Email content */}
              {task.task_type === TaskType.EMAIL_SENDING && (
                <div className="space-y-1.5">
                  <Label htmlFor="emailContent" className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email Content *
                  </Label>
                  <Textarea
                    id="emailContent"
                    rows={5}
                    placeholder="Paste the full email you sent to recipients…"
                    className="resize-none"
                    {...form.register("emailContent" as never)}
                  />
                  {(form.formState.errors as Record<string, { message?: string }>).emailContent && (
                    <p className="text-xs text-destructive">
                      {(form.formState.errors as Record<string, { message?: string }>).emailContent?.message}
                    </p>
                  )}
                </div>
              )}

              {/* Screenshot upload */}
              <div className="space-y-1.5">
                <Label htmlFor="screenshot" className="flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5" /> Evidence Screenshot *
                </Label>
                <div
                  className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => document.getElementById("screenshot-input")?.click()}
                >
                  {screenshotPreview ? (
                    <img
                      src={screenshotPreview}
                      alt="Screenshot preview"
                      className="w-full max-h-40 object-contain rounded-lg mx-auto"
                    />
                  ) : (
                    <div className="space-y-2 py-4">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Click to upload screenshot</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  id="screenshot-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createSubmission.isPending}
              >
                {createSubmission.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit Task"
                )}
              </Button>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
