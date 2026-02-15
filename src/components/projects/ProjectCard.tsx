import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ProjectTaskList } from "./ProjectTaskList";

export interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onTaskUpdate?: () => void;
  className?: string;
}

export function ProjectCard({ project, onEdit, onDelete, onTaskUpdate, className }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className={cn(
          "flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer",
          className
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          borderLeft: `4px solid ${project.color}`,
        }}
      >
        <div className="flex items-start gap-3 w-full">
          <div className="flex-shrink-0 pt-0.5">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <span className="font-medium truncate">{project.name}</span>
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      <div className={`transition-all duration-200 overflow-hidden ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}>
        <div className="p-4 pt-2">
          <ProjectTaskList projectId={project.id} onTaskUpdate={onTaskUpdate} />
        </div>
      </div>
    </div>
  );
}
