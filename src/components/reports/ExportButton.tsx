import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export type ExportScope = "full" | "full_csv" | "summary" | "breakdown" | "detailed" | "daily";

export interface ExportButtonProps {
  onExport: (scope: ExportScope) => void;
  disabled?: boolean;
  className?: string;
}

export function ExportButton({ onExport, disabled, className }: ExportButtonProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onExport("full")}
        disabled={disabled}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export full report (XLSX)
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onExport("full_csv")}
        disabled={disabled}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Full report (CSV)
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onExport("summary")}
        disabled={disabled}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Summary only
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onExport("breakdown")}
        disabled={disabled}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        By project
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onExport("detailed")}
        disabled={disabled}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Detailed tasks
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onExport("daily")}
        disabled={disabled}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Daily summary
      </Button>
    </div>
  );
}
