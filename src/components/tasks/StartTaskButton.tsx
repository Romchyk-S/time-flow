import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { tasksClient } from "@/api/clients/tasksClient";
import { Task, TaskStatus, Project } from "@/types";
import { useTimer } from "@/state/hooks/useTimer";
import { useQueryClient } from "@tanstack/react-query";
import { projectsClient } from "@/api/clients/projectsClient";
import { formatDateKey } from "@/state/utils/dateUtils";

type TaskInput = {
  id?: string;
  name: string;
  project_id: string;
  project?: Project;
  status?: TaskStatus;
  work_dates?: string[];
  last_used?: string;
};

interface StartTaskButtonProps {
  /** The task to start/resume. If only name and project_id are provided, will create a new task. */
  task: TaskInput;
  /** Callback when the task is successfully started */
  onTaskUpdate?: () => void;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
  showIcon?: boolean;
}

export function StartTaskButton({
  task,
  onTaskUpdate,
  className,
  variant = "default",
  size = "default",
  children,
  showIcon = true,
}: StartTaskButtonProps) {
  const { toast } = useToast();
  const { startTimer } = useTimer();
  const queryClient = useQueryClient();

  const handleStartTask = useCallback(async () => {
    try {
      // Get or create the project
      let project: Project;
      if (task.project) {
        project = task.project;
      } else {
        const projectData = await projectsClient.getById(task.project_id);
        if (!projectData) {
          throw new Error('Project not found');
        }
        project = projectData;
      }

      // Prepare task updates
      const today = formatDateKey(new Date());
      const workDates = new Set(task.work_dates || []);
      workDates.add(today);
      
      const taskUpdates = {
        status: 'in_progress' as TaskStatus,
        work_dates: Array.from(workDates),
        last_used: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let taskToStart = task;

      // First, try to find an existing task with the same name and project
      if (!task.id) {
        try {
          const existingTask = await tasksClient.findByNameAndProject(task.name, task.project_id);
          if (existingTask) {
            console.log('Found existing task, updating instead of creating new:', existingTask);
            task = { ...existingTask };
          }
        } catch (error) {
          console.warn('Error checking for existing task, will try to create new one', error);
        }
      }

      // Update or create the task
      if (task.id) {
        // Existing task - update it
        console.log('Updating existing task:', { taskId: task.id, updates: taskUpdates });
        try {
          const updatedTask = await tasksClient.update(task.id, taskUpdates);
          taskToStart = { ...task, ...updatedTask };
        } catch (updateError) {
          console.error('Error updating task, will try to find it again:', updateError);
          // If update fails, try to get the latest version of the task
          const freshTask = await tasksClient.getById(task.id);
          if (freshTask) {
            taskToStart = { ...freshTask };
          } else {
            throw new Error('Task not found after update attempt');
          }
        }
      } else {
        // New task - create it
        console.log('Creating new task with:', { 
          name: task.name, 
          project_id: task.project_id, 
          ...taskUpdates 
        });
        try {
          const newTask = await tasksClient.create({
            name: task.name,
            project_id: task.project_id,
            status: 'in_progress',
            ...taskUpdates
          });
          taskToStart = { ...task, ...newTask };
        } catch (createError: any) {
          // If we get a unique constraint violation, try to find the existing task
          if (createError.code === '23505') { // PostgreSQL unique violation error code
            console.log('Task already exists, finding it...');
            const existingTask = await tasksClient.findByNameAndProject(task.name, task.project_id);
            if (existingTask) {
              console.log('Found existing task after conflict:', existingTask);
              // Update the existing task
              const updatedTask = await tasksClient.update(existingTask.id, taskUpdates);
              taskToStart = { ...existingTask, ...updatedTask };
            } else {
              throw new Error('Task creation failed due to duplicate key, but could not find the existing task');
            }
          } else {
            throw createError;
          }
        }
      }

      // Start the timer with the updated/created task
      console.log('Starting timer for task:', taskToStart);
      startTimer(taskToStart);

      // Invalidate relevant queries
      console.log('Invalidating queries');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['recent-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['time-entries-day'] }),
        queryClient.invalidateQueries({ queryKey: ['time-entries-week'] }),
        queryClient.invalidateQueries({ queryKey: ['tasks-for-date'] }),
      ]);

      // Show success toast
      toast({
        title: "Task started",
        description: `Timer started for "${taskToStart.name}"`,
      });

      console.log('Task started successfully:', taskToStart);

      // Call the onTaskUpdate callback if provided
      onTaskUpdate?.();
    } catch (error) {
      console.error('Error starting task:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start task. Please try again.",
        variant: "destructive",
      });
    }
  }, [task, onTaskUpdate, startTimer, queryClient, toast]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStartTask}
      className={className}
    >
      {showIcon && <Play className="h-4 w-4 mr-2" />}
      {children || 'Start'}
    </Button>
  );
}
