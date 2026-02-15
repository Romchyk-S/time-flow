import { supabase } from "@/integrations/supabase/client";
import type { TimeEntry } from "@/types";

export const timeEntriesClient = {
  async getRunning(): Promise<TimeEntry | null> {
    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .is("end_time", null)
      .order("start_time", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data as TimeEntry | null;
  },

  async getByTaskId(taskId: string): Promise<TimeEntry[]> {
    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .eq("task_id", taskId)
      .order("start_time", { ascending: false });
    if (error) throw error;
    return (data ?? []) as TimeEntry[];
  },

  async getByDateRange(startDate: string, endDate: string): Promise<TimeEntry[]> {
    const { data, error } = await supabase
      .from("time_entries")
      .select("*, task:tasks(id, name, project_id, status, project:projects(id, name, color))")
      .gte("start_time", startDate)
      .lt("start_time", endDate)
      .order("start_time", { ascending: false });
    if (error) throw error;
    return (data ?? []) as TimeEntry[];
  },

  async getEntriesForDay(dayStart: string, dayEnd: string): Promise<TimeEntry[]> {
    const { data, error } = await supabase
      .from("time_entries")
      .select("*, task:tasks(id, name, project_id, status, project:projects(id, name, color))")
      .gte("start_time", dayStart)
      .lt("start_time", dayEnd)
      .order("start_time", { ascending: false });
    if (error) throw error;
    return (data ?? []) as TimeEntry[];
  },

  async start(taskId: string, notes?: string): Promise<TimeEntry> {
    const { data, error } = await supabase
      .from("time_entries")
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

  async stop(id: string, durationSeconds: number): Promise<TimeEntry> {
    const { data, error } = await supabase
      .from("time_entries")
      .update({
        end_time: new Date().toISOString(),
        duration: durationSeconds,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as TimeEntry;
  },

  async update(id: string, updates: Partial<Pick<TimeEntry, "duration" | "notes">>): Promise<TimeEntry> {
    const { data, error } = await supabase
      .from("time_entries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as TimeEntry;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("time_entries").delete().eq("id", id);
    if (error) throw error;
  },
};
