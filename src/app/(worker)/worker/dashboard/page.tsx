"use client";

import React, { useMemo } from "react";
import { format, startOfMonth, isAfter } from "date-fns";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useSubmissionsByWorker } from "@/features/submissions/hooks/use-submissions";
import { TaskTypeBadge } from "@/components/shared/badges";
import { useAuth } from "@/features/auth/auth-context";
import { SubmissionStatus } from "@/types";

export default function WorkerDashboardPage() {
  const { user } = useAuth();
  const { data: submissions = [], isLoading } = useSubmissionsByWorker(user?.id ?? "");

  const stats = useMemo(() => {
    const approved = submissions.filter((s) => s.status === SubmissionStatus.APPROVED);
    const pending = submissions.filter((s) => s.status === SubmissionStatus.PENDING);
    const totalEarned = approved.reduce((a, s) => a + (s.reward ?? 0), 0);
    const pendingEarnings = pending.reduce((a, s) => a + (s.reward ?? 0), 0);
    const thisMonthStart = startOfMonth(new Date());
    const thisMonth = approved.filter((s) => isAfter(new Date(s.createdAt), thisMonthStart));
    const thisMonthEarnings = thisMonth.reduce((a, s) => a + (s.reward ?? 0), 0);
    return { totalEarned, pendingEarnings, thisMonthEarnings, approvedCount: approved.length };
  }, [submissions]);

  // Recent approved submissions (for activity feed)
  const recentApproved = useMemo(
    () =>
      submissions
        .filter((s) => s.status === SubmissionStatus.APPROVED)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10),
    [submissions]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Earnings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your earnings and payment history
        </p>
      </div>

      {/* Balance card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-violet-600 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4 opacity-80" />
            <p className="text-sm opacity-80">Available Balance</p>
          </div>
          <p className="text-4xl font-bold tabular-nums tracking-tight">
            ${(user?.balance ?? 0).toFixed(2)}
          </p>
          <p className="text-sm opacity-70 mt-0.5">AUD</p>
          {stats.pendingEarnings > 0 && (
            <p className="text-xs opacity-70 mt-3 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ${stats.pendingEarnings.toFixed(2)} pending review
            </p>
          )}
        </div>
        {/* decorative circle */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs text-muted-foreground">This Month</p>
          </div>
          <p className="text-xl font-bold tabular-nums">${stats.thisMonthEarnings.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground">AUD earned</p>
        </div>
        <div className="border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <p className="text-xl font-bold tabular-nums">{stats.approvedCount}</p>
          <p className="text-[10px] text-muted-foreground">tasks completed</p>
        </div>
        <div className="border rounded-xl p-4 col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Total Earned (All Time)</p>
          </div>
          <p className="text-2xl font-bold tabular-nums">${stats.totalEarned.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground">AUD</p>
        </div>
      </div>

      <Separator />

      {/* Recent earnings activity */}
      <div>
        <p className="text-sm font-semibold mb-3">Recent Earnings</p>
        {recentApproved.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No approved tasks yet — start submitting to earn!
          </p>
        ) : (
          <div className="space-y-2">
            {recentApproved.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between gap-3 p-3 border rounded-xl hover-card"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{sub.taskTitle}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <TaskTypeBadge type={sub.taskType} />
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(sub.createdAt), "MMM d")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-green-600 tabular-nums">
                    +${(sub.reward ?? 0).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">AUD</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
