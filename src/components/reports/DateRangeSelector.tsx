import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type PresetKey = "today" | "this_week" | "last_week" | "last_month" | "custom";

export interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  preset: PresetKey;
  onPresetChange: (preset: PresetKey) => void;
  onRangeChange: (start: Date, end: Date) => void;
  className?: string;
}

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "this_week", label: "This week" },
  { key: "last_week", label: "Last week" },
  { key: "last_month", label: "Last month" },
  { key: "custom", label: "Custom" },
];

export function DateRangeSelector({
  startDate,
  endDate,
  preset,
  onPresetChange,
  onRangeChange,
  className,
}: DateRangeSelectorProps) {
  const handleSelectRange = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range?.from) return;
    const to = range.to ?? range.from;
    onRangeChange(range.from, to);
    onPresetChange("custom");
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.key}
            variant={preset === p.key ? "default" : "outline"}
            size="sm"
            onClick={() => onPresetChange(p.key)}
          >
            {p.label}
          </Button>
        ))}
        {preset === "custom" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(startDate, "MMM d")} – {format(endDate, "MMM d")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: startDate, to: endDate }}
                onSelect={handleSelectRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
      {preset !== "custom" && (
        <p className="text-sm text-muted-foreground">
          {format(startDate, "MMM d, yyyy")} – {format(endDate, "MMM d, yyyy")}
        </p>
      )}
    </div>
  );
}
