import type { TaskName } from '@/data/repositories/taskNamesRepo';
import { taskNamesRepo } from '@/data/repositories/taskNamesRepo';

export const taskNamesClient = {
  async searchByProject(projectId: string, options?: { searchTerm?: string; limit?: number }): Promise<TaskName[]> {
    return taskNamesRepo.searchByProject(projectId, options);
  },

  async ensureExists(projectId: string, name: string): Promise<void> {
    return taskNamesRepo.ensureExists(projectId, name);
  },

  async upsert(projectId: string, name: string): Promise<void> {
    return taskNamesRepo.upsert(projectId, name);
  },

  async deleteUnused(projectId: string): Promise<void> {
    return taskNamesRepo.deleteUnused(projectId);
  },
};
