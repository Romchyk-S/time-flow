import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "./ColorPicker";
import { pickDistinctPastel } from "@/state/utils/colorUtils";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

export interface ProjectFormProps {
  project?: Project | null;
  usedColors: string[];
  onSubmit: (data: { name: string; color: string }) => void;
  onCancel: () => void;
  className?: string;
}

export function ProjectForm({
  project,
  usedColors,
  onSubmit,
  onCancel,
  className,
}: ProjectFormProps) {
  const [name, setName] = useState(project?.name ?? "");
  const [color, setColor] = useState(
    project?.color ?? pickDistinctPastel(usedColors)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), color });
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor="project-name">Name</Label>
        <Input
          id="project-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <ColorPicker
          value={color}
          onChange={setColor}
          usedColors={usedColors}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={!name.trim()}>
          {project ? "Save" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
