import { formatDuration } from "@/state/utils/timeUtils";
import { cn } from "@/lib/utils";

export interface TimerDisplayProps {
  isRunning: boolean;
  elapsedTime: number;
  taskName: string | null;
  projectName: string | null;
  projectColor: string | null;
  className?: string;
}

export function TimerDisplay({
  isRunning,
  elapsedTime,
  taskName,
  projectName,
  projectColor,
  className,
}: TimerDisplayProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="font-mono text-sm tabular-nums">
        {formatDuration(elapsedTime)}
      </span>
      {taskName && (
        <span className="text-sm text-foreground truncate max-w-[120px]" title={taskName}>
          {taskName}
        </span>
      )}
      {projectName && (
        <span
          className="text-xs rounded px-1.5 py-0.5 truncate max-w-[80px]"
          style={{
            backgroundColor: projectColor ? `${projectColor}30` : "var(--muted)",
            color: projectColor || "inherit",
          }}
          title={projectName}
        >
          {projectName}
        </span>
      )}
      {isRunning && (
        <span
          className="h-2 w-2 rounded-full bg-green-500 animate-pulse"
          title="Timer running"
        />
      )}
    </div>
  );
}
