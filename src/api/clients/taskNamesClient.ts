import { supabase } from '@/integrations/supabase/client';

export interface TaskName {
  id: string;
  project_id: string;
  name: string;
  usage_count: number;
  last_used: string;
}

const db = supabase as any;

export const taskNamesClient = {
  async searchByProject(projectId: string, options?: { searchTerm?: string; limit?: number }): Promise<TaskName[]> {
    let q = db
      .from('task_names')
      .select('*')
      .eq('project_id', projectId)
      .order('usage_count', { ascending: false })
      .order('last_used', { ascending: false })
      .limit(options?.limit ?? 10);

    if (options?.searchTerm?.trim()) {
      q = q.ilike('name', `%${options.searchTerm.trim()}%`);
    }

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as TaskName[];
  },

  async upsert(projectId: string, name: string): Promise<void> {
    const { data: existing } = await db
      .from('task_names')
      .select('id, usage_count, last_used')
      .eq('project_id', projectId)
      .eq('name', name)
      .single();

    if (existing) {
      await db
        .from('task_names')
        .update({
          usage_count: existing.usage_count + 1,
          last_used: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await db
        .from('task_names')
        .insert({
          project_id: projectId,
          name,
          usage_count: 1,
          last_used: new Date().toISOString(),
        });
    }
  },

  async deleteUnused(projectId: string): Promise<void> {
    await db
      .from('task_names')
      .delete()
      .eq('project_id', projectId)
      .lt('usage_count', 2);
  },
};
