// ============================================
// Seed data — generates initial mock data
// ============================================

import { v4 as uuid } from "uuid";
import {
  User,
  UserRole,
  Task,
  TaskType,
  Submission,
  SubmissionStatus,
} from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage";

// ----------- Users -----------

const SEED_USERS: User[] = [
  {
    id: "admin-001",
    name: "Admin User",
    email: "admin@microtask.io",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=admin",
    role: UserRole.ADMIN,
    balance: 0,
    pendingEarnings: 0,
    createdAt: new Date("2025-01-01").toISOString(),
  },
  {
    id: "worker-001",
    name: "Alice Johnson",
    email: "alice@example.com",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=alice",
    role: UserRole.WORKER,
    balance: 45.5,
    pendingEarnings: 12.0,
    createdAt: new Date("2025-02-15").toISOString(),
  },
  {
    id: "worker-002",
    name: "Bob Williams",
    email: "bob@example.com",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=bob",
    role: UserRole.WORKER,
    balance: 78.2,
    pendingEarnings: 5.0,
    createdAt: new Date("2025-03-10").toISOString(),
  },
  {
    id: "worker-003",
    name: "Carol Davis",
    email: "carol@example.com",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=carol",
    role: UserRole.WORKER,
    balance: 22.0,
    pendingEarnings: 8.5,
    createdAt: new Date("2025-04-01").toISOString(),
  },
];

// ----------- Tasks -----------

const CAMPAIGN_IDS = ["campaign-launch-2026", "campaign-engagement-q1", "campaign-outreach", "campaign-brand-awareness"];

function generateTasks(): Task[] {
  const tasks: Task[] = [];
  const taskTemplates = [
    {
      type: TaskType.SOCIAL_MEDIA_POSTING,
      titles: [
        "Post about our new product launch on Twitter/X",
        "Share our webinar announcement on LinkedIn",
        "Create a tweet promoting our blog post",
        "Post about our partnership on social media",
        "Share our new feature release on Twitter",
        "Promote our upcoming event on LinkedIn",
        "Tweet about our latest case study",
        "Share company news on your social profile",
      ],
      details: "Create a post on your social media account promoting our content. Include relevant hashtags and tag our official account. Make sure the post is visible to public.",
    },
    {
      type: TaskType.EMAIL_SENDING,
      titles: [
        "Send promotional email about our tool",
        "Email your network about our webinar",
        "Send introduction email for our product",
        "Email contacts about our new feature",
        "Send newsletter-style email to 5 recipients",
        "Forward our announcement to your network",
      ],
      details: "Send a promotional email to at least 5 recipients in your network introducing our product. Include the key features and a call-to-action link. Be professional and personalize where possible.",
    },
    {
      type: TaskType.SOCIAL_MEDIA_LIKING,
      titles: [
        "Like our latest Instagram post",
        "Like our product launch announcement",
        "Like and engage with our latest tweet",
        "Like our LinkedIn company update",
        "Like our Facebook product showcase post",
        "Like our new feature announcement post",
      ],
      details: "Like our latest post on the specified social media platform. Make sure you are logged into your personal account, not a bot account. The post should appear in your liked posts history.",
    },
  ];

  let totalTasks = 0;
  for (const template of taskTemplates) {
    for (const title of template.titles) {
      const amount = Math.floor(Math.random() * 50) + 5;
      const filled = Math.floor(Math.random() * amount);
      const daysAgo = Math.floor(Math.random() * 60);
      const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      tasks.push({
        id: uuid(),
        task_type: template.type,
        title,
        description: `Complete this ${template.type.replace(/_/g, " ")} task to earn rewards.`,
        details: template.details,
        amount,
        filledAmount: filled,
        reward: parseFloat((Math.random() * 4.5 + 0.5).toFixed(2)),
        allow_multiple_submissions: Math.random() > 0.7,
        campaign_id: CAMPAIGN_IDS[Math.floor(Math.random() * CAMPAIGN_IDS.length)],
        status: filled >= amount ? "completed" : "active",
        createdAt: createdDate.toISOString(),
        updatedAt: createdDate.toISOString(),
      });
      totalTasks++;
    }
  }

  // generate additional tasks to have ~40 total
  while (totalTasks < 40) {
    const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
    const title = template.titles[Math.floor(Math.random() * template.titles.length)];
    const amount = Math.floor(Math.random() * 100) + 10;
    const filled = Math.floor(Math.random() * Math.floor(amount * 0.7));
    const daysAgo = Math.floor(Math.random() * 90);
    const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    tasks.push({
      id: uuid(),
      task_type: template.type,
      title: `${title} #${totalTasks}`,
      description: `Complete this ${template.type.replace(/_/g, " ")} task to earn rewards.`,
      details: template.details,
      amount,
      filledAmount: filled,
      reward: parseFloat((Math.random() * 9.5 + 0.5).toFixed(2)),
      allow_multiple_submissions: Math.random() > 0.6,
      campaign_id: CAMPAIGN_IDS[Math.floor(Math.random() * CAMPAIGN_IDS.length)],
      status: filled >= amount ? "completed" : "active",
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString(),
    });
    totalTasks++;
  }

  return tasks;
}

// ----------- Submissions -----------

function generateSubmissions(tasks: Task[], workers: User[]): Submission[] {
  const submissions: Submission[] = [];
  const statuses = [SubmissionStatus.PENDING, SubmissionStatus.APPROVED, SubmissionStatus.REJECTED];

  for (const task of tasks.slice(0, 25)) {
    const numSubmissions = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < numSubmissions; i++) {
      const worker = workers[Math.floor(Math.random() * workers.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      const sub: Submission = {
        id: uuid(),
        taskId: task.id,
        taskTitle: task.title,
        taskType: task.task_type,
        workerId: worker.id,
        workerName: worker.name,
        workerAvatar: worker.avatar,
        status,
        createdAt: createdDate.toISOString(),
        updatedAt: createdDate.toISOString(),
      };

      // Add type-specific fields
      if (task.task_type === TaskType.SOCIAL_MEDIA_POSTING || task.task_type === TaskType.SOCIAL_MEDIA_LIKING) {
        sub.postUrl = `https://twitter.com/user/status/${Math.floor(Math.random() * 1000000000)}`;
      }
      if (task.task_type === TaskType.EMAIL_SENDING) {
        sub.emailContent = `Hi there,\n\nI'm excited to share with you our latest product that can help streamline your workflow...\n\nBest regards,\n${worker.name}`;
      }
      if (status === SubmissionStatus.REJECTED) {
        sub.rejectionReason = "Evidence unclear. Please resubmit with a clearer screenshot.";
      }

      // Screenshot placeholder — will be a colored placeholder in the UI
      sub.screenshotUrl = "";

      submissions.push(sub);
    }
  }

  return submissions;
}

// ----------- Seed Function -----------

export function seedData(): void {
  const alreadySeeded = getItem<boolean>(STORAGE_KEYS.SEEDED);
  if (alreadySeeded) return;

  const workers = SEED_USERS.filter((u) => u.role === UserRole.WORKER);
  const tasks = generateTasks();
  const submissions = generateSubmissions(tasks, workers);

  setItem(STORAGE_KEYS.USERS, SEED_USERS);
  setItem(STORAGE_KEYS.TASKS, tasks);
  setItem(STORAGE_KEYS.SUBMISSIONS, submissions);
  setItem(STORAGE_KEYS.SEEDED, true);
}

export function resetSeedData(): void {
  localStorage.removeItem(STORAGE_KEYS.SEEDED);
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
  localStorage.removeItem(STORAGE_KEYS.USERS);
  seedData();
}
