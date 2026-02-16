import type { Project } from "@/types";
import { projectsRepo } from '@/data/repositories/projectsRepo';

export const projectsClient = {
  async getAll(): Promise<Project[]> {
    return projectsRepo.getAll();
  },

  async getById(id: string): Promise<Project | null> {
    return projectsRepo.getById(id);
  },

  async create(input: { name: string; color: string }): Promise<Project> {
    return projectsRepo.create(input);
  },

  async update(id: string, updates: Partial<Pick<Project, 'name' | 'color'>>): Promise<Project> {
    return projectsRepo.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    return projectsRepo.delete(id);
  },
};
