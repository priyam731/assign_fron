import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchTasks,
  fetchTask,
  createTask,
  updateTask,
  deleteTask,
  bulkUpdateTasks,
} from "@/lib/mock-api";
import { TaskFormData } from "@/types";

export const TASK_KEYS = {
  all: ["tasks"] as const,
  detail: (id: string) => ["tasks", id] as const,
};

export function useTasks() {
  return useQuery({
    queryKey: TASK_KEYS.all,
    queryFn: fetchTasks,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: () => fetchTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskFormData) => createTask(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
      toast.success("Task created successfully!");
    },
    onError: () => toast.error("Failed to create task"),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskFormData> }) =>
      updateTask(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
      qc.invalidateQueries({ queryKey: TASK_KEYS.detail(id) });
      toast.success("Task updated successfully!");
    },
    onError: () => toast.error("Failed to update task"),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
      toast.success("Task deleted");
    },
    onError: () => toast.error("Failed to delete task"),
  });
}

export function useBulkUpdateTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ids,
      data,
    }: {
      ids: string[];
      data: { amount?: number; campaign_id?: string };
    }) => bulkUpdateTasks(ids, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
      toast.success("Tasks updated successfully!");
    },
    onError: () => toast.error("Failed to bulk update tasks"),
  });
}
