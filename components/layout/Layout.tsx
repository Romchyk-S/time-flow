'use client';

import { usePathname } from 'next/navigation';
import { useAppContext } from '../../app/context/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { TimerBar } from '../timer/TimerBar';

export function Layout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useAppContext();
  const pathname = usePathname();
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-200 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto p-5 md:p-8 bg-surface-50 dark:bg-surface-950">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <TimerBar />
    </div>
  );
}
