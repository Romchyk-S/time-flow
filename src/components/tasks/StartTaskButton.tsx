import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { tasksClient } from "@/api/clients/tasksClient";
import { Task, TaskStatus, Project } from "@/types";
import { useTimer } from "@/state/hooks/useTimer";
import { useQueryClient } from "@tanstack/react-query";
import { projectsClient } from "@/api/clients/projectsClient";

interface StartTaskButtonProps {
  task: Task;
  projectId: string;
  onTaskUpdate?: () => void;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function StartTaskButton({
  task,
  projectId,
  onTaskUpdate,
  className,
  variant = "default",
  size = "default",
}: StartTaskButtonProps) {
  const { toast } = useToast();
  const { startTimer } = useTimer();
  const queryClient = useQueryClient();

  const handleStartTask = useCallback(async () => {
    try {
      // Get the full project data if not already available
      let project: Project;
      if ('project' in task && task.project) {
        project = task.project;
      } else {
        const projectData = await projectsClient.getById(projectId);
        if (!projectData) {
          throw new Error('Project not found');
        }
        project = projectData;
      }

      // Update task status and work dates
      const today = new Date().toISOString().split('T')[0];
      const workDates = new Set(task.work_dates || []);
      workDates.add(today);
      
      const updates = {
        status: 'in_progress' as TaskStatus,
        work_dates: Array.from(workDates),
        last_used: new Date().toISOString(),
      };

      // Start the timer with the full project data
      startTimer(task.name, project);

      // Update the task in the database
      await tasksClient.update(task.id, updates);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['recent-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries-day'] });

      // Show success toast
      toast({
        title: "Task started",
        description: `Timer started for "${task.name}"`,
      });

      // Call the onTaskUpdate callback if provided
      onTaskUpdate?.();
    } catch (error) {
      console.error('Error starting task:', error);
      toast({
        title: "Error",
        description: "Failed to start task. Please try again.",
        variant: "destructive",
      });
    }
  }, [task, projectId, onTaskUpdate, startTimer, queryClient, toast]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStartTask}
      className={className}
    >
      <Play className="h-4 w-4 mr-2" />
      Start
    </Button>
  );
}
