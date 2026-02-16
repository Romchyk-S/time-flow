import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./button";
import { Pencil, Trash2, Clock, Calendar, Folder } from "lucide-react";
import { Badge } from "./badge";
import { StartTaskButton } from "@/components/tasks/StartTaskButton";
import { useTimerStore } from "@/state/store/timerStore";

interface HoverEffectProps {
  items: {
    id: string;
    title: string;
    description?: string;
    link: string;
    status?: string;
    lastWorkedDate?: string;
    duration?: string;
    project?: {
      id?: string;
      name: string;
      color?: string;
      description?: string;
    };
  }[];
  className?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onTaskClick?: (id: string) => void;
}

export const HoverEffect = ({
  items,
  className,
  onEdit,
  onDelete,
  onTaskClick,
}: HoverEffectProps) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const runningTaskId = useTimerStore((s) => s.taskId);

  // Status color mapping
  const statusColors = {
    not_started: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    in_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    blocked: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return statusColors.default;
    return statusColors[status as keyof typeof statusColors] || statusColors.default;
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={`${item.id}-${idx}`}
          className="relative group h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => onTaskClick?.(item.id)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-2xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card
            className={cn(
              runningTaskId === item.id && 'border-emerald-500 group-hover:border-emerald-500'
            )}
          >
            <div className="flex flex-col h-full">
              {/* Header with title and status */}
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onEdit?.(item.id);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (confirm('Are you sure you want to delete this task?')) {
                        onDelete?.(item.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  </div>
                </div>
              </div>
              
              {/* Status badge */}
              {item.status && (
                <Badge 
                  className={`text-xs px-2 py-0.5 mb-3 w-fit ${getStatusColor(item.status)}`}
                >
                  {item.status.replace(/_/g, ' ')}
                </Badge>
              )}
              
              {/* Description */}
              {item.description && (
                <div className="mb-4">
                  <CardDescription className="line-clamp-3">
                    {item.description}
                  </CardDescription>
                </div>
              )}
              
              {/* Project info */}
              {item.project && (
                <div className="mt-auto mb-3">
                  <div className="flex items-center text-xs text-muted-foreground mb-1">
                    <Folder className="h-3.5 w-3.5 mr-1.5" />
                    <span className="font-medium">Project:</span>
                    <span className="ml-1 flex min-w-0 items-center gap-2">
                      {item.project.color ? (
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0 border"
                          style={{ backgroundColor: item.project.color, borderColor: "var(--border)" }}
                        />
                      ) : null}
                      <span className="truncate">{item.project.name}</span>
                    </span>
                  </div>
                </div>
              )}
              
              {/* Footer with metadata */}
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {item.lastWorkedDate && item.lastWorkedDate !== 'Never' && (
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>{item.lastWorkedDate}</span>
                      </div>
                    )}
                    {item.duration && (
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>{item.duration}</span>
                      </div>
                    )}
                  </div>

                  {runningTaskId === item.id ? (
                    <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                      Running...
                    </div>
                  ) : null}

                  {item.project?.id ? (
                    <div
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <StartTaskButton
                        task={{
                          id: item.id,
                          name: item.title,
                          project_id: item.project.id,
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-8"
                      >
                        Start
                      </StartTaskButton>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <div
      className={cn(
        "rounded-xl h-full w-full p-4 overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-600 relative z-20 transition-colors cursor-pointer hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <div className="relative z-50">
        <div className="p-1">{children}</div>
      </div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={cn("text-base font-semibold tracking-wide line-clamp-2", className)}>
      {children}
    </h4>
  );
};

export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "text-sm text-gray-600 dark:text-gray-300 tracking-wide leading-relaxed",
        className
      )}
    >
      {children}
    </p>
  );
};
