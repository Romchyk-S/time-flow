# Time Flow

A modern time tracking web app built with **Vite**, **React**, **TypeScript**, and **Supabase**. Track time by task and project, manage tasks with status and day-by-day navigation, and export reports to CSV. Deployable on Vercel or any static host.

## Features

### Time tracking
- **Start/Stop timer** with live elapsed time
- **Task name** field with autocomplete from previous tasks (per project, sorted by usage)
- **Project** chosen via dropdown
- **Floating timer** in the top-right on every page when a timer is running

### Tasks
- **Day navigation**: move one day at a time (no weekend skip) within a 2-week window (current week + next week)
- **Task cards** with project + status + total duration
- **Edit** task fields (name, description, status, project)
- **Task edit dialog** includes a list of time entries for that task, with an edit popup to adjust start/end times (duration recalculates)
- **Running indicator** (green border + “Running...”) when that task’s timer is active
- **Create** and **delete** tasks (with confirmation)

### Time entries
- Dedicated **Time Entries** page with a day picker and a **Group by project** toggle
- Edit entries via popup (start/end time) and delete entries (deletes the entry only)

### Projects
- **CRUD** for projects
- **Pastel color picker** with distinct colors per project (used across the app for tasks)

### Reports
- **Period**: Today, This week, Last week, Last month, or custom date range (calendar)
- **Summary**: Total time, project count, task count, average daily time
- **Tables**: Time by project, detailed task list, daily summary
- **XLSX export**: Full report as a multi-sheet workbook
- **CSV export**: Full report (combined) or individual sections (summary, by project, detailed tasks, daily)

### Settings
- **Theme**: Light, Dark, or System (follow OS)

## Tech stack

| Layer | Technology |
|-------|------------|
| **Build** | Vite 7 |
| **UI** | React 18, TypeScript |
| **Routing** | React Router DOM 7 |
| **Styling** | Tailwind CSS, Radix UI primitives, class-variance-authority |
| **State** | Zustand (timer), TanStack Query (server state) |
| **Data** | Supabase (PostgreSQL, client via `@supabase/supabase-js`) |
| **Theme** | next-themes |
| **Dates** | date-fns |
| **Icons** | Lucide React |
| **Forms / validation** | React Hook Form, Zod |
| **Exports** | SheetJS (`xlsx`) |

## Prerequisites

- Node.js 18+ and npm
- Supabase project (for database)

## Getting started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/time-flow.git
   cd time-flow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   The Supabase client is currently configured in `src/integrations/supabase/client.ts`.

   If you want to run against your own Supabase project, you should provide your Supabase URL and anon key.

   You can either:

   - Update `src/integrations/supabase/client.ts` directly, or
   - Switch it to Vite env vars (recommended for deployments).

   If you choose env vars, create a `.env` in the project root and set:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Apply Supabase migrations**
   SQL migrations live in `supabase/migrations/`. Apply them to your Supabase project (via Supabase SQL editor, or via Supabase CLI if you use it).

   After applying migrations, if you still see “table/function not found” errors in the app, reload the Supabase schema cache in the dashboard.

5. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open the URL shown in the terminal (e.g. [http://localhost:5173](http://localhost:5173)).

6. **Build for production**
   ```bash
   npm run build
   ```
   Output is in `dist/`. Preview with `npm run preview`.

## Project structure

```
time-flow/
├── src/
│   ├── App.tsx                 # Root app, routes, providers, FloatingTimer
│   ├── main.tsx                # Entry point, ThemeProvider
│   ├── index.css                # Tailwind + design tokens (light/dark)
│   │
│   ├── pages/                   # Route pages
│   │   ├── Dashboard.tsx        # Timer, project/task inputs, today & week stats
│   │   ├── Tasks.tsx            # Day picker, entries by day, grouped by project
│   │   ├── Projects.tsx        # Project list, create/edit/delete, color picker
│   │   ├── Reports.tsx         # Period selector, summary, tables, CSV export
│   │   ├── Settings.tsx        # Theme toggle (light/dark/system)
│   │   └── NotFound.tsx
│   │
│   ├── components/
│   │   ├── layout/             # App shell
│   │   │   ├── AppSidebar.tsx
│   │   │   └── AppHeader.tsx
│   │   ├── timer/              # Timer UI
│   │   │   ├── TimerDisplay.tsx
│   │   │   ├── TimerControls.tsx
│   │   │   ├── TaskInput.tsx    # Task name + autocomplete
│   │   │   ├── ProjectSelect.tsx
│   │   │   └── FloatingTimer.tsx
│   │   ├── entries/            # Time entries list
│   │   │   └── EntryGroupByProject.tsx
│   │   ├── projects/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   └── ColorPicker.tsx
│   │   ├── reports/
│   │   │   ├── DateRangeSelector.tsx
│   │   │   ├── ReportSummary.tsx
│   │   │   ├── ReportTable.tsx
│   │   │   └── ExportButton.tsx
│   │   ├── ui/                 # Radix-based primitives (button, card, dialog, etc.)
│   │   └── NavLink.tsx
│   │
│   ├── state/                  # Business logic & state
│   │   ├── store/
│   │   │   └── timerStore.ts    # Running timer (Zustand)
│   │   ├── hooks/
│   │   │   ├── useTimer.ts
│   │   │   ├── useAutocomplete.ts
│   │   │   ├── useTimeEntries.ts
│   │   │   ├── useProjects.ts
│   │   │   └── useReports.ts
│   │   ├── services/
│   │   │   ├── timerService.ts
│   │   │   └── exportService.ts  # CSV generation
│   │   └── utils/
│   │       ├── timeUtils.ts
│   │       ├── dateUtils.ts
│   │       └── colorUtils.ts
│   │
│   ├── api/                    # Supabase client layer
│   │   └── clients/
│   │       ├── projectsClient.ts
│   │       ├── tasksClient.ts
│   │       └── timeEntriesClient.ts
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   │
│   ├── types/
│   │   └── index.ts             # Project, Task, TimeEntry, report types
│   │
│   ├── lib/
│   │   └── utils.ts
│   └── hooks/                   # Generic UI hooks (e.g. useToast, useMobile)
│
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Database schema (Supabase)

The app uses three tables (no `user_id` in this version; RLS can be added later).

### `projects`
| Column       | Type      | Description        |
|-------------|-----------|--------------------|
| id          | uuid      | Primary key        |
| name        | text      | Project name       |
| color       | text      | Hex color (e.g. pastel) |
| created_at  | timestamptz | Default now()   |
| updated_at  | timestamptz | Updated by trigger |

### `tasks`
| Column       | Type      | Description        |
|-------------|-----------|--------------------|
| id          | uuid      | Primary key        |
| name        | text      | Task name          |
| description | text      | Optional            |
| project_id  | uuid      | FK → projects(id)  |
| status      | text      | not_started, in_progress, in_review, completed |
| is_active   | boolean   | Default true       |
| usage_count | integer   | For autocomplete   |
| last_used   | timestamptz | For autocomplete |
| created_at  | timestamptz | Default now()   |
| updated_at  | timestamptz | Updated by trigger |

Unique on `(name, project_id)`.

### `time_entries`
| Column     | Type      | Description        |
|------------|-----------|--------------------|
| id         | uuid      | Primary key        |
| task_id    | uuid      | FK → tasks(id)    |
| start_time | timestamptz | Required        |
| end_time   | timestamptz | Null while running |
| duration   | integer   | Minutes            |
| notes      | text      | Optional            |
| created_at | timestamptz | Default now()   |
| updated_at | timestamptz | Updated by trigger |

There are indexes on `tasks(project_id)`, `tasks(usage_count, last_used)`, `time_entries(task_id)`, and `time_entries(start_time)`. A trigger updates `tasks.usage_count` and `tasks.last_used` when a time entry is inserted.

### `task_names`
The app uses `task_names` for task-name autocomplete. It is kept in sync with `tasks` via a database trigger, and can be backfilled from existing tasks.

## Scripts

| Command           | Description                |
|-------------------|----------------------------|
| `npm run dev`     | Start Vite dev server      |
| `npm run build`   | TypeScript check + Vite build |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Serve production build     |
| `npm run lint`    | Run ESLint                 |
| `npm run backfill:task-names` | Backfill `task_names` from existing `tasks` |

### Backfill `task_names`
This is only needed if you already have tasks in your database and want autocomplete suggestions immediately.

1. Set env vars (use your **Supabase service role key**; do not expose it in the client app):
   ```bash
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
2. Run:
   ```bash
   npm run backfill:task-names
   ```

Optional:

- To clear and fully rebuild `task_names`:
  ```bash
  npm run backfill:task-names -- --truncate
  ```

## Deployment (e.g. Vercel)

1. Push the repo to GitHub (or GitLab/Bitbucket).
2. Import the project on [Vercel](https://vercel.com); use the Vite preset.
3. Add environment variables (Supabase URL and anon key if you use Vite env).
4. Deploy. The build command is `npm run build`; output directory is `dist`.

This repo includes `vercel.json` configured for SPA routing (so hard-refreshing a route like `/projects` works).

## Repository

- **Repository**: [time-flow](https://github.com/your-username/time-flow) (update the URL to your actual repo)
- **License**: MIT (see [LICENSE](LICENSE) if present)

## Acknowledgments

- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [TanStack Query](https://tanstack.com/query/latest)
