-- Add status and work_dates to existing tasks table (idempotent)
-- Run this if your tasks table already exists but lacks these columns.

-- Add status column if missing (not_started | in_progress | paused | in_review | completed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.tasks
    ADD COLUMN status text NOT NULL DEFAULT 'not_started';
  END IF;
END $$;

-- Add check constraint for status (drop first if exists to allow re-run)
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check
  CHECK (status = ANY (ARRAY['not_started'::text, 'in_progress'::text, 'paused'::text, 'in_review'::text, 'completed'::text]));

-- Add work_dates column if missing (dates the task is expected / was worked on)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'work_dates'
  ) THEN
    ALTER TABLE public.tasks
    ADD COLUMN work_dates date[] DEFAULT '{}';
  END IF;
END $$;
