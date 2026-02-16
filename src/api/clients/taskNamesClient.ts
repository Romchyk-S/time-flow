import { taskNamesRepo } from '@/data/repositories/taskNamesRepo';
import type { TaskName } from '@/types';

export const taskNamesClient = {
  async searchByProject(
    projectId: string,
    options?: { searchTerm?: string; limit?: number }
  ): Promise<TaskName[]> {
    console.log('[taskNamesClient.searchByProject] called', {
      projectId,
      searchTerm: options?.searchTerm,
      limit: options?.limit,
    });
    return taskNamesRepo.searchByProject(projectId, options);
  },

  async upsert(projectId: string, name: string): Promise<void> {
    console.log('[taskNamesClient.upsert] called', { projectId, name });
    return taskNamesRepo.upsert(projectId, name);
  },
};
