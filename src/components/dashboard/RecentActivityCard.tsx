import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskWithProject } from "@/types";
import { format } from "date-fns";
import { StartTaskButton } from "@/components/tasks/StartTaskButton";

interface RecentActivityCardProps {
  task: TaskWithProject;
  onStatusUpdate?: () => void;
  onTaskUpdated?: () => void;
}

export function RecentActivityCard({ task, onStatusUpdate, onTaskUpdated }: RecentActivityCardProps) {

  const statusColors = {
    not_started: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    in_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    blocked: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  };

  const statusText = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    in_review: 'In Review',
    completed: 'Completed',
    blocked: 'Blocked',
    on_hold: 'On Hold',
  };

  return (
    <div className="relative group">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg line-clamp-2">
              {task.name}
            </CardTitle>
            <Badge 
              className={`text-xs px-2 py-0.5 ${statusColors[task.status as keyof typeof statusColors]}`}
            >
              {statusText[task.status as keyof typeof statusText]}
            </Badge>
          </div>
          
          {task.project && (
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: task.project.color }}
              />
              <span className="truncate">{task.project.name}</span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-0 mt-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                {task.last_used ? 
                  format(new Date(task.last_used), 'yyyy-MM-dd') : 
                  'Never'}
              </span>
            </div>
            
            <StartTaskButton 
              task={task}
              projectId={task.project_id}
              onTaskUpdate={() => {
                onStatusUpdate?.();
                onTaskUpdated?.();
              }}
              variant="ghost"
              size="sm"
              className="h-8"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
