import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Pencil, Trash2 } from 'lucide-react';
import { useTimeEntriesForDay } from '@/state/hooks/useTimeEntries';
import { formatDuration, parseDurationToMinutes, minutesToDurationInput } from '@/state/utils/timeUtils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
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
import { EntryGroupByProject } from '@/components/entries/EntryGroupByProject';
import { useToast } from '@/components/ui/use-toast';
import { timeEntriesClient } from '@/api/clients/timeEntriesClient';
import { useQueryClient } from '@tanstack/react-query';
import { tasksClient } from '@/api/clients/tasksClient';
import { useProjects } from '@/state/hooks/useProjects';
import type { Project, TaskStatus } from '@/types';

const formatDateDisplay = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export default function TimeEntriesPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [groupByProject, setGroupByProject] = useState(true);
  const { toast } = useToast();
  const { entries = [], isLoading, refetch } = useTimeEntriesForDay(selectedDate);
  const queryClient = useQueryClient();
  const { data: projects = [] } = useProjects();

  // Editing state
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingDurationValue, setEditingDurationValue] = useState('');

  // Transform entries to groups (if grouped) or flat list
  const groups = groupByProject
    ? Object.values(
        entries.reduce((acc, entry) => {
          const proj = entry.task?.project;
          if (!proj) return acc;
          const key = proj.id;
          if (!acc[key]) {
            acc[key] = {
              project: {
                id: proj.id,
                name: proj.name,
                color: proj.color,
              },
              taskCount: 0,
              totalMinutes: 0,
              entries: [],
            };
          }
          acc[key].taskCount += 1;
          acc[key].totalMinutes += entry.duration ?? 0;
          acc[key].entries.push({
            id: entry.id,
            taskId: entry.task_id,
            taskName: entry.task?.name ?? '',
            projectId: proj.id,
            projectName: proj.name,
            projectColor: proj.color,
            status: (entry.task?.status ?? 'not_started') as TaskStatus | undefined,
            duration: entry.duration ?? 0,
            startTime: entry.start_time,
            endTime: entry.end_time,
            isRunning: entry.end_time === null,
          });
          return acc;
        }, {} as Record<string, any>)
      )
    : [];

  // Handlers
  const handleEditTaskName = async (taskId: string, name: string) => {
    try {
      await tasksClient.update(taskId, { name });
      await refetch();
      toast({ title: 'Task name updated', description: name });
    } catch (error) {
      console.error('Failed to update task name:', error);
      toast({ title: 'Error', description: 'Failed to update task name', variant: 'destructive' });
    }
  };

  const handleEditProject = async (taskId: string, projectId: string) => {
    try {
      await tasksClient.update(taskId, { project_id: projectId });
      await refetch();
      toast({ title: 'Task project updated' });
    } catch (error) {
      console.error('Failed to update task project:', error);
      toast({ title: 'Error', description: 'Failed to update task project', variant: 'destructive' });
    }
  };

  const handleEditStatus = async (taskId: string, status: string) => {
    try {
      await tasksClient.update(taskId, { status });
      await refetch();
      toast({ title: 'Task status updated' });
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast({ title: 'Error', description: 'Failed to update task status', variant: 'destructive' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await tasksClient.delete(taskId);
      await refetch();
      toast({ title: 'Task deleted' });
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast({ title: 'Error', description: 'Failed to delete task', variant: 'destructive' });
    }
  };

  const handleStartEditDuration = (entryId: string, currentMinutes: number) => {
    setEditingEntryId(entryId);
    setEditingDurationValue(minutesToDurationInput(currentMinutes));
  };

  const handleSaveDuration = async () => {
    if (!editingEntryId) return;
    const minutes = parseDurationToMinutes(editingDurationValue);
    if (minutes < 0) {
      toast({ title: 'Invalid duration', description: 'Enter a valid H:MM duration', variant: 'destructive' });
      return;
    }
    try {
      await timeEntriesClient.update(editingEntryId, { duration: minutes });
      await refetch();
      toast({ title: 'Duration updated' });
    } catch (error) {
      console.error('Failed to update duration:', error);
      toast({ title: 'Error', description: 'Failed to update duration', variant: 'destructive' });
    } finally {
      setEditingEntryId(null);
      setEditingDurationValue('');
    }
  };

  const handleCancelEditDuration = () => {
    setEditingEntryId(null);
    setEditingDurationValue('');
  };

  const handleDurationChange = (value: string) => {
    setEditingDurationValue(value);
  };

  // Date navigation
  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'not_started' as TaskStatus, label: 'Not started' },
    { value: 'in_progress' as TaskStatus, label: 'In progress' },
    { value: 'in_review' as TaskStatus, label: 'In review' },
    { value: 'completed' as TaskStatus, label: 'Completed' },
    { value: 'on_hold' as TaskStatus, label: 'On hold' },
    { value: 'blocked' as TaskStatus, label: 'Blocked' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Time Entries</h2>
          <p className="text-muted-foreground">
            {isToday(selectedDate)
              ? "Today's entries"
              : `Entries for ${format(selectedDate, 'EEEE, MMMM d, yyyy')}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGroupByProject(!groupByProject)}
          >
            {groupByProject ? 'Ungroup' : 'Group by project'}
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigateDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <CalendarIcon className="h-4 w-4" />
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
            <Button variant="ghost" size="sm" onClick={() => navigateDate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No entries for this day</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start a timer to see entries here
          </p>
        </div>
      ) : groupByProject ? (
        <EntryGroupByProject
          groups={groups}
          runningTaskId={null}
          onEditTaskName={handleEditTaskName}
          onEditProject={handleEditProject}
          onEditDuration={handleSaveDuration}
          onEditStatus={handleEditStatus}
          onDeleteTask={handleDeleteTask}
          editingEntryId={editingEntryId}
          editingDurationValue={editingDurationValue}
          onStartEditDuration={handleStartEditDuration}
          onDurationChange={handleDurationChange}
          onSaveDuration={handleSaveDuration}
          onCancelEditDuration={handleCancelEditDuration}
          statusOptions={statusOptions}
          projects={projects}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => {
            const task = entry.task;
            const proj = task?.project;
            const timeRange = entry.end_time
              ? `${new Date(entry.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(entry.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Running...';
            return (
              <div key={entry.id} className="relative group h-full w-full rounded-lg border bg-card p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {proj && (
                      <span
                        className="inline-block w-3 h-3 rounded-full border-2"
                        style={{ backgroundColor: proj.color, borderColor: proj.color }}
                      />
                    )}
                    <span className="font-medium">{task?.name ?? 'Unknown task'}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        const minutes = parseDurationToMinutes(prompt('Edit duration (H:MM):', minutesToDurationInput(entry.duration ?? 0)));
                        if (!isNaN(minutes) && minutes >= 0) {
                          timeEntriesClient.update(entry.id, { duration: minutes }).then(() => refetch());
                        }
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-700"
                      onClick={() => {
                        if (confirm('Delete this entry?')) {
                          timeEntriesClient.delete(entry.id).then(() => refetch());
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div>Project: {proj?.name ?? 'None'}</div>
                  <div>Status: {(entry.task?.status ?? 'not_started') as TaskStatus | undefined}</div>
                  <div>Duration: {formatDuration(entry.duration ?? 0)}</div>
                  <div>Time: {timeRange}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
