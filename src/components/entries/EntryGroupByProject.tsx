import { formatDurationLong } from "@/state/utils/timeUtils";
import { formatDuration } from "@/state/utils/timeUtils";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import { CircleDot, Pause } from "lucide-react";

export interface EntryRow {
  id: string;
  taskId: string;
  taskName: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  status: string;
  duration: number;
  startTime: string;
  endTime: string | null;
  isRunning?: boolean;
}

export interface EntryGroupByProjectProps {
  groups: { project: Project; taskCount: number; totalSeconds: number; entries: EntryRow[] }[];
  runningTaskId: string | null;
  onEditTaskName: (taskId: string, name: string) => void;
  onEditProject: (taskId: string, projectId: string) => void;
  onEditDuration: (entryId: string, durationSeconds: number) => void;
  onEditStatus: (taskId: string, status: string) => void;
  onDeleteTask: (taskId: string) => void;
  editingEntryId: string | null;
  editingDurationValue: string;
  onStartEditDuration: (entryId: string, currentSeconds: number) => void;
  onDurationChange: (value: string) => void;
  onSaveDuration: () => void;
  onCancelEditDuration: () => void;
  statusOptions: { value: string; label: string }[];
  projects: Project[];
  className?: string;
}

export function EntryGroupByProject({
  groups,
  runningTaskId,
  onEditTaskName,
  onEditProject,
  onEditDuration,
  onEditStatus,
  onDeleteTask,
  editingEntryId,
  editingDurationValue,
  onStartEditDuration,
  onDurationChange,
  onSaveDuration,
  onCancelEditDuration,
  statusOptions,
  projects,
  className,
}: EntryGroupByProjectProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {groups.map(({ project, taskCount, totalSeconds, entries }) => (
        <div key={project.id} className="rounded-lg border">
          <div
            className="flex items-center justify-between px-4 py-2 border-b"
            style={{
              backgroundColor: `${project.color}18`,
              borderColor: `${project.color}40`,
            }}
          >
            <span className="font-medium" style={{ color: project.color }}>
              {project.name}
            </span>
            <span className="text-sm text-muted-foreground">
              {taskCount} task{taskCount !== 1 ? "s" : ""} · {formatDurationLong(totalSeconds)}
            </span>
          </div>
          <div className="divide-y">
            {entries.map((row) => (
              <EntryRowInline
                key={row.id}
                row={row}
                isRunning={runningTaskId === row.taskId}
                onEditTaskName={onEditTaskName}
                onEditProject={onEditProject}
                onEditDuration={onEditDuration}
                onEditStatus={onEditStatus}
                onDeleteTask={onDeleteTask}
                editingEntryId={editingEntryId}
                editingDurationValue={editingDurationValue}
                onStartEditDuration={onStartEditDuration}
                onDurationChange={onDurationChange}
                onSaveDuration={onSaveDuration}
                onCancelEditDuration={onCancelEditDuration}
                statusOptions={statusOptions}
                projects={projects}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface EntryRowInlineProps {
  row: EntryRow;
  isRunning: boolean;
  onEditTaskName: (taskId: string, name: string) => void;
  onEditProject: (taskId: string, projectId: string) => void;
  onEditDuration: (entryId: string, durationSeconds: number) => void;
  onEditStatus: (taskId: string, status: string) => void;
  onDeleteTask: (taskId: string) => void;
  editingEntryId: string | null;
  editingDurationValue: string;
  onStartEditDuration: (entryId: string, currentSeconds: number) => void;
  onDurationChange: (value: string) => void;
  onSaveDuration: () => void;
  onCancelEditDuration: () => void;
  statusOptions: { value: string; label: string }[];
  projects: Project[];
}

function EntryRowInline({
  row,
  isRunning,
  onEditTaskName,
  onEditProject,
  onEditDuration,
  onEditStatus,
  onDeleteTask,
  editingEntryId,
  editingDurationValue,
  onStartEditDuration,
  onDurationChange,
  onSaveDuration,
  onCancelEditDuration,
  statusOptions,
  projects,
}: EntryRowInlineProps) {
  const isEditingDuration = editingEntryId === row.id;
  const timeRange =
    row.endTime
      ? `${new Date(row.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(row.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : "Running...";

  const statusIcon =
    row.status === "in_progress" && isRunning ? (
      <CircleDot className="h-4 w-4 text-green-500 shrink-0 animate-pulse" />
    ) : row.status === "paused" ? (
      <Pause className="h-4 w-4 text-muted-foreground shrink-0" />
    ) : null;

  return (
    <div className="flex items-center gap-4 px-4 py-2 text-sm">
      {statusIcon ?? (isRunning ? <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" title="Timer running" /> : null)}
      <div className="min-w-[140px] flex-1">
        <input
          type="text"
          className="w-full bg-transparent border-b border-transparent hover:border-input focus:border-ring focus:outline-none px-1 py-0.5"
          value={row.taskName}
          onChange={(e) => onEditTaskName(row.taskId, e.target.value)}
          onBlur={(e) => e.target.value.trim() && onEditTaskName(row.taskId, e.target.value.trim())}
        />
      </div>
      <select
        className="min-w-[120px] rounded border bg-background px-2 py-1 text-xs"
        value={row.projectId}
        onChange={(e) => onEditProject(row.taskId, e.target.value)}
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <div className="min-w-[70px]">
        {isEditingDuration ? (
          <span className="flex items-center gap-1">
            <input
              type="text"
              className="w-14 rounded border px-1 py-0.5 text-xs font-mono"
              value={editingDurationValue}
              onChange={(e) => onDurationChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveDuration();
                if (e.key === "Escape") onCancelEditDuration();
              }}
              autoFocus
            />
            <button type="button" onClick={onSaveDuration} className="text-primary text-xs">Save</button>
            <button type="button" onClick={onCancelEditDuration} className="text-muted-foreground text-xs">Cancel</button>
          </span>
        ) : (
          <button
            type="button"
            className="text-left font-mono hover:underline"
            onClick={() => onStartEditDuration(row.id, row.duration)}
          >
            {formatDuration(row.duration)}
          </button>
        )}
      </div>
      <span className="text-muted-foreground text-xs w-24 shrink-0">{timeRange}</span>
      <span className="flex items-center gap-1.5 min-w-[120px]">
        {statusIcon}
        <select
          className="flex-1 min-w-0 rounded border bg-background px-2 py-1 text-xs capitalize"
          value={row.status}
          onChange={(e) => onEditStatus(row.taskId, e.target.value)}
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </span>
      <button
        type="button"
        onClick={() => onDeleteTask(row.taskId)}
        className="text-destructive hover:underline text-xs shrink-0"
      >
        Delete
      </button>
    </div>
  );
}
