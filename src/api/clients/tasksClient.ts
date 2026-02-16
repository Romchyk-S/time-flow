import { tasksRepo } from '@/data/repositories/tasksRepo';
import type { Task, TaskStatus } from '@/types';

export const tasksClient = {
  async getAll(): Promise<Task[]> {
    return tasksRepo.getAll();
  },

  async getById(id: string): Promise<Task | null> {
    return tasksRepo.getById(id);
  },

  async create(input: {
    name: string;
    project_id: string;
    description?: string | null;
    status?: TaskStatus;
    work_dates?: string[] | null;
    is_active?: boolean;
    usage_count?: number;
    last_used?: string | null;
    total_duration?: number;
  }): Promise<Task> {
    return tasksRepo.create(input);
  },

  async update(id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task> {
    return tasksRepo.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    return tasksRepo.delete(id);
  },

  async setStatus(id: string, status: TaskStatus): Promise<void> {
    return tasksRepo.setStatus(id, status);
  },

  async incrementUsage(id: string): Promise<void> {
    return tasksRepo.incrementUsage(id);
  },

  async updateLastUsed(id: string): Promise<void> {
    return tasksRepo.updateLastUsed(id);
  },

  async findByNameAndProject(name: string, projectId: string): Promise<Task | null> {
    return tasksRepo.findByNameAndProject(name, projectId);
  },

  async getNameSuggestionsByProject(
    projectId: string,
    options?: { searchTerm?: string; limit?: number }
  ): Promise<string[]> {
    return tasksRepo.getNameSuggestionsByProject(projectId, options);
  },

  async getByProject(
    projectId: string,
    options?: { isActive?: boolean; searchTerm?: string; limit?: number }
  ): Promise<Task[]> {
    const tasks = await tasksRepo.getAll();
    let filtered = tasks;
    if (options?.isActive !== undefined) {
      filtered = options.isActive
        ? filtered.filter(t => t.status !== 'completed')
        : filtered.filter(t => t.status === 'completed');
    }
    if (options?.searchTerm?.trim()) {
      filtered = filtered.filter(t => t.name.toLowerCase().includes(options.searchTerm.toLowerCase()));
    }
    const limited = options?.limit ? filtered.slice(0, options.limit) : filtered;
    return limited;
  },

  async getRecentActivity(input: {
    dateKeys: string[];
    limit: number;
    includeCompleted: boolean;
  }): Promise<any[]> {
    return tasksRepo.getRecentActivity(input);
  },
};
