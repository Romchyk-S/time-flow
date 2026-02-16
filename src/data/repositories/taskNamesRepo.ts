import { supabase } from '@/integrations/supabase/client';
import type { TaskName } from '@/types';

const db = supabase as any;

export const taskNamesRepo = {
  async searchByProject(
    projectId: string,
    options?: { searchTerm?: string; limit?: number }
  ): Promise<TaskName[]> {
    const limit = options?.limit ?? 10;
    const term = options?.searchTerm?.trim();

    console.log('[taskNamesRepo.searchByProject] start', {
      projectId,
      term,
      limit,
    });

    let q = db
      .from('task_names')
      .select('id, project_id, name, usage_count, last_used')
      .eq('project_id', projectId)
      .order('last_used', { ascending: false, nullsFirst: false })
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (term) {
      q = q.ilike('name', `%${term}%`);
    }

    const startedAt = performance.now();
    const { data, error } = await q;
    console.log('[taskNamesRepo.searchByProject] done', {
      projectId,
      term,
      limit,
      count: (data ?? []).length,
      elapsedMs: Math.round(performance.now() - startedAt),
      error: error ? { message: (error as any).message, code: (error as any).code } : null,
    });
    if (error) throw error;
    return (data ?? []) as TaskName[];
  },

  async upsert(projectId: string, name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) return;

    console.log('[taskNamesRepo.upsert] start', { projectId, name: trimmed });

    const { data: existing, error: existingError } = await db
      .from('task_names')
      .select('id, usage_count')
      .eq('project_id', projectId)
      .eq('name', trimmed)
      .maybeSingle();
    if (existingError) throw existingError;

    if (existing) {
      const { error } = await db
        .from('task_names')
        .update({
          usage_count: (existing.usage_count ?? 0) + 1,
          last_used: new Date().toISOString(),
        })
        .eq('id', existing.id);
      if (error) throw error;
      console.log('[taskNamesRepo.upsert] updated existing', {
        projectId,
        name: trimmed,
        id: existing.id,
        nextUsageCount: (existing.usage_count ?? 0) + 1,
      });
    } else {
      const { error } = await db
        .from('task_names')
        .insert({
          project_id: projectId,
          name: trimmed,
          usage_count: 1,
          last_used: new Date().toISOString(),
        });
      if (error) throw error;
      console.log('[taskNamesRepo.upsert] inserted new', { projectId, name: trimmed });
    }
  },
};
