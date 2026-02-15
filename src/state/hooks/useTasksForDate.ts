import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateKey } from "../utils/dateUtils";
import type { Task, Project, TaskWithProject } from "@/types";

// Define the return type for the task with project
type TaskWithProjectResult = Task & {
  project: Pick<Project, 'id' | 'name' | 'color' | 'description' | 'created_at' | 'updated_at'>;
};

export function useTasksForDate(date: Date) {
  const dateStr = formatDateKey(date);
  
  console.log('Fetching tasks for date:', dateStr);
  
  return useQuery<TaskWithProjectResult[]>({
    queryKey: ["tasks-for-date", dateStr],
    staleTime: 5 * 60 * 1000,        // 5 minutes
    refetchOnWindowFocus: false,      // Don't refetch when window focused
    refetchOnMount: false,            // Don't refetch on component mount
    refetchInterval: false,           // No automatic interval refetch
    retry: 1,                         // Only retry once on error
    queryFn: async () => {
      // Fetch tasks that have the specified date in their work_dates array
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
        .contains('work_dates', [dateStr]);
      
      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      
      if (!tasks || tasks.length === 0) {
        return [];
      }
      
      // Transform the data to match the expected TaskWithProject format
      return (tasks as Array<Task & { project?: Project; project_id: string }>).map(task => {
        const project = task.project || {
          id: task.project_id,
          name: 'Unknown Project',
          description: '',
          color: '#888',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        return {
          ...task,
          project
        } as TaskWithProjectResult;
      });
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}
