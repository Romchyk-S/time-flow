import { supabase } from '@/integrations/supabase/client';
import type { TimeEntry } from '@/types';

const db = supabase as any;

export const timeEntriesRepo = {
  async getRunning(): Promise<TimeEntry | null> {
    const { data, error } = await db
      .from('time_entries')
      .select('*')
      .is('end_time', null)
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data as TimeEntry | null;
  },

  async getByTaskId(taskId: string): Promise<TimeEntry[]> {
    const { data, error } = await db
      .from('time_entries')
      .select('*')
      .eq('task_id', taskId)
      .order('start_time', { ascending: false });
    if (error) throw error;
    return (data ?? []) as TimeEntry[];
  },

  async getLatestDurationsByTaskIds(taskIds: string[]): Promise<Record<string, number>> {
    const ids = Array.from(new Set(taskIds)).filter(Boolean);
    if (!ids.length) return {};
    const { data, error } = await db
      .from('time_entries')
      .select('task_id, duration, start_time')
      .in('task_id', ids)
      .not('end_time', 'is', null)
      .order('start_time', { ascending: false });
    if (error) throw error;
    const result: Record<string, number> = {};
    for (const row of (data ?? [])) {
      if (!row.task_id) continue;
      if (result[row.task_id] !== undefined) continue;
      result[row.task_id] = row.duration ?? 0;
    }
    return result;
  },

  async getByDateRange(startDate: string, endDate: string): Promise<TimeEntry[]> {
    const { data, error } = await db
      .from('time_entries')
      .select('*, task:tasks(id, name, project_id, status, project:projects(id, name, color))')
      .gte('start_time', startDate)
      .lt('start_time', endDate)
      .order('start_time', { ascending: false });
    if (error) throw error;
    return (data ?? []) as TimeEntry[];
  },

  async getEntriesForDay(dayStart: string, dayEnd: string): Promise<TimeEntry[]> {
    const { data, error } = await db
      .from('time_entries')
      .select('*, task:tasks(id, name, project_id, status, project:projects(id, name, color))')
      .gte('start_time', dayStart)
      .lt('start_time', dayEnd)
      .order('start_time', { ascending: false });
    if (error) throw error;
    return (data ?? []) as TimeEntry[];
  },

  async start(taskId: string, notes?: string): Promise<TimeEntry> {
    const { data, error } = await db
      .from('time_entries')
      .insert({
        task_id: taskId,
        start_time: new Date().toISOString(),
        duration: 0,
        notes: notes ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as TimeEntry;
  },

  async stop(id: string, durationMinutes: number): Promise<TimeEntry> {
    const { data, error } = await db
      .from('time_entries')
      .update({
        end_time: new Date().toISOString(),
        duration: durationMinutes,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as TimeEntry;
  },

  async update(
    id: string,
    updates: Partial<Pick<TimeEntry, 'duration' | 'notes' | 'start_time' | 'end_time'>>
  ): Promise<TimeEntry> {
    const { data, error } = await db
      .from('time_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as TimeEntry;
  },

  async delete(id: string): Promise<void> {
    const { error } = await db.from('time_entries').delete().eq('id', id);
    if (error) throw error;
  },
};
