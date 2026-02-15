import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDurationLong } from "@/state/utils/timeUtils";
import type { ProjectBreakdownRow, DetailedTaskRow, DailySummaryRow } from "@/types";
import { cn } from "@/lib/utils";

export interface ReportTableBreakdownProps {
  rows: ProjectBreakdownRow[];
  className?: string;
}

export function ReportTableBreakdown({ rows, className }: ReportTableBreakdownProps) {
  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead className="text-right">Total time</TableHead>
            <TableHead className="text-right">% of total</TableHead>
            <TableHead className="text-right">Task count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.projectId}>
              <TableCell>
                <span
                  className="inline-block h-3 w-3 rounded-full mr-2 align-middle"
                  style={{ backgroundColor: r.projectColor }}
                />
                {r.projectName}
              </TableCell>
              <TableCell className="text-right">{formatDurationLong(r.totalSeconds)}</TableCell>
              <TableCell className="text-right">{r.percentOfTotal.toFixed(1)}%</TableCell>
              <TableCell className="text-right">{r.taskCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export interface ReportTableDetailedProps {
  rows: DetailedTaskRow[];
  className?: string;
}

export function ReportTableDetailed({ rows, className }: ReportTableDetailedProps) {
  return (
    <div className={cn("rounded-md border overflow-x-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Task name</TableHead>
            <TableHead className="text-right">Duration</TableHead>
            <TableHead>Time range</TableHead>
            <TableHead>Completed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={`${r.entryId}-${i}`}>
              <TableCell>{r.date}</TableCell>
              <TableCell>
                <span
                  className="inline-block h-3 w-3 rounded-full mr-2 align-middle"
                  style={{ backgroundColor: r.projectColor }}
                />
                {r.projectName}
              </TableCell>
              <TableCell>{r.taskName}</TableCell>
              <TableCell className="text-right">{formatDurationLong(r.durationSeconds)}</TableCell>
              <TableCell>{r.timeRange}</TableCell>
              <TableCell>{r.completedInRange ? "Yes" : "No"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export interface ReportTableDailyProps {
  rows: DailySummaryRow[];
  className?: string;
}

export function ReportTableDaily({ rows, className }: ReportTableDailyProps) {
  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Total time</TableHead>
            <TableHead className="text-right">Projects</TableHead>
            <TableHead className="text-right">Tasks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.date}>
              <TableCell>{r.date}</TableCell>
              <TableCell className="text-right">{formatDurationLong(r.totalSeconds)}</TableCell>
              <TableCell className="text-right">{r.projectCount}</TableCell>
              <TableCell className="text-right">{r.taskCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
