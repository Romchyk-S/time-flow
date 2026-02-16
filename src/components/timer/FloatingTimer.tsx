import { Link } from "react-router-dom";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { useTimer } from "@/state/hooks/useTimer";
import { Timer } from "lucide-react";

export function FloatingTimer() {
  const {
    isRunning,
    elapsed,
    taskName,
    projectName,
    projectColor,
    stopTimer,
    refreshRunning,
  } = useTimer();

  if (!isRunning) return null;

  return (
    <div className="fixed top-2 right-4 z-50 flex items-center gap-3 rounded-full border bg-card px-4 py-2 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
      <Timer className="h-4 w-4 text-muted-foreground" />
      <TimerDisplay
        isRunning={true}
        elapsedTime={elapsed}
        taskName={taskName}
        projectName={projectName}
        projectColor={projectColor}
        compact
      />
      <TimerControls
        isRunning={true}
        onStart={() => {}}
        onStop={async () => {
          await stopTimer();
          refreshRunning();
        }}
        size="sm"
      />
      <Link
        to="/"
        className="text-xs font-medium text-primary hover:underline"
      >
        Open
      </Link>
    </div>
  );
}
