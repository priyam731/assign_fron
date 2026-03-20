// ============================================
// Core Types for the Freelancing Micro-Task Platform
// ============================================

// --- Enums ---

export enum TaskType {
  SOCIAL_MEDIA_POSTING = "social_media_posting",
  EMAIL_SENDING = "email_sending",
  SOCIAL_MEDIA_LIKING = "social_media_liking",
}

export enum SubmissionStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum UserRole {
  ADMIN = "admin",
  WORKER = "worker",
}

export enum DripFeedState {
  ACTIVE = "active",
  WAITING = "waiting",
  COMPLETED = "completed",
}

// --- User ---

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  balance: number;
  pendingEarnings: number;
  createdAt: string;
}

// --- Task Phase ---

export interface TaskPhase {
  id: string;
  phase_name: string;
  phase_index: number;
  slots: number;
  filledSlots: number;
  instructions: string;
  reward: number;
}

// --- Drip Feed Config ---

export interface DripFeedConfig {
  enabled: boolean;
  drip_amount: number;
  drip_interval: number; // in hours
  releasedSlots: number;
  lastDripAt: string;
  state: DripFeedState;
}

// --- Task ---

export interface Task {
  id: string;
  task_type: TaskType;
  title: string;
  description?: string;
  details: string;
  amount: number; // total submissions required
  filledAmount: number; // current approved submissions
  reward: number; // in AUD
  allow_multiple_submissions: boolean;
  campaign_id: string;
  status: "active" | "completed" | "paused";
  createdAt: string;
  updatedAt: string;

  // Phase 2 features
  phases?: TaskPhase[];
  activePhaseIndex?: number;
  dripFeed?: DripFeedConfig;
}

// --- Submission ---

export interface Submission {
  id: string;
  taskId: string;
  taskTitle: string;
  taskType: TaskType;
  workerId: string;
  workerName: string;
  workerAvatar: string;
  status: SubmissionStatus;
  postUrl?: string;
  emailContent?: string;
  screenshotUrl?: string; // base64 data URL
  rejectionReason?: string;
  phaseId?: string;
  reward: number; // reward amount from the task at time of submission
  createdAt: string;
  updatedAt: string;
}

// --- API Response Wrappers ---

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// --- Form types ---

export interface TaskFormData {
  task_type: TaskType;
  title: string;
  description?: string;
  details: string;
  amount: number;
  reward: number;
  allow_multiple_submissions: boolean;
  campaign_id: string;
  phases?: Omit<TaskPhase, "id" | "filledSlots">[];
  dripFeed?: {
    enabled: boolean;
    drip_amount: number;
    drip_interval: number;
  };
}

export interface SubmissionFormData {
  taskId: string;
  postUrl?: string;
  emailContent?: string;
  screenshot?: File | null;
  phaseId?: string;
}
