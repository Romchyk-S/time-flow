import { useEffect, useState } from 'react';
import { TasksHoverGrid } from '@/components/tasks/TasksHoverGrid';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDateKey } from '@/state/utils/dateUtils';
import type { TaskWithProject } from '@/types';

export default function TasksPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateKey = formatDateKey(selectedDate);

  const { data: tasks = [], isLoading, error } = useQuery<TaskWithProject[]>({
    queryKey: ['tasks-for-date', dateKey],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('tasks')
        .select(`*, project:projects (*)`)
        .contains('work_dates', [dateKey])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((t: any) => ({
        ...t,
        is_active: t.is_active ?? true,
        usage_count: t.usage_count ?? 0,
        last_used: t.last_used ?? null,
        total_duration: t.total_duration ?? 0,
        work_dates: t.work_dates ?? [],
        status: t.status ?? 'not_started',
      })) as TaskWithProject[];
    },
  });

  if (error) {
    return (
      <div className="p-4 text-destructive">
        Error loading tasks: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d);
            }}
            className="p-2 rounded-lg hover:bg-muted"
          >
            ←
          </button>
          <div className="text-lg font-medium">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </div>
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d);
            }}
            className="p-2 rounded-lg hover:bg-muted"
          >
            →
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="ml-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      ) : tasks.length > 0 ? (
        <TasksHoverGrid tasks={tasks} />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks found for this date.</p>
        </div>
      )}
    </div>
  );
}
