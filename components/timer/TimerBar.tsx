'use client';

import { PlayIcon, StopIcon } from '@heroicons/react/24/solid';
import { formatDuration } from '@/lib/utils/date';
import { useTimer } from '@/hooks/useTimer';

export function TimerBar() {
  const {
    currentTask,
    isRunning,
    elapsedTime,
    startTimer,
    stopTimer,
    formatTime,
  } = useTimer();

  if (!currentTask) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-surface-200 dark:border-surface-800 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md shadow-soft-lg">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-semibold text-sm"
              style={{
                backgroundColor: `${currentTask.project?.color ?? '#6366f1'}22`,
                color: currentTask.project?.color ?? '#6366f1',
              }}
            >
              {(currentTask.project?.name ?? 'P').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                {currentTask.title}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                {currentTask.project?.name ?? 'Project'} · {formatTime(elapsedTime)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0">
            {isRunning ? (
              <button
                type="button"
                onClick={() => { void stopTimer(); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 transition-colors"
              >
                <StopIcon className="h-4 w-4" aria-hidden />
                Stop
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startTimer()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 transition-colors"
              >
                <PlayIcon className="h-4 w-4" aria-hidden />
                Resume
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
