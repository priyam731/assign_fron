// ============================================
// Mock API — Submission CRUD operations
// ============================================

import { v4 as uuid } from "uuid";
import {
  Submission,
  SubmissionStatus,
  SubmissionFormData,
  Task,
  User,
} from "@/types";
import { STORAGE_KEYS, FETCH_DELAY, MUTATION_DELAY } from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage";
import { delay } from "./delay";

// ----------- Read -----------

export async function fetchSubmissions(): Promise<Submission[]> {
  await delay(FETCH_DELAY.min, FETCH_DELAY.max);
  return getItem<Submission[]>(STORAGE_KEYS.SUBMISSIONS) || [];
}

export async function fetchSubmissionsByTask(taskId: string): Promise<Submission[]> {
  await delay(FETCH_DELAY.min, FETCH_DELAY.max);
  const subs = getItem<Submission[]>(STORAGE_KEYS.SUBMISSIONS) || [];
  return subs.filter((s) => s.taskId === taskId);
}

export async function fetchSubmissionsByWorker(workerId: string): Promise<Submission[]> {
  await delay(FETCH_DELAY.min, FETCH_DELAY.max);
  const subs = getItem<Submission[]>(STORAGE_KEYS.SUBMISSIONS) || [];
  return subs.filter((s) => s.workerId === workerId);
}

// ----------- Create -----------

export async function createSubmission(
  data: SubmissionFormData,
  currentUser: User
): Promise<Submission> {
  await delay(MUTATION_DELAY.min, MUTATION_DELAY.max);
  const submissions = getItem<Submission[]>(STORAGE_KEYS.SUBMISSIONS) || [];
  const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS) || [];
  const task = tasks.find((t) => t.id === data.taskId);

  if (!task) throw new Error("Task not found");

  // Convert screenshot to base64 if provided
  let screenshotUrl = "";
  if (data.screenshot) {
    screenshotUrl = await fileToBase64(data.screenshot);
  }

  const now = new Date().toISOString();
  const newSubmission: Submission = {
    id: uuid(),
    taskId: data.taskId,
    taskTitle: task.title,
    taskType: task.task_type,
    workerId: currentUser.id,
    workerName: currentUser.name,
    workerAvatar: currentUser.avatar,
    status: SubmissionStatus.PENDING,
    postUrl: data.postUrl,
    emailContent: data.emailContent,
    screenshotUrl,
    phaseId: data.phaseId,
    createdAt: now,
    updatedAt: now,
  };

  submissions.unshift(newSubmission);
  setItem(STORAGE_KEYS.SUBMISSIONS, submissions);

  // Update task filled amount
  task.filledAmount = (task.filledAmount || 0) + 1;
  if (task.filledAmount >= task.amount) {
    task.status = "completed";
  }
  task.updatedAt = now;
  setItem(STORAGE_KEYS.TASKS, tasks);

  return newSubmission;
}

// ----------- Approve / Reject -----------

export async function approveSubmission(id: string): Promise<Submission> {
  await delay(MUTATION_DELAY.min, MUTATION_DELAY.max);
  const submissions = getItem<Submission[]>(STORAGE_KEYS.SUBMISSIONS) || [];
  const index = submissions.findIndex((s) => s.id === id);
  if (index === -1) throw new Error("Submission not found");

  submissions[index].status = SubmissionStatus.APPROVED;
  submissions[index].updatedAt = new Date().toISOString();

  setItem(STORAGE_KEYS.SUBMISSIONS, submissions);

  // Update worker balance
  const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS) || [];
  const task = tasks.find((t) => t.id === submissions[index].taskId);
  if (task) {
    const users = getItem<User[]>(STORAGE_KEYS.USERS) || [];
    const workerIndex = users.findIndex((u) => u.id === submissions[index].workerId);
    if (workerIndex !== -1) {
      users[workerIndex].balance += task.reward;
      users[workerIndex].pendingEarnings = Math.max(
        0,
        users[workerIndex].pendingEarnings - task.reward
      );
      setItem(STORAGE_KEYS.USERS, users);
    }
  }

  return submissions[index];
}

export async function rejectSubmission(
  id: string,
  reason?: string
): Promise<Submission> {
  await delay(MUTATION_DELAY.min, MUTATION_DELAY.max);
  const submissions = getItem<Submission[]>(STORAGE_KEYS.SUBMISSIONS) || [];
  const index = submissions.findIndex((s) => s.id === id);
  if (index === -1) throw new Error("Submission not found");

  submissions[index].status = SubmissionStatus.REJECTED;
  submissions[index].rejectionReason = reason;
  submissions[index].updatedAt = new Date().toISOString();

  setItem(STORAGE_KEYS.SUBMISSIONS, submissions);

  // Remove pending earnings
  const tasks = getItem<Task[]>(STORAGE_KEYS.TASKS) || [];
  const task = tasks.find((t) => t.id === submissions[index].taskId);
  if (task) {
    const users = getItem<User[]>(STORAGE_KEYS.USERS) || [];
    const workerIndex = users.findIndex((u) => u.id === submissions[index].workerId);
    if (workerIndex !== -1) {
      users[workerIndex].pendingEarnings = Math.max(
        0,
        users[workerIndex].pendingEarnings - task.reward
      );
      setItem(STORAGE_KEYS.USERS, users);
    }
  }

  return submissions[index];
}

// ----------- Helpers -----------

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
