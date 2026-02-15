-- Update the function to store duration in minutes and add logging
CREATE OR REPLACE FUNCTION public.increment_task_duration(
  task_id uuid,
  duration_seconds integer
)
RETURNS SETOF tasks
LANGUAGE plpgsql
AS $$
DECLARE
  duration_minutes integer;
  current_duration integer;
  updated_task tasks%ROWTYPE;
BEGIN
  -- Convert seconds to minutes, rounding up to ensure we don't lose time
  duration_minutes := CEIL(duration_seconds::numeric / 60);
  
  -- Log the update
  RAISE NOTICE 'Updating task %: adding % minutes (from % seconds)', 
    task_id, 
    duration_minutes, 
    duration_seconds;
    
  -- Get current duration for logging
  SELECT total_duration INTO current_duration 
  FROM public.tasks 
  WHERE id = task_id;
  
  RAISE NOTICE 'Current duration before update: % minutes', current_duration;
  
  -- Update with minutes
  UPDATE public.tasks
  SET 
    total_duration = COALESCE(total_duration, 0) + duration_minutes,
    last_used = NOW()
  WHERE id = task_id
  RETURNING * INTO updated_task;
  
  RAISE NOTICE 'Updated duration: % minutes', updated_task.total_duration;
  
  RETURN NEXT updated_task;
  RETURN;
END;
$$;
