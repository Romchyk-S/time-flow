import { Card, CardContent } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";

const Projects = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Organize your work by project.</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No projects yet</h3>
          <p className="text-sm text-muted-foreground">Create your first project to organize tasks.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Projects;
