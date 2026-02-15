import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { timeEntriesClient } from "@/api/clients/timeEntriesClient";
import type {
  ReportSummary,
  ProjectBreakdownRow,
  DetailedTaskRow,
  DailySummaryRow,
} from "@/types";
import { formatDateKey, dayEnd } from "../utils/dateUtils";

type EntryRow = Awaited<ReturnType<typeof timeEntriesClient.getByDateRange>>[number];

function buildReport(
  entries: EntryRow[],
  startDate: Date,
  endDate: Date
): {
  summary: ReportSummary;
  breakdown: ProjectBreakdownRow[];
  detailed: DetailedTaskRow[];
  daily: DailySummaryRow[];
} {
  const totalSeconds = entries.reduce((s, e) => s + (e.duration ?? 0), 0);
  const projectIds = new Set<string>();
  const taskIds = new Set<string>();
  const byProject = new Map<string, { seconds: number; tasks: Set<string> }>();
  const dailyMap = new Map<string, { seconds: number; projects: Set<string>; tasks: Set<string> }>();

  for (const e of entries) {
    const task = (e as { task?: { id: string; name: string; project_id: string; project?: { id: string; name: string; color: string } } }).task;
    if (!task) continue;
    const proj = task.project;
    const duration = e.duration ?? 0;
    const dateKey = formatDateKey(new Date(e.start_time));
    projectIds.add(task.project_id);
    taskIds.add(task.id);
    if (!byProject.has(task.project_id)) {
      byProject.set(task.project_id, { seconds: 0, tasks: new Set() });
    }
    const bp = byProject.get(task.project_id)!;
    bp.seconds += duration;
    bp.tasks.add(task.id);
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, { seconds: 0, projects: new Set(), tasks: new Set() });
    }
    const dm = dailyMap.get(dateKey)!;
    dm.seconds += duration;
    dm.projects.add(task.project_id);
    dm.tasks.add(task.id);
  }

  const workDaysCount = dailyMap.size || 1;
  const summary: ReportSummary = {
    totalSeconds,
    projectCount: projectIds.size,
    taskCount: taskIds.size,
    averageDailySeconds: Math.round(totalSeconds / workDaysCount),
    workDaysCount,
  };

  const breakdown: ProjectBreakdownRow[] = Array.from(byProject.entries()).map(([projectId, data]) => {
    const firstEntry = entries.find((e) => ((e as EntryRow & { task?: { project_id: string; project?: { name: string; color: string } } }).task?.project_id) === projectId);
    const proj = firstEntry && (firstEntry as EntryRow & { task?: { project?: { name: string; color: string } } }).task?.project;
    return {
      projectId,
      projectName: proj?.name ?? "",
      projectColor: proj?.color ?? "#888",
      totalSeconds: data.seconds,
      percentOfTotal: totalSeconds ? (data.seconds / totalSeconds) * 100 : 0,
      taskCount: data.tasks.size,
    };
  });

  const detailed: DetailedTaskRow[] = entries.map((e) => {
    const task = (e as EntryRow & { task?: { id: string; name: string; project?: { name: string; color: string } } }).task;
    const start = new Date(e.start_time);
    const end = e.end_time ? new Date(e.end_time) : new Date();
    const range = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    return {
      date: formatDateKey(start),
      projectName: task?.project?.name ?? "",
      projectColor: task?.project?.color ?? "#888",
      taskName: task?.name ?? "",
      durationSeconds: e.duration ?? 0,
      timeRange: range,
      completedInRange: !!e.end_time,
      taskId: task?.id ?? "",
      entryId: e.id,
    };
  });

  const daily: DailySummaryRow[] = Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      totalSeconds: data.seconds,
      projectCount: data.projects.size,
      taskCount: data.tasks.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { summary, breakdown, detailed, daily };
}

export function useReportData(startDate: Date, endDate: Date) {
  const startStr = startDate.toISOString();
  const endStr = dayEnd(endDate);
  const query = useQuery({
    queryKey: ["report", startStr, endStr],
    queryFn: () => timeEntriesClient.getByDateRange(startStr, endStr),
  });
  const report = useMemo(() => {
    if (!query.data?.length) {
      return {
        summary: {
          totalSeconds: 0,
          projectCount: 0,
          taskCount: 0,
          averageDailySeconds: 0,
          workDaysCount: 0,
        },
        breakdown: [],
        detailed: [],
        daily: [],
      };
    }
    return buildReport(query.data as EntryRow[], startDate, endDate);
  }, [query.data, startDate, endDate]);

  return { ...query, ...report };
}
