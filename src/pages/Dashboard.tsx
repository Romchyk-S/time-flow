import { useState, useCallback, useEffect } from "react";
import { Clock, ListTodo, FolderKanban, TrendingUp, Clock3, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTimer } from "@/state/hooks/useTimer";
import { useProjects } from "@/state/hooks/useProjects";
import { useAutocomplete } from "@/state/hooks/useAutocomplete";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TaskInput } from "@/components/timer/TaskInput";
import { ProjectSelect } from "@/components/timer/ProjectSelect";
import { formatDurationLong } from "@/state/utils/timeUtils";
import { formatDuration } from "@/state/utils/timeUtils";
import { todayStart, dayEnd, formatDateKey, subDays } from "@/state/utils/dateUtils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { timeEntriesClient } from "@/api/clients/timeEntriesClient";
import { tasksClient } from "@/api/clients/tasksClient";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { TaskWithProject } from "@/types";
import { StartTaskButton } from "@/components/tasks/StartTaskButton";

const Dashboard = () => {
  const { projects } = useProjects();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [taskNameInput, setTaskNameInput] = useState("");
  const { suggestions, fetchSuggestions } = useAutocomplete(projectId);
  const queryClient = useQueryClient();
  const todayStartStr = todayStart();
  const todayEndStr = dayEnd(new Date());
  
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

  const handleTaskUpdated = useCallback(() => {
    // Invalidate both recent tasks and today's entries to ensure UI is up to date
    queryClient.invalidateQueries({ queryKey: ["recent-tasks"] });
    queryClient.invalidateQueries({ queryKey: ["time-entries-day", todayStartStr] });
    queryClient.invalidateQueries({ queryKey: ["time-entries-week"] });
  }, [queryClient, todayStartStr]);

  const handleStartNewTask = useCallback(async () => {
    if (!selectedProject || !taskNameInput.trim()) return;
    
    // Create a minimal task object for the StartTaskButton
    const newTask = {
      name: taskNameInput.trim(),
      project_id: selectedProject.id,
      project: selectedProject,
      status: 'not_started' as const,
      work_dates: [] as string[]
    };
    
    // Clear the input after starting
    setTaskNameInput('');
    
    return newTask;
  }, [selectedProject, taskNameInput]);

  const handleSelectSuggestion = useCallback((name: string) => {
    setTaskNameInput(name);
  }, []);

  
  const todayEntries = useQuery({
    queryKey: ["time-entries-day", todayStartStr],
    queryFn: () => timeEntriesClient.getEntriesForDay(todayStartStr, todayEndStr),
  });

  // Fetch tasks that were worked on today
  const recentTasksQuery = useQuery({
    queryKey: ["recent-tasks"],
    queryFn: async () => {
      const minTasks = 6;
      const maxDaysBack = 30;
      const now = new Date();

      const dateKeys: string[] = [];
      for (let i = 0; i <= maxDaysBack; i++) {
        dateKeys.push(formatDateKey(subDays(now, i)));
      }

      console.log(`[recent-tasks] querying overlaps for dateKeys[0]=${dateKeys[0]}.. len=${dateKeys.length}`);
      const recent = await tasksClient.getRecentActivity({
        dateKeys,
        limit: minTasks,
        includeCompleted: false,
      });

      console.log(`[recent-tasks] received count=${recent.length}`);
      const latestDurations = await timeEntriesClient.getLatestDurationsByTaskIds(recent.map((t: any) => t.id));
      return (recent as any[]).map((t) => ({
        ...(t as TaskWithProject),
        latest_duration_minutes: latestDurations[t.id] ?? null,
      })) as TaskWithProject[];
    },
    enabled: !!todayEntries.data,
  });

  const todaySeconds = (todayEntries.data ?? []).reduce((s, e) => s + ((e.duration ?? 0) * 60), 0);

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
  const weekSeconds = (weekEntries.data ?? []).reduce((s, e) => s + ((e.duration ?? 0) * 60), 0);

  const taskCount = new Set((todayEntries.data ?? []).map((e) => (e as { task_id: string }).task_id)).size;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground">Track time and see your overview.</p>
      </div>

      <Card className="overflow-visible">
        <div className="flex flex-col md:flex-row">
          {/* Left: Input controls */}
          <div className="flex-1 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Timer</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Project</label>
                <ProjectSelect
                  projects={projects}
                  value={projectId}
                  onValueChange={setProjectId}
                  placeholder="Select project"
                  disabled={isRunning}
                />
              </div>
              <div className="space-y-1.5 relative">
                <label className="text-xs font-medium text-muted-foreground">Task</label>
                <TaskInput
                  value={taskNameInput}
                  onChange={setTaskNameInput}
                  suggestions={suggestions}
                  onSelectSuggestion={handleSelectSuggestion}
                  disabled={isRunning}
                  placeholder="What are you working on?"
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {/* Right: Timer display & controls */}
          <div className={`flex flex-col items-center justify-center gap-3 p-5 min-w-[220px] border-t md:border-t-0 md:border-l transition-colors ${isRunning ? 'bg-muted/20 dark:bg-muted/10' : 'bg-muted/30 dark:bg-muted/20'}`}>
            {isRunning ? (
              <>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                    <span className="font-mono text-3xl font-bold tabular-nums tracking-tight text-foreground">
                      {formatDuration(elapsed)}
                    </span>
                  </div>
                  <div className="text-sm text-foreground w-full">
                    <div className="flex items-baseline gap-2 justify-center">
                      <span className="text-muted-foreground">Task:</span>
                      <span className="font-medium" title={taskName ?? undefined}>{taskName ?? ""}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center mt-1">
                      <span className="text-muted-foreground">Project:</span>
                      {projectName ? (
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0 border"
                            style={{ backgroundColor: projectColor ?? "#888888", borderColor: "var(--border)" }}
                          />
                          <span
                            className="text-xs font-medium rounded-full px-2.5 py-0.5 truncate max-w-[160px]"
                            style={{
                              backgroundColor: projectColor ? `${projectColor}12` : "hsl(var(--muted))",
                              border: `1px solid ${projectColor ? `${projectColor}55` : "hsl(var(--border))"}`,
                              color: "hsl(var(--foreground))",
                            }}
                            title={projectName}
                          >
                            {projectName}
                          </span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="default"
                  onClick={stopTimer}
                  className="gap-1.5 font-semibold px-6"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              </>
            ) : (
              <>
                <div className="text-center space-y-1">
                  <p className="font-mono text-3xl font-bold tabular-nums text-muted-foreground/40">0:00</p>
                  <p className="text-xs text-muted-foreground">Ready to track</p>
                </div>
                <div className={!selectedProject || !taskNameInput.trim() ? 'opacity-40 pointer-events-none' : ''}>
                  <StartTaskButton
                    task={{
                      id: '',
                      name: taskNameInput.trim(),
                      project_id: selectedProject?.id || '',
                      project: selectedProject ? {
                        ...selectedProject,
                        description: selectedProject.description || '',
                        created_at: selectedProject.created_at || new Date().toISOString(),
                        updated_at: selectedProject.updated_at || new Date().toISOString()
                      } : undefined,
                      status: 'not_started',
                      work_dates: [],
                      last_used: null
                    }}
                    onTaskUpdate={handleTaskUpdated}
                    variant="default"
                    size="default"
                    className="min-w-[100px] gap-1.5 font-semibold px-6"
                  >
                    Start
                  </StartTaskButton>
                </div>
              </>
            )}
          </div>
        </div>
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
          <CardTitle className="flex items-center gap-2">
            <Clock3 className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasksQuery.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading recent tasks...</div>
          ) : recentTasksQuery.data && recentTasksQuery.data.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {recentTasksQuery.data
                .sort((a, b) => 
                  new Date(b.last_used || 0).getTime() - new Date(a.last_used || 0).getTime()
                )
                .slice(0, 6)
                .map((task) => (
                  <RecentActivityCard 
                    key={task.id} 
                    task={task as TaskWithProject}
                    onTaskUpdated={handleTaskUpdated}
                  />
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity today.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
