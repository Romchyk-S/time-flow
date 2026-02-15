'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, ClockIcon, CheckCircleIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { TaskCard } from './TaskCard';
import { Button } from '../ui/Button';
import { TaskForm } from './TaskForm';
import { Task, TaskStatus, TaskWithRelations } from '../../types';
import { useTimer } from '../../hooks/useTimer';
import { formatDuration } from '../../lib/utils/date';

type TaskListProps = {
  tasks: TaskWithRelations[];
  onTaskUpdate: (task: TaskWithRelations) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
  onTaskCreate: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  loading?: boolean;
  error?: string | null;
};

export function TaskList({ 
  tasks, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskCreate, 
  loading = false, 
  error = null 
}: TaskListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { currentTask, isRunning, startTimer, stopTimer } = useTimer();

  const filteredTasks = tasks
    .filter(task => {
      const matchesStatus = filter === 'all' || task.status === filter;
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.project?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      // Sort by status: in_progress first, then not_started, then others
      if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
      if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
      if (a.status === 'not_started' && b.status !== 'not_started') return -1;
      if (a.status !== 'not_started' && b.status === 'not_started') return 1;
      
      // Then sort by updated_at (newest first)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const handleStartTimer = async (task: TaskWithRelations) => {
    if (currentTask?.id === task.id && isRunning) {
      await stopTimer();
    } else {
      if (currentTask && isRunning) {
        await stopTimer();
      }
      startTimer(task);
    }
  };

  const handleStatusChange = async (task: TaskWithRelations, status: TaskStatus) => {
    const updatedTask = { ...task, status };
    await onTaskUpdate(updatedTask);
  };

  const handleEdit = (task: TaskWithRelations) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (editingTask) {
      await onTaskUpdate({ ...editingTask, ...taskData } as unknown as TaskWithRelations);
    } else {
      await onTaskCreate(taskData);
    }
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const totalTimeSpent = tasks.reduce((total, task) => total + (task.total_time_spent || 0), 0);
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading tasks</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {tasks.length} tasks • {completedTasks} completed • {formatDuration(totalTimeSpent)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-600 placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-800"
            value={filter}
            onChange={(e) => setFilter((e.target.value as unknown) as TaskStatus | 'all')}
          >
            <option value="all">All Tasks</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="completed">Completed</option>
          </select>
          <Button
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Task
          </Button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center bg-white dark:bg-gray-800 shadow rounded-lg p-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new task.</p>
          <div className="mt-6">
            <Button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Task
            </Button>
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center bg-white dark:bg-gray-800 shadow rounded-lg p-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks match your filters</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
          <div className="mt-6">
            <Button
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Reset filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isActive={currentTask?.id === task.id && isRunning}
                onStartTimer={() => handleStartTimer(task)}
                onStatusChange={(status) => handleStatusChange(task, status)}
                onEdit={() => handleEdit(task)}
                onDelete={() => onTaskDelete(task.id)}
              />
            ))}
          </ul>
        </div>
      )}

      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        task={editingTask}
      />
    </div>
  );
}
