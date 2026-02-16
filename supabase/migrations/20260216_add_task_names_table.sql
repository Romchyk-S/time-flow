-- Add task_names table for autocomplete and usage tracking
CREATE TABLE IF NOT EXISTS task_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, name)
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_task_names_project_id ON task_names(project_id);
CREATE INDEX IF NOT EXISTS idx_task_names_usage_count ON task_names(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_task_names_last_used ON task_names(last_used DESC);
