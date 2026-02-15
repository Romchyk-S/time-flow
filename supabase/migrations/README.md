# Supabase migrations for Time Flow

Run these migrations against your Supabase database so the app has the required columns and constraints.

## Option 1: Supabase CLI (recommended)

If you use the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## Option 2: SQL Editor in Supabase Dashboard

1. Open your project in [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**.
2. Run the contents of each migration file in order (by filename timestamp).

Start with:

- `20260215120000_time_flow_tasks_status_and_work_dates.sql` – adds `status` and `work_dates` to `tasks` (idempotent).

## What the migration does

- **`tasks.status`** – `text`, default `'not_started'`, constraint: `not_started` | `in_progress` | `paused` | `in_review` | `completed`.
- **`tasks.work_dates`** – `date[]`, default `'{}'` (expected / worked-on dates).

Your existing `tasks` table (and its trigger `update_updated_at_column`) are left as-is; only these columns and the status constraint are added or updated.
