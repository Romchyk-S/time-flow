import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTimerStore } from "../store/timerStore";
import { timerService } from "../services/timerService";
import { timeEntriesClient } from "@/api/clients/timeEntriesClient";
import { tasksClient } from "@/api/clients/tasksClient";
import { projectsClient } from "@/api/clients/projectsClient";
import { formatDateKey } from "../utils/dateUtils";
import type { Project, Task } from "@/types";

export function useTimer() {
  const queryClient = useQueryClient();
  const store = useTimerStore.getState();
  const { entryId, taskId, taskName, projectId, projectName, projectColor, startTime } = useTimerStore();
  const [error, setError] = useState<string | null>(null);

  const isRunning = !!entryId && !!startTime;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }
    const update = () => setElapsed(timerService.calculateElapsed(startTime));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const refreshRunning = useCallback(async () => {
    try {
      const running = await timeEntriesClient.getRunning();
      if (running) {
        const task = await tasksClient.getById(running.task_id);
        const project = task ? await projectsClient.getById(task.project_id) : null;
        useTimerStore.getState().setRunning({
          entryId: running.id,
          taskId: running.task_id,
          taskName: task?.name ?? null,
          projectId: task?.project_id ?? null,
          projectName: project?.name ?? null,
          projectColor: project?.color ?? null,
          startTime: running.start_time,
        });
      } else {
        useTimerStore.getState().clearRunning();
      }
    } catch (error) {
      console.error('Error refreshing running timer:', error);
      useTimerStore.getState().clearRunning();
    }
  }, []);

  useEffect(() => {
    refreshRunning();
  }, [refreshRunning]);

  const startTimer = useCallback(
    async (taskNameInput: string, project: Project) => {
      setError(null);
      const name = taskNameInput.trim();
      
      try {
        if (!name || !project?.id) {
          throw new Error("Task name and project are required");
        }

        console.log('[useTimer] Starting timer for task:', { name, projectId: project.id });
        
        // Find or create task
        let task: Task | null = null;
        try {
          task = await tasksClient.findByNameAndProject(name, project.id);
          if (!task) {
            console.log('[useTimer] Task not found, creating new task');
            task = await tasksClient.create({ 
              name, 
              project_id: project.id,
              work_dates: [formatDateKey(new Date())]
            });
            // Update status separately since it's not in the create type
            await tasksClient.update(task.id, { status: 'in_progress' });
          }
        } catch (taskError) {
          console.error('[useTimer] Error finding/creating task:', taskError);
          throw new Error('Failed to find or create task');
        }

        try {
          // Ensure work date is added
          const todayKey = formatDateKey(new Date());
          await tasksClient.addWorkDateIfNeeded(task.id, todayKey);
          
          // Start time entry
          const entry = await timeEntriesClient.start(task.id);
          console.log('[useTimer] Time entry created:', entry.id);
          
          // Update store
          useTimerStore.getState().setRunning({
            entryId: entry.id,
            taskId: task.id,
            taskName: task.name,
            projectId: project.id,
            projectName: project.name,
            projectColor: project.color,
            startTime: entry.start_time,
          });
          
          return true;
          
        } catch (entryError) {
          console.error('[useTimer] Error starting time entry:', entryError);
          throw new Error('Failed to start time entry');
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to start timer';
        console.error('[useTimer] Error in startTimer:', { error, name, projectId: project?.id });
        setError(errorMessage);
        return false;
      }
    },
    []
  );

  const stopTimer = useCallback(async () => {
    console.log('[useTimer] stopTimer called', { entryId, startTime, taskId });
    
    // Validate required data
    if (!entryId || !startTime || !taskId) {
      const errorMsg = 'Missing required data to stop timer';
      console.warn('[useTimer]', errorMsg, { entryId, startTime, taskId });
      setError(errorMsg);
      return false;
    }
    
    setError(null);
    
    try {
      // Calculate duration
      const durationMs = timerService.calculateDuration(startTime);
      const durationSeconds = Math.max(1, Math.floor(durationMs / 1000));
      const durationMinutes = Math.max(1, Math.ceil(durationMs / 60000));
      console.log('[useTimer] Stopping timer', {
        taskId,
        entryId,
        durationMs,
        durationSeconds,
        durationMinutes,
        startTime: new Date(startTime).toISOString()
      });
      
      // Clear the running state immediately to prevent double-clicks
      useTimerStore.getState().clearRunning();
      
      // Stop the time entry
      console.log('[useTimer] Stopping time entry', { entryId, durationMs });
      await timeEntriesClient.stop(entryId, durationMinutes);
      
      // Update task's execution duration
      console.log('[useTimer] Updating task execution duration', { taskId, durationSeconds });
      await tasksClient.updateExecutionDuration(taskId, durationSeconds);
      
      // Invalidate relevant queries
      console.log('[useTimer] Invalidating queries');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['recent-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['time-entries-day'] }),
        queryClient.invalidateQueries({ queryKey: ['time-entries-week'] }),
        queryClient.invalidateQueries({ queryKey: ['time-entries-range'] }),
      ]);
      
      console.log('[useTimer] Timer stopped successfully');
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error stopping timer';
      console.error('[useTimer] Error stopping timer:', {
        error: errorMessage,
        taskId,
        entryId,
        startTime,
        originalError: error
      });
      
      // Try to restore the running state if we failed to stop
      try {
        await refreshRunning();
      } catch (refreshError) {
        console.error('[useTimer] Failed to refresh running state after error:', refreshError);
      }
      
      setError(errorMessage);
      return false;
    }
  }, [entryId, startTime, taskId, queryClient]);

  return {
    isRunning,
    elapsed,
    entryId,
    taskId,
    taskName,
    projectId,
    projectName,
    projectColor,
    startTime,
    startTimer,
    stopTimer,
    refreshRunning,
    error,
    setError,
  };
}
