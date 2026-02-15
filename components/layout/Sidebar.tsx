'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
  Bars3Icon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { useAppContext } from '../../app/context/AppContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Tasks', href: '/tasks', icon: ClockIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useAppContext();
  const pathname = usePathname();

  return (
    <aside className={`sidebar ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
      <div className="flex items-center justify-between h-16 px-5 shrink-0 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 border-b border-primary-500/20">
        <Link href="/" className="flex items-center gap-2 min-w-0 flex-shrink-0">
          <div className="flex-none w-8 h-8 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center overflow-hidden" style={{ minWidth: 32, maxWidth: 32, minHeight: 32, maxHeight: 32 }}>
            <ClockIcon className="text-white" style={{ width: 16, height: 16 }} aria-hidden />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">TimeTrack</span>
        </Link>
        <button
          type="button"
          className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-w-0 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-400'
                      : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100'
                  }`}
                >
                  <span className="flex-none flex items-center justify-center overflow-hidden" style={{ width: 20, height: 20 }}>
                    <Icon
                      className={`flex-none ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500 dark:text-surface-400'}`}
                      style={{ width: 20, height: 20 }}
                      aria-hidden
                    />
                  </span>
                  <span className="truncate">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
