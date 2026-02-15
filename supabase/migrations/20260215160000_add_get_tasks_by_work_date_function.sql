-- Create a function to get tasks by work date
create or replace function get_tasks_by_work_date(target_date date)
returns setof tasks as $$
  select t.*
  from tasks t
  where t.work_dates @> ARRAY[target_date]::date[]
  order by t.name;
$$ language sql stable;
