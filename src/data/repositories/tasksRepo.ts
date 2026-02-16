import { supabase } from '@/integrations/supabase/client';
import type { Task, TaskStatus } from '@/types';
import { taskNamesRepo } from '@/data/repositories/taskNamesRepo';

const db = supabase as any;

export const tasksRepo = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await db
      .from('tasks')
      .select('*, project:projects(*)')
      .neq('status', 'completed')
      .order('name');
    if (error) throw error;
    return (data ?? []).map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      project_id: t.project_id,
      status: t.status,
      is_active: t.is_active,
      usage_count: t.usage_count,
      last_used: t.last_used,
      work_dates: t.work_dates,
      total_duration: t.total_duration || 0,
      created_at: t.created_at,
      updated_at: t.updated_at,
    }));
  },

  async getById(id: string): Promise<Task | null> {
    const { data, error } = await db
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? {
      id: data.id,
      name: data.name,
      description: data.description,
      project_id: data.project_id,
      status: data.status,
      is_active: data.is_active,
      usage_count: data.usage_count,
      last_used: data.last_used,
      work_dates: data.work_dates,
      total_duration: data.total_duration || 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } : null;
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
    const toInsert = {
      name: input.name.trim(),
      project_id: input.project_id,
      description: input.description ?? null,
      status: input.status ?? 'not_started',
      work_dates: input.work_dates ?? [],
      is_active: input.is_active ?? true,
      usage_count: input.usage_count ?? 0,
      last_used: input.last_used ?? null,
      total_duration: input.total_duration ?? 0,
    };
    const { data, error } = await db
      .from('tasks')
      .insert(toInsert)
      .select()
      .single();
    if (error) throw error;
    await taskNamesRepo.ensureExists(toInsert.project_id, toInsert.name);
    return data as Task;
  },

  async findByNameAndProject(name: string, projectId: string): Promise<Task | null> {
    const normalized = name.trim();
    const { data, error } = await db
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('name', normalized)
      .maybeSingle();
    if (error) throw error;
    return (data as Task) ?? null;
  },

  async update(id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task> {
    const shouldSyncName = typeof (updates as any).name === 'string' || typeof (updates as any).project_id === 'string';
    const before = shouldSyncName ? await this.getById(id) : null;

    const nextUpdates = { ...updates } as any;
    if (typeof nextUpdates.name === 'string') {
      nextUpdates.name = nextUpdates.name.trim();
    }

    const { data, error } = await db
      .from('tasks')
      .update(nextUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    if (shouldSyncName) {
      const projectId = (nextUpdates.project_id as string | undefined) ?? before?.project_id;
      const name = (nextUpdates.name as string | undefined) ?? before?.name;
      if (projectId && name) {
        await taskNamesRepo.ensureExists(projectId, name);
      }
    }

    return data as Task;
  },

  async delete(id: string): Promise<void> {
    const { error } = await db.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  async setStatus(id: string, status: TaskStatus): Promise<void> {
    const { error } = await db.from('tasks').update({ status }).eq('id', id);
    if (error) throw error;
  },

  async incrementUsage(id: string): Promise<void> {
    const { error } = await db.rpc('increment_task_usage', { task_id: id });
    if (error) throw error;
  },

  async updateLastUsed(id: string): Promise<void> {
    const { error } = await db
      .from('tasks')
      .update({ last_used: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async addWorkDate(id: string, dateKey: string): Promise<void> {
    const { error } = await db.rpc('add_task_work_date', { task_id: id, date_key: dateKey });
    if (error) throw error;
  },

  async updateExecutionDuration(id: string, durationSeconds: number): Promise<void> {
    const durationMinutes = Math.ceil(durationSeconds / 60);
    const { error } = await db.rpc('increment_task_duration', { task_id: id, duration_minutes: durationMinutes });
    if (error) throw error;
  },

  async getRecentActivity(input: {
    dateKeys: string[];
    limit: number;
    includeCompleted: boolean;
  }): Promise<(Task & { project?: any })[]> {
    let q = db
      .from('tasks')
      .select('*, project:projects(*)')
      .overlaps('work_dates', input.dateKeys)
      .order('last_used', { ascending: false, nullsFirst: false })
      .limit(input.limit);

    if (!input.includeCompleted) {
      q = q.neq('status', 'completed');
    }

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as (Task & { project?: any })[];
  },
};
