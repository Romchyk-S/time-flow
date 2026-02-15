import { Link } from "react-router-dom";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { useTimer } from "@/state/hooks/useTimer";

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
    <div className="fixed top-2 right-4 z-50 flex items-center gap-3 rounded-lg border bg-card px-3 py-2 shadow-md">
      <TimerDisplay
        isRunning={true}
        elapsedTime={elapsed}
        taskName={taskName}
        projectName={projectName}
        projectColor={projectColor}
      />
      <TimerControls
        isRunning={true}
        onStart={() => {}}
        onStop={async () => {
          await stopTimer();
          refreshRunning();
        }}
      />
      <Link
        to="/"
        className="text-xs text-primary hover:underline"
      >
        Open
      </Link>
    </div>
  );
}
