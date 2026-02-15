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
  
  // First, try to get tasks for the requested date
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
    .contains('work_dates', [dateStr])
    .order('last_used', { ascending: false });
  
  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
  
  // Transform the data to match the expected TaskWithProject format
  let resultTasks: TaskWithProjectResult[] = [];
  
  if (tasks && tasks.length > 0) {
    const typedTasks = tasks as DbTaskRow[];
    resultTasks = typedTasks.map(task => {
      // Create a default project if none exists
      const project = task.project || {
        id: task.project_id,
        name: 'Unknown Project',
        color: '#888888',
        description: 'No project information available',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Create the task data with proper types
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
    let currentDate = new Date(date);
    let daysBack = 1;
    const maxDaysBack = 30; // Safety limit to prevent infinite loops
    
    while (resultTasks.length < minTasks && daysBack <= maxDaysBack) {
      const previousDate = subDays(currentDate, 1);
      const previousDateStr = formatDateKey(previousDate);
      
      console.log(`[fetchTasksForDate] Fetching tasks for previous day: ${previousDateStr}`);
      
      // Fetch tasks for the previous day
      const { data: prevDayTasks, error: prevDayError } = await supabase
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
        .contains('work_dates', [previousDateStr])
        .order('last_used', { ascending: false });
      
      if (prevDayError) {
        console.error(`Error fetching tasks for ${previousDateStr}:`, prevDayError);
        break;
      }
      
      if (prevDayTasks && prevDayTasks.length > 0) {
        const typedPrevDayTasks = prevDayTasks as DbTaskRow[];
        
        // Map the tasks and add them to our results
        const additionalTasks = typedPrevDayTasks
          .filter(task => !resultTasks.some(t => t.id === task.id)) // Remove duplicates
          .map(task => {
            // Create a default project if none exists
            const project = task.project || {
              id: task.project_id,
              name: 'Unknown Project',
              color: '#888888',
              description: 'No project information available',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            // Create the task data with proper types
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
              original_date: previousDateStr
            };
            return taskData;
          });
        
        console.log(`[fetchTasksForDate] Found ${additionalTasks.length} additional tasks from ${previousDateStr}`);
        
        // Add the new tasks to our results
        resultTasks = [...resultTasks, ...additionalTasks];
      }
      
      // Move to the previous day
      currentDate = previousDate;
      daysBack++;
      
      // If we've reached the minimum number of tasks, we can stop
      if (resultTasks.length >= minTasks) {
        break;
      }
    }
    
    // If we still don't have enough tasks, sort by last_used to get the most recent ones
    if (resultTasks.length > 0) {
      resultTasks.sort((a, b) => {
        const timeA = a.last_used ? new Date(a.last_used).getTime() : 0;
        const timeB = b.last_used ? new Date(b.last_used).getTime() : 0;
        return timeB - timeA;
      });
    }
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
