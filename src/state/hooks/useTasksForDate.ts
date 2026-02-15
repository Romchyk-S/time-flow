import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateKey } from "../utils/dateUtils";
import type { Task } from "@/types";

export function useTasksForDate(date: Date) {
  const dateKey = formatDateKey(date);
  
  return useQuery<Task[]>({
    queryKey: ["tasks-for-date", dateKey],
    queryFn: async () => {
      // Get all tasks that have the specified date in their work_dates array
      const { data, error } = await supabase
        .from("tasks")
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
        .contains("work_dates", [dateKey])
        .order("name");
        
      if (error) throw error;
      return (data ?? []) as Task[];
    },
  });
}
