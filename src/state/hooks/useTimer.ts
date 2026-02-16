import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTimerStore } from "../store/timerStore";
import { timerService } from "../services/timerService";
import { timeEntriesClient } from "@/api/clients/timeEntriesClient";
import { tasksRepo } from '@/data/repositories/tasksRepo';
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
        const task = await tasksRepo.getById(running.task_id);
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
    async (task?: { id: string; name: string; project_id: string }, notes?: string): Promise<boolean> => {
      if (!task) return false;
      try {
        // Ensure task has today in work_dates and update usage
        await tasksRepo.addWorkDate(task.id, formatDateKey(new Date()));
        await tasksRepo.incrementUsage(task.id);
        await tasksRepo.updateLastUsed(task.id);

        const entry = await timeEntriesClient.start(task.id, notes);
        // Populate project name and color for the running timer
        const project = await projectsClient.getById(task.project_id);
        store.setRunning({
          entryId: entry.id,
          taskId: task.id,
          taskName: task.name,
          projectId: task.project_id,
          projectName: project?.name ?? '',
          projectColor: project?.color ?? '',
          startTime: entry.start_time,
        });
        setError(null);
        return true;
      } catch (err) {
        console.error('Failed to start timer:', err);
        setError('Failed to start timer');
        throw err;
      }
    },
    [queryClient]
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
      const durationSeconds = Math.max(1, Math.floor(timerService.calculateDuration(startTime)));
      const durationMinutes = Math.max(1, Math.ceil(durationSeconds / 60));
      const parsedStartMs = Date.parse(
        (startTime.includes(" ") && !startTime.includes("T") ? startTime.replace(" ", "T") : startTime).replace(
          /\+00$/,
          "+00:00"
        )
      );
      const nowMs = Date.now();
      console.log('[useTimer] Stopping timer', {
        taskId,
        entryId,
        durationSeconds,
        durationMinutes,
        parsedStartMs,
        nowMs,
        diffSeconds: Number.isFinite(parsedStartMs) ? Math.floor((nowMs - parsedStartMs) / 1000) : null,
        startTime: new Date(startTime).toISOString()
      });
      
      // Clear the running state immediately to prevent double-clicks
      useTimerStore.getState().clearRunning();
      
      // Stop the time entry
      console.log('[useTimer] Stopping time entry', { entryId, durationSeconds, durationMinutes });
      await timeEntriesClient.stop(entryId, durationMinutes);
      
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
