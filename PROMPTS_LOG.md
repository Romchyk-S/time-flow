# Prompt Log

This file logs all prompts sent to AI tools during development, along with their outcomes.

## Log Format

```
### [YYYY-MM-DD HH:MM:SS] [AI Tool]

**Prompt:**
[Exact prompt text]

**Changes/Outcome:**
[Brief summary of what was generated or changed]
```

## Log Entries

### [2025-02-13 15:43:00] [Windsurf]

**Prompt:**
Hello. I am creating a web app for time tracking projects and tasks people spend on their job.

We need to cleanly separate it into 4 main layers, each with its own folder, with separation within it by tasks and purposes into folders as well.
1) UI components, where we have all the visual components, also cleanly separated into folders. Here ensure we maintain component reuse, importing shared components on different pages, not recreating the same ones over and over.
2) State/logic where we keep the services/hooks and store logic, there we need to support validation of input parameters and other kinds of business logic for this task, data conversions and filtering, coordinating database operations and API calls through layer 3, managing the current state (e.g. what task is being done right now).
3) API client layer. Its task will be to transport data to layer 2 so it can be prepared and shown to the frontend and to layer 4 so it can be stored in database. There it has to support properly configuring HTTP requests, sending requests and receiving repsonses, handling HTTP errors and clearly informing about them so they can be shown to the frontend (where necessary) and stored as console logs and proper log files, as well as doing authentication using .env variables and retrying in case it is necessary.
4) Data Layer that saves and retrieves data to/from supabase, performs CRUD operation, stores all migrations we performed.

This app has to support the following functionality:
For time tracking:
1) Start/Stop button on the task showing elapsed time.
2) Field to enter the task name with clever autofill based on the previous tasks to spend less time typing.
3) Choosing project or client through dropdown menu
4) Currently running timer has to always be visible. If we go to another page, we need to still show it on top right of the screen.

For tasks management:
1) Listing all tasks for today (or any workday within a week using arrows to navigate)
2) Manually updating the task name, attaching it to a different project, editing the time spent on it (in format hours:minutes)
3) Creating and Deleting the tasks
4) Attaching status: not started, in progress (if timer on that task is now running we need a proper icon to display it too), in review, completed
5) Grouping tasks by project, calculating the count of tasks and summing up the time spent.

For project management:
1) Its own page where we can add or manage the projects, attaching a specific color to them which will be visible on the whole app for all tasks attached to the project (ensuring no two projects have the same or similar color, using pastel tones for nice look).

For reports:
1) Its own page where we can choose the reports period (from presets today/this week/last week/last month and custom calendar picker).
2) Exporting in CSV format the whole page or any section of it. For whole page we need to put each table on its separate sheet and show the summary metrics (Total time tracked for the chosen period, number of projects worked on, number of tasks, average daily time) as its own first sheet.
3) Information to show: Total time tracked for the chosen period, number of projects worked on, number of tasks, average daily time. There we also need tables: time breakdown by project (project name|total time|% of total|task count), detailed task table (date|project|task name}duration|time range|completed in this time range: true/false), daily summary (date|total hours|projects count|task count). This is an example of info to prepare on level 2.

Technologies required. Use the newest versions available:
1) Frontend: Node.js
2) Backend: Next.js
3) Database: supabase, I already have .env with SUPABASE_URL for Node.js. I will add the key later if we need it.
4) Styling: Taiwlind CSS with consistent styling between pages.

In the process I need to maintain README.md where the information about technologies and architecture solution employed needs to be tracked, as well as info about how to launch it on localhost through cloning the repository. Also maintain PROMPTS_LOG.md file where each prompt sent is stored with fields: 
1. Date/Time
2. Which AI tool (for now will always be Windsurf)
3. The exact prompt
4. What was generated/changed (1-2 sentence summary)

**Changes/Outcome:**
Initialized project structure with Next.js, TypeScript, Tailwind CSS, and Supabase. Created core components including Layout, Header, Sidebar, TaskList, TaskCard, and TimerBar. Set up state management with custom hooks and utility functions for date handling and formatting.

### [2025-02-13 16:05:36] [Windsurf]

**Prompt:**
When doing npm install, I got the following package warnings:

roman@WIN-M898SFO3CBH:~/time_tracker_web_app$ npm install
npm WARN deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm WARN deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm WARN deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
npm WARN deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
npm WARN deprecated @supabase/auth-helpers-shared@0.6.3: This package is now deprecated - please use the @supabase/ssr package instead.
npm WARN deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm WARN deprecated @supabase/auth-helpers-nextjs@0.8.7: This package is now deprecated - please use the @supabase/ssr package instead.
npm WARN deprecated glob@10.3.10: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm WARN deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
npm WARN deprecated next@14.1.0: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11 for more details.

added 406 packages, and audited 407 packages in 1m

153 packages are looking for funding
  run `npm fund` for details

4 vulnerabilities (3 high, 1 critical)

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

**Changes/Outcome:**
Updated package.json to address security vulnerabilities and deprecation warnings. Upgraded Next.js to 14.1.3, replaced deprecated @supabase/auth-helpers with @supabase/ssr, and updated other dependencies to their latest secure versions.

### [2025-02-13 16:30:00] [Windsurf]

**Prompt:**
Update the Supabase authentication to use the new @supabase/ssr package instead of the deprecated @supabase/auth-helpers-nextjs. The build is failing with module not found errors.

**Changes/Outcome:**
Updated the Supabase client implementation to use the new @supabase/ssr package. Modified both the main client.ts file and providers.tsx to use the new createBrowserClient function. The changes include proper TypeScript types and authentication configuration for better server-side rendering support.
