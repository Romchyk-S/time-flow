import { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListTodo, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Project } from "@/types";
import { useTimeEntriesForDay } from "@/state/hooks/useTimeEntries";
import { useTasksForDate } from "@/state/hooks/useTasksForDate";
import { useProjects } from "@/state/hooks/useProjects";
import { useTimer } from "@/state/hooks/useTimer";
import { useInvalidateTimeEntries } from "@/state/hooks/useTimeEntries";
import { EntryGroupByProject, type EntryRow } from "@/components/entries/EntryGroupByProject";
import { dayStart, formatDateKey, prevDay, nextDay, isSameDay, getTasksPageDateRange } from "@/state/utils/dateUtils";
import { parseDurationToSeconds } from "@/state/utils/timeUtils";
import { tasksClient } from "@/api/clients/tasksClient";
import { timeEntriesClient } from "@/api/clients/timeEntriesClient";
import type { TaskStatus } from "@/types";
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
import { Badge } from "@/components/ui/badge";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "paused", label: "Paused" },
  { value: "in_review", label: "In review" },
  { value: "completed", label: "Completed" },
];

export default function Tasks() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const dayStartStr = dayStart(selectedDate);
  const { entries, refetch } = useTimeEntriesForDay(selectedDate);
  const { data: tasksForDate = [], isLoading: isLoadingTasks } = useTasksForDate(selectedDate);
  const { projects } = useProjects();

  // Debug logging
  useEffect(() => {
    console.log('Entries:', entries);
    console.log('Tasks for date:', tasksForDate);
    console.log('Projects:', projects);
  }, [entries, tasksForDate, projects]);
  const { taskId: runningTaskId } = useTimer();
  const invalidate = useInvalidateTimeEntries();

  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingDurationValue, setEditingDurationValue] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskProjectId, setNewTaskProjectId] = useState<string | null>(null);
  const [newTaskWorkDates, setNewTaskWorkDates] = useState<string[]>(() => [formatDateKey(new Date())]);
  const [newTaskWorkDateInput, setNewTaskWorkDateInput] = useState("");

  // Create a map of task IDs to their time entries for quick lookup
  const taskTimeEntries = useMemo(() => {
    const map = new Map<string, typeof entries[number]>();
    for (const entry of entries) {
      if (entry.task_id) {
        map.set(entry.task_id, entry);
      }
    }
    return map;
  }, [entries]);

  // Group tasks by project and include time entry data if it exists
  const groups = useMemo(() => {
    const byProject = new Map<
      string,
      { 
        project: {
          id: string;
          name: string;
          description: string;
          color: string;
          created_at: string;
          updated_at: string;
        };
        taskIds: Set<string>; 
        totalSeconds: number; 
        entries: EntryRow[] 
      }
    >();

    // Process tasks for the selected date
    for (const task of tasksForDate) {
      // Find the project for this task
      const project: Project = projects.find(p => p.id === task.project_id) || {
        id: task.project_id,
        name: "Unknown Project",
        description: "",
        color: "#888",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Ensure all required fields are present
      const projectWithDefaults: Project = {
        id: project.id,
        name: project.name || "Unknown Project",
        description: project.description || "",
        color: project.color || "#888",
        created_at: project.created_at || new Date().toISOString(),
        updated_at: project.updated_at || new Date().toISOString()
      };
      
      if (!byProject.has(projectWithDefaults.id)) {
        byProject.set(projectWithDefaults.id, {
          project: projectWithDefaults,
          taskIds: new Set(),
          totalSeconds: 0,
          entries: [],
        });
      }
      
      const g = byProject.get(projectWithDefaults.id)!;
      const timeEntry = taskTimeEntries.get(task.id);
      
      g.taskIds.add(task.id);
      const duration = timeEntry?.duration ?? 0;
      g.totalSeconds += duration;
      
      g.entries.push({
        id: timeEntry?.id ?? `task-${task.id}`,
        taskId: task.id,
        taskName: task.name,
        projectId: project.id,
        projectName: project.name,
        projectColor: project.color,
        status: task.status ?? "not_started",
        duration: duration,
        startTime: timeEntry?.start_time ?? null,
        endTime: timeEntry?.end_time ?? null,
        isRunning: runningTaskId === task.id,
      });
    }

    // Also include any time entries that don't have corresponding tasks in tasksForDate
    for (const entry of entries) {
      if (!entry.task_id || !entry.task) continue;
      
      const task = entry.task;
      const projectFromTask = task.project;
      const proj: Project = projectFromTask 
        ? {
            id: projectFromTask.id,
            name: projectFromTask.name || "Unknown Project",
            description: projectFromTask.description || "",
            color: projectFromTask.color || "#888",
            created_at: projectFromTask.created_at || new Date().toISOString(),
            updated_at: projectFromTask.updated_at || new Date().toISOString()
          }
        : {
            id: task.project_id,
            name: "Unknown Project",
            description: "",
            color: "#888",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
      
      // Skip if we've already processed this task from tasksForDate
      const taskAlreadyProcessed = tasksForDate.some(t => t.id === task.id);
      if (taskAlreadyProcessed) continue;
      
      if (!byProject.has(proj.id)) {
        byProject.set(proj.id, {
          project: proj,
          taskIds: new Set(),
          totalSeconds: 0,
          entries: [],
        });
      }
      
      const g = byProject.get(proj.id)!;
      if (!g.taskIds.has(task.id)) {
        g.taskIds.add(task.id);
        g.totalSeconds += entry.duration ?? 0;
        
        g.entries.push({
          id: entry.id,
          taskId: task.id,
          taskName: task.name,
          projectId: proj.id,
          projectName: proj.name,
          projectColor: proj.color,
          status: task.status ?? "not_started",
          duration: entry.duration ?? 0,
          startTime: entry.start_time,
          endTime: entry.end_time,
          isRunning: runningTaskId === task.id,
        });
      }
    }

    return Array.from(byProject.values()).map((g) => ({
      project: g.project,
      taskCount: g.taskIds.size,
      totalSeconds: g.totalSeconds,
      entries: g.entries,
    }));
  }, [entries, runningTaskId, tasksForDate, taskTimeEntries]);

  const { rangeStart, rangeEnd } = useMemo(getTasksPageDateRange, []);

  const canGoPrev = useMemo(() => formatDateKey(selectedDate) > formatDateKey(rangeStart), [selectedDate, rangeStart]);
  const canGoNext = useMemo(() => formatDateKey(selectedDate) < formatDateKey(rangeEnd), [selectedDate, rangeEnd]);

  const handleEditTaskName = useCallback(
    async (taskId: string, name: string) => {
      if (!name.trim()) return;
      await tasksClient.update(taskId, { name: name.trim() });
      invalidate();
      refetch();
    },
    [invalidate, refetch]
  );

  const handleEditProject = useCallback(
    async (taskId: string, projectId: string) => {
      await tasksClient.update(taskId, { project_id: projectId });
      invalidate();
      refetch();
    },
    [invalidate, refetch]
  );

  const handleEditDuration = useCallback(
    async (entryId: string, durationSeconds: number) => {
      await timeEntriesClient.update(entryId, { duration: durationSeconds });
      setEditingEntryId(null);
      invalidate();
      refetch();
    },
    [invalidate, refetch]
  );

  const handleEditStatus = useCallback(
    async (taskId: string, status: string) => {
      await tasksClient.setStatus(taskId, status as TaskStatus);
      invalidate();
      refetch();
    },
    [invalidate, refetch]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (!window.confirm("Delete this task and all its time entries?")) return;
      await tasksClient.delete(taskId);
      invalidate();
      refetch();
    },
    [invalidate, refetch]
  );

  const handleStartEditDuration = useCallback((entryId: string, currentSeconds: number) => {
    setEditingEntryId(entryId);
    const h = Math.floor(currentSeconds / 3600);
    const m = Math.floor((currentSeconds % 3600) / 60);
    setEditingDurationValue(`${h}:${m.toString().padStart(2, "0")}`);
  }, []);

  const handleDurationChange = useCallback((value: string) => {
    setEditingDurationValue(value);
  }, []);

  const handleSaveDuration = useCallback(() => {
    if (!editingEntryId) return;
    const sec = parseDurationToSeconds(editingDurationValue);
    if (sec >= 0) handleEditDuration(editingEntryId, sec);
  }, [editingEntryId, editingDurationValue, handleEditDuration]);

  const handleCancelEditDuration = useCallback(() => {
    setEditingEntryId(null);
  }, []);

  const handleCreateTask = useCallback(async () => {
    if (!newTaskName.trim() || !newTaskProjectId) return;
    await tasksClient.create({
      name: newTaskName.trim(),
      project_id: newTaskProjectId,
      description: newTaskDescription.trim() || undefined,
      work_dates: newTaskWorkDates.length ? newTaskWorkDates : [formatDateKey(new Date())],
    });
    setNewTaskName("");
    setNewTaskDescription("");
    setNewTaskProjectId(null);
    setNewTaskWorkDates([formatDateKey(new Date())]);
    setCreateOpen(false);
    invalidate();
    refetch();
  }, [newTaskName, newTaskDescription, newTaskProjectId, newTaskWorkDates, invalidate, refetch]);

  const openCreateDialog = useCallback(() => {
    setNewTaskWorkDates([formatDateKey(new Date())]);
    setCreateOpen(true);
  }, []);

  const addWorkDate = useCallback(() => {
    const d = newTaskWorkDateInput.trim().slice(0, 10);
    if (!d || newTaskWorkDates.includes(d)) return;
    setNewTaskWorkDates((prev) => [...prev, d].sort());
    setNewTaskWorkDateInput("");
  }, [newTaskWorkDateInput, newTaskWorkDates]);

  const removeWorkDate = useCallback((dateKey: string) => {
    setNewTaskWorkDates((prev) => prev.filter((d) => d !== dateKey));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">Manage and track your tasks by day.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(prevDay(selectedDate))} disabled={!canGoPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center font-medium">
            {formatDateKey(selectedDate)}
            {isSameDay(selectedDate, new Date()) && " (Today)"}
          </span>
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(nextDay(selectedDate))} disabled={!canGoNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            New task
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="py-6">
          {isLoadingTasks ? (
        <div className="text-center py-12">Loading tasks...</div>
      ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No tasks for this day</h3>
              <p className="text-sm text-muted-foreground">Time entries for the selected day will appear here, grouped by project.</p>
            </div>
          ) : (
            <EntryGroupByProject
              groups={groups}
              runningTaskId={runningTaskId}
              onEditTaskName={handleEditTaskName}
              onEditProject={handleEditProject}
              onEditDuration={handleEditDuration}
              onEditStatus={handleEditStatus}
              onDeleteTask={handleDeleteTask}
              editingEntryId={editingEntryId}
              editingDurationValue={editingDurationValue}
              onStartEditDuration={handleStartEditDuration}
              onDurationChange={handleDurationChange}
              onSaveDuration={handleSaveDuration}
              onCancelEditDuration={handleCancelEditDuration}
              statusOptions={STATUS_OPTIONS}
              projects={projects}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <ProjectSelect
                projects={projects}
                value={newTaskProjectId}
                onValueChange={setNewTaskProjectId}
                placeholder="Select project"
              />
            </div>
            <div className="space-y-2">
              <Label>Task name</Label>
              <Input
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Task name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Task description"
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Expected / work dates</Label>
              <p className="text-xs text-muted-foreground">Default is today. Add or remove dates as needed.</p>
              <div className="flex flex-wrap gap-2">
                {newTaskWorkDates.map((d) => (
                  <Badge key={d} variant="secondary" className="gap-1">
                    {d}
                    <button
                      type="button"
                      onClick={() => removeWorkDate(d)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20"
                      aria-label={`Remove ${d}`}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={newTaskWorkDateInput}
                  onChange={(e) => setNewTaskWorkDateInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addWorkDate())}
                />
                <Button type="button" variant="outline" size="sm" onClick={addWorkDate}>
                  Add date
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTask} disabled={!newTaskName.trim() || !newTaskProjectId}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
