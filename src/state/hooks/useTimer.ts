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
  }, []);

  useEffect(() => {
    refreshRunning();
  }, [refreshRunning]);

  const startTimer = useCallback(
    async (taskNameInput: string, project: Project) => {
      setError(null);
      const name = taskNameInput.trim();
      if (!name || !project.id) {
        setError("Task name and project are required");
        return;
      }
      let task: Task | null = await tasksClient.findByNameAndProject(name, project.id);
      if (!task) {
        task = await tasksClient.create({ name, project_id: project.id });
      }
      const todayKey = formatDateKey(new Date());
      await tasksClient.addWorkDateIfNeeded(task.id, todayKey);
      const entry = await timeEntriesClient.start(task.id);
      useTimerStore.getState().setRunning({
        entryId: entry.id,
        taskId: task.id,
        taskName: task.name,
        projectId: project.id,
        projectName: project.name,
        projectColor: project.color,
        startTime: entry.start_time,
      });
    },
    []
  );

  const stopTimer = useCallback(async () => {
    if (!entryId || !startTime || !taskId) {
      console.warn('[useTimer] Missing required data to stop timer:', { entryId, startTime, taskId });
      return;
    }
    
    setError(null);
    
    try {
      console.log('[useTimer] Stopping timer for task:', taskId);
      
      // Calculate duration in milliseconds
      const durationMs = timerService.calculateDuration(startTime);
      console.log(`[useTimer] Calculated duration: ${durationMs}ms`);
      
      // Convert to seconds and ensure we have at least 1 second
      const durationSeconds = Math.max(1, Math.floor(durationMs / 1000));
      console.log(`[useTimer] Rounded to: ${durationSeconds} seconds`);
      
      try {
        // Stop the time entry with original milliseconds
        console.log('[useTimer] Stopping time entry:', { entryId, durationMs });
        await timeEntriesClient.stop(entryId, durationMs);
        
        // Update the task's execution duration (will be converted to minutes in the client)
        console.log('[useTimer] Updating task execution duration:', { taskId, durationSeconds });
        await tasksClient.updateExecutionDuration(taskId, durationSeconds);
        
        // Clear the running timer state
        useTimerStore.getState().clearRunning();
        console.log('[useTimer] Timer stopped and state cleared');
        
        // Invalidate relevant queries to refresh UI
        const invalidationPromises = [
          queryClient.invalidateQueries({ queryKey: ['tasks'] }),
          queryClient.invalidateQueries({ queryKey: ['recent-tasks'] }),
          queryClient.invalidateQueries({ queryKey: ['time-entries-day'] })
        ];
        
        await Promise.all(invalidationPromises);
        console.log('[useTimer] Cache invalidated');
        
      } catch (updateError) {
        console.error('[useTimer] Error during timer stop operations:', updateError);
        throw updateError;
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[useTimer] Failed to stop timer:', {
        error: errorMessage,
        taskId,
        entryId,
        startTime
      });
      setError('Failed to stop timer. Please try again.');
      throw error; // Re-throw to allow error handling in the component
    }
  }, [entryId, startTime, taskId]);

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
