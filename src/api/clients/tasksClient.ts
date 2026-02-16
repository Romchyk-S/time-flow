import { supabase } from "@/integrations/supabase/client";
import type { Task, TaskStatus } from "@/types";

const supabaseAny = supabase as any;

// Define the database task type that matches our actual database schema
type DbTask = {
  id: string;
  name: string;
  description: string | null;
  project_id: string;
  status: TaskStatus;
  is_active: boolean;
  usage_count: number;
  last_used: string | null;
  work_dates: string[] | null;
  total_duration: number;
  created_at: string;
  updated_at: string;
};

type TaskInsert = Omit<DbTask, 'id' | 'created_at' | 'updated_at'>;
type TaskUpdate = Partial<Omit<DbTask, 'id' | 'created_at'>>;

// Helper to map database task to our app's Task type
const mapDbTaskToAppTask = (dbTask: DbTask): Task => ({
  id: dbTask.id,
  name: dbTask.name,
  description: dbTask.description,
  project_id: dbTask.project_id,
  status: dbTask.status,
  is_active: dbTask.is_active,
  usage_count: dbTask.usage_count,
  last_used: dbTask.last_used,
  work_dates: dbTask.work_dates || [],
  total_duration: dbTask.total_duration || 0,
  created_at: dbTask.created_at,
  updated_at: dbTask.updated_at,
});

// Helper to map our Task type to database task
const mapAppTaskToDbTask = (task: Partial<Task>): Partial<TaskUpdate> => {
  const dbTask: Record<string, unknown> = { ...task };
  
  // No need to map name as it's the same in both schemas
  
  // Map is_active to is_active (no change needed)
  
  // Map total_duration to total_duration (no change needed)
  
  return dbTask as Partial<TaskUpdate>;
};

export const tasksClient = {
  async getByProject(
    projectId: string,
    options?: { isActive?: boolean; searchTerm?: string; limit?: number }
  ): Promise<Task[]> {
    let q = supabaseAny
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("usage_count", { ascending: false })
      .order("last_used", { ascending: false, nullsFirst: true });
      
    if (options?.isActive !== undefined) {
      q = options.isActive 
        ? q.neq("status", 'completed')
        : q.eq("status", 'completed');
    }
    
    if (options?.searchTerm?.trim()) {
      q = q.ilike("name", `%${options.searchTerm.trim()}%`);
    }
    if (options?.limit) q = q.limit(options.limit);
    
    const { data, error } = await q;
    if (error) throw error;
    
    // Map database tasks to our app's Task type
    return (data || []).map(mapDbTaskToAppTask);
  },

  async findByNameAndProject(name: string, projectId: string): Promise<Task | null> {
    const { data, error } = await supabaseAny
      .from('tasks')
      .select('*')
      .eq('name', name.trim())
      .eq('project_id', projectId)
      .maybeSingle();

    if (error) throw error;
    return data ? mapDbTaskToAppTask(data) : null;
  },

  async getById(id: string): Promise<Task | null> {
    const { data, error } = await supabaseAny
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    
    return mapDbTaskToAppTask(data);
  },

  async getAll(): Promise<Task[]> {
    const { data, error } = await supabaseAny
      .from("tasks")
      .select("*, project:projects(*)")
      .neq("status", 'completed')
      .order("name");
      
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

  async getRecentActivity(options: {
    dateKeys: string[];
    limit?: number;
    includeCompleted?: boolean;
  }): Promise<Task[]> {
    const limit = options.limit ?? 6;

    let q = supabaseAny
      .from("tasks")
      .select("*, project:projects(*)")
      .overlaps("work_dates", options.dateKeys)
      .order("last_used", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (!options.includeCompleted) {
      q = q.neq("status", "completed");
    }

    const { data, error } = await q;
    if (error) throw error;

    const mapped = (data || []).map((task: any) => {
      const mappedTask = mapDbTaskToAppTask(task);
      if (task.project) {
        return {
          ...mappedTask,
          project: {
            id: task.project.id,
            name: task.project.name,
            description: task.project.description,
            color: task.project.color || "#000000",
            created_at: task.project.created_at,
            updated_at: task.project.updated_at,
          },
        };
      }
      return mappedTask;
    });

    if (mapped.length >= limit) return mapped;

    let qFallback = supabaseAny
      .from("tasks")
      .select("*, project:projects(*)")
      .order("last_used", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (!options.includeCompleted) {
      qFallback = qFallback.neq("status", "completed");
    }

    const { data: fbData, error: fbError } = await qFallback;
    if (fbError) throw fbError;

    return (fbData || []).map((task: any) => {
      const mappedTask = mapDbTaskToAppTask(task);
      if (task.project) {
        return {
          ...mappedTask,
          project: {
            id: task.project.id,
            name: task.project.name,
            description: task.project.description,
            color: task.project.color || "#000000",
            created_at: task.project.created_at,
            updated_at: task.project.updated_at,
          },
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
    const taskToCreate: TaskInsert = {
      name: input.name.trim(),
      project_id: input.project_id,
      description: input.description ?? null,
      work_dates: input.work_dates?.map(d => d.split('T')[0]) ?? [],
      status: input.status ?? 'not_started',
      is_active: true,
      total_duration: 0,
      usage_count: 0,
      last_used: null
    };

    const { data, error } = await supabaseAny
      .from('tasks')
      .insert(taskToCreate)
      .select()
      .single();
      
    if (error || !data) {
      throw error || new Error('Failed to create task');
    }
    
    // Convert DbTask to our app's Task type
    return mapDbTaskToAppTask(data);
  },

  async addWorkDateIfNeeded(taskId: string, dateKey: string): Promise<Task | null> {
    const task = await this.getById(taskId);
    if (!task) return null;
    
    const raw = task.work_dates ?? [];
    const dates = raw.map((d) => (typeof d === "string" ? d.slice(0, 10) : String(d).slice(0, 10)));
    if (dates.includes(dateKey)) return task;
    
    const next = [...dates, dateKey].sort();
    const { data, error } = await (supabaseAny
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
    // Convert app task updates to database format
    const dbUpdates: Partial<DbTask> = { ...updates };
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabaseAny
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
      
    if (error || !data) {
      throw error || new Error('Failed to update task');
    }
    return mapDbTaskToAppTask(data);
  },
  
  async incrementUsage(taskId: string): Promise<Task> {
    // First update the usage count
    const { data: taskData } = await supabaseAny
      .from('tasks')
      .select('usage_count')
      .eq('id', taskId)
      .single();
      
    if (!taskData) throw new Error('Task not found');
    
    const { data, error } = await supabaseAny
      .from('tasks')
      .update({ 
        usage_count: (taskData.usage_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();
      
    if (error || !data) throw error || new Error('Failed to update task usage');
    
    return mapDbTaskToAppTask(data);
  },
  
  async updateLastUsed(taskId: string): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabaseAny
      .from('tasks')
      .update({ 
        last_used: now, 
        updated_at: now 
      })
      .eq('id', taskId);
      
    if (error) throw error;
  },
  
  async incrementDuration(taskId: string, seconds: number): Promise<Task> {
    const minutes = Math.ceil(seconds / 60);
    
    // First get the current duration
    const { data: taskData } = await supabaseAny
      .from('tasks')
      .select('total_duration')
      .eq('id', taskId)
      .single();
      
    if (!taskData) throw new Error('Task not found');
    
    // Update the duration directly
    const { data, error } = await supabaseAny
      .from('tasks')
      .update({ 
        total_duration: (taskData.total_duration || 0) + minutes,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();
      
    if (error || !data) throw error || new Error('Failed to update task duration');
    
    return mapDbTaskToAppTask(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAny.from("tasks").delete().eq("id", id);
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
        const { data, error } = await supabaseAny.rpc('increment_task_duration', {
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
      const { data: task, error: fetchError } = await supabaseAny
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
      const { data: updatedTask, error: updateError } = await supabaseAny
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
        const { data: task } = await supabaseAny
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
