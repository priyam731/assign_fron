"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { X, Pencil, Users, Calendar, DollarSign, Hash, Layers } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskTypeBadge, TaskStatusBadge } from "@/components/shared/badges";
import { useSubmissionsByTask } from "@/features/submissions/hooks/use-submissions";
import { useApproveSubmission, useRejectSubmission } from "@/features/submissions/hooks/use-submissions";
import { Task, SubmissionStatus } from "@/types";
import { StatusBadge } from "@/components/shared/badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format as fmtDate } from "date-fns";

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
}

export function TaskDetailPanel({ task, onClose }: TaskDetailPanelProps) {
  const router = useRouter();
  const { data: submissions = [], isLoading } = useSubmissionsByTask(task.id);
  const approve = useApproveSubmission();
  const reject = useRejectSubmission();
  const [rejectId, setRejectId] = React.useState<string | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");

  const pct = Math.round((task.filledAmount / task.amount) * 100);

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0" side="right">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b px-5 py-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <TaskTypeBadge type={task.task_type} />
              <TaskStatusBadge status={task.status} />
            </div>
            <h2 className="font-semibold text-base leading-tight">{task.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-3 space-y-0.5">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Submissions</p>
              <p className="font-semibold tabular-nums">{task.filledAmount} / {task.amount}</p>
            </div>
            <div className="border rounded-lg p-3 space-y-0.5">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" /> Reward</p>
              <p className="font-semibold tabular-nums">${task.reward.toFixed(2)} AUD</p>
            </div>
            <div className="border rounded-lg p-3 space-y-0.5">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Created</p>
              <p className="font-semibold text-sm">{format(new Date(task.createdAt), "MMM d, yyyy")}</p>
            </div>
            <div className="border rounded-lg p-3 space-y-0.5">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3" /> Campaign</p>
              <p className="font-semibold text-sm truncate">{task.campaign_id}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>

          {/* Details */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Task Details</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{task.details}</p>
          </div>

          {/* Phases */}
          {task.phases && task.phases.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" /> Phases
              </p>
              <div className="space-y-2">
                {task.phases.map((phase) => {
                  const phasePct = phase.slots > 0 ? Math.round((phase.filledSlots / phase.slots) * 100) : 0;
                  const isActive = task.activePhaseIndex === task.phases!.indexOf(phase);
                  return (
                    <div key={phase.id} className={`border rounded-lg p-3 ${isActive ? "border-primary bg-primary/5" : ""}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium">{phase.phase_name}</p>
                        <div className="flex items-center gap-1.5">
                          {isActive && <span className="text-xs text-primary font-medium">Active</span>}
                          <span className="text-xs text-muted-foreground">{phase.filledSlots}/{phase.slots}</span>
                        </div>
                      </div>
                      <Progress value={phasePct} className="h-1 mb-1.5" />
                      <p className="text-xs text-muted-foreground">${phase.reward.toFixed(2)} reward</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => router.push(`/admin/composer?taskId=${task.id}`)}
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit Task
            </Button>
          </div>

          <Separator />

          {/* Submissions */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Submissions ({submissions.length})
            </p>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
              </div>
            ) : submissions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No submissions yet</p>
            ) : (
              <div className="space-y-2">
                {submissions.map((sub) => (
                  <div key={sub.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={sub.workerAvatar} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {sub.workerName.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-medium">{sub.workerName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {fmtDate(new Date(sub.createdAt), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={sub.status} />
                    </div>

                    {sub.postUrl && (
                      <p className="text-xs text-muted-foreground truncate">
                        🔗 <a href={sub.postUrl} className="text-primary hover:underline" target="_blank" rel="noreferrer">{sub.postUrl}</a>
                      </p>
                    )}
                    {sub.emailContent && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{sub.emailContent}</p>
                    )}

                    {sub.status === SubmissionStatus.PENDING && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-7 text-xs text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => approve.mutate(sub.id)}
                          disabled={approve.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-7 text-xs text-destructive border-destructive/20 hover:bg-destructive/5"
                          onClick={() => {
                            setRejectId(sub.id);
                            setRejectReason("");
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                    {rejectId === sub.id && (
                      <div className="flex gap-2 items-center pt-1">
                        <input
                          className="flex-1 text-xs border rounded-md px-2 py-1 bg-background"
                          placeholder="Rejection reason (optional)"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs"
                          onClick={() => {
                            reject.mutate({ id: sub.id, reason: rejectReason });
                            setRejectId(null);
                          }}
                        >
                          Confirm
                        </Button>
                      </div>
                    )}

                    {sub.status === SubmissionStatus.REJECTED && sub.rejectionReason && (
                      <p className="text-xs text-destructive">Reason: {sub.rejectionReason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
