import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { ChartBarIcon, ChevronRightIcon, FolderIcon, ListBulletIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const links = [
    { name: 'Tasks', href: '/tasks', icon: ListBulletIcon, desc: 'Track time and manage your tasks' },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, desc: 'View time reports and analytics' },
    { name: 'Projects', href: '/projects', icon: FolderIcon, desc: 'Organize tasks by project' },
  ];

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1.5 text-surface-500 dark:text-surface-400">
            Welcome back. Use the sidebar or the cards below to get started.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="card group flex items-start gap-4 p-5 no-underline text-inherit transition-all hover:shadow-soft-lg hover:border-primary-200 dark:hover:border-primary-800 min-w-0"
              >
                <div className="flex-none flex items-center justify-center overflow-hidden rounded-xl bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-500/25 transition-colors" style={{ width: 48, height: 48, minWidth: 48, maxWidth: 48, minHeight: 48, maxHeight: 48 }}>
                  <Icon className="flex-none" style={{ width: 24, height: 24 }} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {item.name}
                  </h2>
                  <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">
                    {item.desc}
                  </p>
                </div>
                <ChevronRightIcon className="flex-none text-surface-300 dark:text-surface-600 ml-auto mt-1 group-hover:translate-x-0.5 transition-transform" style={{ width: 16, height: 16 }} aria-hidden />
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
