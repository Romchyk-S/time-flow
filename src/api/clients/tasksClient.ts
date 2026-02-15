import { supabase } from "@/integrations/supabase/client";
import type { Task, TaskStatus } from "@/types";

export const tasksClient = {
  async getByProject(
    projectId: string,
    options?: { isActive?: boolean; searchTerm?: string; limit?: number }
  ): Promise<Task[]> {
    let q = supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("usage_count", { ascending: false })
      .order("last_used", { ascending: false, nullsFirst: false });
    if (options?.isActive !== undefined) q = q.eq("is_active", options.isActive);
    if (options?.searchTerm?.trim()) {
      q = q.ilike("name", `%${options.searchTerm.trim()}%`);
    }
    if (options?.limit) q = q.limit(options.limit);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Task[];
  },

  async findByNameAndProject(name: string, projectId: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .ilike("name", name.trim())
      .maybeSingle();
    if (error) throw error;
    return data as Task | null;
  },

  async getById(id: string): Promise<Task | null> {
    const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as Task;
  },

  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, project:projects(*)")
      .eq("is_active", true)
      .order("name");
    if (error) throw error;
    return (data ?? []) as Task[];
  },

  async create(input: {
    name: string;
    project_id: string;
    description?: string;
    work_dates?: string[];
  }): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        name: input.name.trim(),
        project_id: input.project_id,
        description: input.description ?? null,
        work_dates: (input.work_dates ?? []).map((d) => d), // Supabase accepts YYYY-MM-DD strings for date[]
      })
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  },

  /** Add today to task's work_dates if not already present (call when starting timer). */
  async addWorkDateIfNeeded(taskId: string, dateKey: string): Promise<Task | null> {
    const task = await this.getById(taskId);
    if (!task) return null;
    const raw = task.work_dates ?? [];
    const dates = raw.map((d) => (typeof d === "string" ? d.slice(0, 10) : String(d).slice(0, 10)));
    if (dates.includes(dateKey)) return task;
    const next = [...dates, dateKey].sort();
    const { data, error } = await supabase
      .from("tasks")
      .update({ work_dates: next })
      .eq("id", taskId)
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  },

  async update(
    id: string,
    updates: Partial<Pick<Task, "name" | "description" | "project_id" | "status" | "is_active" | "work_dates" | "execution_duration">>
  ): Promise<Task> {
    const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data as Task;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
  },

  async setStatus(id: string, status: TaskStatus): Promise<Task> {
    return this.update(id, { status });
  },

  async updateExecutionDuration(id: string, durationInSeconds: number): Promise<Task> {
    console.log(`[TasksClient] Updating task ${id} duration with ${durationInSeconds} seconds`);
    
    // Ensure we have a valid duration (at least 1 second)
    const duration = Math.max(1, Math.floor(durationInSeconds));
    
    try {
      const { data, error } = await supabase.rpc('increment_task_duration', {
        task_id: id,
        duration_seconds: duration
      });
      
      if (error) {
        console.error('[TasksClient] Error updating task duration:', {
          taskId: id,
          durationInSeconds: duration,
          error
        });
        throw error;
      }
      
      console.log('[TasksClient] Successfully updated task duration:', {
        taskId: id,
        durationInSeconds: duration,
        result: data
      });
      
      return data as Task;
    } catch (error) {
      console.error('[TasksClient] Unexpected error in updateExecutionDuration:', {
        taskId: id,
        durationInSeconds: duration,
        error
      });
      throw error;
    }
  },
};
