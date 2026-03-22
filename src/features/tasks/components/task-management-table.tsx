"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  SlidersHorizontal,
  CheckSquare,
  DollarSign,
  Users,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TaskTypeBadge, TaskStatusBadge } from "@/components/shared/badges";
import { useTasks, useDeleteTask, useBulkUpdateTasks } from "@/features/tasks/hooks/use-tasks";
import { Task, TaskType } from "@/types";
import { TASK_TYPE_LABELS } from "@/lib/constants";
import { TaskDetailPanel } from "@/features/tasks/components/task-detail-panel";
import { TaskPhasesPanel } from "@/features/tasks/components/phase2-controls";

// ─── Column Defs ─────────────────────────────────────────────────────────────

function getColumns(
  onView: (task: Task) => void,
  onDelete: (id: string) => void,
  router: ReturnType<typeof useRouter>
): ColumnDef<Task>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      size: 40,
      enableSorting: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <SortableHeader label="Title" column={column} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[260px]">
          <p className="font-medium text-sm truncate">{row.original.title}</p>
          <p className="text-xs text-muted-foreground truncate">{row.original.campaign_id}</p>
        </div>
      ),
    },
    {
      accessorKey: "task_type",
      header: "Type",
      cell: ({ row }) => <TaskTypeBadge type={row.original.task_type} />,
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    },
    {
      id: "progress",
      header: ({ column }) => <SortableHeader label="Progress" column={column} />,
      accessorFn: (row) => row.filledAmount / row.amount,
      cell: ({ row }) => {
        const { filledAmount, amount } = row.original;
        const pct = Math.round((filledAmount / amount) * 100);
        return (
          <div className="w-32 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {filledAmount}/{amount}
              </span>
              <span className="font-medium">{pct}%</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        );
      },
    },
    {
      accessorKey: "reward",
      header: ({ column }) => <SortableHeader label="Reward" column={column} />,
      cell: ({ row }) => (
        <span className="text-sm font-medium tabular-nums">
          ${row.original.reward.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <TaskStatusBadge status={row.original.status} />,
    },
    {
      id: "phases",
      header: "Phases",
      cell: ({ row }) => {
        const task = row.original;
        if (!task.phases?.length) return <span className="text-xs text-muted-foreground/50">—</span>;
        const activeIdx = task.activePhaseIndex ?? 0;
        return (
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {task.phases.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < activeIdx
                      ? "bg-green-500"
                      : i === activeIdx
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              {activeIdx + 1}/{task.phases.length}
            </span>
          </div>
        );
      },
      size: 80,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <SortableHeader label="Created" column={column} />,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/composer?taskId=${row.original.id}`);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row.original.id);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 50,
    },
  ];
}

function SortableHeader({ column, label }: { column: any; label: string }) {
  return (
    <button
      className="flex items-center gap-1 text-xs font-medium hover:text-foreground transition-colors"
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function TaskManagementTable() {
  const router = useRouter();
  const { data: tasks = [], isLoading } = useTasks();
  const deleteTask = useDeleteTask();
  const bulkUpdate = useBulkUpdateTasks();

  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAmount, setBulkAmount] = useState("");
  const [bulkCampaign, setBulkCampaign] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Apply type filter
  const filteredTasks = useMemo(() => {
    if (typeFilter === "all") return tasks;
    return tasks.filter((t) => t.task_type === typeFilter);
  }, [tasks, typeFilter]);

  const columns = useMemo(
    () => getColumns(setSelectedTask, (id) => deleteTask.mutate(id), router),
    [deleteTask, router]
  );

  const table = useReactTable({
    data: filteredTasks,
    columns,
    state: { sorting, columnFilters, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedIds = Object.keys(rowSelection).map(
    (idx) => filteredTasks[Number(idx)]?.id
  ).filter(Boolean);

  const handleBulkUpdate = async () => {
    await bulkUpdate.mutateAsync({
      ids: selectedIds,
      data: {
        ...(bulkAmount ? { amount: Number(bulkAmount) } : {}),
        ...(bulkCampaign ? { campaign_id: bulkCampaign } : {}),
      },
    });
    setRowSelection({});
    setShowBulkDialog(false);
    setBulkAmount("");
    setBulkCampaign("");
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Header controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48 max-w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 h-9"
              placeholder="Search tasks…"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>

          {/* Type filter buttons */}
          <div className="flex items-center gap-1">
            {["all", ...Object.values(TaskType)].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  typeFilter === t
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-muted-foreground"
                }`}
              >
                {t === "all" ? "All" : TASK_TYPE_LABELS[t as TaskType].split(" ").slice(-1)[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk actions */}
          {selectedIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkDialog(true)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
              Edit {selectedIds.length} selected
            </Button>
          )}
          <Link href="/admin/composer">
            <Button size="sm">
              <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border rounded-lg px-4 py-3 flex items-center gap-3">
          <CheckSquare className="h-5 w-5 text-primary" />
          <div>
            <p className="text-2xl font-bold tabular-nums">{tasks.length}</p>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
          </div>
        </div>
        <div className="border rounded-lg px-4 py-3 flex items-center gap-3">
          <Users className="h-5 w-5 text-emerald-500" />
          <div>
            <p className="text-2xl font-bold tabular-nums">
              {tasks.reduce((a, t) => a + t.filledAmount, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Submissions</p>
          </div>
        </div>
        <div className="border rounded-lg px-4 py-3 flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-amber-500" />
          <div>
            <p className="text-2xl font-bold tabular-nums">
              ${tasks.reduce((a, t) => a + t.reward * t.filledAmount, 0).toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Paid Out</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap"
                      style={{ width: header.getSize() }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-muted-foreground text-sm">
                    No tasks found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedTask(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
          <span>{table.getFilteredRowModel().rows.length} task(s)</span>
          {selectedIds.length > 0 && (
            <span className="text-primary font-medium">{selectedIds.length} selected</span>
          )}
        </div>
      </div>

      {/* Task detail panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Bulk edit dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Bulk Edit — {selectedIds.length} Tasks</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>New Amount (submissions required)</Label>
              <Input
                type="number"
                min={1}
                placeholder="Leave blank to keep unchanged"
                value={bulkAmount}
                onChange={(e) => setBulkAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>New Campaign ID</Label>
              <Input
                placeholder="Leave blank to keep unchanged"
                value={bulkCampaign}
                onChange={(e) => setBulkCampaign(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleBulkUpdate}
              disabled={bulkUpdate.isPending || (!bulkAmount && !bulkCampaign)}
            >
              {bulkUpdate.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating…</>
              ) : "Apply Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
