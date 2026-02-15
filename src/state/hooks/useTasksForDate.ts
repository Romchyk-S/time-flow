import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateKey, subDays } from "../utils/dateUtils";
import type { Task, Project, TaskStatus } from "@/types";

// Define the return type for the task with project
type TaskWithProjectResult = Task & {
  project: Pick<Project, 'id' | 'name' | 'color' | 'description' | 'created_at' | 'updated_at'>;
  original_date?: string;
};

// Define the database task type
interface DbTask {
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
  
  // First, try to get tasks for the requested date
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select<DbTask>(`
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
    .contains('work_dates', [dateStr])
    .order('last_used', { ascending: false });
  
  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
  
  // Transform the data to match the expected TaskWithProject format
  let resultTasks: TaskWithProjectResult[] = [];
  
  if (tasks && tasks.length > 0) {
    resultTasks = tasks.map(task => {
      const taskData: TaskWithProjectResult = {
        id: task.id,
        name: task.name,
        description: task.description,
        status: task.status,
        is_active: true, // Default value for is_active
        project_id: task.project_id,
        project: task.project || {
          id: task.project_id,
          name: 'Unknown Project',
          color: '#888888',
          description: 'No project information available',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        last_used: task.last_used ? new Date(task.last_used) : null,
        total_duration: task.total_duration,
        usage_count: task.usage_count,
        work_dates: task.work_dates || [],
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
        original_date: dateStr
      };
      return taskData;
    });
  }
  
  // If we have enough tasks, return them
  if (resultTasks.length >= minTasks) {
    return resultTasks;
  }
  
  // If we don't have enough tasks, fetch from previous days
  const tasksNeeded = minTasks - resultTasks.length;
  if (tasksNeeded > 0) {
    const previousDay = subDays(date, 1);
    const previousDayTasks = await fetchTasksForDate(previousDay, tasksNeeded);
    
    // Add tasks from previous day, ensuring we don't exceed the number needed
    const additionalTasks = previousDayTasks
      .filter(task => !resultTasks.some(t => t.id === task.id)) // Remove duplicates
      .slice(0, tasksNeeded);
    
    resultTasks = [...resultTasks, ...additionalTasks];
  }
  
  return resultTasks;
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
