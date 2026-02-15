import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

export interface ProjectSelectProps {
  projects: Project[];
  value: string | null;
  onValueChange: (projectId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ProjectSelect({
  projects,
  value,
  onValueChange,
  placeholder = "Select project",
  disabled,
  className,
}: ProjectSelectProps) {
  return (
    <Select
      value={value ?? ""}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-full min-w-[160px]", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            <span className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: p.color }}
              />
              {p.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
