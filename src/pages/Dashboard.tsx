import { useState, useCallback, useEffect } from "react";
import { Clock, ListTodo, FolderKanban, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTimer } from "@/state/hooks/useTimer";
import { useProjects } from "@/state/hooks/useProjects";
import { useAutocomplete } from "@/state/hooks/useAutocomplete";
import { useTimeEntriesForDay } from "@/state/hooks/useTimeEntries";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { TaskInput } from "@/components/timer/TaskInput";
import { ProjectSelect } from "@/components/timer/ProjectSelect";
import { formatDurationLong } from "@/state/utils/timeUtils";
import { todayStart, dayEnd } from "@/state/utils/dateUtils";
import { useQuery } from "@tanstack/react-query";
import { timeEntriesClient } from "@/api/clients/timeEntriesClient";

const Dashboard = () => {
  const { projects } = useProjects();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [taskNameInput, setTaskNameInput] = useState("");
  const { suggestions, fetchSuggestions } = useAutocomplete(projectId);
  const {
    isRunning,
    elapsed,
    taskName,
    projectName,
    projectColor,
    startTimer,
    stopTimer,
    error,
  } = useTimer();

  const selectedProject = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (projectId) fetchSuggestions(taskNameInput);
  }, [projectId, taskNameInput, fetchSuggestions]);

  const handleStart = useCallback(() => {
    if (!selectedProject) return;
    startTimer(taskNameInput, selectedProject);
  }, [selectedProject, taskNameInput, startTimer]);

  const handleStop = useCallback(() => {
    stopTimer();
  }, [stopTimer]);

  const handleSelectSuggestion = useCallback((name: string) => {
    setTaskNameInput(name);
  }, []);

  const todayStartStr = todayStart();
  const todayEndStr = dayEnd(new Date());
  const todayEntries = useQuery({
    queryKey: ["time-entries-day", todayStartStr],
    queryFn: () => timeEntriesClient.getEntriesForDay(todayStartStr, todayEndStr),
  });
  const todaySeconds = (todayEntries.data ?? []).reduce((s, e) => s + (e.duration ?? 0), 0);

  const weekStart = new Date();
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEntries = useQuery({
    queryKey: ["time-entries-range", weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: () =>
      timeEntriesClient.getByDateRange(weekStart.toISOString(), weekEnd.toISOString()),
  });
  const weekSeconds = (weekEntries.data ?? []).reduce((s, e) => s + (e.duration ?? 0), 0);

  const taskCount = new Set((todayEntries.data ?? []).map((e) => (e as { task_id: string }).task_id)).size;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground">Track time and see your overview.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Project</label>
              <ProjectSelect
                projects={projects}
                value={projectId}
                onValueChange={setProjectId}
                placeholder="Select project"
                disabled={isRunning}
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label className="text-xs text-muted-foreground">Task</label>
              <TaskInput
                value={taskNameInput}
                onChange={setTaskNameInput}
                suggestions={suggestions}
                onSelectSuggestion={handleSelectSuggestion}
                disabled={isRunning}
                placeholder="Task name..."
              />
            </div>
            <div className="flex items-end gap-2">
              {isRunning ? (
                <>
                  <TimerDisplay
                    isRunning={true}
                    elapsedTime={elapsed}
                    taskName={taskName}
                    projectName={projectName}
                    projectColor={projectColor}
                  />
                  <TimerControls isRunning onStart={() => {}} onStop={handleStop} />
                </>
              ) : (
                <TimerControls
                  isRunning={false}
                  onStart={handleStart}
                  onStop={handleStop}
                  disabled={!selectedProject || !taskNameInput.trim()}
                />
              )}
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDurationLong(todaySeconds)}</div>
            <p className="text-xs text-muted-foreground">
              {todaySeconds > 0 ? "Time tracked today" : "No time tracked today"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks Today</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCount}</div>
            <p className="text-xs text-muted-foreground">
              {taskCount > 0 ? "Tasks with time today" : "No tasks yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              {projects.length > 0 ? "Projects" : "No projects yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDurationLong(weekSeconds)}</div>
            <p className="text-xs text-muted-foreground">
              {weekSeconds > 0 ? "Time this week" : "No time this week"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {todayEntries.data && todayEntries.data.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {(todayEntries.data as { start_time: string; duration: number; task?: { name: string; project?: { name: string } } }[]).slice(0, 5).map((e) => (
                <li key={e.start_time} className="flex justify-between">
                  <span>
                    {(e as { task?: { name: string; project?: { name: string } } }).task?.name ?? "—"} · {(e as { task?: { project?: { name: string } } }).task?.project?.name ?? "—"}
                  </span>
                  <span className="text-muted-foreground">{formatDurationLong(e.duration ?? 0)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No recent activity. Start tracking time on a task to see it here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
