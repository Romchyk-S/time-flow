import { useCallback, useEffect, useState } from "react";
import { useTimerStore } from "../store/timerStore";
import { timerService } from "../services/timerService";
import { timeEntriesClient } from "@/api/clients/timeEntriesClient";
import { tasksClient } from "@/api/clients/tasksClient";
import { projectsClient } from "@/api/clients/projectsClient";
import { formatDateKey } from "../utils/dateUtils";
import type { Project, Task } from "@/types";

export function useTimer() {
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
    if (!entryId || !startTime || !taskId) return;
    setError(null);
    const duration = timerService.calculateDuration(startTime);
    
    try {
      // Stop the time entry
      await timeEntriesClient.stop(entryId, duration);
      
      // Update the task's execution duration
      await tasksClient.updateExecutionDuration(taskId, Math.floor(duration / 1000)); // Convert to seconds
      
      // Clear the running state
      useTimerStore.getState().clearRunning();
    } catch (error) {
      console.error('Error stopping timer:', error);
      setError('Failed to stop timer. Please try again.');
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
