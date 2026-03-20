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
import { SubmissionFormData, User } from "@/types";

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
    onSuccess: (_, { data }) => {
      qc.invalidateQueries({ queryKey: SUBMISSION_KEYS.all });
      qc.invalidateQueries({ queryKey: SUBMISSION_KEYS.byTask(data.taskId) });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Submission sent! We'll review it shortly.");
    },
    onError: () => toast.error("Failed to submit task"),
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
