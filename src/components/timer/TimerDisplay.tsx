import { formatDuration } from "@/state/utils/timeUtils";
import { cn } from "@/lib/utils";
import { Timer } from "lucide-react";

export interface TimerDisplayProps {
  isRunning: boolean;
  elapsedTime: number;
  taskName: string | null;
  projectName: string | null;
  projectColor: string | null;
  className?: string;
  compact?: boolean;
}

export function TimerDisplay({
  isRunning,
  elapsedTime,
  taskName,
  projectName,
  projectColor,
  className,
  compact = false,
}: TimerDisplayProps) {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {isRunning && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        )}
        <span className="font-mono text-sm font-semibold tabular-nums tracking-tight">
          {formatDuration(elapsedTime)}
        </span>
        {taskName && (
          <span className="text-sm text-foreground truncate max-w-[160px]" title={taskName}>
            {taskName}
          </span>
        )}
        {projectName && (
          <span
            className="text-xs font-medium rounded-full px-2 py-0.5 truncate max-w-[140px]"
            style={{
              backgroundColor: projectColor ? `${projectColor}18` : "hsl(var(--muted))",
              color: "hsl(var(--foreground))",
              border: `1px solid ${projectColor ? `${projectColor}55` : "hsl(var(--border))"}`,
            }}
            title={projectName}
          >
            {projectName}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Large timer display */}
      <div className="flex items-center gap-3">
        {isRunning && (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
        )}
        <span className="font-mono text-3xl font-bold tabular-nums tracking-tight text-foreground">
          {formatDuration(elapsedTime)}
        </span>
      </div>
      {/* Task and project info */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {taskName && (
          <span className="text-sm font-medium text-foreground" title={taskName}>
            {taskName}
          </span>
        )}
        {taskName && projectName && (
          <span className="text-muted-foreground">·</span>
        )}
        {projectName && (
          <span
            className="text-xs font-medium rounded-full px-2.5 py-0.5"
            style={{
              backgroundColor: projectColor ? `${projectColor}18` : "hsl(var(--muted))",
              color: "hsl(var(--foreground))",
              border: `1px solid ${projectColor ? `${projectColor}55` : "hsl(var(--border))"}`,
            }}
            title={projectName}
          >
            {projectName}
          </span>
        )}
      </div>
    </div>
  );
}
