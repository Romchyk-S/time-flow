-- Migration: Add total_duration_seconds to tasks and backfill from time_entries
-- Run order: after existing tasks and time_entries tables exist

BEGIN;

-- 1) Add column with default 0
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS total_duration_seconds integer NOT NULL DEFAULT 0;

-- 2) Backfill using time_entries durations for each task
-- This sums durations from completed entries. Assumes duration stored in seconds.
UPDATE public.tasks t
SET total_duration_seconds = COALESCE(src.total_seconds, 0)
FROM (
  SELECT task_id, COALESCE(SUM(duration), 0)::int AS total_seconds
  FROM public.time_entries
  WHERE duration IS NOT NULL
  GROUP BY task_id
) AS src
WHERE src.task_id = t.id;

COMMIT;