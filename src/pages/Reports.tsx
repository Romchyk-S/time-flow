import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useReportData } from "@/state/hooks/useReports";
import { getPresetRange } from "@/state/utils/dateUtils";
import { exportService } from "@/state/services/exportService";
import { DateRangeSelector, type PresetKey } from "@/components/reports/DateRangeSelector";
import { ReportSummary } from "@/components/reports/ReportSummary";
import {
  ReportTableBreakdown,
  ReportTableDetailed,
  ReportTableDaily,
} from "@/components/reports/ReportTable";
import { ExportButton, type ExportScope } from "@/components/reports/ExportButton";
import { format } from "date-fns";

export default function Reports() {
  const [preset, setPreset] = useState<PresetKey>("today");
  const initialRange = useMemo(() => getPresetRange("today"), []);
  const [customStart, setCustomStart] = useState<Date>(() => initialRange.start);
  const [customEnd, setCustomEnd] = useState<Date>(() => initialRange.end);

  const { startDate, endDate } = useMemo(() => {
    if (preset === "custom") {
      return { startDate: customStart, endDate: customEnd };
    }
    const range = getPresetRange(preset as "today" | "this_week" | "last_week" | "last_month");
    return { startDate: range.start, endDate: range.end };
  }, [preset, customStart, customEnd]);

  const { summary, breakdown, detailed, daily, isLoading } = useReportData(startDate, endDate);

  const periodLabel = useMemo(
    () => `${format(startDate, "MMM d")} – ${format(endDate, "MMM d")}`,
    [startDate, endDate]
  );

  const handlePresetChange = useCallback((p: PresetKey) => {
    setPreset(p);
    if (p !== "custom") {
      const range = getPresetRange(p as "today" | "this_week" | "last_week" | "last_month");
      setCustomStart(range.start);
      setCustomEnd(range.end);
    }
  }, []);

  const handleRangeChange = useCallback((start: Date, end: Date) => {
    setCustomStart(start);
    setCustomEnd(end);
  }, []);

  const handleExport = useCallback(
    (scope: ExportScope) => {
      const csv =
        scope === "full"
          ? exportService.fullReportToCsv(summary, periodLabel, breakdown, detailed, daily)
          : scope === "summary"
            ? exportService.summaryToCsv(summary, periodLabel)
            : scope === "breakdown"
              ? exportService.projectBreakdownToCsv(breakdown)
              : scope === "detailed"
                ? exportService.detailedTasksToCsv(detailed)
                : exportService.dailySummaryToCsv(daily);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `time-report-${scope}-${format(startDate, "yyyy-MM-dd")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [summary, periodLabel, breakdown, detailed, daily, startDate]
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">View time tracking reports and export to CSV.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            preset={preset}
            onPresetChange={handlePresetChange}
            onRangeChange={handleRangeChange}
          />
          <ExportButton onExport={handleExport} disabled={isLoading} />
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading report…
          </CardContent>
        </Card>
      ) : (
        <>
          <div>
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <ReportSummary summary={summary} />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Time by project</h3>
            {breakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data for this period.</p>
            ) : (
              <ReportTableBreakdown rows={breakdown} />
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Detailed tasks</h3>
            {detailed.length === 0 ? (
              <p className="text-sm text-muted-foreground">No entries for this period.</p>
            ) : (
              <ReportTableDetailed rows={detailed} />
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Daily summary</h3>
            {daily.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data for this period.</p>
            ) : (
              <ReportTableDaily rows={daily} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
