import type {
  ReportSummary,
  ProjectBreakdownRow,
  DetailedTaskRow,
  DailySummaryRow,
} from "@/types";
import { formatDurationLongSeconds } from "../utils/timeUtils";
import { formatDateKey, dayEnd } from "../utils/dateUtils";

import * as XLSX from "xlsx";

function rowsToXlsxSheet(rows: Record<string, string | number>[]) {
  return XLSX.utils.json_to_sheet(rows);
}

function workbookToBlob(wb: XLSX.WorkBook): Blob {
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function escapeCsvCell(value: string): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowsToCsv(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(escapeCsvCell).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvCell(String(row[h] ?? ""))).join(","));
  }
  return lines.join("\r\n");
}

export const exportService = {
  summaryToCsv(summary: ReportSummary, periodLabel: string): string {
    const rows = [
      { metric: "Period", value: periodLabel },
      { metric: "Total time tracked", value: formatDurationLongSeconds(summary.totalSeconds) },
      { metric: "Number of projects", value: summary.projectCount },
      { metric: "Number of tasks", value: summary.taskCount },
      { metric: "Average daily time", value: formatDurationLongSeconds(summary.averageDailySeconds) },
    ];
    return rowsToCsv(rows);
  },

  projectBreakdownToCsv(rows: ProjectBreakdownRow[]): string {
    const data = rows.map((r) => ({
      "Project name": r.projectName,
      "Total time": formatDurationLongSeconds(r.totalSeconds),
      "% of total": `${r.percentOfTotal.toFixed(1)}%`,
      "Task count": r.taskCount,
    }));
    return rowsToCsv(data);
  },

  detailedTasksToCsv(rows: DetailedTaskRow[]): string {
    const data = rows.map((r) => ({
      Date: r.date,
      Project: r.projectName,
      "Task name": r.taskName,
      Duration: formatDurationLongSeconds(r.durationSeconds),
      "Time range": r.timeRange,
      "Completed in range": r.completedInRange ? "Yes" : "No",
    }));
    return rowsToCsv(data);
  },

  dailySummaryToCsv(rows: DailySummaryRow[]): string {
    const data = rows.map((r) => ({
      Date: r.date,
      "Total hours": formatDurationLongSeconds(r.totalSeconds),
      "Projects count": r.projectCount,
      "Task count": r.taskCount,
    }));
    return rowsToCsv(data);
  },

  fullReportToCsv(
    summary: ReportSummary,
    periodLabel: string,
    breakdown: ProjectBreakdownRow[],
    detailed: DetailedTaskRow[],
    daily: DailySummaryRow[]
  ): string {
    const sheets: string[] = [];
    sheets.push("=== Summary ===");
    sheets.push(this.summaryToCsv(summary, periodLabel));
    sheets.push("");
    sheets.push("=== Time by project ===");
    sheets.push(this.projectBreakdownToCsv(breakdown));
    sheets.push("");
    sheets.push("=== Detailed tasks ===");
    sheets.push(this.detailedTasksToCsv(detailed));
    sheets.push("");
    sheets.push("=== Daily summary ===");
    sheets.push(this.dailySummaryToCsv(daily));
    return sheets.join("\r\n");
  },

  fullReportToXlsxBlob(
    summary: ReportSummary,
    periodLabel: string,
    breakdown: ProjectBreakdownRow[],
    detailed: DetailedTaskRow[],
    daily: DailySummaryRow[]
  ): Blob {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, rowsToXlsxSheet([
      { metric: "Period", value: periodLabel },
      { metric: "Total time tracked", value: formatDurationLongSeconds(summary.totalSeconds) },
      { metric: "Number of projects", value: summary.projectCount },
      { metric: "Number of tasks", value: summary.taskCount },
      { metric: "Average daily time", value: formatDurationLongSeconds(summary.averageDailySeconds) },
    ]), "Summary");
    XLSX.utils.book_append_sheet(wb, rowsToXlsxSheet(breakdown.map(r => ({
      "Project name": r.projectName,
      "Total time": formatDurationLongSeconds(r.totalSeconds),
      "% of total": `${r.percentOfTotal.toFixed(1)}%`,
      "Task count": r.taskCount,
    }))), "Time by project");
    XLSX.utils.book_append_sheet(wb, rowsToXlsxSheet(detailed.map(r => ({
      Date: r.date,
      Project: r.projectName,
      "Task name": r.taskName,
      Duration: formatDurationLongSeconds(r.durationSeconds),
      "Time range": r.timeRange,
      "Completed in range": r.completedInRange ? "Yes" : "No",
    }))), "Detailed tasks");
    XLSX.utils.book_append_sheet(wb, rowsToXlsxSheet(daily.map(r => ({
      Date: r.date,
      "Total hours": formatDurationLongSeconds(r.totalSeconds),
      "Projects count": r.projectCount,
      "Task count": r.taskCount,
    }))), "Daily summary");
    return workbookToBlob(wb);
  },
};
