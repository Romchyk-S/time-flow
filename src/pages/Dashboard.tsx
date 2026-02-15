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
import { todayStart, dayEnd } from "@/state/utils/dateUtils";
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
      // Get all tasks with their projects
      const tasks = await tasksClient.getAll();
      
      // Filter tasks that were worked on today or have time entries today
      const taskIdsFromToday = new Set(
        (todayEntries.data ?? []).map(entry => (entry as { task_id: string }).task_id)
      );
      
      return tasks.filter(task => 
        taskIdsFromToday.has(task.id) || 
        (task.last_used && new Date(task.last_used) >= new Date(todayStartStr))
      );
    },
    enabled: !!todayEntries.data,
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
                <div className="flex items-center gap-2">
                  <TimerDisplay
                    isRunning={true}
                    elapsedTime={elapsed}
                    taskName={taskName}
                    projectName={projectName}
                    projectColor={projectColor}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={stopTimer}
                    className="gap-1.5"
                  >
                    <Square className="h-4 w-4" />
                    Stop
                  </Button>
                </div>
              ) : (
                <div className={!selectedProject || !taskNameInput.trim() ? 'opacity-50' : ''}>
                  <StartTaskButton
                    task={{
                      id: '', // Will be created
                      name: taskNameInput.trim(),
                      project_id: selectedProject?.id || '',
                      project: selectedProject ? {
                        ...selectedProject,
                        // Ensure all required fields are present
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
                    size="sm"
                    className="min-w-[80px]"
                  >
                    Start
                  </StartTaskButton>
                </div>
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
