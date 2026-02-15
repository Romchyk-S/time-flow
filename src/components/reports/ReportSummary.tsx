import type { ReportSummary as ReportSummaryType } from "@/types";
import { formatDurationLong } from "@/state/utils/timeUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ReportSummaryProps {
  summary: ReportSummaryType;
  className?: string;
}

export function ReportSummary({ summary, className }: ReportSummaryProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total time tracked</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDurationLong(summary.totalSeconds)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.projectCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.taskCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average daily time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDurationLong(summary.averageDailySeconds)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
