import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchSubmissions,
  fetchSubmissionsByTask,
  fetchSubmissionsByWorker,
  createSubmission,
  approveSubmission,
  rejectSubmission,
} from "@/lib/mock-api";
import { SubmissionFormData, User, Submission, SubmissionStatus } from "@/types";

export const SUBMISSION_KEYS = {
  all: ["submissions"] as const,
  byTask: (taskId: string) => ["submissions", "task", taskId] as const,
  byWorker: (workerId: string) => ["submissions", "worker", workerId] as const,
};

export function useSubmissions() {
  return useQuery({
    queryKey: SUBMISSION_KEYS.all,
    queryFn: fetchSubmissions,
  });
}

export function useSubmissionsByTask(taskId: string) {
  return useQuery({
    queryKey: SUBMISSION_KEYS.byTask(taskId),
    queryFn: () => fetchSubmissionsByTask(taskId),
    enabled: !!taskId,
  });
}

export function useSubmissionsByWorker(workerId: string) {
  return useQuery({
    queryKey: SUBMISSION_KEYS.byWorker(workerId),
    queryFn: () => fetchSubmissionsByWorker(workerId),
    enabled: !!workerId,
  });
}

export function useCreateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      user,
    }: {
      data: SubmissionFormData;
      user: User;
    }) => createSubmission(data, user),

    // Optimistically add the submission to the worker's local cache
    // so the dashboard shows "+$X.XX pending review" without waiting for the server.
    onMutate: async ({ data, user }) => {
      await qc.cancelQueries({ queryKey: SUBMISSION_KEYS.byWorker(user.id) });
      const previous = qc.getQueryData(SUBMISSION_KEYS.byWorker(user.id));

      // Build a temporary optimistic submission — will be replaced after invalidation
      const optimistic: Submission = {
        id: `temp-${Date.now()}`,
        taskId: data.taskId,
        taskTitle: "", // filled in by server; placeholder only
        taskType: "social_media_posting" as any,
        workerId: user.id,
        workerName: user.name,
        workerAvatar: user.avatar ?? "",
        status: SubmissionStatus.PENDING,
        postUrl: data.postUrl,
        emailContent: data.emailContent,
        reward: 0, // reward will be correct after invalidation
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      qc.setQueryData(
        SUBMISSION_KEYS.byWorker(user.id),
        (old: Submission[] = []) => [optimistic, ...old]
      );

      return { previous, workerId: user.id };
    },

    onError: (_err, _vars, context) => {
      // Roll back on failure
      if (context?.previous !== undefined) {
        qc.setQueryData(SUBMISSION_KEYS.byWorker(context.workerId), context.previous);
      }
      toast.error("Failed to submit task");
    },

    onSuccess: (_, { data, user }) => {
      qc.invalidateQueries({ queryKey: SUBMISSION_KEYS.all });
      qc.invalidateQueries({ queryKey: SUBMISSION_KEYS.byTask(data.taskId) });
      qc.invalidateQueries({ queryKey: SUBMISSION_KEYS.byWorker(user.id) });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Submission sent! We'll review it shortly.");
    },
  });
}

export function useApproveSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveSubmission(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBMISSION_KEYS.all });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Submission approved");
    },
    onError: () => toast.error("Failed to approve submission"),
  });
}

export function useRejectSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectSubmission(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBMISSION_KEYS.all });
      toast.success("Submission rejected");
    },
    onError: () => toast.error("Failed to reject submission"),
  });
}
