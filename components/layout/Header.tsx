'use client';

import { useRouter } from 'next/navigation';
import { Bars3Icon, BellIcon, MoonIcon, SunIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '../../app/context/AppContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { supabase } from '@/lib/supabase/client';

export function Header() {
  const { toggleSidebar, theme, toggleTheme } = useAppContext();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="shrink-0 h-16 border-b border-surface-200 dark:border-surface-800 bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        <button
          type="button"
          className="p-2.5 rounded-xl text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-2.5 rounded-xl text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>

          <button
            type="button"
            className="p-2.5 rounded-xl text-surface-500 hover:text-surface-700 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            aria-label="Notifications"
          >
            <BellIcon className="w-5 h-5" />
          </button>

          <Menu as="div" className="relative ml-2">
            <Menu.Button className="flex items-center p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors">
              <span className="sr-only">Open user menu</span>
              <div className="flex-none rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center overflow-hidden" style={{ width: 36, height: 36, minWidth: 36, maxWidth: 36, minHeight: 36, maxHeight: 36 }}>
                <UserCircleIcon className="flex-none text-primary-600 dark:text-primary-400" style={{ width: 20, height: 20 }} aria-hidden />
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl bg-white dark:bg-surface-800 shadow-soft-lg border border-surface-200 dark:border-surface-700 py-1 focus:outline-none z-50">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => router.push('/profile')}
                      className={`${
                        active ? 'bg-surface-50 dark:bg-surface-700/50' : ''
                      } block w-full text-left px-4 py-2.5 text-sm text-surface-700 dark:text-surface-200`}
                    >
                      Your Profile
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => router.push('/settings')}
                      className={`${
                        active ? 'bg-surface-50 dark:bg-surface-700/50' : ''
                      } block w-full text-left px-4 py-2.5 text-sm text-surface-700 dark:text-surface-200`}
                    >
                      Settings
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={`${
                        active ? 'bg-red-50 dark:bg-red-500/10' : ''
                      } block w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 font-medium`}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}
