import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
  className?: string;
}

export function TimerControls({
  isRunning,
  onStart,
  onStop,
  disabled,
  className,
}: TimerControlsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isRunning ? (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onStop}
          disabled={disabled}
          className="gap-1.5"
        >
          <Square className="h-4 w-4" />
          Stop
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          onClick={onStart}
          disabled={disabled}
          className="gap-1.5"
        >
          <Play className="h-4 w-4" />
          Start
        </Button>
      )}
    </div>
  );
}
