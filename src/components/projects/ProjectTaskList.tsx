import { useState, forwardRef } from "react";
import React from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/state/hooks/useTasks";
import { formatDuration } from "@/lib/utils";
import { Task, TaskStatus, Project } from "@/types";
import { tasksClient } from "@/api/clients/tasksClient";
import { projectsClient } from "@/api/clients/projectsClient";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { TaskForm } from "@/components/forms/TaskForm";

interface ProjectTaskListProps {
  projectId: string;
  onTaskUpdate?: () => void;
}

const ProjectTaskListComponent = React.forwardRef<HTMLDivElement, ProjectTaskListProps>(({ projectId, onTaskUpdate }, ref) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task> | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const { tasks, isLoading, refetch } = useTasks(projectId);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const result = await projectsClient.getAll();
      return result || [];
    }
  }) as { data: Project[] };

  const handleEditTask = (task: Task) => {
    setCurrentTask({
      ...task,
      ...(task.work_dates?.length && {
        dateRange: {
          from: new Date(task.work_dates[0]),
          to: task.work_dates.length > 1 ? new Date(task.work_dates[task.work_dates.length - 1]) : new Date(task.work_dates[0])
        }
      })
    } as any);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setDeletingTaskId(taskId);
  };

  const confirmDeleteTask = async () => {
    if (!deletingTaskId) return;
    
    try {
      await tasksClient.delete(deletingTaskId);
      onTaskUpdate?.();
      refetch();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const { dateRange, ...taskData } = values;
      
      if (currentTask?.id) {
        await tasksClient.update(currentTask.id, taskData);
      } else {
        await tasksClient.create(taskData);
      }
      
      setIsDialogOpen(false);
      setCurrentTask(null);
      onTaskUpdate?.();
      refetch();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  if (isLoading) return <div className="text-sm text-muted-foreground p-4">Loading tasks...</div>;

  return (
    <div className="border-t">
      <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
        <div className="col-span-4">Task</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2 text-right">Last Worked</div>
        <div className="col-span-2 text-right">Duration</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>
      
      {tasks?.map((task) => (
        <div key={task.id} className="grid grid-cols-12 gap-2 px-4 py-2 text-sm hover:bg-muted/30 items-center">
          <div className="col-span-4 font-medium">
            <div className="font-medium">{task.name}</div>
            {task.description && (
              <div className="text-xs text-muted-foreground truncate">
                {task.description}
              </div>
            )}
          </div>
          <div className="col-span-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
              {task.status.replace('_', ' ')}
            </span>
          </div>
          <div className="col-span-2 text-right text-muted-foreground">
            {task.last_used ? new Date(task.last_used).toLocaleDateString() : 'Never'}
          </div>
          <div className="col-span-2 text-right text-muted-foreground">
            {task.execution_duration ? formatDuration(task.execution_duration) : '0s'}
          </div>
          <div className="col-span-2 flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditTask(task)}
              className="h-6 w-6 p-0"
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteTask(task.id)}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
      
      <div className="p-3 border-t">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) setCurrentTask(null);
          setIsDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="w-full gap-1"
              onClick={() => setCurrentTask({ project_id: projectId, status: 'not_started' })}
            >
              <Plus className="h-3.5 w-3.5" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentTask?.id ? 'Edit Task' : 'New Task'}</DialogTitle>
            </DialogHeader>
            <TaskForm
              initialData={currentTask || { project_id: projectId, status: 'not_started' }}
              projects={projects}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              isSubmitting={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ConfirmDialog
        open={!!deletingTaskId}
        onOpenChange={(open) => !open && setDeletingTaskId(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete Task"
        variant="destructive"
        onConfirm={confirmDeleteTask}
      />
    </div>
  );
});

ProjectTaskListComponent.displayName = 'ProjectTaskList';

export { ProjectTaskListComponent as ProjectTaskList };
