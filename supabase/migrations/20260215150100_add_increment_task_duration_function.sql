-- Create a function to safely increment task duration
CREATE OR REPLACE FUNCTION public.increment_task_duration(
  task_id uuid,
  duration_seconds integer
)
RETURNS SETOF tasks
LANGUAGE sql
AS $$
  UPDATE public.tasks
  SET 
    execution_duration = COALESCE(execution_duration, '0 seconds'::interval) + (duration_seconds * interval '1 second'),
    last_used = NOW()
  WHERE id = task_id
  RETURNING *;
$$;
