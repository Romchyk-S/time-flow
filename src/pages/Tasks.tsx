import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Loader2, Calendar as CalendarIcon, ListTodo, Pencil } from 'lucide-react';
import { useTasksForDate } from '@/state/hooks/useTasksForDate';
import { TasksHoverGrid } from '@/components/tasks/TasksHoverGrid';
import { formatDateKey } from '@/state/utils/dateUtils';
import { useToast } from '@/components/ui/use-toast';
import { tasksClient } from '@/api/clients/tasksClient';
import { useProjects } from '@/state/hooks/useProjects';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProjectSelect } from '@/components/timer/ProjectSelect';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { timeEntriesClient } from '@/api/clients/timeEntriesClient';
import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDuration } from '@/state/utils/timeUtils';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Helper function to format date for display
const formatDateDisplay = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper function to check if a date is today
const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export default function TasksPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { toast } = useToast();
  const { data: tasks = [], isLoading, refetch } = useTasksForDate(selectedDate);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle task updates
  const handleTaskUpdated = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Delete this time entry?')) return;
    try {
      await timeEntriesClient.delete(entryId);
      await taskEntriesQuery.refetch();
      await refetch();
      toast({ title: 'Entry deleted' });
    } catch (error) {
      console.error('Failed to delete entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete entry',
        variant: 'destructive',
      });
    }
  };
  const { data: projects = [] } = useProjects();

  // Task form state
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTask, setCurrentTask] = useState<{
    id?: string;
    name: string;
    description: string;
    project_id: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'blocked' | 'in_review';
    work_dates: string[];
  }>({
    name: '',
    description: '',
    project_id: '',
    status: 'not_started',
    work_dates: [formatDateKey(new Date())],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editEntryDialogOpen, setEditEntryDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<null | { id: string; startTime: string; endTime: string | null }>(
    null,
  );
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  const taskEntriesQuery = useQuery({
    queryKey: ['time-entries-by-task', currentTask.id],
    queryFn: async () => {
      if (!currentTask.id) return [];
      return timeEntriesClient.getByTaskId(currentTask.id);
    },
    enabled: isTaskDialogOpen && isEditMode && !!currentTask.id,
  });

  const openEditEntryDialog = (entry: { id: string; start_time: string; end_time: string | null }) => {
    setEditingEntry({ id: entry.id, startTime: entry.start_time, endTime: entry.end_time });
    const start = new Date(entry.start_time);
    const end = entry.end_time ? new Date(entry.end_time) : new Date();
    const startStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
    const endStr = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
    setEditStart(startStr);
    setEditEnd(endStr);
    setEditEntryDialogOpen(true);
  };

  const saveEditEntryDialog = async () => {
    if (!editingEntry) return;
    const [sh, sm] = editStart.split(':').map((v) => parseInt(v, 10));
    const [eh, em] = editEnd.split(':').map((v) => parseInt(v, 10));
    if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) {
      toast({ title: 'Invalid time', description: 'Use HH:MM', variant: 'destructive' });
      return;
    }

    const baseDate = new Date(editingEntry.startTime);
    const start = new Date(baseDate);
    start.setHours(sh, sm, 0, 0);

    const end = new Date(baseDate);
    end.setHours(eh, em, 0, 0);
    if (end.getTime() <= start.getTime()) {
      toast({ title: 'Invalid range', description: 'End must be after start', variant: 'destructive' });
      return;
    }

    const durationMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));

    try {
      await timeEntriesClient.update(editingEntry.id, {
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        duration: durationMinutes,
      });
      await taskEntriesQuery.refetch();
      await refetch();
      toast({ title: 'Entry updated' });
      setEditEntryDialogOpen(false);
      setEditingEntry(null);
    } catch (error) {
      console.error('Failed to update entry:', error);
      toast({ title: 'Error', description: 'Failed to update entry', variant: 'destructive' });
    }
  };

  // Open create task dialog
  const openCreateDialog = () => {
    setCurrentTask({
      name: '',
      description: '',
      project_id: '',
      status: 'not_started',
      work_dates: [formatDateKey(selectedDate)],
    });
    setIsEditMode(false);
    setIsTaskDialogOpen(true);
  };

  // Open edit task dialog
  const openEditDialog = (task: any) => {
    setCurrentTask({
      id: task.id,
      name: task.name,
      description: task.description || '',
      project_id: task.project_id || '',
      status: task.status || 'not_started',
      work_dates: task.work_dates || [formatDateKey(selectedDate)],
    });
    setIsEditMode(true);
    setIsTaskDialogOpen(true);
  };

  // Handle date navigation
  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  // Handle date selection from calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  // Handle task save (create or update)
  const handleSaveTask = async () => {
    if (!currentTask.name || !currentTask.project_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && currentTask.id) {
        // Update existing task
        await tasksClient.update(currentTask.id, {
          name: currentTask.name,
          description: currentTask.description,
          project_id: currentTask.project_id,
          status: currentTask.status as any, // Type assertion needed due to type mismatch
          work_dates: currentTask.work_dates,
        });
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
      } else {
        // Create new task
        await tasksClient.create({
          name: currentTask.name,
          description: currentTask.description,
          project_id: currentTask.project_id,
          status: currentTask.status,
          work_dates: [formatDateKey(selectedDate)],
        });
        toast({
          title: "Success",
          description: "Task created successfully",
        });
      }

      // Reset form and refetch tasks
      setIsTaskDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} task. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await tasksClient.delete(taskId);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Manage your daily tasks and track your progress
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-muted/50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate(-1)}
              className="h-8 w-8 p-0 hover:bg-background"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 px-3 font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate(1)}
              className="h-8 w-8 p-0 hover:bg-background"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {!isToday(selectedDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
                className="ml-1 h-8 text-sm"
              >
                Today
              </Button>
            )}
          </div>
          
          <Button
            onClick={openCreateDialog}
            className="h-8"
          >
            <Plus className="mr-2 h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">
            {isToday(selectedDate) 
              ? "Today's Tasks" 
              : `Tasks for ${format(selectedDate, 'EEEE, MMMM d, yyyy')}`}
          </h2>
          <span className="text-sm text-muted-foreground">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
        
        {isLoading || isRefreshing ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          </div>
        ) : tasks.length > 0 ? (
          <TasksHoverGrid
            tasks={tasks}
            onEditTask={(taskId) => {
              const task = tasks.find(t => t.id === taskId);
              if (task) openEditDialog(task);
            }}
            onDeleteTask={handleDeleteTask}
            onTaskUpdated={handleTaskUpdated}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
            <div className="rounded-full bg-muted p-3 mb-4">
              <ListTodo className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No tasks for this day</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating a new task
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        )}
      </div>

      {/* Task Form Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the task details below.' : 'Add a new task to your list.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                value={currentTask.name}
                onChange={(e) => setCurrentTask({...currentTask, name: e.target.value})}
                className="col-span-3"
                placeholder="Task name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={currentTask.description}
                onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                className="col-span-3"
                placeholder="Task description (optional)"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project" className="text-right">
                Project *
              </Label>
              <div className="col-span-3">
                <ProjectSelect
                  value={currentTask.project_id}
                  onValueChange={(value) => setCurrentTask({...currentTask, project_id: value})}
                  projects={projects}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={currentTask.status}
                onValueChange={(value) => setCurrentTask({...currentTask, status: value as any})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isEditMode && currentTask.id ? (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Entries</h3>
                    <span className="text-xs text-muted-foreground">
                      {taskEntriesQuery.isLoading
                        ? 'Loading...'
                        : `${(taskEntriesQuery.data ?? []).length} ${(taskEntriesQuery.data ?? []).length === 1 ? 'entry' : 'entries'}`}
                    </span>
                  </div>

                  {taskEntriesQuery.data && taskEntriesQuery.data.length > 0 ? (
                    <ScrollArea className="h-48 rounded-md border">
                      <div className="divide-y">
                        {taskEntriesQuery.data
                          .slice()
                          .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
                          .map((e) => {
                            const dateLabel = format(new Date(e.start_time), 'yyyy-MM-dd');
                            const timeRange = e.end_time
                              ? `${dateLabel} ${new Date(e.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(e.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                              : `${dateLabel} ${new Date(e.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Running...`;
                            return (
                              <div key={e.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                                <div className="min-w-0">
                                  <div className="text-xs text-muted-foreground font-mono truncate">{timeRange}</div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono text-xs">{formatDuration(e.duration ?? 0)}</span>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => openEditEntryDialog(e)}
                                    title="Edit time"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-destructive"
                                    onClick={() => handleDeleteEntry(e.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </ScrollArea>
                  ) : taskEntriesQuery.isLoading ? (
                    <div className="text-xs text-muted-foreground">Loading entries...</div>
                  ) : (
                    <div className="text-xs text-muted-foreground">No entries for this task yet.</div>
                  )}
                </div>
              </>
            ) : null}
          </div>
          <Dialog open={editEntryDialogOpen} onOpenChange={setEditEntryDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit time entry</DialogTitle>
                <DialogDescription />
              </DialogHeader>

              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start" className="text-right">Start</Label>
                  <Input
                    id="start"
                    className="col-span-3 font-mono"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    placeholder="HH:MM"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end" className="text-right">End</Label>
                  <Input
                    id="end"
                    className="col-span-3 font-mono"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    placeholder="HH:MM"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditEntryDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveEditEntryDialog}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <DialogFooter>
            {isEditMode && (
              <Button
                variant="destructive"
                onClick={() => currentTask.id && handleDeleteTask(currentTask.id)}
                disabled={isSubmitting}
                className="mr-auto"
              >
                Delete
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsTaskDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleSaveTask}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Saving...' : 'Creating...'}
                </>
              ) : isEditMode ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
