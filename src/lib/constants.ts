import { TaskType } from "@/types";

// Task type display labels
export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  [TaskType.SOCIAL_MEDIA_POSTING]: "Social Media Posting",
  [TaskType.EMAIL_SENDING]: "Email Sending",
  [TaskType.SOCIAL_MEDIA_LIKING]: "Social Media Liking",
};

// Task type colors for badges
export const TASK_TYPE_COLORS: Record<TaskType, { bg: string; text: string }> = {
  [TaskType.SOCIAL_MEDIA_POSTING]: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  [TaskType.EMAIL_SENDING]: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  [TaskType.SOCIAL_MEDIA_LIKING]: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
};

// Submission status badge colors
export const SUBMISSION_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300" },
  approved: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  rejected: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
};

// Mock delay ranges (in milliseconds)
export const FETCH_DELAY = { min: 1000, max: 3000 };
export const MUTATION_DELAY = { min: 3000, max: 5000 };

// LocalStorage keys
export const STORAGE_KEYS = {
  TASKS: "microtask_tasks",
  SUBMISSIONS: "microtask_submissions",
  USERS: "microtask_users",
  CURRENT_USER: "microtask_current_user",
  SEEDED: "microtask_seeded",
} as const;

// Drip interval presets (in hours)
export const DRIP_INTERVAL_OPTIONS = [
  { label: "Every 1 hour", value: 1 },
  { label: "Every 6 hours", value: 6 },
  { label: "Every 12 hours", value: 12 },
  { label: "Every 24 hours", value: 24 },
  { label: "Every 48 hours", value: 48 },
];
