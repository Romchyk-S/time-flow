import { HoverEffect } from "@/components/ui/hover-effect";
import { formatDistanceToNow, parseISO } from "date-fns";
import { formatDuration } from "@/lib/utils";
import type { TaskWithProject } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { tasksClient } from "@/api/clients/tasksClient";

interface TasksHoverGridProps {
  tasks: TaskWithProject[];
  onEditTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => Promise<void>;
  onTaskClick?: (taskId: string) => void;
  onTaskUpdated?: () => void;
}

export function TasksHoverGrid({ 
  tasks, 
  onEditTask, 
  onDeleteTask, 
  onTaskClick, 
  onTaskUpdated 
}: TasksHoverGridProps) {
  const { toast } = useToast();

  const handleDelete = async (taskId: string) => {
    if (onDeleteTask) {
      await onDeleteTask(taskId);
    } else {
      try {
        await tasksClient.delete(taskId);
        toast({
          title: "Success",
          description: "Task deleted successfully",
        });
        onTaskUpdated?.();
      } catch (error) {
        console.error("Error deleting task:", error);
        toast({
          title: "Error",
          description: "Failed to delete task",
          variant: "destructive",
        });
      }
    }
  };
  const items = tasks.map(task => {
    // Format total_duration (stored in minutes) to a human-readable string
    let durationText = 'No time tracked';
    if (task.total_duration) {
      const minutes = task.total_duration;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (hours > 0) {
        durationText = `${hours}h ${remainingMinutes}m`;
      } else {
        durationText = `${minutes}m`;
      }
    }

    // Format last worked date
    let lastWorkedDate = 'Never';
    console.log('Processing task:', { 
      id: task.id, 
      name: task.name, 
      last_used: task.last_used, 
      work_dates: task.work_dates 
    });

    try {
      // Try to use last_used first, then fall back to the most recent work date
      let lastDate = task.last_used;
      console.log('Initial lastDate from task.last_used:', lastDate);
      
      if ((!lastDate || lastDate === '') && task.work_dates && task.work_dates.length > 0) {
        console.log('No valid last_used, checking work_dates:', task.work_dates);
        
        // Process and sort work dates
        const processedDates = task.work_dates
          .filter((date): date is string => {
            const isValid = !!date;
            if (!isValid) {
              console.log('Filtered out invalid date:', date);
            }
            return isValid;
          })
          .map(dateStr => {
            // Handle both 'YYYY-MM-DD' and ISO date strings
            const date = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
            const dateObj = new Date(date);
            console.log(`Processed date string "${dateStr}" to:`, date, 'Parsed as:', dateObj);
            return dateObj;
          });
          
        const sortedDates = [...processedDates].sort((a, b) => b.getTime() - a.getTime());
        console.log('Sorted dates:', sortedDates.map(d => d.toISOString()));
        
        if (sortedDates.length > 0) {
          lastDate = sortedDates[0].toISOString();
          console.log('Selected most recent date from work_dates:', lastDate);
        }
      }
      
      if (lastDate) {
        console.log('Final date to format:', lastDate);
        const date = new Date(lastDate);
        if (!isNaN(date.getTime())) { // Check if date is valid
          // Format as YYYY-MM-DD
          lastWorkedDate = date.toISOString().split('T')[0];
        } 
        console.log('Formatted date string:', lastWorkedDate);
      } else {
        console.log('No valid date found for task');
      }
    } catch (e) {
      console.error('Error formatting last worked date:', e, 'Task:', task);
    }
    
    console.log('Final lastWorkedDate for task', task.id, ':', lastWorkedDate);

    return {
      id: task.id,
      title: task.name,
      description: task.description || undefined,
      link: `#${task.id}`,
      status: task.status,
      lastWorkedDate,
      duration: durationText,
      project: task.project ? {
        name: task.project.name,
        color: task.project.color
      } : undefined
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4">
      <HoverEffect 
        items={items} 
        onEdit={onEditTask}
        onDelete={handleDelete}
        onTaskClick={onTaskClick}
      />
    </div>
  );
}
