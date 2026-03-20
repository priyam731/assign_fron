"use client";

import React, { useMemo } from "react";
import { format } from "date-fns";
import { CheckCircle, Clock, XCircle, ExternalLink, Mail, Inbox, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, TaskTypeBadge } from "@/components/shared/badges";
import { useSubmissionsByWorker } from "@/features/submissions/hooks/use-submissions";
import { useAuth } from "@/features/auth/auth-context";
import { SubmissionStatus } from "@/types";
import { useState } from "react";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: SubmissionStatus.PENDING, label: "Pending" },
  { value: SubmissionStatus.APPROVED, label: "Approved" },
  { value: SubmissionStatus.REJECTED, label: "Rejected" },
];

export default function WorkerSubmissionsPage() {
  const { user } = useAuth();
  const { data: submissions = [], isLoading } = useSubmissionsByWorker(user?.id ?? "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const filtered = useMemo(
    () =>
      submissions
        .filter((s) => statusFilter === "all" || s.status === statusFilter)
        .sort((a, b) => {
          const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          return sortDir === "desc" ? diff : -diff;
        }),
    [submissions, statusFilter, sortDir]
  );

  const pendingCount = submissions.filter((s) => s.status === SubmissionStatus.PENDING).length;
  const approvedCount = submissions.filter((s) => s.status === SubmissionStatus.APPROVED).length;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Submissions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your past submissions and their status
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border rounded-xl p-4 space-y-0.5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <p className="text-2xl font-bold tabular-nums">{pendingCount}</p>
        </div>
        <div className="border rounded-xl p-4 space-y-0.5">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <p className="text-xs text-muted-foreground">Approved</p>
          </div>
          <p className="text-2xl font-bold tabular-nums">{approvedCount}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center border rounded-lg p-0.5 gap-0.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs text-muted-foreground hover:bg-accent transition-colors"
          onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
        >
          {sortDir === "desc" ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          {sortDir === "desc" ? "Newest first" : "Oldest first"}
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <Inbox className="h-10 w-10 opacity-40" />
          <p className="text-sm">No submissions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => (
            <div key={sub.id} className="border rounded-xl p-4 space-y-3 hover-card">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TaskTypeBadge type={sub.taskType} />
                    <StatusBadge status={sub.status} />
                  </div>
                  <p className="text-sm font-medium truncate">{sub.taskTitle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(sub.createdAt), "MMM d, yyyy · h:mm a")}
                  </p>
                </div>
                {sub.reward && (
                  <div className="text-right shrink-0">
                    <p className={`text-base font-bold tabular-nums ${sub.status === SubmissionStatus.APPROVED ? "text-green-600" : "text-muted-foreground"}`}>
                      ${sub.reward.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">AUD</p>
                  </div>
                )}
              </div>

              {sub.postUrl && (
                <a href={sub.postUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline truncate">
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  {sub.postUrl}
                </a>
              )}
              {sub.emailContent && (
                <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 rounded-lg p-2">
                  {sub.emailContent}
                </p>
              )}

              {sub.status === SubmissionStatus.REJECTED && sub.rejectionReason && (
                <div className="flex items-start gap-1.5 text-xs text-destructive">
                  <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{sub.rejectionReason}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
