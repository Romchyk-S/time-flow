import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { tasksClient } from "@/api/clients/tasksClient";
import { useToast } from "@/components/ui/use-toast";
import { TaskWithProject } from "@/types";

interface TaskActionsProps {
  task: TaskWithProject;
  onTaskUpdated?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function TaskActions({
  task,
  onTaskUpdated,
  variant = 'ghost',
  size = 'default',
  showLabel = true,
}: TaskActionsProps) {
  const { toast } = useToast();

  const handleStartTask = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const updates: any = {};
      
      // Update status if needed
      if (task.status === 'not_started') {
        updates.status = 'in_progress';
      }
      
      // Update work_dates if today is not already included
      const workDates = Array.isArray(task.work_dates) ? [...task.work_dates] : [];
      if (!workDates.includes(today)) {
        workDates.push(today);
        updates.work_dates = workDates;
      }
      
      // Only update if there are changes to make
      if (Object.keys(updates).length > 0) {
        await tasksClient.update(task.id, updates);
        onTaskUpdated?.();
        
        toast({
          title: "Task started",
          description: "Task has been marked as in progress",
        });
      }

      // Here you would typically start the timer for this task
      // You'll need to implement this part based on your timer logic
      
    } catch (error) {
      console.error('Error starting task:', error);
      toast({
        title: "Error",
        description: "Failed to start task",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleStartTask}
      className="gap-1"
    >
      <Play className="h-4 w-4" />
      {showLabel && <span>Start</span>}
    </Button>
  );
}
