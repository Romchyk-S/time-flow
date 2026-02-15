import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

export interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export function ProjectCard({ project, onEdit, onDelete, className }: ProjectCardProps) {
  return (
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
}
