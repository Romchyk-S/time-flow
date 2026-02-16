import { useRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface TaskInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  onSelectSuggestion: (value: string) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  "data-testid"?: string;
}

export function TaskInput({
  value,
  onChange,
  suggestions,
  onSelectSuggestion,
  loading,
  disabled,
  placeholder = "Task name...",
  className,
  "data-testid": testId,
}: TaskInputProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showList = open && (suggestions.length > 0 || loading);
  const displaySuggestions = value.trim() ? suggestions : suggestions.slice(0, 5);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        data-testid={testId}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full"
      />
      {showList && (
        <ul
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover py-1 text-sm shadow-md"
          role="listbox"
        >
          {loading ? (
            <li className="px-3 py-2 text-muted-foreground">Loading...</li>
          ) : (
            displaySuggestions.map((s) => (
              <li
                key={s}
                role="option"
                className="cursor-pointer px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectSuggestion(s);
                  setOpen(false);
                }}
              >
                {s}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
