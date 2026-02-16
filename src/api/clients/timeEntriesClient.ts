import { timeEntriesRepo } from '@/data/repositories/timeEntriesRepo';
import type { TimeEntry } from '@/types';

export const timeEntriesClient = {
  async getRunning(): Promise<TimeEntry | null> {
    return timeEntriesRepo.getRunning();
  },

  async getByTaskId(taskId: string): Promise<TimeEntry[]> {
    return timeEntriesRepo.getByTaskId(taskId);
  },

  async getLatestDurationsByTaskIds(taskIds: string[]): Promise<Record<string, number>> {
    return timeEntriesRepo.getLatestDurationsByTaskIds(taskIds);
  },

  async getByDateRange(startDate: string, endDate: string): Promise<TimeEntry[]> {
    return timeEntriesRepo.getByDateRange(startDate, endDate);
  },

  async getEntriesForDay(dayStart: string, dayEnd: string): Promise<TimeEntry[]> {
    return timeEntriesRepo.getEntriesForDay(dayStart, dayEnd);
  },

  async start(taskId: string, notes?: string): Promise<TimeEntry> {
    return timeEntriesRepo.start(taskId, notes);
  },

  async stop(id: string, durationMinutes: number): Promise<TimeEntry> {
    return timeEntriesRepo.stop(id, durationMinutes);
  },

  async update(
    id: string,
    updates: Partial<Pick<TimeEntry, 'duration' | 'notes' | 'start_time' | 'end_time'>>
  ): Promise<TimeEntry> {
    return timeEntriesRepo.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    return timeEntriesRepo.delete(id);
  },
};
