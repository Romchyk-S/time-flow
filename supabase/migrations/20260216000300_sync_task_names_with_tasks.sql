-- Keep task_names in sync with tasks (insert/update/delete)

CREATE OR REPLACE FUNCTION public.recalculate_task_name(p_project_id uuid, p_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_usage_count integer;
  v_last_used timestamptz;
  v_name text;
BEGIN
  v_name := btrim(p_name);

  SELECT
    COALESCE(SUM(COALESCE(usage_count, 0)), 0),
    MAX(last_used)
  INTO v_usage_count, v_last_used
  FROM public.tasks
  WHERE project_id = p_project_id
    AND btrim(name) = v_name;

  IF v_usage_count = 0 THEN
    DELETE FROM public.task_names
    WHERE project_id = p_project_id
      AND name = v_name;
    RETURN;
  END IF;

  INSERT INTO public.task_names (project_id, name, usage_count, last_used)
  VALUES (p_project_id, v_name, v_usage_count, COALESCE(v_last_used, now()))
  ON CONFLICT (project_id, name)
  DO UPDATE SET
    usage_count = EXCLUDED.usage_count,
    last_used = EXCLUDED.last_used;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_tasks_sync_task_names()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM public.recalculate_task_name(NEW.project_id, NEW.name);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM public.recalculate_task_name(OLD.project_id, OLD.name);
    RETURN OLD;
  ELSE
    IF (NEW.project_id IS DISTINCT FROM OLD.project_id) OR (btrim(NEW.name) IS DISTINCT FROM btrim(OLD.name)) THEN
      PERFORM public.recalculate_task_name(OLD.project_id, OLD.name);
      PERFORM public.recalculate_task_name(NEW.project_id, NEW.name);
      RETURN NEW;
    END IF;

    IF (NEW.usage_count IS DISTINCT FROM OLD.usage_count) OR (NEW.last_used IS DISTINCT FROM OLD.last_used) THEN
      PERFORM public.recalculate_task_name(NEW.project_id, NEW.name);
      RETURN NEW;
    END IF;

    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS tasks_sync_task_names ON public.tasks;
CREATE TRIGGER tasks_sync_task_names
AFTER INSERT OR UPDATE OF name, project_id, usage_count, last_used OR DELETE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.trg_tasks_sync_task_names();
