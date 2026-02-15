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
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className="font-mono text-sm tabular-nums">
        {formatDuration(elapsedTime)}
      </span>
      {taskName && (
        <span className="text-sm text-foreground whitespace-normal break-words" title={taskName}>
          {taskName}
        </span>
      )}
      {projectName && (
        <span
          className="text-xs rounded px-1.5 py-0.5 border text-foreground whitespace-normal break-words"
          style={{
            backgroundColor: projectColor ? `${projectColor}1A` : "var(--muted)",
            borderColor: projectColor || "var(--border)",
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
