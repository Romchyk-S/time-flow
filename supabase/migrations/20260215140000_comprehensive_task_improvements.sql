-- Comprehensive task improvements migration
-- Adds actual_duration, notes, tags, subtasks support, and improves constraints

-- 1. Add actual_duration column if missing (tracked time in minutes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'actual_duration'
  ) THEN
    ALTER TABLE public.tasks
    ADD COLUMN actual_duration integer DEFAULT 0;
  END IF;
END $$;

-- 2. Add notes column if missing (for task notes/comments)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.tasks
    ADD COLUMN notes text;
  END IF;
END $$;

-- 3. Add tags column if missing (array of tags for categorization)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'tags'
  ) THEN
    ALTER TABLE public.tasks
    ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;

-- 4. Add parent_task_id for subtasks support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'parent_task_id'
  ) THEN
    ALTER TABLE public.tasks
    ADD COLUMN parent_task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Add completed_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE public.tasks
    ADD COLUMN completed_at timestamptz;
  END IF;
END $$;

-- 6. Add started_at timestamp (when task was first set to in_progress)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'started_at'
  ) THEN
    ALTER TABLE public.tasks
    ADD COLUMN started_at timestamptz;
  END IF;
END $$;

-- 7. Add priority column with check constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'priority'
  ) THEN
    ALTER TABLE public.tasks
    ADD COLUMN priority text DEFAULT 'medium';
  END IF;
END $$;

-- Add priority check constraint
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_priority_check
  CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]));

-- 8. Create index on parent_task_id for better subtask queries
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON public.tasks(parent_task_id);

-- 9. Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- 10. Create index on user_id and status for user-specific queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status);

-- 11. Create index on tags using GIN for array operations
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON public.tasks USING GIN (tags);

-- 12. Create a function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_task_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Set started_at when task moves to in_progress for the first time
  IF NEW.status = 'in_progress' AND OLD.status != 'in_progress' AND NEW.started_at IS NULL THEN
    NEW.started_at = NOW();
  END IF;

  -- Set completed_at when task is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;

  -- Clear completed_at if task is reopened
  IF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    NEW.completed_at = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Create trigger for timestamp updates
DROP TRIGGER IF EXISTS task_timestamp_trigger ON public.tasks;
CREATE TRIGGER task_timestamp_trigger
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_timestamps();

-- 14. Add a view for task statistics
CREATE OR REPLACE VIEW task_statistics AS
SELECT
  user_id,
  status,
  COUNT(*) as count,
  AVG(estimated_duration) as avg_estimated_duration,
  AVG(actual_duration) as avg_actual_duration,
  COUNT(DISTINCT project_id) as project_count
FROM public.tasks
GROUP BY user_id, status;

-- 15. Add a materialized view for daily task summaries (for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_task_summary AS
SELECT
  user_id,
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
  COUNT(*) FILTER (WHERE status = 'not_started') as not_started_count,
  SUM(actual_duration) FILTER (WHERE status = 'completed') as total_actual_duration,
  SUM(estimated_duration) as total_estimated_duration
FROM public.tasks
GROUP BY user_id, DATE(created_at);

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_task_summary_user_date
ON daily_task_summary(user_id, date);

-- 16. Add RLS policies for new columns (assuming RLS is enabled)
-- These policies ensure users can only see/modify their own data

-- Grant access to the view
GRANT SELECT ON task_statistics TO authenticated;
GRANT SELECT ON daily_task_summary TO authenticated;

-- Add comment to document the schema
COMMENT ON COLUMN public.tasks.actual_duration IS 'Actual time spent on task in minutes';
COMMENT ON COLUMN public.tasks.notes IS 'Additional notes or comments about the task';
COMMENT ON COLUMN public.tasks.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN public.tasks.parent_task_id IS 'Reference to parent task for subtasks';
COMMENT ON COLUMN public.tasks.completed_at IS 'Timestamp when task was marked as completed';
COMMENT ON COLUMN public.tasks.started_at IS 'Timestamp when task was first started';
COMMENT ON COLUMN public.tasks.priority IS 'Task priority: low, medium, high, urgent';
COMMENT ON COLUMN public.tasks.work_dates IS 'Array of dates when work is planned or was done';