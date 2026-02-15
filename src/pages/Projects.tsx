import { useState, useCallback, Component, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus } from "lucide-react";
import { useProjects, useInvalidateProjects } from "@/state/hooks/useProjects";
import { projectsClient } from "@/api/clients/projectsClient";
import ProjectCard from "@/components/projects/ProjectCard";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Project } from "@/types";

class ErrorBoundary extends Component<{ fallback: React.ReactNode; children: React.ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function ProjectsContent() {
  // Debug mount/remount
  console.log('ProjectsContent rendering');
  
  // Use the custom hook for projects data
  const { 
    projects = [], 
    error, 
    isLoading, 
    isError, 
    isSuccess 
  } = useProjects();

  // Log data changes
  useEffect(() => {
    if (isSuccess) {
      console.log('Projects fetched successfully:', projects);
    } else if (isError) {
      console.error('Error fetching projects:', error);
    }
  }, [projects, isSuccess, isError, error]);

  // Use projects directly since useProjects already provides a default empty array
  const projectList = projects;
  
  const invalidate = useInvalidateProjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Debug effect for data changes
  useEffect(() => {
    console.log('Projects data changed:', { 
      projects, 
      count: projects?.length,
      isLoading,
      isError,
      isSuccess,
      error: error ? error.message : null 
    });
  }, [projects, isLoading, isError, isSuccess, error]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4">
        <div>Loading projects...</div>
        <div className="text-sm text-muted-foreground">
          {projectList.length} projects currently loaded
        </div>
      </div>
    );
  }

  // Calculate derived state after hooks and before any conditional returns
  const usedColors = projectList.map((p) => p.color);

  // Show error state
  if (isError) {
    console.error('Error loading projects:', error);
    return (
      <div className="p-4 text-destructive">
        <div>Error loading projects. Please try again.</div>
        {error && (
          <div className="mt-2 p-2 bg-destructive/10 rounded text-sm">
            {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        )}
      </div>
    );
  }

  const handleCreate = useCallback(async (data: { name: string; description: string; color: string }) => {
    await projectsClient.create(data);
    invalidate();
    setDialogOpen(false);
  }, [invalidate]);

  const handleTaskUpdate = useCallback(() => {
    invalidate();
  }, [invalidate]);

  const handleUpdate = useCallback(
    async (data: { name: string; description: string; color: string }) => {
      if (!editingProject) return;
      await projectsClient.update(editingProject.id, data);
      invalidate();
      setEditingProject(null);
    },
    [editingProject, invalidate]
  );

  const handleDelete = useCallback(
    async (project: Project) => {
      setDeletingProject(project);
    },
    []
  );

  const confirmDelete = useCallback(async () => {
    if (!deletingProject) return;
    
    await projectsClient.delete(deletingProject.id);
    invalidate();
    if (editingProject?.id === deletingProject.id) {
      setEditingProject(null);
    }
    setDeletingProject(null);
  }, [deletingProject, invalidate, editingProject]);

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
          {projectList.length === 0 ? (
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
              {projectList.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={() => openEdit(project)}
                  onDelete={() => handleDelete(project)}
                  onTaskUpdate={handleTaskUpdate}
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

      <ConfirmDialog
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
        title={`Delete "${deletingProject?.name}"?`}
        description="This will permanently delete the project and all its associated tasks and time entries. This action cannot be undone."
        confirmText="Delete Project"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default function Projects() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please refresh the page.</div>}>
      <ProjectsContent />
    </ErrorBoundary>
  );
}
