import { taskNamesRepo } from '@/data/repositories/taskNamesRepo';
import type { TaskName } from '@/types';

export const taskNamesClient = {
  async searchByProject(
    projectId: string,
    options?: { searchTerm?: string; limit?: number }
  ): Promise<TaskName[]> {
    return taskNamesRepo.searchByProject(projectId, options);
  },

  async upsert(projectId: string, name: string): Promise<void> {
    return taskNamesRepo.upsert(projectId, name);
  },
};
