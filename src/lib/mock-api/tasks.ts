// ============================================
// Mock API — Task CRUD operations
// ============================================

import { v4 as uuid } from "uuid";
import { Task, TaskFormData, DripFeedState } from "@/types";
import { STORAGE_KEYS, FETCH_DELAY, MUTATION_DELAY } from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage";
import { delay } from "./delay";

// ----------- Read -----------

export async function fetchTasks(): Promise<Task[]> {
  await delay(FETCH_DELAY.min, FETCH_DELAY.max);
  return getItem<Task[]>(STORAGE_KEYS.TASKS) || [];
}

export async function fetchTask(id: string): Promise<Task | null> {
  await delay(FETCH_DELAY.min, FETCH_DELAY.max);
  const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS) || [];
  return tasks.find((t) => t.id === id) || null;
}

// ----------- Create -----------

export async function createTask(data: TaskFormData): Promise<Task> {
  await delay(MUTATION_DELAY.min, MUTATION_DELAY.max);
  const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS) || [];
  const now = new Date().toISOString();

  const newTask: Task = {
    id: uuid(),
    task_type: data.task_type,
    title: data.title,
    description: data.description,
    details: data.details,
    amount: data.amount,
    filledAmount: 0,
    reward: data.reward,
    allow_multiple_submissions: data.allow_multiple_submissions,
    campaign_id: data.campaign_id,
    status: "active",
    createdAt: now,
    updatedAt: now,
    phases: data.phases?.map((p, i) => ({
      ...p,
      id: uuid(),
      filledSlots: 0,
      phase_index: i + 1,
    })),
    activePhaseIndex: data.phases ? 0 : undefined,
    dripFeed: data.dripFeed?.enabled
      ? {
          enabled: true,
          drip_amount: data.dripFeed.drip_amount,
          drip_interval: data.dripFeed.drip_interval,
          releasedSlots: data.dripFeed.drip_amount,
          lastDripAt: now,
          state: DripFeedState.ACTIVE,
        }
      : undefined,
  };

  tasks.unshift(newTask);
  setItem(STORAGE_KEYS.TASKS, tasks);
  return newTask;
}

// ----------- Update -----------

export async function updateTask(id: string, data: Partial<TaskFormData>): Promise<Task> {
  await delay(MUTATION_DELAY.min, MUTATION_DELAY.max);
  const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS) || [];
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Task not found");

  const existing = tasks[index];
  const { phases: _phases, dripFeed: _dripFeed, ...safeData } = data;
  const updated: Task = {
    ...existing,
    ...safeData,
    updatedAt: new Date().toISOString(),
  };

  // Handle phases update
  if (data.phases) {
    updated.phases = data.phases.map((p, i) => ({
      ...p,
      id: existing.phases?.[i]?.id || uuid(),
      filledSlots: existing.phases?.[i]?.filledSlots || 0,
      phase_index: i + 1,
    }));
  }

  // Handle drip feed update
  if (data.dripFeed) {
    if (data.dripFeed.enabled) {
      updated.dripFeed = {
        enabled: true,
        drip_amount: data.dripFeed.drip_amount,
        drip_interval: data.dripFeed.drip_interval,
        releasedSlots: existing.dripFeed?.releasedSlots || data.dripFeed.drip_amount,
        lastDripAt: existing.dripFeed?.lastDripAt || new Date().toISOString(),
        state: existing.dripFeed?.state || DripFeedState.ACTIVE,
      };
    } else {
      updated.dripFeed = undefined;
    }
  }

  tasks[index] = updated;
  setItem(STORAGE_KEYS.TASKS, tasks);
  return updated;
}

// ----------- Bulk Update -----------

export async function bulkUpdateTasks(
  ids: string[],
  data: { amount?: number; campaign_id?: string }
): Promise<Task[]> {
  await delay(MUTATION_DELAY.min, MUTATION_DELAY.max);
  const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS) || [];
  const now = new Date().toISOString();
  const updated: Task[] = [];

  for (const task of tasks) {
    if (ids.includes(task.id)) {
      if (data.amount !== undefined) task.amount = data.amount;
      if (data.campaign_id !== undefined) task.campaign_id = data.campaign_id;
      task.updatedAt = now;
      updated.push(task);
    }
  }

  setItem(STORAGE_KEYS.TASKS, tasks);
  return updated;
}

// ----------- Delete -----------

export async function deleteTask(id: string): Promise<void> {
  await delay(MUTATION_DELAY.min, MUTATION_DELAY.max);
  const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS) || [];
  setItem(
    STORAGE_KEYS.TASKS,
    tasks.filter((t) => t.id !== id)
  );
}
