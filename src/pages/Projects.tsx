import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus } from "lucide-react";
import { useProjects } from "@/state/hooks/useProjects";
import { useInvalidateProjects } from "@/state/hooks/useProjects";
import { projectsClient } from "@/api/clients/projectsClient";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectForm } from "@/components/projects/ProjectForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Project } from "@/types";

export default function Projects() {
  const { projects } = useProjects();
  const invalidate = useInvalidateProjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const usedColors = projects.map((p) => p.color);

  const handleCreate = useCallback(async (data: { name: string; color: string }) => {
    await projectsClient.create(data);
    invalidate();
    setDialogOpen(false);
  }, [invalidate]);

  const handleUpdate = useCallback(
    async (data: { name: string; color: string }) => {
      if (!editingProject) return;
      await projectsClient.update(editingProject.id, data);
      invalidate();
      setEditingProject(null);
    },
    [editingProject, invalidate]
  );

  const handleDelete = useCallback(
    async (project: Project) => {
      if (!window.confirm(`Delete project "${project.name}" and all its tasks and time entries?`))
        return;
      await projectsClient.delete(project.id);
      invalidate();
      if (editingProject?.id === project.id) setEditingProject(null);
    },
    [editingProject, invalidate]
  );

  const openCreate = () => {
    setEditingProject(null);
    setDialogOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Organize your work by project. Each project has a unique color.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add project
        </Button>
      </div>

      <Card>
        <CardContent className="py-6">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first project to organize tasks and track time.
              </p>
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Add project
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={() => openEdit(project)}
                  onDelete={() => handleDelete(project)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit project" : "New project"}</DialogTitle>
          </DialogHeader>
          <ProjectForm
            project={editingProject}
            usedColors={usedColors}
            onSubmit={editingProject ? handleUpdate : handleCreate}
            onCancel={() => {
              setDialogOpen(false);
              setEditingProject(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
