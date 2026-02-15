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
  estimated_duration: number | null;
}

// Time entry related types
export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Combined types
export interface TaskWithRelations extends Task {
  project: Project;
  time_entries: TimeEntry[];
  total_time_spent: number;
  is_running: boolean;
}

export interface ProjectWithStats extends Project {
  task_count: number;
  total_time_spent: number;
  last_worked_on: string | null;
}
