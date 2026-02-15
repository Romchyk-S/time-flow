'use client';

import { useState, Fragment } from 'react';
import { TaskStatus, TaskWithRelations } from '../../types';
import { formatDuration } from '../../lib/utils/date';
import { Button } from '../ui/Button';
import { Menu, Transition } from '@headlessui/react';
import { 
  PlayIcon, 
  StopIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { TaskStatusBadge } from './TaskStatusBadge';

type TaskCardProps = {
  task: TaskWithRelations;
  isActive: boolean;
  onStartTimer: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function TaskCard({ task, isActive, onStartTimer, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'in_review':
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusOptions = (currentStatus: TaskStatus) => {
    const allStatuses: TaskStatus[] = ['not_started', 'in_progress', 'in_review', 'completed'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const statusOptions = getStatusOptions(task.status);
  const hasNotes = task.description || (task.time_entries && task.time_entries.some(te => te.notes));
  const totalTimeSpent = task.total_time_spent || 0;
  const projectColor = task.project?.color || '#6b7280';

  return (
    <li className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <div className="flex-shrink-0 mr-3">
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: `${projectColor}40` }}
              >
                {task.project?.name?.charAt(0).toUpperCase() || 'P'}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center">
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
                  {task.title}
                </p>
                <div className="ml-2 flex-shrink-0 flex">
                  <TaskStatusBadge status={task.status} />
                </div>
              </div>
              <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="truncate">{task.project?.name || 'No project'}</span>
                <span className="mx-1">•</span>
                <span>{formatDuration(totalTimeSpent)}</span>
                {task.estimated_duration && (
                  <>
                    <span className="mx-1">•</span>
                    <span>Est. {formatDuration(task.estimated_duration * 60)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
            <Button
              onClick={onStartTimer}
              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                isActive 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                  : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              {isActive ? (
                <>
                  <StopIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                  Stop
                </>
              ) : (
                <>
                  <PlayIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                  Start
                </>
              )}
            </Button>

            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">
                <span className="sr-only">Open options</span>
                <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={onEdit}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                          } group flex items-center px-4 py-2 text-sm w-full text-left`}
                        >
                          <PencilIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
                          Edit
                        </button>
                      )}
                    </Menu.Item>
                    {hasNotes && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setShowNotes(!showNotes)}
                            className={`${
                              active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                            } group flex items-center px-4 py-2 text-sm w-full text-left`}
                          >
                            <ChatBubbleLeftRightIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
                            {showNotes ? 'Hide Notes' : 'View Notes'}
                          </button>
                        )}
                      </Menu.Item>
                    )}
                    {statusOptions.length > 0 && (
                      <Menu as="div" className="relative">
                        <Menu.Button className="w-full text-left">
                          {({ open }) => (
                            <div className={`${
                              open ? 'bg-gray-100 dark:bg-gray-700' : ''
                            } group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 w-full`}>
                              <ArrowPathIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
                              <span>Change Status</span>
                            </div>
                          )}
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="origin-top-left left-full ml-1 absolute top-0 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                            <div className="py-1">
                              {statusOptions.map((status) => (
                                <Menu.Item key={status}>
                                  {({ active }) => (
                                    <button
                                      onClick={() => onStatusChange(status)}
                                      className={`${
                                        active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                                      } group flex items-center px-4 py-2 text-sm w-full text-left`}
                                    >
                                      <span className="mr-3">
                                        {getStatusIcon(status)}
                                      </span>
                                      {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </button>
                                  )}
                                </Menu.Item>
                              ))}
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    )}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={onDelete}
                          className={`${
                            active ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'text-red-600 dark:text-red-400'
                          } group flex items-center px-4 py-2 text-sm w-full text-left`}
                        >
                          <TrashIcon className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
                          Delete
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
        
        {showNotes && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {task.description && (
              <div className="prose prose-sm max-w-none text-gray-500 dark:text-gray-400">
                <p>{task.description}</p>
              </div>
            )}
            
            {task.time_entries && task.time_entries.some(te => te.notes) && (
              <div className="mt-4">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Time Entry Notes</h4>
                <div className="space-y-3">
                  {task.time_entries
                    .filter(te => te.notes)
                    .map((entry) => (
                      <div key={entry.id} className="text-sm bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>{new Date(entry.start_time).toLocaleDateString()}</span>
                          <span>{formatDuration(entry.duration || 0)}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{entry.notes}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
