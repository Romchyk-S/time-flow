import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import { getProjectColor } from "@/lib/colorUtils";
import { useState, useEffect, useCallback } from "react";
import { ProjectTaskList } from "./ProjectTaskList";
import React from "react";

export interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onTaskUpdate?: () => void;
  className?: string;
}

const ProjectCard = React.memo(function ProjectCard({ project, onEdit, onDelete, onTaskUpdate, className }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Debug mount/update
  useEffect(() => {
    console.log(`ProjectCard rendered/updated - ID: ${project.id}, Name: ${project.name}`);
    return () => {
      console.log(`ProjectCard unmounting - ID: ${project.id}, Name: ${project.name}`);
    };
  }, [project.id, project.name]);

  const handleToggleExpand = useCallback(() => {
    console.log(`Toggling expand for project ${project.id}`);
    setIsExpanded(prev => !prev);
  }, [project.id]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Delete clicked for project ${project.id}`);
    onDelete();
  }, [onDelete, project.id]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Edit clicked for project ${project.id}`);
    onEdit();
  }, [onEdit, project.id]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className={cn(
          "flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer",
          className
        )}
        onClick={handleToggleExpand}
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
                className={cn(
                  'h-4 w-4 rounded-full flex-shrink-0',
                  getProjectColor(project.color, 'bg'),
                  'border',
                  getProjectColor(project.color, 'border')
                )}
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={handleEditClick}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      <div 
        className={cn(
          'transition-all duration-200 overflow-hidden',
          isExpanded ? 'max-h-[1000px]' : 'max-h-0',
          'border-t',
          getProjectColor(project.color, 'border'),
          'bg-opacity-20',
          getProjectColor(project.color, 'bg')
        )}
      >
        <div className="p-4 pt-2">
          <ProjectTaskList projectId={project.id} onTaskUpdate={onTaskUpdate} />
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.project.id === nextProps.project.id &&
    prevProps.project.name === nextProps.project.name &&
    prevProps.project.color === nextProps.project.color &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onTaskUpdate === nextProps.onTaskUpdate
  );
});

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;
