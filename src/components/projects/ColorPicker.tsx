import { PASTEL_PALETTE } from "@/state/utils/colorUtils";
import { cn } from "@/lib/utils";

export interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  usedColors?: string[];
  className?: string;
}

export function ColorPicker({ value, onChange, usedColors = [], className }: ColorPickerProps) {
  const colors = PASTEL_PALETTE;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {colors.map((hex) => (
        <button
          key={hex}
          type="button"
          className={cn(
            "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
            value.toLowerCase() === hex.toLowerCase()
              ? "border-foreground ring-2 ring-offset-2 ring-foreground/30"
              : "border-transparent"
          )}
          style={{ backgroundColor: hex }}
          onClick={() => onChange(hex)}
          title={hex}
        />
      ))}
    </div>
  );
}
