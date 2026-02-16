-- Keep tasks.total_duration (minutes) authoritative as sum of related time_entries.duration

-- Recalculate helper
CREATE OR REPLACE FUNCTION public.recalculate_task_total_duration(p_task_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_total integer;
BEGIN
  SELECT COALESCE(SUM(duration), 0)
  INTO v_total
  FROM public.time_entries
  WHERE task_id = p_task_id
    AND end_time IS NOT NULL;

  UPDATE public.tasks
  SET total_duration = v_total,
      updated_at = NOW()
  WHERE id = p_task_id;
END;
$$;

-- Trigger function
CREATE OR REPLACE FUNCTION public.trg_time_entries_recalc_task_total_duration()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    PERFORM public.recalculate_task_total_duration(OLD.task_id);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    -- If task_id changed, update both
    IF (NEW.task_id IS DISTINCT FROM OLD.task_id) THEN
      PERFORM public.recalculate_task_total_duration(OLD.task_id);
      PERFORM public.recalculate_task_total_duration(NEW.task_id);
    ELSE
      PERFORM public.recalculate_task_total_duration(NEW.task_id);
    END IF;
    RETURN NEW;
  ELSE
    -- INSERT
    PERFORM public.recalculate_task_total_duration(NEW.task_id);
    RETURN NEW;
  END IF;
END;
$$;

-- Create (or replace) trigger
DROP TRIGGER IF EXISTS time_entries_recalc_task_total_duration ON public.time_entries;
CREATE TRIGGER time_entries_recalc_task_total_duration
AFTER INSERT OR UPDATE OR DELETE ON public.time_entries
FOR EACH ROW
EXECUTE FUNCTION public.trg_time_entries_recalc_task_total_duration();
