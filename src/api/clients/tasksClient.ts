import { supabase } from "@/integrations/supabase/client";
import type { Task, TaskStatus } from "@/types";
import type { Database } from '@/integrations/supabase/types';

type DbTask = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

// Helper to map database task to our app's Task type
const mapDbTaskToAppTask = (dbTask: DbTask): Task => ({
  id: dbTask.id,
  name: dbTask.title,
  description: dbTask.description,
  project_id: dbTask.project_id || '',
  status: dbTask.status as TaskStatus,
  is_active: !dbTask.is_completed,
  usage_count: 0, // Not in DB schema, default to 0
  last_used: dbTask.started_at,
  work_dates: dbTask.work_dates || [],
  total_duration: dbTask.actual_duration || 0,
  created_at: dbTask.created_at,
  updated_at: dbTask.updated_at,
});

// Helper to map our Task type to database task
const mapAppTaskToDbTask = (task: Partial<Task>): Partial<TaskUpdate> => {
  const dbTask: Record<string, unknown> = { ...task };
  
  if ('name' in dbTask) {
    dbTask.title = dbTask.name;
    delete dbTask.name;
  }
  
  if ('is_active' in dbTask) {
    dbTask.is_completed = !(dbTask.is_active as boolean);
    delete dbTask.is_active;
  }
  
  if ('total_duration' in dbTask) {
    dbTask.actual_duration = dbTask.total_duration as number;
    delete dbTask.total_duration;
  }
  
  return dbTask as Partial<TaskUpdate>;
};

export const tasksClient = {
  async getByProject(
    projectId: string,
    options?: { isActive?: boolean; searchTerm?: string; limit?: number }
  ): Promise<Task[]> {
    let q = supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index", { ascending: true })
      .order("started_at", { ascending: false, nullsFirst: false });
      
    if (options?.isActive !== undefined) {
      q = options.isActive 
        ? q.neq("status", 'completed')
        : q.eq("status", 'completed');
    }
    
    if (options?.searchTerm?.trim()) {
      q = q.ilike("title", `%${options.searchTerm.trim()}%`);
    }
    if (options?.limit) q = q.limit(options.limit);
    
    const { data, error } = await q;
    if (error) throw error;
    
    // Map database tasks to our app's Task type
    return (data || []).map(mapDbTaskToAppTask);
  },

  async findByNameAndProject(name: string, projectId: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .ilike("title", name.trim())
      .maybeSingle();
    if (error) throw error;
    return data ? mapDbTaskToAppTask(data) : null;
  },

  async getById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    
    return this.mapDbTaskToAppTask(data);
  },

  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, project:projects(*)")
      .neq("status", 'completed')
      .order("title");
      
    if (error) throw error;
    
    // Map database tasks to our app's Task type
    return (data || []).map(task => {
      const mappedTask = mapDbTaskToAppTask(task);
      if (task.project) {
        return {
          ...mappedTask,
          project: {
            id: task.project.id,
            name: task.project.name,
            description: task.project.description,
            color: task.project.color || '#000000',
            created_at: task.project.created_at,
            updated_at: task.project.updated_at,
          }
        };
      }
      return mappedTask;
    });
  },

  async create(input: {
    name: string;
    project_id: string;
    description?: string;
    work_dates?: string[];
    status?: TaskStatus;
    user_id?: string;
  }): Promise<Task> {
    const taskToCreate: Omit<TaskInsert, 'id'> = {
      title: input.name.trim(),
      project_id: input.project_id,
      description: input.description ?? null,
      work_dates: input.work_dates ?? [],
      status: (input.status ?? 'not_started') as 'not_started' | 'in_progress' | 'paused' | 'in_review' | 'completed',
      user_id: input.user_id || '',
      actual_duration: 0,
      is_completed: false,
      priority: 'medium',
      tags: [],
      order_index: 0,
      is_recurring: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (supabase
      .from('tasks')
      .insert([taskToCreate])
      .select()
      .single() as Promise<{ data: DbTask | null; error: any }>);
      
    if (error || !data) {
      throw error || new Error('Failed to create task');
    }
    return mapDbTaskToAppTask(data);
  },

  /** Add today to task's work_dates if not already present (call when starting timer). */
  async addWorkDateIfNeeded(taskId: string, dateKey: string): Promise<Task | null> {
    const task = await this.getById(taskId);
    if (!task) return null;
    
    const raw = task.work_dates ?? [];
    const dates = raw.map((d) => (typeof d === "string" ? d.slice(0, 10) : String(d).slice(0, 10)));
    if (dates.includes(dateKey)) return task;
    
    const next = [...dates, dateKey].sort();
    const { data, error } = await (supabase
      .from("tasks")
      .update({ work_dates: next } as any) // Workaround for type issue
      .eq("id", taskId)
      .select()
      .single() as Promise<{ data: DbTask | null; error: any }>);
      
    if (error || !data) {
      throw error || new Error('Failed to update work dates');
    }
    return mapDbTaskToAppTask(data);
  },

  async update(
    id: string,
    updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Task> {
    const dbUpdates = mapAppTaskToDbTask(updates);
    (dbUpdates as { updated_at: string }).updated_at = new Date().toISOString();
    
    const { data, error } = await (supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single() as Promise<{ data: DbTask | null; error: any }>);
      
    if (error || !data) {
      throw error || new Error('Failed to update task');
    }
    return mapDbTaskToAppTask(data);
  },
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
  },

  async setStatus(id: string, status: TaskStatus): Promise<Task> {
    return this.update(id, { status });
  },

  async updateExecutionDuration(id: string, durationInSeconds: number): Promise<Task> {
    // Ensure we have a valid duration (at least 1 second)
    const duration = Math.max(1, Math.floor(durationInSeconds));
    
    console.log(`[TasksClient] Updating task ${id} duration with ${duration} seconds`);
    
    try {
      // First try using the RPC function
      try {
        const { data, error } = await supabase.rpc('increment_task_duration', {
          task_id: id,
          duration_seconds: duration
        });
        
        if (!error && data) {
          console.log('[TasksClient] Successfully updated task duration using RPC:', {
            taskId: id,
            durationInSeconds: duration,
            result: data
          });
          return data as Task;
        }
        console.warn('[TasksClient] RPC call failed or returned no data, falling back to direct update', { error });
      } catch (rpcError) {
        console.warn('[TasksClient] RPC call failed, falling back to direct update', { rpcError });
      }
      
      // Fallback: Get the current task and update it directly
      console.log('[TasksClient] Falling back to direct task update');
      const { data: task, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError || !task) {
        throw fetchError || new Error('Task not found');
      }
      
      // Calculate new duration in minutes (stored as minutes in the database)
      const currentDuration = task.total_duration || 0;
      const durationInMinutes = Math.ceil(duration / 60); // Convert seconds to minutes, rounding up
      const newDuration = currentDuration + durationInMinutes;
      
      console.log('[TasksClient] Updating task duration directly', {
        taskId: id,
        currentDuration,
        durationInMinutes,
        newDuration
      });
      
      // Update the task directly
      const { data: updatedTask, error: updateError } = await supabase
        .from('tasks')
        .update({ 
          total_duration: newDuration,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (updateError) {
        console.error('[TasksClient] Error updating task duration directly:', updateError);
        throw updateError;
      }
      
      console.log('[TasksClient] Successfully updated task duration directly:', updatedTask);
      return updatedTask as Task;
      
    } catch (error) {
      console.error('[TasksClient] Error in updateExecutionDuration:', {
        taskId: id,
        durationInSeconds: duration,
        error
      });
      
      // If all else fails, try a minimal update
      try {
        console.log('[TasksClient] Attempting minimal update to record task usage');
        const { data: task } = await supabase
          .from('tasks')
          .update({ 
            last_used: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();
          
        if (task) {
          console.log('[TasksClient] Recorded task usage (minimal update)');
          return task as Task;
        }
      } catch (minimalUpdateError) {
        console.error('[TasksClient] Minimal update also failed:', minimalUpdateError);
      }
      
      throw error;
    }
  },
};
