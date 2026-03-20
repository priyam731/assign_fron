"use client";

import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Download, X, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TaskType } from "@/types";
import { TASK_TYPE_LABELS } from "@/lib/constants";
import { useCreateTask } from "@/features/tasks/hooks/use-tasks";

// ── CSV template content ──────────────────────────────────────────────────────

const CSV_TEMPLATE = `task_type,title,description,details,amount,reward,campaign_id
social_media_posting,Post about our launch,"Share on Twitter","Go to https://example.com, write a post tagging us, take a screenshot and submit the URL.",20,2.50,campaign-launch-2026
email_sending,Send intro email,"Email our pitch","Email the following content to 5 contacts: [paste email here]",10,5.00,campaign-email-q1
social_media_liking,Like our Instagram posts,"Like 3 posts","Visit @mytwitterhandle and like the last 3 posts. Screenshot proof required.",50,0.75,campaign-social`;

const COLUMNS = ["task_type", "title", "description", "details", "amount", "reward", "campaign_id"] as const;

interface ParsedRow {
  task_type: string;
  title: string;
  description: string;
  details: string;
  amount: string;
  reward: string;
  campaign_id: string;
  _valid: boolean;
  _errors: string[];
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    // Handle quoted fields with commas inside
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === "," && !inQuotes) { values.push(current.trim()); current = ""; continue; }
      current += ch;
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });

    const errors: string[] = [];
    const validTypes = Object.values(TaskType) as string[];
    if (!validTypes.includes(row.task_type)) {
      errors.push(`Invalid task_type: must be one of ${validTypes.join(", ")}`);
    }
    if (!row.title || row.title.length < 3) errors.push("Title too short (min 3 chars)");
    if (!row.details || row.details.length < 10) errors.push("Details too short (min 10 chars)");
    if (!row.campaign_id) errors.push("campaign_id is required");
    if (isNaN(Number(row.amount)) || Number(row.amount) < 1) errors.push("amount must be ≥ 1");
    if (isNaN(Number(row.reward)) || Number(row.reward) < 0.01) errors.push("reward must be ≥ 0.01");

    return {
      task_type: row.task_type ?? "",
      title: row.title ?? "",
      description: row.description ?? "",
      details: row.details ?? "",
      amount: row.amount ?? "",
      reward: row.reward ?? "",
      campaign_id: row.campaign_id ?? "",
      _valid: errors.length === 0,
      _errors: errors,
    };
  });
}

// ── Dialog component ──────────────────────────────────────────────────────────

interface BulkUploadDialogProps {
  open: boolean;
  onClose: () => void;
}

export function BulkUploadDialog({ open, onClose }: BulkUploadDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const createTask = useCreateTask();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRows(parseCSV(text));
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setRows(parseCSV(ev.target?.result as string));
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const valid = rows.filter((r) => r._valid);
    if (valid.length === 0) {
      toast.error("No valid rows to import");
      return;
    }
    setIsUploading(true);
    let created = 0;
    for (const row of valid) {
      try {
        await createTask.mutateAsync({
          task_type: row.task_type as TaskType,
          title: row.title,
          description: row.description,
          details: row.details,
          amount: Number(row.amount),
          reward: Number(row.reward),
          allow_multiple_submissions: false,
          campaign_id: row.campaign_id,
        });
        created++;
      } catch { /* skip failed rows */ }
    }
    setIsUploading(false);
    toast.success(`Imported ${created} task${created !== 1 ? "s" : ""} successfully`);
    setRows([]);
    onClose();
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "task-upload-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = rows.filter((r) => r._valid).length;
  const errorCount = rows.filter((r) => !r._valid).length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Bulk Task Upload
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to create multiple tasks at once.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pb-2">
          {/* Drop zone */}
          <div
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Drop CSV here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">
              Max 500 rows · UTF-8 encoding
            </p>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
          </div>

          {/* Template download */}
          <div className="flex items-center justify-between bg-muted/40 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium">Download Template</p>
              <p className="text-xs text-muted-foreground">
                Valid task types: {Object.values(TaskType).join(", ")}
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadTemplate}>
              <Download className="h-3.5 w-3.5" />
              Template CSV
            </Button>
          </div>

          {/* Preview table */}
          {rows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold">Preview ({rows.length} rows)</p>
                {validCount > 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {validCount} valid
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errorCount} with errors
                  </span>
                )}
                <button className="ml-auto text-xs text-muted-foreground hover:text-foreground" onClick={() => setRows([])}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium w-6"></th>
                        <th className="px-3 py-2 text-left font-medium">Title</th>
                        <th className="px-3 py-2 text-left font-medium">Type</th>
                        <th className="px-3 py-2 text-left font-medium text-right">Slots</th>
                        <th className="px-3 py-2 text-left font-medium text-right">Reward</th>
                        <th className="px-3 py-2 text-left font-medium">Campaign</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {rows.map((row, i) => (
                        <tr key={i} className={row._valid ? "" : "bg-destructive/5"}>
                          <td className="px-3 py-2">
                            {row._valid ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                            )}
                          </td>
                          <td className="px-3 py-2 max-w-[160px]">
                            <p className="truncate font-medium">{row.title || <span className="text-muted-foreground italic">empty</span>}</p>
                            {!row._valid && (
                              <p className="text-destructive text-[10px] truncate">{row._errors.join("; ")}</p>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-muted-foreground">
                              {TASK_TYPE_LABELS[row.task_type as TaskType] ?? row.task_type}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">{row.amount}</td>
                          <td className="px-3 py-2 text-right tabular-nums font-medium">${row.reward}</td>
                          <td className="px-3 py-2 text-muted-foreground truncate max-w-[120px]">{row.campaign_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t gap-3">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={validCount === 0 || isUploading}
            className="gap-1.5 min-w-32"
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Importing…
              </>
            ) : (
              <>
                <ChevronRight className="h-4 w-4" />
                Import {validCount} Task{validCount !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
