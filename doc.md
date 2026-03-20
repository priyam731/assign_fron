Frontend Engineer Evaluation Assignment
Phase 1
pending
|
6h 20m 16s
Platform Overview
We are building an internal freelancing platform for micro tasks where people can complete small tasks to earn money. Unlike other platforms, where people can hire other people, we are just limited to one admin who can post the tasks, and the rest of the people are just the workers who complete those tasks. There are various types of tasks offered by our platform, like Data entry, social media posting, and so on.

How it works:

At a high-level platform have two sides admin side and the user side. On the admin side, A admin can upload a task with a title, details, amount, and reward in dollars (Task functionality is explained below in-depth).

On the user side, the user can see all the tasks and complete them by submitting the evidence (Note: input required for the submission depends on the task type). Once the user submits the task, it goes to the admin submissions screen, where the admin can see all the details submitted by the user. After a review admin can either approve or reject the task.

Task
A task is a unit of work that rewards workers after verified completion, under configurable rules. Each task has a type, metadata, and a set of behavioral rules that define how workers can discover, reserve, and submit it.

Note: This is what the task is from our existing system. We keep the task functionality very simple for the scope of this assignment, so don’t worry about things like configuration rules and reservations.

Task Type:

For the scope of this assignment, there are only three types of tasks being offered by this platform.

Social Media Posting
Email sending
Social Media Liking
Here are the input forms for each task type user must fill out to submit the specific task type:

Task Type	fields	explaination
Social Media Posting	Post URL* , Evidence screenshot*	
Email Sending	Email content*, Evidence screenshot*	Email content is the full email sent by worker to X recipient.
Social Media Liking	Post URL*, Evidence screenshot*	
Examples:

Task type: Email Sending - Admin: "Send a promotional email to at least 5 recipients in your network introducing our new project management tool. Include the key features and a call-to-action link."

Task type: Social Media Posting - Admin: "Create a post on your Twitter/X or LinkedIn account promoting our upcoming webinar on March 20th. Use the hashtag #TechWebinar2026 and tag our official account."

Task type: Social Media Liking - Admin: "Like our latest Instagram post announcing the product launch. Make sure you are logged into your personal account, not a bot account."

Platform core components
There are the core components of the platform, you will be mostly working on these in both phases of the assignment.

Task Composer:

Task composer is much more complicated, but for the scope of this assignment, start with the simple task composer. Here are the fields required to compose a task.

Field	Type	Description	Default/Optional
task_type	enum	Type of the task	-
title	Text	Title of the task	-
description	Text	Short description of the task	yes
details	Markdown/JSON	Full details of the task	-
amount	number	Number of submissions required	-
reward	float	Reward in AUD	-
allow_multiple_submissions	boolean	Determines if a worker can submit the task multiple times	false (optional)
campaign_id	text	ID of the campaign this task belongs to (campaigns group related tasks together)	-
Tasks Feed:

Once an admin creates a task, it goes to the user’s tasks feed. The feed displays all available tasks, showing necessary details. The user can click into a task to view its full details and submit it by filling out the task-type-specific form.

Tasks Management:

On the task management screen, the admin can see all tasks that have been created. For each task, the admin can view the tasks including its total submissions received vs. the required amount, and its current status. The admin can also delete tasks from this screen.

Submissions:

On the submissions screen, the admin can see all submissions made by workers across all tasks. Each submission shows the worker’s submitted fields (e.g. Post URL, email content, screenshot), the task it belongs to, and the date submitted. The admin can approve or reject each submission individually. Approved submissions mark the worker as rewarded; rejected submissions can optionally include a reason.

Implementation Guidelines
This section outlines guidelines on implementation, some are the strict guidelines you must follow, but some are just engineer's personal preferences of doing things.

Note: There are some product design decisions are intentionally didn’t pin pointed to evaluate the engineer's common sense and thinking process from user’s perspective.

Recommended Tech Stack
You must use following stack to do this assignment.

NextJS, React, Typescript, Tailwind CSS, and Shadcn UI.

You are always welcome to choose libraries of your choice. To match our company practices, we encourage using the following libraries:

tanstack table - for data tables
tanstack query - for data fetching
Zod - for validation
react-hook-form - for handling forms
nuqs - for URL state management
lexical - for markdown editor
Mock Server
Since this assignment is focused on the frontend engineering side, you are encouraged to use mock data instead of a real server. But, still, you have to mimic the server experience by adding delays and abstracting data fetching and mutation logic. This is important to demonstrate your ability to work with real data and handling async operation and loading states.

Recommendation:

Use localstorage or indexDB for storage
Add random 1 to 3 seconds delay for data fetching, and 3 to 5 seconds for the mutations.
AI Policy
If you are using AI Assistant, consider including all the context files and prompt you crafted throughout the developed in final submission. This helps use evaluate your ability to use AI assistant to ship faster.

for example: if you are using Claude code then include CLAUDE.md and .claude folder in your final submission.

Tips to stand out
Here are a few tips you can follow to really stand out from the rest of the crowd:

Think from the user’s perspective while implementing a feature to demonstrate your good UX sense. Thinking example: for the task details, what would be the appropriate component to show the details… Modal or Sidebar? How can we decrease the drag to allow the user to see & switch between the details faster? Aha! Discord is doing similar stuff; let me see how they are solving this problem.

Use common sense approach to show appropriate details, for example: Referring to the task management screen… As an admin, i need to see the details on the task, how many submissions have been made so far, and how many amounts/slots are left behind, and I also want to see all the submissions of a task.

Reduce drag by showing details on a single screen as much as possible, for example: On the submission screen admin might want to see the task or user details associated with the submission.

Technical tips:

Always use a clean Git history, so your assignment can be evaluated easily. For example, a senior developer might want to see how you customized the shadcn components. So, instead of committing all at once, commit after every feature. for example: commit -m “feat: add shadcn UI” …
Use the best React practices for folder-structure, patterns, components and overall architecture. For example: use feature-based folder structure, use design patterns like composition, custom hooks, and custom providers.
Don’t try to re-invent the wheel; we highly encourage using already existing libraries to ship faster. For example, instead of caching data manually on the user side, use libraries like tanstack query to do heavy lifting for you.
Don’t be dogmatic when it comes to solving every problem with one consistently used method being used through out the project. You can always break the rules to come up with simpler and more Performant solutions as long as it stays in isolation.
Use proper empty, loading, and error states everywhere where needed.
Be consistent through out the project both for technical conventions and design language.
Phase 1 requirements
Before starting to work on core features, think from both sides perspective and lay out the basic mock authentication, app shell and mock users profiles. Since this assignment is focused on the frontend engineering side, you are encouraged to use mock data instead of a real server (See guidelines for mock data).

While this assignment does not ask you to build a beautiful animated UI, we discourage to use libraries like Shadcn as it is, you must customize them to match the unique design system.

For this assignment, consider using the following inspirations for the design system:

https://preline.co/pro/crm/index.html
Note: You don’t need to copy the inspiration fully. We highly recommended to come up with a unique design to solve a specific problem. Eventually purpose is just to demonstrate your ability to customize the existing components.

Task Composer
Implement a task composer with the following requirements:

Show all the fields in the form listed above
Think from the admin’s perspective, how to make a better UX and fill the fields quicker
A composer should be able to support both create and edit modes.
Hint: Think about it, after form submission, is it worth redirecting the admin to the task management page or resetting the form?

Tasks feed
Implement a task feed for the user with the following requirements:

Allow the user to scroll through all the tasks
Allow the user to order the tasks by the ‘latest’ and ‘highest reward.’
Show the task details when they click on it
Since we are getting tasks done at scale, the screen should be able to render 1000s of tasks
Allow the user to submit the task from the same screen
Good to Know:

Don’t show campaign ID on the user side
Hint: Think about it, whether it is worth showing all the types of tasks on a single screen or should we separate them.

Target Audience: Workers should be able to access the tasks from both desktop and mobile. In fact, 70% people will be accessing from mobile devices.

Tasks Management:
Implement a task management screen for the admin with the following requirements:

Allow the admin to see all the tasks
Add actions: view, update, and delete.
Admin should be able to edit certain fields in bulk (by selected multiple tasks), like amount and campaign ID.
Admin should be able to access almost all the necessary details without clicking on View details.
Admin should be able to filter & sort the tasks.
Hints:

Think from the Admin’s perspective

Show all submissions made on the task and slots/amount left.
Is it worth showing the tasks in the datatable?
Submission screen
Implement a minimal submissions screen for the admin side with the following requirements:

Allow the admin to see all the submissions made by the workers.
The screen should be able to show 1000s of submissions.
Allow the admin to see the submission and approve/reject it.
Allow the admin to filter, sort, and group (by task) submissions.
Hints:

Think from the admin’s perspective:

Is it worth showing approved/rejected/pending submissions in a single feed?
Is it worth showing task details with submission details to help the admin with ADHD?
How should I approach grouping submissions by task?
Submission
pending
Submit your work for this phase.
https://github.com/you/repo
https://your-app.vercel.app
Phase 2 Requirements (Final Phase)
This final phase introduces more complex features and evaluates the candidate's ability to solve complex UI/UX and thinking problems without many hints.

1. Introducing Task Phases
Task phases are a new behavior on the task that allows you to break a single task into multiple sequential stages. Each phase must be completed before the next one begins — a phase is considered complete once it has collected enough submissions to fill its slots.

Note: This is an add-on to the existing task functionality. It should not replace the standard behavior of a task. If you are not familiar with the task, consider re-reading the task's core above.

A content campaign task might be structured as:

Phase 1 — 20 slots: Workers post about the product launch
Phase 2 — 50 slots: Workers reply to comments on those posts
Phase 3 — 10 slots: Workers compile engagement reports
Each phase can carry different instructions, a different reward, and a different submission form — all within the same task.

Configurable parameters per phase:

Parameter	Description
phase_name	Display name for the phase (e.g. "Phase 1 — Launch")
phase_index	Append it with the phase_name (e.g Phase X ...)
slots	Number of completions required to complete this phase
instructions	Phase-specific instructions shown to the worker
reward	Reward amount for this phase (can differ per phase)
Implementation Instructions:

Add task phases to the task composer.
Show only the active phase to the worker. Workers should also be able to see past phases only if they have made a submission in that phase.
Show all phases to the admin in the task management data tables (think creatively about the UI).
Show all phases when the admin is editing the task.
Show submissions both for the task and per phase separately (think creatively about the UI).
Hints:

How should phase progress be visualized to the admin?
Target Audience: Workers should be able to access the tasks from both desktop and mobile. In fact, 70% of users will be accessing from mobile devices.

2. Introducing Drip Feed Tasks
Drip feed is a slot release mechanism on a task. Instead of exposing all slots at once, the system releases slots in controlled batches. This is useful for pacing the rate of completions — for example, publishing 10 Reddit posts per day rather than 100 all at once.

Note: Drip feed is configured at the task level and is inherited by the current active phase. It does not need to be configured per phase separately.

Configurable parameters:

Parameter	Description	Default
drip_amount	How many slots to release per interval	—
drip_interval	How often to release (e.g. every 1h, every 24h)	—
Example: Release 5 slots every 6 hours until total_slots is reached.

Drip feed states:

State	Meaning
Active	Slots are available, drip is releasing on schedule
Waiting	Next batch releases in X time (e.g. "Waiting — next release in 4h")
Completed	All slots have been released
Implementation Instructions:

Add drip feed option to the task composer.
Show the current drip feed state to the admin.
Make sure to respect the drip feed state while showing tasks to workers.
Allow the admin to enable/disable drip feed while editing the task.
Hints:

How should the admin visualize drip progress? Is a timeline or progress bar more useful than raw numbers?
3. Miscellaneous
Add support for bulk upload in the task composer. Think creatively about how to speed up the process for the admin.
Add earnings and update them optimistically whenever a worker completes a task. Show this on the worker's dashboard.
Add a screen to show the worker's past submissions.
