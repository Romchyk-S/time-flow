import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useTasksForDate } from "@/state/hooks/useTasksForDate";
import { TasksHoverGrid } from "@/components/tasks/TasksHoverGrid";
import { formatDateKey } from "@/state/utils/dateUtils";
import { formatDuration } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { tasksClient } from "@/api/clients/tasksClient";

// Helper function to format date for display
const formatDateDisplay = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function TasksPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();
  const { data: tasks = [], isLoading, refetch } = useTasksForDate(selectedDate);
  
  // New task form state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    project_id: "",
    status: "not_started" as const,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle date navigation
  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  // Handle task creation
  const handleCreateTask = async () => {
    if (!newTask.name || !newTask.project_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await tasksClient.create({
        ...newTask,
        work_dates: [formatDateKey(selectedDate)],
      });
      
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      
      // Reset form and refetch tasks
      setNewTask({
        name: "",
        description: "",
        project_id: "",
        status: "not_started",
      });
      
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="flex items-center bg-muted/50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate(-1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium px-4">
              {formatDateDisplay(selectedDate)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate(1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="ml-2"
            >
              Today
            </Button>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="ml-2"
          >
            <Plus className="mr-2 h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      ) : (
        <TasksHoverGrid 
          tasks={tasks} 
          onTaskClick={(taskId) => {
            // Handle task click (e.g., navigate to task detail)
            console.log('Task clicked:', taskId);
          }} 
        />
      )}

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                value={newTask.name}
                onChange={(e) =>
                  setNewTask({ ...newTask, name: e.target.value })
                }
                className="col-span-3"
                placeholder="Enter task name"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="col-span-3"
                placeholder="Enter task description (optional)"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Project *
              </Label>
              <div className="col-span-3">
                <ProjectSelect
                  value={newTask.project_id}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, project_id: value })
                  }
                  placeholder="Select project"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Status
              </Label>
              <Select
                value={newTask.status}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, status: value as any })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTask}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Add missing imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProjectSelect } from "@/components/timer/ProjectSelect";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
