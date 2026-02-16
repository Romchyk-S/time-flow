import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function TimerControls({
  isRunning,
  onStart,
  onStop,
  disabled,
  className,
  size = "default",
}: TimerControlsProps) {
  const iconSize = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isRunning ? (
        <Button
          type="button"
          variant="destructive"
          size={size === "lg" ? "default" : "sm"}
          onClick={onStop}
          disabled={disabled}
          className={cn(
            "gap-1.5 font-semibold shadow-sm",
            size === "lg" && "px-6 py-2.5 text-base"
          )}
        >
          <Square className={iconSize} />
          Stop
        </Button>
      ) : (
        <Button
          type="button"
          size={size === "lg" ? "default" : "sm"}
          onClick={onStart}
          disabled={disabled}
          className={cn(
            "gap-1.5 font-semibold shadow-sm",
            size === "lg" && "px-6 py-2.5 text-base"
          )}
        >
          <Play className={iconSize} />
          Start
        </Button>
      )}
    </div>
  );
}
