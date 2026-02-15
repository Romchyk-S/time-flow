import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import type { Project, Task } from "@/types";
import { cn } from "@/lib/utils";
import { tasksClient } from "@/api/clients/tasksClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDurationLong } from "@/state/utils/timeUtils";

export interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

function getLastWorkedDate(task: Task): string | null {
  const arr = task.work_dates ?? [];
  if (!arr.length) return null;
  // work_dates are YYYY-MM-DD strings; take the max lexicographically
  return arr.slice().sort().at(-1) ?? null;
}

export function ProjectCard({ project, onEdit, onDelete, className }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!expanded) return;
      setLoading(true);
      setError(null);
      try {
        const items = await tasksClient.getByProject(project.id, { isActive: true });
        if (!cancelled) setTasks(items);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load tasks");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [expanded, project.id]);

  const header = (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border p-4",
        className
      )}
      style={{
        borderLeftWidth: 4,
        borderLeftColor: project.color,
      }}
    >
      <div className="flex items-center gap-3">
        <button
          aria-label={expanded ? "Collapse" : "Expand"}
          className="p-1 rounded hover:bg-muted"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <span
          className="h-4 w-4 rounded-full shrink-0"
          style={{ backgroundColor: project.color }}
        />
        <span className="font-medium">{project.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const content = (
    <div className="mt-2 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">Task Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last worked</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">Loading…</TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-destructive">{error}</TableCell>
            </TableRow>
          ) : tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">No tasks</TableCell>
            </TableRow>
          ) : (
            tasks.map((t) => {
              const last = getLastWorkedDate(t);
              return (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="capitalize">{t.status.replaceAll("_", " ")}</TableCell>
                  <TableCell>{last ?? "—"}</TableCell>
                  <TableCell className="text-right">{formatDurationLong(t.total_duration_seconds ?? 0)}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div>
      {header}
      {expanded && content}
    </div>
  );
}
