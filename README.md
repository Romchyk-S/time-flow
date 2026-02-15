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
- **List** time entries for the selected day, **grouped by project** (count + total time per project)
- **Edit** task name, project, duration (H:MM), and status (not started, in progress, in review, completed)
- **Running indicator** (green dot) when that task’s timer is active
- **Create** and **delete** tasks (with confirmation)

### Projects
- **CRUD** for projects
- **Pastel color picker** with distinct colors per project (used across the app for tasks)

### Reports
- **Period**: Today, This week, Last week, Last month, or custom date range (calendar)
- **Summary**: Total time, project count, task count, average daily time
- **Tables**: Time by project, detailed task list, daily summary
- **CSV export**: Full report (all sections) or individual sections (summary, by project, detailed tasks, daily)

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
   Create a `.env` in the project root (see `.env.example` if present). The app expects Supabase URL and anon key to be set (e.g. in `src/integrations/supabase/client.ts` or via `import.meta.env` if you switch to Vite env).
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   If the client is still hardcoded, update `src/integrations/supabase/client.ts` with your Supabase URL and anon key.

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open the URL shown in the terminal (e.g. [http://localhost:5173](http://localhost:5173)).

5. **Build for production**
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
| duration   | integer   | Seconds            |
| notes      | text      | Optional            |
| created_at | timestamptz | Default now()   |
| updated_at | timestamptz | Updated by trigger |

There are indexes on `tasks(project_id)`, `tasks(usage_count, last_used)`, `time_entries(task_id)`, and `time_entries(start_time)`. A trigger updates `tasks.usage_count` and `tasks.last_used` when a time entry is inserted.

## Scripts

| Command           | Description                |
|-------------------|----------------------------|
| `npm run dev`     | Start Vite dev server      |
| `npm run build`   | TypeScript check + Vite build |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Serve production build     |
| `npm run lint`    | Run ESLint                 |

## Deployment (e.g. Vercel)

1. Push the repo to GitHub (or GitLab/Bitbucket).
2. Import the project on [Vercel](https://vercel.com); use the Vite preset.
3. Add environment variables (Supabase URL and anon key if you use Vite env).
4. Deploy. The build command is `npm run build`; output directory is `dist`.

## Repository

- **Repository**: [time-flow](https://github.com/your-username/time-flow) (update the URL to your actual repo)
- **License**: MIT (see [LICENSE](LICENSE) if present)

## Acknowledgments

- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [TanStack Query](https://tanstack.com/query/latest)
