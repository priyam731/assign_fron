# MicroTask — Freelancing Micro-Task Platform

A production-quality internal freelancing platform where **admins create tasks** and **workers complete them** for rewards.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + Shadcn UI (custom design system) |
| Tables | @tanstack/react-table |
| Data Fetching | @tanstack/react-query |
| Forms | react-hook-form + Zod |
| Rich Text | **Lexical** (with markdown shortcuts) |
| URL State | **nuqs** |
| Storage | localStorage (async delay wrappers) |

## Features

### Admin
- **Task Management** — Tanstack table with sort, search, type filter tabs, inline progress, bulk edit, detail side panel
- **Task Composer** — Rich Lexical editor for task details, task phases (field array), drip feed config, create/edit modes
- **Bulk CSV Upload** — Drag-and-drop CSV import with parse validation, preview table, and template download
- **Submissions Screen** — Stat cards, group-by-task, inline approve/reject with rejection reason, screenshot preview
- **Phases & Drip Feed** — Phase progression panel, drip feed pause/resume/trigger-now controls

### Worker
- **Task Feed** — URL-persisted filters (nuqs), type pills + counts, sort by latest/reward, drip-aware (greyed-out waiting tasks), active phase shown inline
- **Task Submission** — Type-specific form (URL / email / screenshot), success state with earnings preview
- **My Submissions** — Status tabs, sort toggle, rejection reasons, reward per submission
- **Earnings Dashboard** — Gradient balance card, this-month earnings, recent activity feed

## Demo Accounts

No password required. Click any profile on the login page.

| Role | Account |
|---|---|
| Admin | Admin user |
| Workers | 3 pre-seeded worker accounts shown on login |

Use **Reset Demo Data** on the login page to clear and re-seed all localStorage data.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
src/
├── app/
│   ├── (auth)/           # Login
│   ├── (admin)/          # Admin layout + tasks / composer / submissions / phases
│   └── (worker)/         # Worker layout + feed / submissions / dashboard
├── components/shared/    # App-wide: admin sidebar, worker navbar, badges, rich-text editor
├── features/
│   ├── auth/             # AuthContext, role-based route guard
│   ├── tasks/            # Worker feed, submit sheet, management table, phase2 controls
│   ├── submissions/      # Admin submissions screen, hooks
│   └── composer/         # Composer form, bulk upload dialog
├── hooks/                # use-url-state (nuqs hooks)
├── lib/
│   ├── mock-api/         # localStorage CRUD with simulated delays
│   ├── storage/          # getItem/setItem wrappers
│   └── constants.ts
└── types/                # Shared TypeScript interfaces
```

## Git History

```
8e913b9  Initial commit from Create Next App
df421b7  feat: initial commit (mock API, types, seed data)
bc0899c  initialization (Shadcn, design system, auth, layouts)
ce01130  feat: add admin submissions screen with inline review
a52093f  feat: add phase 2 controls for task phases and drip feed
419725b  feat: enhance login page with role sections and reset demo data
6e30858  feat: add lexical rich-text editor to task composer details field
```
