-- Add missing task-related RPCs used by the app

-- 1. add_task_work_date: add a date to a task's work_dates array (idempotent)
CREATE OR REPLACE FUNCTION public.add_task_work_date(task_id uuid, date_key text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.tasks
  SET work_dates = array_append(
    COALESCE(work_dates, ARRAY[]::text[]),
    date_key
  ),
      updated_at = NOW()
  WHERE id = task_id
    AND NOT (work_dates @> ARRAY[date_key]);
END;
$$;

-- 2. increment_task_usage: increment usage_count and optionally update last_used
CREATE OR REPLACE FUNCTION public.increment_task_usage(task_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.tasks
  SET 
    usage_count = COALESCE(usage_count, 0) + 1,
    last_used = NOW(),
    updated_at = NOW()
  WHERE id = task_id;
END;
$$;
