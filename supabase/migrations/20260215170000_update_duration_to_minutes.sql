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
  current_duration interval;
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
  SELECT execution_duration INTO current_duration 
  FROM public.tasks 
  WHERE id = task_id;
  
  RAISE NOTICE 'Current duration before update: %', current_duration;
  
  -- Update with minutes
  UPDATE public.tasks
  SET 
    execution_duration = COALESCE(execution_duration, '0 minutes'::interval) + 
                        (duration_minutes * interval '1 minute'),
    last_used = NOW()
  WHERE id = task_id
  RETURNING * INTO updated_task;
  
  RAISE NOTICE 'Updated duration: %', updated_task.execution_duration;
  
  RETURN NEXT updated_task;
  RETURN;
END;
$$;
