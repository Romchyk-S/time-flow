import { HoverEffect } from "@/components/ui/hover-effect";
import { formatDistanceToNow } from "date-fns";
import { formatDuration } from "@/lib/utils";

type TaskWithProject = {
  id: string;
  name: string;
  description?: string | null;
  status: 'not_started' | 'in_progress' | 'paused' | 'in_review' | 'completed';
  project_id: string;
  project?: {
    name: string;
    color: string;
  };
  last_worked_at?: string | null;
  execution_duration?: number | null;
};

interface TasksHoverGridProps {
  tasks: TaskWithProject[];
  onTaskClick?: (taskId: string) => void;
}

export function TasksHoverGrid({ tasks, onTaskClick }: TasksHoverGridProps) {
  const items = tasks.map(task => ({
    title: task.name,
    description: task.description || undefined,
    link: `#${task.id}`, // You might want to update this to your actual task detail route
    status: task.status,
    lastWorkedDate: task.last_worked_at || undefined,
    duration: task.execution_duration ? formatDuration(task.execution_duration) : undefined
  }));

  return (
    <div className="max-w-7xl mx-auto px-4">
      <HoverEffect items={items} />
    </div>
  );
}
