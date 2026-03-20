"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2, Upload, Link, Mail, Users, DollarSign, CheckCircle } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { TaskTypeBadge } from "@/components/shared/badges";
import { useCreateSubmission } from "@/features/submissions/hooks/use-submissions";
import { Task, TaskType, User } from "@/types";

// ─── Schemas per type ────────────────────────────────────────────────────────

const postingSchema = z.object({
  postUrl: z.string().url("Enter a valid URL"),
  screenshot: z.instanceof(File).nullable().refine((f) => f !== null, "Screenshot is required"),
});

const emailSchema = z.object({
  emailContent: z.string().min(20, "Email content must be at least 20 characters"),
  screenshot: z.instanceof(File).nullable().refine((f) => f !== null, "Screenshot is required"),
});

const likingSchema = z.object({
  postUrl: z.string().url("Enter a valid URL"),
  screenshot: z.instanceof(File).nullable().refine((f) => f !== null, "Screenshot is required"),
});

type PostingForm = z.infer<typeof postingSchema>;
type EmailForm = z.infer<typeof emailSchema>;
type LikingForm = z.infer<typeof likingSchema>;

interface TaskSubmitSheetProps {
  task: Task;
  user: User;
  onClose: () => void;
}

export function TaskSubmitSheet({ task, user, onClose }: TaskSubmitSheetProps) {
  const createSubmission = useCreateSubmission();
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const schema =
    task.task_type === TaskType.EMAIL_SENDING
      ? emailSchema
      : task.task_type === TaskType.SOCIAL_MEDIA_POSTING
      ? postingSchema
      : likingSchema;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      postUrl: "",
      emailContent: "",
      screenshot: undefined,
    },
  });

  const onSubmit = async (values: PostingForm | EmailForm | LikingForm) => {
    const v = values as Record<string, unknown>;
    await createSubmission.mutateAsync({
      data: {
        taskId: task.id,
        postUrl: v.postUrl as string | undefined,
        emailContent: v.emailContent as string | undefined,
        screenshot: v.screenshot as File | null,
      },
      user,
    });
    setSubmitted(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    form.setValue("screenshot" as keyof typeof form.getValues, file as never);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setScreenshotPreview(null);
    }
  };

  const pct = Math.round((task.filledAmount / task.amount) * 100);
  const slotsLeft = task.amount - task.filledAmount;

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

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Task stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Reward
              </p>
              <p className="font-bold text-primary text-lg tabular-nums">
                ${task.reward.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">AUD per completion</p>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" /> Slots
              </p>
              <p className="font-bold text-lg tabular-nums">{slotsLeft}</p>
              <p className="text-xs text-muted-foreground">of {task.amount} remaining</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <Progress value={pct} className="h-1.5" />
            <p className="text-xs text-muted-foreground">{pct}% filled</p>
          </div>

          {/* Task details */}
          <div className="bg-muted/40 rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Instructions
            </p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{task.details}</p>
          </div>

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
              </div>
              <Button variant="outline" onClick={onClose} className="mt-2">
                Back to Feed
              </Button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-sm font-semibold">Submit Your Evidence</p>

              {/* Post URL field (posting / liking) */}
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

              {/* Email content (email sending) */}
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
                      <p className="text-sm text-muted-foreground">
                        Click to upload screenshot
                      </p>
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
                {(form.formState.errors as Record<string, { message?: string }>).screenshot && (
                  <p className="text-xs text-destructive">
                    {(form.formState.errors as Record<string, { message?: string }>).screenshot?.message}
                  </p>
                )}
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
