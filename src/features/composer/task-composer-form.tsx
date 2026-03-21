"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskType, TaskFormData, Task } from "@/types";
import { TASK_TYPE_LABELS, DRIP_INTERVAL_OPTIONS } from "@/lib/constants";
import { useCreateTask, useUpdateTask } from "@/features/tasks/hooks/use-tasks";

// ----------- Zod Schema -----------

const phaseSchema = z.object({
  phase_name: z.string().min(1, "Phase name is required"),
  phase_index: z.number().int().min(1),
  slots: z.coerce.number().int().min(1, "At least 1 slot required"),
  instructions: z.string().min(1, "Instructions are required"),
  reward: z.coerce.number().min(0.01, "Reward must be > 0"),
});

const composerSchema = z.object({
  task_type: z.nativeEnum(TaskType, { error: (issue) => issue.input === undefined ? { message: "Task type is required" } : { message: "Invalid task type" } }),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  details: z.string().min(10, "Details must be at least 10 characters"),
  amount: z.coerce.number().int().min(1, "At least 1 submission required"),
  reward: z.coerce.number().min(0.01, "Reward must be greater than $0.01"),
  allow_multiple_submissions: z.boolean().default(false),
  campaign_id: z.string().min(1, "Campaign ID is required"),
  enablePhases: z.boolean().default(false),
  phases: z.array(phaseSchema).optional(),
  enableDrip: z.boolean().default(false),
  dripAmount: z.coerce.number().int().min(1).optional(),
  dripInterval: z.coerce.number().int().min(1).optional(),
});

type ComposerFormValues = z.infer<typeof composerSchema>;

// ----------- Props -----------

interface TaskComposerFormProps {
  task?: Task; // when provided, operates in edit mode
  onSuccess?: () => void;
}

// ----------- Component -----------

export function TaskComposerForm({ task, onSuccess }: TaskComposerFormProps) {
  const isEdit = !!task;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const [showPhases, setShowPhases] = React.useState(false);
  const [showDrip, setShowDrip] = React.useState(false);

  const form = useForm<ComposerFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(composerSchema) as any,
    defaultValues: {
      task_type: task?.task_type ?? ("" as TaskType),
      title: task?.title ?? "",
      description: task?.description ?? "",
      details: task?.details ?? "",
      amount: task?.amount ?? 10,
      reward: task?.reward ?? 1.0,
      allow_multiple_submissions: task?.allow_multiple_submissions ?? false,
      campaign_id: task?.campaign_id ?? "",
      enablePhases: !!task?.phases?.length,
      phases: task?.phases?.map((p) => ({
        phase_name: p.phase_name,
        phase_index: p.phase_index,
        slots: p.slots,
        instructions: p.instructions,
        reward: p.reward,
      })) ?? [],
      enableDrip: !!task?.dripFeed?.enabled,
      dripAmount: task?.dripFeed?.drip_amount ?? 5,
      dripInterval: task?.dripFeed?.drip_interval ?? 6,
    },
  });

  const { fields: phaseFields, append: appendPhase, remove: removePhase } = useFieldArray({
    control: form.control,
    name: "phases",
  });

  const enablePhases = form.watch("enablePhases");
  const enableDrip = form.watch("enableDrip");

  // Sync state with form values
  React.useEffect(() => { setShowPhases(enablePhases); }, [enablePhases]);
  React.useEffect(() => { setShowDrip(enableDrip); }, [enableDrip]);

  const onSubmit = async (values: ComposerFormValues) => {
    const payload: TaskFormData = {
      task_type: values.task_type,
      title: values.title,
      description: values.description,
      details: values.details,
      amount: values.amount,
      reward: values.reward,
      allow_multiple_submissions: values.allow_multiple_submissions,
      campaign_id: values.campaign_id,
      phases: values.enablePhases && values.phases?.length
        ? values.phases.map((p, i) => ({ ...p, phase_index: i + 1 }))
        : undefined,
      dripFeed: values.enableDrip
        ? { enabled: true, drip_amount: values.dripAmount!, drip_interval: values.dripInterval! }
        : { enabled: false, drip_amount: 0, drip_interval: 0 },
    };

    if (isEdit && task) {
      await updateTask.mutateAsync({ id: task.id, data: payload });
    } else {
      await createTask.mutateAsync(payload);
      form.reset(); // Reset form after create — admin likely wants to create another
    }

    onSuccess?.();
  };

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* ── Core Fields ── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Task Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Task Type */}
          <div className="space-y-1.5">
            <Label htmlFor="task_type">
              Task Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.watch("task_type") || ""}
              onValueChange={(v) => form.setValue("task_type", v as TaskType, { shouldValidate: true })}
            >
              <SelectTrigger id="task_type" className="w-full">
                <SelectValue placeholder="Select task type…" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TaskType).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TASK_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.task_type && (
              <p className="text-xs text-destructive">{form.formState.errors.task_type.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Post about our product launch on Twitter"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Short Description <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="description"
              placeholder="Brief summary shown in the task card"
              {...form.register("description")}
            />
          </div>

          {/* Details — Lexical rich-text editor */}
          <div className="space-y-1.5">
            <Label>
              Full Details <span className="text-destructive">*</span>
            </Label>
            <RichTextEditor
              value={form.getValues("details")}
              onChange={(text) =>
                form.setValue("details", text, { shouldValidate: true })
              }
              placeholder="Full instructions for the worker — what to do, where to post, what to include… (Markdown shortcuts work: **bold**, ## heading, - bullet)"
            />
            {form.formState.errors.details && (
              <p className="text-xs text-destructive">{form.formState.errors.details.message}</p>
            )}
          </div>

          {/* Amount + Reward (side by side) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount">
                Submissions Required <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min={1}
                placeholder="e.g. 20"
                {...form.register("amount")}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reward">
                Reward (AUD) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  id="reward"
                  type="number"
                  step="0.01"
                  min={0.01}
                  placeholder="0.00"
                  className="pl-7"
                  {...form.register("reward")}
                />
              </div>
              {form.formState.errors.reward && (
                <p className="text-xs text-destructive">{form.formState.errors.reward.message}</p>
              )}
            </div>
          </div>

          {/* Campaign ID */}
          <div className="space-y-1.5">
            <Label htmlFor="campaign_id">
              Campaign ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="campaign_id"
              placeholder="e.g. campaign-launch-2026"
              {...form.register("campaign_id")}
            />
            {form.formState.errors.campaign_id && (
              <p className="text-xs text-destructive">{form.formState.errors.campaign_id.message}</p>
            )}
          </div>

          {/* Allow multiple submissions toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium">Allow Multiple Submissions</p>
              <p className="text-xs text-muted-foreground">
                Let the same worker submit this task more than once
              </p>
            </div>
            <Switch
              checked={form.watch("allow_multiple_submissions")}
              onCheckedChange={(v) => form.setValue("allow_multiple_submissions", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Task Phases (Phase 2 feature) ── */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Task Phases</p>
              <p className="text-xs text-muted-foreground">
                Break this task into sequential stages with different rewards
              </p>
            </div>
            <Switch
              checked={enablePhases}
              onCheckedChange={(v) => {
                form.setValue("enablePhases", v);
                if (v && phaseFields.length === 0) {
                  appendPhase({ phase_name: "Phase 1 — Launch", phase_index: 1, slots: 10, instructions: "", reward: 1 });
                }
              }}
            />
          </div>

          {enablePhases && (
            <div className="mt-5 space-y-4">
              {phaseFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm font-medium flex-1">Phase {index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removePhase(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Phase Name</Label>
                      <Input
                        placeholder="e.g. Phase 1 — Launch"
                        {...form.register(`phases.${index}.phase_name`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Slots</Label>
                      <Input type="number" min={1} {...form.register(`phases.${index}.slots`)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Reward (AUD)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                        <Input type="number" step="0.01" min={0.01} className="pl-6 text-sm" {...form.register(`phases.${index}.reward`)} />
                      </div>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Phase Instructions</Label>
                      <Textarea
                        rows={2}
                        placeholder="What should workers do in this phase?"
                        className="resize-none text-sm"
                        {...form.register(`phases.${index}.instructions`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  appendPhase({
                    phase_name: `Phase ${phaseFields.length + 1}`,
                    phase_index: phaseFields.length + 1,
                    slots: 10,
                    instructions: "",
                    reward: 1,
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add Phase
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Drip Feed (Phase 2 feature) ── */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Drip Feed</p>
              <p className="text-xs text-muted-foreground">
                Release submission slots in batches over time
              </p>
            </div>
            <Switch
              checked={enableDrip}
              onCheckedChange={(v) => form.setValue("enableDrip", v)}
            />
          </div>

          {enableDrip && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Slots per Release</Label>
                <Input type="number" min={1} {...form.register("dripAmount")} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Release Interval</Label>
                <Select
                  value={String(form.watch("dripInterval"))}
                  onValueChange={(v) => form.setValue("dripInterval", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    {DRIP_INTERVAL_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={String(o.value)}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Submit ── */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3.5 w-3.5" />
          {isEdit ? "Changes apply immediately" : "Form resets after creation to let you add more tasks"}
        </p>
        <Button
          type="submit"
          disabled={isPending}
          className="min-w-32"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEdit ? "Saving…" : "Creating…"}
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Task"
          )}
        </Button>
      </div>
    </form>
  );
}
