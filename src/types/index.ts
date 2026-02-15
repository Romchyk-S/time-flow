// Project – matches Supabase projects table
export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

// Task status
export type TaskStatus = "not_started" | "in_progress" | "paused" | "in_review" | "completed";

// Task – matches Supabase tasks table (work_dates = dates task is expected / was worked on)
export interface Task {
  id: string;
  name: string;
  description: string | null;
  project_id: string;
  status: TaskStatus;
  is_active: boolean;
  usage_count: number;
  last_used: string | null;
  work_dates: string[] | null;
  total_duration: number; // Total duration in minutes
  created_at: string;
  updated_at: string;
}

// Time entry – matches Supabase time_entries table
export interface TimeEntry {
  id: string;
  task_id: string;
  start_time: string;
  end_time: string | null;
  duration: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Joined / view types
export interface TaskWithProject extends Task {
  project?: Project;
}

export interface TimeEntryWithTask extends TimeEntry {
  task?: Task & { project?: Project };
}

export interface TaskWithRelations extends Task {
  project: Project;
  time_entries?: TimeEntry[];
  total_time_spent: number;
  is_running?: boolean;
}

export interface ProjectWithStats extends Project {
  task_count: number;
  total_time_spent: number;
  last_worked_on: string | null;
}

// Report types
export interface ReportSummary {
  totalSeconds: number;
  projectCount: number;
  taskCount: number;
  averageDailySeconds: number;
  workDaysCount: number;
}

export interface ProjectBreakdownRow {
  projectId: string;
  projectName: string;
  projectColor: string;
  totalSeconds: number;
  percentOfTotal: number;
  taskCount: number;
}

export interface DetailedTaskRow {
  date: string;
  projectName: string;
  projectColor: string;
  taskName: string;
  durationSeconds: number;
  timeRange: string;
  completedInRange: boolean;
  taskId: string;
  entryId: string;
}

export interface DailySummaryRow {
  date: string;
  totalSeconds: number;
  projectCount: number;
  taskCount: number;
}
