export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          color: string | null
          icon: string | null
          is_active: boolean
          user_id: string
          parent_project_id: string | null
          order_index: number
          deadline: string | null
          budget: number | null
          hourly_rate: number | null
          estimated_hours: number | null
          tags: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          color?: string | null
          icon?: string | null
          is_active?: boolean
          user_id: string
          parent_project_id?: string | null
          order_index?: number
          deadline?: string | null
          budget?: number | null
          hourly_rate?: number | null
          estimated_hours?: number | null
          tags?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          color?: string | null
          icon?: string | null
          is_active?: boolean
          user_id?: string
          parent_project_id?: string | null
          order_index?: number
          deadline?: string | null
          budget?: number | null
          hourly_rate?: number | null
          estimated_hours?: number | null
          tags?: string[]
        }
      }
      tasks: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          project_id: string | null
          user_id: string
          due_date: string | null
          estimated_duration: number | null
          actual_duration: number
          is_completed: boolean
          completed_at: string | null
          started_at: string | null
          status: 'not_started' | 'in_progress' | 'paused' | 'in_review' | 'completed'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          notes: string | null
          tags: string[]
          parent_task_id: string | null
          work_dates: string[]
          order_index: number
          is_recurring: boolean
          recurrence_pattern: string | null
          assigned_to: string | null
          attachments: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          project_id?: string | null
          user_id: string
          due_date?: string | null
          estimated_duration?: number | null
          actual_duration?: number
          is_completed?: boolean
          completed_at?: string | null
          started_at?: string | null
          status?: 'not_started' | 'in_progress' | 'paused' | 'in_review' | 'completed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          notes?: string | null
          tags?: string[]
          parent_task_id?: string | null
          work_dates?: string[]
          order_index?: number
          is_recurring?: boolean
          recurrence_pattern?: string | null
          assigned_to?: string | null
          attachments?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          project_id?: string | null
          user_id?: string
          due_date?: string | null
          estimated_duration?: number | null
          actual_duration?: number
          is_completed?: boolean
          completed_at?: string | null
          started_at?: string | null
          status?: 'not_started' | 'in_progress' | 'paused' | 'in_review' | 'completed'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          notes?: string | null
          tags?: string[]
          parent_task_id?: string | null
          work_dates?: string[]
          order_index?: number
          is_recurring?: boolean
          recurrence_pattern?: string | null
          assigned_to?: string | null
          attachments?: Json | null
        }
      }
      time_entries: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          task_id: string
          user_id: string
          start_time: string
          end_time: string | null
          duration_minutes: number | null
          description: string | null
          is_billable: boolean
          hourly_rate: number | null
          tags: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          task_id: string
          user_id: string
          start_time: string
          end_time?: string | null
          duration_minutes?: number | null
          description?: string | null
          is_billable?: boolean
          hourly_rate?: number | null
          tags?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          task_id?: string
          user_id?: string
          start_time?: string
          end_time?: string | null
          duration_minutes?: number | null
          description?: string | null
          is_billable?: boolean
          hourly_rate?: number | null
          tags?: string[]
        }
      }
      user_settings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          theme: 'light' | 'dark' | 'system'
          default_view: 'list' | 'kanban' | 'calendar' | 'timeline'
          timezone: string
          week_starts_on: number
          daily_goal_hours: number
          notification_preferences: Json
          currency: string
          date_format: string
          time_format: '12h' | '24h'
          language: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          theme?: 'light' | 'dark' | 'system'
          default_view?: 'list' | 'kanban' | 'calendar' | 'timeline'
          timezone?: string
          week_starts_on?: number
          daily_goal_hours?: number
          notification_preferences?: Json
          currency?: string
          date_format?: string
          time_format?: '12h' | '24h'
          language?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          theme?: 'light' | 'dark' | 'system'
          default_view?: 'list' | 'kanban' | 'calendar' | 'timeline'
          timezone?: string
          week_starts_on?: number
          daily_goal_hours?: number
          notification_preferences?: Json
          currency?: string
          date_format?: string
          time_format?: '12h' | '24h'
          language?: string
        }
      }
      task_comments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          task_id: string
          user_id: string
          content: string
          parent_comment_id: string | null
          is_edited: boolean
          edited_at: string | null
          mentions: string[]
          attachments: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          task_id: string
          user_id: string
          content: string
          parent_comment_id?: string | null
          is_edited?: boolean
          edited_at?: string | null
          mentions?: string[]
          attachments?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          task_id?: string
          user_id?: string
          content?: string
          parent_comment_id?: string | null
          is_edited?: boolean
          edited_at?: string | null
          mentions?: string[]
          attachments?: Json | null
        }
      }
      task_dependencies: {
        Row: {
          id: string
          created_at: string
          predecessor_task_id: string
          successor_task_id: string
          dependency_type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish'
          lag_days: number
        }
        Insert: {
          id?: string
          created_at?: string
          predecessor_task_id: string
          successor_task_id: string
          dependency_type?: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish'
          lag_days?: number
        }
        Update: {
          id?: string
          created_at?: string
          predecessor_task_id?: string
          successor_task_id?: string
          dependency_type?: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish'
          lag_days?: number
        }
      }
    }
    Views: {
      task_statistics: {
        Row: {
          user_id: string
          status: string
          count: number
          avg_estimated_duration: number | null
          avg_actual_duration: number | null
          project_count: number
        }
      }
      daily_task_summary: {
        Row: {
          user_id: string
          date: string
          completed_count: number
          in_progress_count: number
          not_started_count: number
          total_actual_duration: number | null
          total_estimated_duration: number | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      task_status: 'not_started' | 'in_progress' | 'paused' | 'in_review' | 'completed'
      task_priority: 'low' | 'medium' | 'high' | 'urgent'
      theme: 'light' | 'dark' | 'system'
      view_type: 'list' | 'kanban' | 'calendar' | 'timeline'
      time_format: '12h' | '24h'
      dependency_type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
  ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
  ? PublicSchema['Enums'][PublicEnumNameOrOptions]
  : never

// Convenience type aliases
export type Project = Tables<'projects'>
export type Task = Tables<'tasks'>
export type TimeEntry = Tables<'time_entries'>
export type UserSettings = Tables<'user_settings'>
export type TaskComment = Tables<'task_comments'>
export type TaskDependency = Tables<'task_dependencies'>

export type ProjectInsert = TablesInsert<'projects'>
export type TaskInsert = TablesInsert<'tasks'>
export type TimeEntryInsert = TablesInsert<'time_entries'>
export type UserSettingsInsert = TablesInsert<'user_settings'>
export type TaskCommentInsert = TablesInsert<'task_comments'>
export type TaskDependencyInsert = TablesInsert<'task_dependencies'>

export type ProjectUpdate = TablesUpdate<'projects'>
export type TaskUpdate = TablesUpdate<'tasks'>
export type TimeEntryUpdate = TablesUpdate<'time_entries'>
export type UserSettingsUpdate = TablesUpdate<'user_settings'>
export type TaskCommentUpdate = TablesUpdate<'task_comments'>
export type TaskDependencyUpdate = TablesUpdate<'task_dependencies'>

export type TaskStatus = Enums<'task_status'>
export type TaskPriority = Enums<'task_priority'>
export type Theme = Enums<'theme'>
export type ViewType = Enums<'view_type'>
export type TimeFormat = Enums<'time_format'>
export type DependencyType = Enums<'dependency_type'>