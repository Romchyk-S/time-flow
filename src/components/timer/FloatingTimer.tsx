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
    <div className="fixed top-2 right-4 z-50 group">
      <div className="flex items-center gap-3 rounded-full border bg-card px-4 py-2 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl">
        <Timer className="h-4 w-4 text-muted-foreground" />

        <div className="block group-hover:hidden">
          <TimerDisplay
            isRunning={true}
            elapsedTime={elapsed}
            taskName={taskName}
            projectName={null}
            projectColor={null}
            compact
          />
        </div>

        <div className="hidden group-hover:flex items-center gap-3">
          <TimerDisplay
            isRunning={true}
            elapsedTime={elapsed}
            taskName={null}
            projectName={null}
            projectColor={null}
            compact
          />
          <div className="flex flex-col leading-tight">
            <div className="text-xs text-muted-foreground">Task:</div>
            <div className="text-sm font-medium text-foreground max-w-[220px] truncate" title={taskName ?? undefined}>
              {taskName ?? ""}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="text-xs text-muted-foreground">Project:</div>
              {projectName ? (
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0 border"
                    style={{ backgroundColor: projectColor ?? "#888888", borderColor: "var(--border)" }}
                  />
                  <span
                    className="text-xs font-medium rounded-full px-2 py-0.5 truncate max-w-[180px]"
                    style={{
                      backgroundColor: projectColor ? `${projectColor}12` : "hsl(var(--muted))",
                      border: `1px solid ${projectColor ? `${projectColor}55` : "hsl(var(--border))"}`,
                      color: "hsl(var(--foreground))",
                    }}
                    title={projectName}
                  >
                    {projectName}
                  </span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <TimerControls
          isRunning={true}
          onStart={() => {}}
          onStop={async () => {
            await stopTimer();
            refreshRunning();
          }}
          size="sm"
        />
      </div>
    </div>
  );
}
