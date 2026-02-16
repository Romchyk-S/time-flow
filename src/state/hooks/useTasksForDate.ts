import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateKey, subDays } from "../utils/dateUtils";
import type { Task, Project, TaskStatus } from "@/types";

// Define the return type for the task with project
type TaskWithProjectResult = Task & {
  project: Pick<Project, 'id' | 'name' | 'color' | 'description' | 'created_at' | 'updated_at'>;
  original_date?: string;
};

// Define the database task row type from Supabase
interface DbTaskRow {
  id: string;
  name: string;
  description: string | null;
  status: TaskStatus;
  project_id: string;
  project?: {
    id: string;
    name: string;
    color: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  last_used: string | null;
  total_duration: number;
  usage_count: number;
  work_dates: string[] | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches tasks for a specific date, and if there are fewer than minTasks,
 * includes tasks from previous days until we reach the minimum number of tasks.
 */
async function fetchTasksForDate(date: Date, minTasks = 6): Promise<TaskWithProjectResult[]> {
  const dateStr = formatDateKey(date);

  const maxDaysBack = 30;
  const dateKeys: string[] = [];
  for (let i = 0; i <= maxDaysBack; i++) {
    dateKeys.push(formatDateKey(subDays(date, i)));
  }

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      *,
      project:projects (
        id,
        name,
        color,
        description,
        created_at,
        updated_at
      )
    `)
    .overlaps('work_dates', dateKeys)
    .order('last_used', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  const typedTasks = (tasks || []) as DbTaskRow[];
  const mappedTasks: TaskWithProjectResult[] = typedTasks.map((task) => {
    const project = task.project || {
      id: task.project_id,
      name: 'Unknown Project',
      color: '#888888',
      description: 'No project information available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const taskData: TaskWithProjectResult = {
      id: task.id,
      name: task.name,
      description: task.description,
      status: task.status,
      is_active: true,
      project_id: task.project_id,
      project: project,
      last_used: task.last_used,
      total_duration: task.total_duration,
      usage_count: task.usage_count,
      work_dates: task.work_dates || [],
      created_at: task.created_at,
      updated_at: task.updated_at,
      original_date: dateStr,
    };
    return taskData;
  });

  // Assemble up to minTasks, prioritizing tasks worked on the requested date,
  // then the previous day, and so on.
  const selected: TaskWithProjectResult[] = [];
  const seen = new Set<string>();

  for (const key of dateKeys) {
    if (selected.length >= minTasks) break;

    const matches = mappedTasks.filter((t) => (t.work_dates ?? []).includes(key));
    for (const t of matches) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      selected.push({ ...t, original_date: key });
      if (selected.length >= minTasks) break;
    }
  }

  // If we still don't have enough, just fill with most recent remaining by last_used.
  if (selected.length < minTasks) {
    const remaining = mappedTasks
      .filter((t) => !seen.has(t.id))
      .sort((a, b) => {
        const timeA = a.last_used ? new Date(a.last_used).getTime() : 0;
        const timeB = b.last_used ? new Date(b.last_used).getTime() : 0;
        return timeB - timeA;
      });

    for (const t of remaining) {
      selected.push(t);
      if (selected.length >= minTasks) break;
    }
  }

  return selected;
}

export function useTasksForDate(date: Date) {
  const dateStr = formatDateKey(date);
  
  console.log('Fetching tasks for date:', dateStr);
  
  return useQuery<TaskWithProjectResult[]>({
    queryKey: ["tasks-for-date", dateStr],
    queryFn: () => fetchTasksForDate(date),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: 1,
  });
}
