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

### [2025-02-15 12:30:36] [Cursor]

**Prompt:**
Add the following functionality:

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

This is the schema of tables in supabase (already created) and how I want them to be used:
Updated Database Schema:

1. projects table (unchanged)

sql

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

2. tasks table (NEW - proper task entities)

sql

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  last_used timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Ensure unique task names per project
  UNIQUE(name, project_id)
);

Columns explained:

name - Task name (e.g., "API Integration")

description - Optional task details

project_id - Which project this task belongs to

is_active - Can archive old tasks

usage_count - How many times tracked (for autocomplete sorting)

last_used - When last tracked (for autocomplete sorting)

UNIQUE(name, project_id) - Same task name allowed across different projects

3. time_entries table (UPDATED - now references tasks)

sql

CREATE TABLE time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  duration integer DEFAULT 0,
  notes text,  -- Optional: add notes to time entries
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

Key changes:

task_id instead of task_name (foreign key)

Removed project_id (now comes from task)

Added optional notes field

Complete SQL Script:

sql

-- 1. Projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Tasks table (proper entities)
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  last_used timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(name, project_id)
);

-- 3. Time entries table (now references tasks)
CREATE TABLE time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  duration integer DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_usage ON tasks(usage_count DESC, last_used DESC);
CREATE INDEX idx_tasks_active ON tasks(is_active) WHERE is_active = true;
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX idx_time_entries_end_time ON time_entries(end_time);

-- Auto-update updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-update task usage when time entry is created
CREATE OR REPLACE FUNCTION update_task_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tasks
  SET 
    usage_count = usage_count + 1,
    last_used = now()
  WHERE id = NEW.task_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_task_usage_on_entry
  AFTER INSERT ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_task_usage();
```

---

## **Relationships Diagram:**
```
projects (1) ────→ (many) tasks
                      ↓
                    (1 task) ────→ (many) time_entries

Example:
Project: "Development"
  ├─ Task: "API Integration"
  │   ├─ Entry: Feb 13, 9:00-11:00 (2h)
  │   └─ Entry: Feb 14, 14:00-16:30 (2.5h)
  │
  └─ Task: "Bug Fixing"
      ├─ Entry: Feb 13, 13:00-15:00 (2h)
      └─ Entry: Feb 15, 10:00-12:00 (2h)

How UI Flow Works Now:

Starting Timer (with task creation):

User selects Project (dropdown)

User types Task name (input with autocomplete)

Autocomplete shows: existing tasks for that project (sorted by usage)

If task doesn't exist, create it automatically

User clicks Start

System:

Creates task if new (or reuses existing)

Creates time_entry linked to task

Updates task.usage_count and task.last_used

Autocomplete Logic:

typescript

// Layer 2: Logic
async function getTaskSuggestionsForProject(projectId: string, searchTerm: string) {
  // Fetch tasks for this project
  const tasks = await tasksClient.getByProject(projectId, {
    isActive: true,
    searchTerm: searchTerm,
    orderBy: ['usage_count DESC', 'last_used DESC'],
    limit: 10
  });
  
  return tasks.map(t => t.name);
}

Example Data:

projects:

idnamecolorp1Development#10B981p2Design#3B82F6

tasks:

idnameproject_idusage_countlast_usedt1API Integrationp152026-02-13t2Bug Fixingp132026-02-12t3Homepage Mockupp222026-02-13

time_entries:

idtask_idstart_timeend_timeduratione1t12026-02-13 09:002026-02-13 11:007200e2t12026-02-14 14:002026-02-14 16:309000e3t32026-02-13 10:002026-02-13 12:309000

Benefits for Reports:

With this structure, you can generate better reports:

sql

-- Total time per task (across all dates)
SELECT 
  tasks.name as task_name,
  projects.name as project_name,
  COUNT(time_entries.id) as entry_count,
  SUM(time_entries.duration) as total_seconds
FROM time_entries
JOIN tasks ON time_entries.task_id = tasks.id
JOIN projects ON tasks.project_id = projects.id
GROUP BY tasks.id, projects.id
ORDER BY total_seconds DESC;

Handling New Tasks in UI:

Option A: Auto-create tasks

typescript

// User types new task name
async function startTimer(taskName: string, projectId: string) {
  // Try to find existing task
  let task = await tasksClient.findByNameAndProject(taskName, projectId);
  
  // If doesn't exist, create it
  if (!task) {
    task = await tasksClient.create({
      name: taskName,
      projectId: projectId
    });
  }
  
  // Create time entry
  await timeEntriesClient.create({
    taskId: task.id,
    startTime: new Date().toISOString()
  });
}

Ensure the project follows this structure, using the code examples as a guide, not verbatim. It will be deployed on Vercel, so work towards that:
Technical Architecture Requirements

Structure (Mandatory Separation)

├── UI Components (presentation layer)
├── State/Logic (services/hooks/store)
├── API Client (client layer)
└── Data Layer (repository)

Detailed Architecture Breakdown
1. UI Components (Presentation Layer)
Purpose: Pure visual components, no business logic, receive data via props, emit events via callbacks.
Structure:
src/components/
├── timer/
│   ├── TimerDisplay.tsx          # Shows running timer
│   ├── TimerControls.tsx         # Start/Stop buttons
│   └── TaskInput.tsx             # Task name + autocomplete
├── entries/
│   ├── EntryList.tsx             # List of time entries
│   ├── EntryItem.tsx             # Single entry row
│   ├── EntryEditor.tsx           # Edit entry inline
│   └── EntryGroupByProject.tsx   # Grouped view
├── projects/
│   ├── ProjectList.tsx           # All projects
│   ├── ProjectCard.tsx           # Single project display
│   ├── ProjectForm.tsx           # Add/Edit form
│   └── ColorPicker.tsx           # Color selector
├── reports/
│   ├── ReportView.tsx            # Main report container
│   ├── DateRangeSelector.tsx    # Period picker
│   ├── ReportSummary.tsx        # Metrics display
│   ├── ReportTable.tsx          # Detailed table
│   └── ExportButton.tsx         # CSV export button
└── shared/
    ├── Button.tsx
    ├── Input.tsx
    ├── Modal.tsx
    └── Card.tsx
Example Component:
typescript// components/timer/TimerDisplay.tsx
interface TimerDisplayProps {
  isRunning: boolean;
  elapsedTime: number;
  taskName: string;
  projectName: string;
}

export function TimerDisplay({ 
  isRunning, 
  elapsedTime, 
  taskName, 
  projectName 
}: TimerDisplayProps) {
  // ONLY rendering logic, NO business logic
  return (
    


      {formatTime(elapsedTime)}
      {taskName}
      {projectName}
      {isRunning && ●}
    


  );
}
```

**Key Rules:**
- ✅ Receive data via props
- ✅ Emit actions via callbacks (`onClick`, `onChange`)
- ✅ Local UI state only (hover, focus, open/closed)
- ❌ NO API calls
- ❌ NO business logic
- ❌ NO direct database access

---

## 2. State/Logic Layer (Services/Hooks/Store)

**Purpose:** Business logic, state management, data transformation, calculations.

### Structure:
```
src/state/
├── hooks/
│   ├── useTimer.ts              # Timer logic & state
│   ├── useTimeEntries.ts        # Entries CRUD logic
│   ├── useProjects.ts           # Projects management
│   ├── useReports.ts            # Report calculations
│   └── useAutocomplete.ts       # Task name suggestions
├── store/
│   ├── timerStore.ts            # Global timer state (Zustand/Redux)
│   ├── projectsStore.ts         # Projects cache
│   └── userStore.ts             # User preferences
├── services/
│   ├── timerService.ts          # Timer business logic
│   ├── calculationService.ts   # Time calculations
│   ├── exportService.ts         # CSV generation
│   └── validationService.ts    # Data validation
└── utils/
    ├── timeUtils.ts             # Time formatting
    ├── dateUtils.ts             # Date manipulation
    └── groupUtils.ts            # Data grouping
Example Hook:
typescript// state/hooks/useTimer.ts
import { useTimerStore } from '../store/timerStore';
import { timerService } from '../services/timerService';
import { timeEntriesClient } from '@/api/timeEntriesClient';

export function useTimer() {
  const { 
    isRunning, 
    startTime, 
    taskName, 
    projectId 
  } = useTimerStore();

  const startTimer = async (task: string, project: string) => {
    // Validation logic
    if (!task || !project) {
      throw new Error('Task and project required');
    }

    // Business logic
    const entry = timerService.createEntry(task, project);
    
    // API call through client layer
    await timeEntriesClient.start(entry);
    
    // Update state
    useTimerStore.setState({ 
      isRunning: true, 
      startTime: Date.now() 
    });
  };

  const stopTimer = async () => {
    const duration = timerService.calculateDuration(startTime);
    await timeEntriesClient.stop({ duration });
    
    useTimerStore.setState({ isRunning: false });
  };

  const getElapsedTime = () => {
    return timerService.calculateElapsed(startTime);
  };

  return { 
    isRunning, 
    startTimer, 
    stopTimer, 
    getElapsedTime 
  };
}
Example Service:
typescript// state/services/timerService.ts
export const timerService = {
  createEntry(taskName: string, projectId: string) {
    return {
      id: generateId(),
      taskName,
      projectId,
      startTime: new Date(),
      endTime: null,
      duration: 0
    };
  },

  calculateDuration(startTime: number): number {
    return Math.floor((Date.now() - startTime) / 1000);
  },

  calculateElapsed(startTime: number): number {
    return Math.floor((Date.now() - startTime) / 1000);
  },

  validateEntry(entry: TimeEntry): boolean {
    return entry.duration > 0 && entry.taskName.length > 0;
  }
};
```

**Key Rules:**
- ✅ Business logic & calculations
- ✅ State management
- ✅ Data transformation
- ✅ Validation rules
- ✅ Coordinate API calls (but delegate to API layer)
- ❌ NO direct component rendering
- ❌ NO direct database queries

---

## 3. API Client Layer

**Purpose:** HTTP communication, API calls, request/response handling, error handling.

### Structure:
```
src/api/
├── clients/
│   ├── timeEntriesClient.ts     # Time entries API
│   ├── projectsClient.ts        # Projects API
│   └── reportsClient.ts         # Reports API
├── config/
│   ├── apiConfig.ts             # Base URL, headers
│   └── endpoints.ts             # API routes
├── types/
│   ├── requests.ts              # Request DTOs
│   └── responses.ts             # Response DTOs
└── utils/
    ├── httpClient.ts            # Axios/Fetch wrapper
    ├── errorHandler.ts          # API error handling
    └── interceptors.ts          # Auth, logging
Example Client:
typescript// api/clients/timeEntriesClient.ts
import { httpClient } from '../utils/httpClient';
import { endpoints } from '../config/endpoints';
import type { TimeEntry, CreateEntryRequest } from '../types';

export const timeEntriesClient = {
  async getAll(filters?: { startDate?: Date; endDate?: Date }) {
    const response = await httpClient.get<TimeEntry[]>(
      endpoints.timeEntries.list,
      { params: filters }
    );
    return response.data;
  },

  async create(entry: CreateEntryRequest) {
    const response = await httpClient.post<TimeEntry>(
      endpoints.timeEntries.create,
      entry
    );
    return response.data;
  },

  async update(id: string, updates: Partial<TimeEntry>) {
    const response = await httpClient.patch<TimeEntry>(
      endpoints.timeEntries.update(id),
      updates
    );
    return response.data;
  },

  async delete(id: string) {
    await httpClient.delete(endpoints.timeEntries.delete(id));
  },

  async start(entry: CreateEntryRequest) {
    return this.create({ ...entry, startTime: new Date() });
  },

  async stop(id: string, duration: number) {
    return this.update(id, { 
      endTime: new Date(), 
      duration 
    });
  }
};
HTTP Client Wrapper:
typescript// api/utils/httpClient.ts
import axios from 'axios';
import { apiConfig } from '../config/apiConfig';
import { handleApiError } from './errorHandler';

const client = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const handledError = handleApiError(error);
    return Promise.reject(handledError);
  }
);

export const httpClient = {
  get: client.get,
  post: client.post,
  patch: client.patch,
  delete: client.delete,
  put: client.put,
};
```

**Key Rules:**
- ✅ HTTP requests/responses only
- ✅ Error handling & retries
- ✅ Request/response transformation
- ✅ Authentication headers
- ❌ NO business logic
- ❌ NO UI rendering
- ❌ NO direct database access

---

## 4. Data Layer (ORM/Repository)

**Purpose:** Database operations, data persistence, queries, migrations.

### Structure:
```
src/data/
├── repositories/
│   ├── timeEntryRepository.ts   # TimeEntry DB operations
│   ├── projectRepository.ts     # Project DB operations
│   └── taskNameRepository.ts    # TaskName DB operations
├── models/
│   ├── TimeEntry.ts             # Domain model
│   ├── Project.ts               # Domain model
│   └── TaskName.ts              # Domain model
├── prisma/                      # If using Prisma ORM
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # DB migrations
│   └── seed.ts                  # Seed data
└── db/
    ├── connection.ts            # DB connection config

**Key Rules:**
- ✅ Database queries only
- ✅ CRUD operations
- ✅ Complex queries & aggregations
- ✅ Transactions
- ✅ Schema migrations
- ❌ NO business logic
- ❌ NO API calls
- ❌ NO UI rendering

---

## Layer Interaction Flow

### Example: Starting a Timer
```
┌─────────────┐
│ UI Component│ TimerControls.tsx
│             │ <Button onClick={() => onStart(task, project)}>
└──────┬──────┘
       │ callback
       ↓
┌─────────────┐
│ State/Logic │ useTimer() hook
│             │ startTimer(task, project)
│             │ - Validates inputs
│             │ - Calls API client
│             │ - Updates local state
└──────┬──────┘
       │ HTTP request
       ↓
┌─────────────┐
│ API Client  │ timeEntriesClient.start()
│             │ POST /api/time-entries
│             │ - Formats request
│             │ - Handles errors
└──────┬──────┘
       │ HTTP to backend
       ↓
┌─────────────┐
│ API Route   │ /api/time-entries/route.ts (Next.js)
│ (Backend)   │ - Receives request
│             │ - Calls repository
└──────┬──────┘
       │ DB operation
       ↓
┌─────────────┐
│ Data Layer  │ timeEntryRepository.create()
│             │ - Prisma query
│             │ - Saves to database
└─────────────┘
```

### Example: Displaying Reports
```
User clicks "View Report" → 
  ReportView component (UI) →
    useReports hook (State/Logic) →
      reportsClient.getReport(filters) (API) →
        GET /api/reports?start=X&end=Y →
          API Route calls reportRepository.generateReport() (Data) →
            Complex aggregation queries →
              Returns data →
                Hook transforms/calculates metrics →
                  Component displays with ReportTable/ReportSummary
```

---

## File Organization Example
```
time-tracker/
├── src/
│   ├── app/                     # Next.js 13+ app directory
│   │   ├── page.tsx            # Home/Timer page
│   │   ├── projects/
│   │   │   └── page.tsx        # Projects page
│   │   ├── reports/
│   │   │   └── page.tsx        # Reports page
│   │   └── api/                # API routes (Backend)
│   │       ├── time-entries/
│   │       │   └── route.ts
│   │       ├── projects/
│   │       │   └── route.ts
│   │       └── reports/
│   │           └── route.ts
│   │
│   ├── components/             # UI Layer
│   │   └── (organized as shown above)
│   │
│   ├── state/                  # State/Logic Layer
│   │   └── (organized as shown above)
│   │
│   ├── api/                    # API Client Layer
│   │   └── (organized as shown above)
│   │
│   └── data/                   # Data Layer
│       └── (organized as shown above)
│
├── prisma/
│   └── schema.prisma
├── package.json
└── README.md

Key Principles

Separation of Concerns: Each layer has ONE responsibility

Dependency Direction: UI → State → API → Data (one direction)

Testability: Each layer can be tested independently

Maintainability: Changes in one layer don't break others

Scalability: Easy to add new features in the right layer

This architecture ensures clean, maintainable, and professional code structure that the evaluators are looking for!

**Changes/Outcome:**
...

### [2025-02-15 ..:..:..] [Cursor]

**Prompt:**
Check for errors on project page, it is not loading.

**Changes/Outcome:**
...

### [2025-02-15 ..:..:..] [Cursor]

**Prompt:**
In Settings add theme toggle.

**Changes/Outcome:**
...

### [2025-02-15 ..:..:..] [Cursor]

**Prompt:**
Date Picker on the tasks page works in a weird way. When I open it it shows today (15.02.2026), forward arrow is not enabled at all. Then I click back and it goes to 13.02.2026 and when I click forward it goes to 16.02.2026 and disables both arrows. Ensure we go through days one by one (time range has to include 2 weeks, whole current one and whole next one) and properly query supabase while doing so.

**Changes/Outcome:**
...

