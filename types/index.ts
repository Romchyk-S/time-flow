// Project related types
export interface Project {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_active: boolean;
}

// Task status types
export type TaskStatus = 'not_started' | 'in_progress' | 'in_review' | 'completed';

// Task related types
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  project_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  estimated_duration: number | null; // in minutes
}

// Time entry related types
export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration: number | null; // in seconds
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Combined types for the application
export interface TaskWithRelations extends Task {
  project: Project;
  time_entries: TimeEntry[];
  total_time_spent: number; // in seconds
  is_running: boolean;
}

export interface ProjectWithStats extends Project {
  task_count: number;
  total_time_spent: number; // in seconds
  last_worked_on: string | null;
}

// Form types
export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  project_id: string;
  estimated_duration?: number;
}

export interface TimeEntryFormData {
  task_id: string;
  start_time: string;
  end_time?: string;
  notes?: string;
}

// Report related types
export interface TimeRange {
  start: Date;
  end: Date;
}

export interface TimeRangePreset {
  id: string;
  label: string;
  getRange: () => TimeRange;
}

export interface TimeByProject {
  project_id: string;
  project_name: string;
  project_color: string;
  total_time: number; // in seconds
  percentage: number;
  task_count: number;
}

export interface DailySummary {
  date: string;
  total_hours: number;
  projects_count: number;
  tasks_count: number;
}

export interface TaskReport {
  date: string;
  project_name: string;
  task_title: string;
  duration: number; // in seconds
  time_range: string;
  completed: boolean;
}

export interface ReportData {
  time_by_project: TimeByProject[];
  task_details: TaskReport[];
  daily_summary: DailySummary[];
  total_time: number; // in seconds
  projects_count: number;
  tasks_count: number;
  average_daily_time: number; // in seconds
}
