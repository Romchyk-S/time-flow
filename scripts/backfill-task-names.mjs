import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

async function getSupabaseClientDefaultsFromSource() {
  const p = resolve(process.cwd(), 'src', 'integrations', 'supabase', 'client.ts');
  const src = await readFile(p, 'utf8');

  const urlMatch = src.match(/const\s+SUPABASE_URL\s*=\s*"([^"]+)"/);
  const keyMatch = src.match(/const\s+SUPABASE_PUBLISHABLE_KEY\s*=\s*"([^"]+)"/);

  return {
    url: urlMatch?.[1] ?? null,
    anonKey: keyMatch?.[1] ?? null,
  };
}

function parseArgs(argv) {
  const flags = new Set(argv.slice(2));
  return {
    truncate: flags.has('--truncate'),
  };
}

function trimName(name) {
  return (name ?? '').trim();
}

function maxDate(a, b) {
  if (!a) return b;
  if (!b) return a;
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}

async function main() {
  const { truncate } = parseArgs(process.argv);

  const defaults = await getSupabaseClientDefaultsFromSource().catch(() => ({ url: null, anonKey: null }));
  const url = process.env.SUPABASE_URL ?? defaults.url;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;
  const anonKey = defaults.anonKey;

  if (!url) {
    throw new Error('Missing SUPABASE_URL (and could not infer it from src/integrations/supabase/client.ts)');
  }

  const key = serviceKey ?? anonKey;
  if (!key) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY (and could not infer anon key from src/integrations/supabase/client.ts)'
    );
  }

  if (!serviceKey) {
    console.log(
      '[backfill-task-names] WARNING: SUPABASE_SERVICE_ROLE_KEY not set; falling back to anon key from src/integrations/supabase/client.ts. This may fail due to RLS.'
    );
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (truncate) {
    const { error } = await supabase.from('task_names').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
    console.log('[backfill-task-names] task_names truncated');
  }

  const pageSize = 1000;
  let from = 0;
  const aggregated = new Map();

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('tasks')
      .select('project_id,name,usage_count,last_used')
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const row of data) {
      const projectId = row.project_id;
      const name = trimName(row.name);
      if (!projectId || !name) continue;

      const key = `${projectId}::${name}`;
      const prev = aggregated.get(key) ?? {
        project_id: projectId,
        name,
        usage_count: 0,
        last_used: null,
      };

      const usage = Number(row.usage_count ?? 0);
      prev.usage_count += Number.isFinite(usage) ? usage : 0;
      prev.last_used = maxDate(prev.last_used, row.last_used ?? null);
      aggregated.set(key, prev);
    }

    from += data.length;
    if (data.length < pageSize) break;
  }

  const rows = Array.from(aggregated.values()).map((r) => ({
    ...r,
    last_used: r.last_used ?? new Date().toISOString(),
  }));

  console.log('[backfill-task-names] aggregated rows', { count: rows.length });
  if (rows.length === 0) {
    console.log('[backfill-task-names] nothing to backfill');
    return;
  }

  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('task_names')
      .upsert(chunk, { onConflict: 'project_id,name' });
    if (error) throw error;
    console.log('[backfill-task-names] upserted', { chunk: `${i}-${i + chunk.length - 1}` });
  }

  console.log('[backfill-task-names] done');
}

main().catch((e) => {
  console.error('[backfill-task-names] failed', e);
  process.exitCode = 1;
});
