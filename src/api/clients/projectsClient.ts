import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/types";

const db = supabase as any;

export const projectsClient = {
  async getAll(): Promise<Project[]> {
    const { data, error } = await db
      .from("projects")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Project[];
  },

  async getById(id: string): Promise<Project | null> {
    const { data, error } = await db.from("projects").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as Project;
  },

  async create(input: { name: string; color: string }): Promise<Project> {
    const { data, error } = await db
      .from("projects")
      .insert({ name: input.name, color: input.color })
      .select()
      .single();
    if (error) throw error;
    return data as Project;
  },

  async update(id: string, updates: Partial<Pick<Project, "name" | "color">>): Promise<Project> {
    const { data, error } = await db
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Project;
  },

  async delete(id: string): Promise<void> {
    const { error } = await db.from("projects").delete().eq("id", id);
    if (error) throw error;
  },
};
