/** Start of day in local timezone as ISO string */
export function dayStart(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** End of day (exclusive) = next day 00:00:00 */
export function dayEnd(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Format date for display YYYY-MM-DD */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse YYYY-MM-DD to Date at start of day local */
export function parseDateKey(key: string): Date {
  const d = new Date(key + "T00:00:00");
  return d;
}

/** Previous workday (skip weekend if needed) */
export function prevWorkday(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  const day = d.getDay();
  if (day === 0) d.setDate(d.getDate() - 2);
  else if (day === 6) d.setDate(d.getDate() - 1);
  return d;
}

/** Next workday */
export function nextWorkday(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  const day = d.getDay();
  if (day === 0) d.setDate(d.getDate() + 1);
  else if (day === 6) d.setDate(d.getDate() + 2);
  return d;
}

/** Previous calendar day (one day back) */
export function prevDay(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d;
}

/** Subtract days from a date */
export function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

/** Next calendar day (one day forward) */
export function nextDay(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d;
}

/** Tasks page range: whole current week + whole next week (2 weeks). Monday = start of week. */
export function getTasksPageDateRange(): { rangeStart: Date; rangeEnd: Date } {
  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setHours(0, 0, 0, 0);
  const day = rangeStart.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  rangeStart.setDate(rangeStart.getDate() + diffToMonday);

  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeEnd.getDate() + 13);
  rangeEnd.setHours(23, 59, 59, 999);

  return { rangeStart, rangeEnd };
}

/** Is same calendar day? */
export function isSameDay(a: Date, b: Date): boolean {
  return formatDateKey(a) === formatDateKey(b);
}

/** Today at start */
export function todayStart(): string {
  return dayStart(new Date());
}

/** Preset ranges for reports */
export function getPresetRange(
  preset: "today" | "this_week" | "last_week" | "last_month"
): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (preset === "today") {
    return { start, end };
  }
  if (preset === "this_week") {
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
    end.setDate(end.getDate() + (7 - (end.getDay() || 7)));
    return { start, end };
  }
  if (preset === "last_week") {
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff - 7);
    end.setTime(start.getTime());
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  if (preset === "last_month") {
    start.setMonth(start.getMonth() - 1);
    start.setDate(1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  return { start, end };
}
