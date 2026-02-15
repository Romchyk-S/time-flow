import { useEffect, useState } from 'react';
import { TasksHoverGrid } from '@/components/tasks/TasksHoverGrid';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDateKey } from '@/lib/dateUtils';
import { formatDuration } from '@/lib/time-utils';

type TaskWithProject = {
  id: string;
  name: string;
  description: string | null;
  status: 'not_started' | 'in_progress' | 'paused' | 'in_review' | 'completed';
  project_id: string;
  project: {
    id: string;
    name: string;
    color: string;
  };
  last_worked_at: string | null;
  execution_duration: number | null;
  work_dates: string[] | null;
};

export default function TasksPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateKey = formatDateKey(selectedDate);

  const { data: tasks = [], isLoading, error } = useQuery<TaskWithProject[]>({
    queryKey: ['tasks-for-date', dateKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          project:projects (id, name, color)
        `)
        .contains('work_dates', [dateKey])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading tasks: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const prevDay = new Date(selectedDate);
              prevDay.setDate(prevDay.getDate() - 1);
              setSelectedDate(prevDay);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ←
          </button>
          <div className="text-lg font-medium">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <button
            onClick={() => {
              const nextDay = new Date(selectedDate);
              nextDay.setDate(nextDay.getDate() + 1);
              setSelectedDate(nextDay);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            →
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : tasks.length > 0 ? (
        <TasksHoverGrid tasks={tasks} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No tasks found for this date.</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create New Task
          </button>
        </div>
      )}
    </div>
  );
}
