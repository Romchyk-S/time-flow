import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Trash2, Pencil } from 'lucide-react';
import { useTimeEntriesForDay } from '@/state/hooks/useTimeEntries';
import { formatDuration } from '@/state/utils/timeUtils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { timeEntriesClient } from '@/api/clients/timeEntriesClient';
import type { Project } from '@/types';

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

  const runningTaskId = entries.find((e) => e.end_time === null)?.task_id ?? null;

  const totalMinutesForDay = entries.reduce((s, e) => s + (e.duration ?? 0), 0);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<null | {
    id: string;
    taskName: string;
    projectName: string;
    projectColor: string;
    startTime: string;
    endTime: string | null;
  }>(null);

  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  const groups = useMemo(() => {
    if (!groupByProject) return [] as { project: Project; taskCount: number; totalMinutes: number; entries: any[] }[];

    const grouped = entries.reduce((acc, entry) => {
      const proj = entry.task?.project;
      if (!proj) return acc;
      const key = proj.id;
      if (!acc[key]) {
        acc[key] = {
          project: {
            id: proj.id,
            name: proj.name,
            description: null,
            color: proj.color,
            created_at: '',
            updated_at: '',
          } as Project,
          taskIds: new Set<string>(),
          totalMinutes: 0,
          entries: [],
        };
      }

      acc[key].taskIds.add(entry.task_id);
      acc[key].totalMinutes += entry.duration ?? 0;
      acc[key].entries.push({
        id: entry.id,
        taskId: entry.task_id,
        taskName: entry.task?.name ?? '',
        projectName: proj.name,
        projectColor: proj.color,
        duration: entry.duration ?? 0,
        startTime: entry.start_time,
        endTime: entry.end_time,
        isRunning: entry.end_time === null,
      });

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((g: any) => ({
      project: g.project as Project,
      taskCount: (g.taskIds as Set<string>).size,
      totalMinutes: g.totalMinutes as number,
      entries: g.entries as any[],
    }));
  }, [entries, groupByProject]);

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Delete this time entry?')) return;
    try {
      await timeEntriesClient.delete(entryId);
      await refetch();
      toast({ title: 'Entry deleted' });
    } catch (error) {
      console.error('Failed to delete entry:', error);
      toast({ title: 'Error', description: 'Failed to delete entry', variant: 'destructive' });
    }
  };

  const openEditEntryDialog = (row: {
    id: string;
    taskName: string;
    projectName: string;
    projectColor: string;
    startTime: string;
    endTime: string | null;
  }) => {
    setEditingEntry(row);
    const start = new Date(row.startTime);
    const end = row.endTime ? new Date(row.endTime) : new Date();
    const startStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
    const endStr = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
    setEditStart(startStr);
    setEditEnd(endStr);
    setEditDialogOpen(true);
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
      await refetch();
      toast({ title: 'Entry updated' });
      setEditDialogOpen(false);
      setEditingEntry(null);
    } catch (error) {
      console.error('Failed to update entry:', error);
      toast({ title: 'Error', description: 'Failed to update entry', variant: 'destructive' });
    }
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
          <p className="text-sm text-muted-foreground">Total: {formatDuration(totalMinutesForDay)}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="relative inline-flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={groupByProject}
              onChange={(e) => setGroupByProject(e.target.checked)}
              aria-label="Group by project"
            />
            <div className="peer h-7 w-12 rounded-full bg-muted ring-offset-1 transition-colors duration-200 peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-ring" />
            <span className="dot absolute top-1 left-1 h-5 w-5 rounded-full bg-background border transition-transform duration-200 ease-in-out peer-checked:translate-x-5" />
            <span className="text-muted-foreground select-none">Group by project</span>
          </label>
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
        <div className="space-y-4">
          {groups.map((g) => (
            <div
              key={g.project.id}
              className="rounded-lg border bg-card"
              style={{ borderColor: `${g.project.color}33` }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: `${g.project.color}22` }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-3 w-3 rounded-full border shrink-0"
                    style={{ backgroundColor: g.project.color, borderColor: `${g.project.color}66` }}
                  />
                  <span className="font-medium truncate">{g.project.name}</span>
                </div>
                <span className="text-sm text-muted-foreground shrink-0">
                  {g.taskCount} task{g.taskCount !== 1 ? 's' : ''} · {formatDuration(g.totalMinutes)}
                </span>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {g.entries.map((row: any) => {
                  const timeRange = row.endTime
                    ? `${new Date(row.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(row.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Running...';
                  const isRunning = runningTaskId === row.taskId;

                  return (
                    <div
                      key={row.id}
                      className="rounded-lg border bg-background p-3"
                      style={{ borderColor: `${row.projectColor}22` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {isRunning ? (
                              <span
                                className="h-2 w-2 rounded-full animate-pulse shrink-0"
                                style={{ backgroundColor: row.projectColor }}
                                title="Timer running"
                              />
                            ) : null}
                            <div className="font-medium truncate">{row.taskName || 'Untitled task'}</div>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono mt-1">{timeRange}</div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="font-mono text-sm">{formatDuration(row.duration)}</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              openEditEntryDialog({
                                id: row.id,
                                taskName: row.taskName,
                                projectName: row.projectName,
                                projectColor: row.projectColor,
                                startTime: row.startTime,
                                endTime: row.endTime,
                              })
                            }
                            title="Edit time"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDeleteEntry(row.id)}
                            title="Delete entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => {
            const task = entry.task;
            const proj = task?.project;
            const isRunning = entry.end_time === null;
            const timeRange = entry.end_time
              ? `${new Date(entry.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(entry.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Running...';
            return (
              <div key={entry.id} className="relative group h-full w-full rounded-lg border bg-card p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {isRunning ? (
                      <span
                        className="h-2 w-2 rounded-full animate-pulse shrink-0"
                        style={{ backgroundColor: proj?.color ?? '#16a34a' }}
                        title="Timer running"
                      />
                    ) : null}
                    {proj && (
                      <span
                        className="inline-block w-3 h-3 rounded-full border-2"
                        style={{ backgroundColor: proj.color, borderColor: proj.color }}
                      />
                    )}
                    <span className="font-medium truncate">{task?.name ?? 'Unknown task'}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        openEditEntryDialog({
                          id: entry.id,
                          taskName: task?.name ?? '',
                          projectName: proj?.name ?? '',
                          projectColor: proj?.color ?? '#000000',
                          startTime: entry.start_time,
                          endTime: entry.end_time,
                        })
                      }
                      title="Edit time"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-700"
                      onClick={() => {
                        handleDeleteEntry(entry.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-mono">{formatDuration(entry.duration ?? 0)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-mono text-xs">{timeRange}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit time entry</DialogTitle>
            <DialogDescription>
              {editingEntry ? `${editingEntry.projectName} · ${editingEntry.taskName}` : ''}
            </DialogDescription>
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
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveEditEntryDialog}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
