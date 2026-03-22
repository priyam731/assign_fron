"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  GroupingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Search,
  ChevronRight,
  Layers,
  ExternalLink,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, TaskTypeBadge } from "@/components/shared/badges";
import { useSubmissions, useApproveSubmission, useRejectSubmission } from "@/features/submissions/hooks/use-submissions";
import { useSubmissionsState } from "@/hooks/use-url-state";
import { Submission, SubmissionStatus, TaskType } from "@/types";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: SubmissionStatus.PENDING, label: "Pending" },
  { value: SubmissionStatus.APPROVED, label: "Approved" },
  { value: SubmissionStatus.REJECTED, label: "Rejected" },
];

function SortableHeader({ column, label }: { column: any; label: string }) {
  return (
    <button
      className="flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors whitespace-nowrap"
      onClick={() => column.toggleSorting()}
    >
      {label}
      {column.getIsSorted() === "asc" ? (
        <ChevronUp className="h-3 w-3" />
      ) : column.getIsSorted() === "desc" ? (
        <ChevronDown className="h-3 w-3" />
      ) : (
        <div className="h-3 w-3" />
      )}
    </button>
  );
}

interface SubmissionRowProps {
  sub: Submission;
}

function SubmissionDetailRow({ sub }: SubmissionRowProps) {
  const approve = useApproveSubmission();
  const reject = useRejectSubmission();
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  return (
    <div className="border rounded-xl p-4 space-y-3 fade-in hover-card">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={sub.workerAvatar} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {sub.workerName.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{sub.workerName}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(sub.createdAt), "MMM d, yyyy · h:mm a")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TaskTypeBadge type={sub.taskType} />
          <StatusBadge status={sub.status} />
          {sub.phaseId && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300 px-1.5 py-0.5 rounded-full">
              Phase
            </span>
          )}
        </div>
      </div>

      {/* Task context */}
      <div className="bg-muted/40 rounded-lg px-3 py-2">
        <p className="text-xs text-muted-foreground">Task</p>
        <p className="text-sm font-medium truncate">{sub.taskTitle}</p>
      </div>

      {/* Submission evidence */}
      <div className="space-y-2">
        {sub.postUrl && (
          <div className="flex items-center gap-2 text-sm">
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <a
              href={sub.postUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline truncate text-xs"
            >
              {sub.postUrl}
            </a>
          </div>
        )}
        {sub.emailContent && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              Email Content
            </div>
            <p className="text-sm whitespace-pre-wrap line-clamp-3 bg-muted/30 rounded-lg p-2.5 text-xs">
              {sub.emailContent}
            </p>
          </div>
        )}
        {sub.screenshotUrl && (
          <img
            src={sub.screenshotUrl}
            alt="Evidence screenshot"
            className="max-h-32 rounded-lg object-cover border cursor-zoom-in"
            onClick={() => window.open(sub.screenshotUrl, "_blank")}
          />
        )}
      </div>

      {/* Rejection reason */}
      {sub.status === SubmissionStatus.REJECTED && sub.rejectionReason && (
        <div className="text-xs text-destructive flex items-center gap-1.5">
          <X className="h-3.5 w-3.5 shrink-0" />
          {sub.rejectionReason}
        </div>
      )}

      {/* Approve/Reject actions */}
      {sub.status === SubmissionStatus.PENDING && (
        <div className="space-y-2 pt-1">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"
              onClick={() => approve.mutate(sub.id)}
              disabled={approve.isPending}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs text-destructive border-destructive/20 hover:bg-destructive/5"
              onClick={() => setShowReject(!showReject)}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Reject
            </Button>
          </div>
          {showReject && (
            <div className="flex gap-2">
              <Input
                className="flex-1 h-8 text-xs"
                placeholder="Rejection reason (optional)…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs"
                onClick={() => {
                  reject.mutate({ id: sub.id, reason: rejectReason });
                  setShowReject(false);
                }}
              >
                Confirm
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SubmissionsScreen() {
  const { data: allSubmissions = [], isLoading } = useSubmissions();
  const { search, setSearch, statusFilter, setStatusFilter, groupByTask, setGroupByTask } = useSubmissionsState();
  const [sortField, setSortField] = useState<"createdAt" | "status">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let list = allSubmissions;
    if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.workerName.toLowerCase().includes(q) ||
          s.taskTitle.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sortField === "createdAt") {
        const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sortDir === "desc" ? diff : -diff;
      }
      const diff = a.status.localeCompare(b.status);
      return sortDir === "desc" ? diff : -diff;
    });
  }, [allSubmissions, statusFilter, search, sortField, sortDir]);

  // Group by task if enabled
  const grouped = useMemo(() => {
    if (!groupByTask) return null;
    const map = new Map<string, { taskTitle: string; items: Submission[] }>();
    for (const s of filtered) {
      if (!map.has(s.taskId)) {
        map.set(s.taskId, { taskTitle: s.taskTitle, items: [] });
      }
      map.get(s.taskId)!.items.push(s);
    }
    return Array.from(map.entries()).map(([taskId, val]) => ({ taskId, ...val }));
  }, [filtered, groupByTask]);

  const pendingCount = allSubmissions.filter((s) => s.status === SubmissionStatus.PENDING).length;
  const approvedCount = allSubmissions.filter((s) => s.status === SubmissionStatus.APPROVED).length;
  const rejectedCount = allSubmissions.filter((s) => s.status === SubmissionStatus.REJECTED).length;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className={`border rounded-xl p-3 cursor-pointer transition-all ${statusFilter === SubmissionStatus.PENDING ? "border-primary bg-primary/5" : "hover:border-primary/30"}`}
          onClick={() => setStatusFilter(statusFilter === SubmissionStatus.PENDING ? "all" : SubmissionStatus.PENDING)}
        >
          <p className="text-2xl font-bold tabular-nums text-amber-600">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div
          className={`border rounded-xl p-3 cursor-pointer transition-all ${statusFilter === SubmissionStatus.APPROVED ? "border-primary bg-primary/5" : "hover:border-primary/30"}`}
          onClick={() => setStatusFilter(statusFilter === SubmissionStatus.APPROVED ? "all" : SubmissionStatus.APPROVED)}
        >
          <p className="text-2xl font-bold tabular-nums text-green-600">{approvedCount}</p>
          <p className="text-xs text-muted-foreground">Approved</p>
        </div>
        <div
          className={`border rounded-xl p-3 cursor-pointer transition-all ${statusFilter === SubmissionStatus.REJECTED ? "border-primary bg-primary/5" : "hover:border-primary/30"}`}
          onClick={() => setStatusFilter(statusFilter === SubmissionStatus.REJECTED ? "all" : SubmissionStatus.REJECTED)}
        >
          <p className="text-2xl font-bold tabular-nums text-destructive">{rejectedCount}</p>
          <p className="text-xs text-muted-foreground">Rejected</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 h-9"
            placeholder="Search by worker or task…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter tabs */}
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

          {/* Sort */}
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs text-muted-foreground hover:bg-accent transition-colors"
            onClick={() =>
              setSortDir((d) => (d === "desc" ? "asc" : "desc"))
            }
          >
            {sortDir === "desc" ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            {sortDir === "desc" ? "Newest first" : "Oldest first"}
          </button>

          {/* Group by task */}
          <button
            onClick={() => setGroupByTask(!groupByTask)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${
              groupByTask
                ? "border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Group by Task
          </button>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">{filtered.length} submission(s)</p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-sm">
          No submissions match your filters
        </div>
      ) : groupByTask && grouped ? (
        <GroupedView groups={grouped} />
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => (
            <SubmissionDetailRow key={sub.id} sub={sub} />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupedView({ groups }: { groups: { taskId: string; taskTitle: string; items: Submission[] }[] }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.taskId);
        return (
          <div key={group.taskId} className="border rounded-xl overflow-hidden">
            <button
              onClick={() => toggle(group.taskId)}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className={`h-4 w-4 transition-transform ${isCollapsed ? "" : "rotate-90"}`} />
                <span className="text-sm font-medium">{group.taskTitle}</span>
                <span className="text-xs text-muted-foreground bg-background border rounded-full px-2 py-0.5">
                  {group.items.length}
                </span>
              </div>
              <div className="flex gap-1.5">
                {group.items.filter((s) => s.status === SubmissionStatus.PENDING).length > 0 && (
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full">
                    {group.items.filter((s) => s.status === SubmissionStatus.PENDING).length} pending
                  </span>
                )}
              </div>
            </button>
            {!isCollapsed && (
              <div className="p-3 space-y-2">
                {group.items.map((sub) => (
                  <SubmissionDetailRow key={sub.id} sub={sub} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
