import { TaskStatus } from '../../types';
import { CheckCircleIcon, ClockIcon, ArrowPathIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

type TaskStatusBadgeProps = {
  status: TaskStatus;
  className?: string;
};

export function TaskStatusBadge({ status, className = '' }: TaskStatusBadgeProps) {
  const statusConfig = {
    not_started: {
      icon: ClockIcon,
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      textColor: 'text-gray-800 dark:text-gray-200',
      label: 'Not Started',
    },
    in_progress: {
      icon: ArrowPathIcon,
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-800 dark:text-blue-400',
      label: 'In Progress',
    },
    in_review: {
      icon: ChatBubbleLeftRightIcon,
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-800 dark:text-yellow-400',
      label: 'In Review',
    },
    completed: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-800 dark:text-green-400',
      label: 'Completed',
    },
  };

  const { icon: Icon, bgColor, textColor, label } = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        bgColor,
        textColor,
        className
      )}
    >
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </span>
  );
}
