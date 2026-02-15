'use client';

import { useState, useEffect, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Project } from '../../types';
import { cn } from '../../lib/utils';

type ProjectSelectorProps = {
  selectedProjectId: string;
  onProjectSelect: (projectId: string) => void;
  error?: boolean;
  className?: string;
};

export function ProjectSelector({ 
  selectedProjectId, 
  onProjectSelect, 
  error = false,
  className = ''
}: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#3b82f6'); // Default blue

  // Fetch projects from the API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/projects');
        // const data = await response.json();
        // setProjects(data);
        
        // Mock data for now
        const mockProjects: Project[] = [
          {
            id: '1',
            name: 'Website Redesign',
            color: '#3b82f6',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: '1',
            is_active: true,
          },
          {
            id: '2',
            name: 'Mobile App',
            color: '#10b981',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: '1',
            is_active: true,
          },
          {
            id: '3',
            name: 'Marketing Campaign',
            color: '#f59e0b',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: '1',
            is_active: true,
          },
        ];
        
        setProjects(mockProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/projects', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     name: newProjectName,
      //     color: newProjectColor,
      //   }),
      // });
      // const newProject = await response.json();
      
      // Mock new project
      const newProject: Project = {
        id: `new-${Date.now()}`,
        name: newProjectName,
        color: newProjectColor,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: '1',
        is_active: true,
      };
      
      setProjects(prev => [...prev, newProject]);
      onProjectSelect(newProject.id);
      setNewProjectName('');
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const colorOptions = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
  ];

  if (isLoading) {
    return (
      <div className="animate-pulse flex items-center space-x-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Listbox value={selectedProjectId} onChange={onProjectSelect}>
        {({ open }) => (
          <div className="relative">
            <Listbox.Button
              className={`relative w-full cursor-default rounded-md border ${
                error
                  ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500'
              } py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 sm:text-sm`}
            >
              {selectedProject ? (
                <div className="flex items-center">
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selectedProject.color }}
                    aria-hidden="true"
                  />
                  <span className="ml-2 block truncate">{selectedProject.name}</span>
                </div>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">Select a project</span>
              )}
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400 dark:text-gray-300"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {projects.map((project) => (
                  <Listbox.Option
                    key={project.id}
                    className={({ active }) =>
                      cn(
                        active ? 'bg-primary-600 text-white' : 'text-gray-900 dark:text-gray-100',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={project.id}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          <span
                            className={cn(
                              'h-3 w-3 rounded-full flex-shrink-0',
                              active ? 'text-white' : ''
                            )}
                            style={{ backgroundColor: project.color }}
                            aria-hidden="true"
                          />
                          <span className={cn(selected ? 'font-semibold' : 'font-normal', 'ml-2 block truncate')}>
                            {project.name}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={cn(
                              active ? 'text-white' : 'text-primary-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreateModalOpen(true);
                  }}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create new project
                </button>
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsCreateModalOpen(false)} />
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Create New Project</h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-2">
                <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Name
                </label>
                <input
                  type="text"
                  id="project-name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  autoFocus
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`h-8 w-full rounded-md border-2 ${
                        newProjectColor === color.value ? 'ring-2 ring-offset-2 ring-primary-500' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewProjectColor(color.value)}
                      title={color.name}
                    >
                      <span className="sr-only">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
