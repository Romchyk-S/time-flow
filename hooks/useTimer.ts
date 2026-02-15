import { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { TimeEntry, TaskWithRelations } from '../types';

export function useTimer() {
  const [currentTask, setCurrentTask] = useState<TaskWithRelations | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [lastStoppedTime, setLastStoppedTime] = useState<Date | null>(null);

  // Load the current task and timer state from localStorage on mount
  useEffect(() => {
    const savedTimer = localStorage.getItem('currentTimer');
    if (savedTimer) {
      const { task, startTime: savedStartTime, elapsedTime: savedElapsedTime } = JSON.parse(savedTimer);
      setCurrentTask(task);
      
      if (savedStartTime) {
        setStartTime(new Date(savedStartTime));
        setIsRunning(true);
      } else {
        setElapsedTime(savedElapsedTime || 0);
      }
    }
  }, []);

  // Update the timer every second when it's running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && startTime) {
      // Calculate initial elapsed time
      const initialElapsed = Math.floor((new Date().getTime() - new Date(startTime).getTime()) / 1000);
      setElapsedTime(prevElapsed => prevElapsed + initialElapsed);
      
      // Set up interval to update elapsed time
      interval = setInterval(() => {
        setElapsedTime(prevElapsed => {
          // Save to localStorage on each update
          if (currentTask) {
            localStorage.setItem('currentTimer', JSON.stringify({
              task: currentTask,
              startTime,
              elapsedTime: prevElapsed + 1
            }));
          }
          return prevElapsed + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime, currentTask]);

  const startTimer = useCallback((task?: TaskWithRelations) => {
    if (task && task.id !== currentTask?.id) {
      // Starting a new task
      setCurrentTask(task);
      setElapsedTime(0);
      const now = new Date();
      setStartTime(now);
      setLastStoppedTime(null);
      
      // Save to localStorage
      localStorage.setItem('currentTimer', JSON.stringify({
        task,
        startTime: now.toISOString(),
        elapsedTime: 0
      }));
    } else if (currentTask) {
      // Resuming the current task
      const now = new Date();
      setStartTime(now);
      setLastStoppedTime(null);
      
      // Save to localStorage
      localStorage.setItem('currentTimer', JSON.stringify({
        task: currentTask,
        startTime: now.toISOString(),
        elapsedTime
      }));
    }
    
    setIsRunning(true);
  }, [currentTask, elapsedTime]);

  const stopTimer = useCallback(async () => {
    if (!currentTask || !startTime) return;
    
    const now = new Date();
    const finalElapsed = elapsedTime + Math.floor((now.getTime() - new Date(startTime).getTime()) / 1000);
    
    // Create a time entry
    const timeEntry: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'> = {
      task_id: currentTask.id,
      user_id: currentTask.user_id,
      start_time: startTime.toISOString(),
      end_time: now.toISOString(),
      duration: finalElapsed,
      notes: null,
    };
    
    try {
      // Here you would typically save the time entry to your database
      // await saveTimeEntry(timeEntry);
      
      // Reset the timer state
      setIsRunning(false);
      setStartTime(null);
      setLastStoppedTime(now);
      
      // Remove from localStorage
      localStorage.removeItem('currentTimer');
      
      // Update the current task with the new time entry
      setCurrentTask(prev => prev ? {
        ...prev,
        time_entries: [...(prev.time_entries || []), {
          ...timeEntry,
          id: `temp-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }],
        total_time_spent: (prev.total_time_spent || 0) + finalElapsed
      } : null);
      
      return timeEntry;
    } catch (error) {
      console.error('Failed to save time entry:', error);
      throw error;
    }
  }, [currentTask, startTime, elapsedTime]);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }, []);

  const formatDateTime = useCallback((dateString: string, formatStr: string) => {
    return format(parseISO(dateString), formatStr);
  }, []); 

  return {
    currentTask,
    isRunning,
    elapsedTime,
    startTime,
    lastStoppedTime,
    startTimer,
    stopTimer,
    formatTime,
    formatDateTime,
  };
}
