/**
 * Utility functions for working with colors in the application
 */

type ColorVariant = 'default' | 'light' | 'dark' | 'darker';

export const getStatusColors = (status: string, variant: ColorVariant = 'default') => {
  const baseColors = {
    not_started: {
      light: 'bg-slate-100 text-slate-800 border border-slate-200',
      dark: 'dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700',
    },
    in_progress: {
      light: 'bg-sky-100 text-sky-800 border border-sky-200',
      dark: 'dark:bg-sky-900/90 dark:text-sky-100 dark:border-sky-800',
    },
    in_review: {
      light: 'bg-violet-100 text-violet-800 border border-violet-200',
      dark: 'dark:bg-violet-900/90 dark:text-violet-100 dark:border-violet-800',
    },
    completed: {
      light: 'bg-green-100 text-green-800 border border-green-200',
      dark: 'dark:bg-green-900/90 dark:text-green-100 dark:border-green-800',
    },
    blocked: {
      light: 'bg-red-100 text-red-800 border border-red-200',
      dark: 'dark:bg-red-900/90 dark:text-red-100 dark:border-red-800',
    },
    on_hold: {
      light: 'bg-amber-100 text-amber-800 border border-amber-200',
      dark: 'dark:bg-amber-900/90 dark:text-amber-100 dark:border-amber-800',
    },
  } as const;

  const statusKey = status as keyof typeof baseColors;
  const statusColors = baseColors[statusKey] || baseColors.not_started;

  switch (variant) {
    case 'light':
      return statusColors.light;
    case 'dark':
      return statusColors.dark;
    case 'darker':
      return statusColors.dark.replace('900', '950');
    default:
      return `${statusColors.light} ${statusColors.dark}`;
  }
};

/**
 * Gets appropriate text color for a given background color in light/dark mode
 */
export const getTextColorForBackground = (bgColor: string, isDark: boolean) => {
  if (isDark) {
    return 'text-white';
  }
  
  // For light mode, use darker text for better contrast
  if (bgColor.includes('100')) {
    return 'text-gray-900';
  }
  
  if (bgColor.includes('200')) {
    return 'text-gray-800';
  }
  
  return 'text-white';
};

/**
 * Gets appropriate border color for a given status
 */
/**
 * Returns a consistent color for project tags and UI elements
 */
export const getProjectColor = (color: string, variant: 'bg' | 'text' | 'border' | 'ring' = 'bg') => {
  const colorMap: Record<string, Record<string, string>> = {
    bg: {
      gray: 'bg-gray-100 dark:bg-gray-800/80',
      red: 'bg-red-100 dark:bg-red-900/80',
      orange: 'bg-orange-100 dark:bg-orange-900/80',
      amber: 'bg-amber-100 dark:bg-amber-900/80',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/80',
      lime: 'bg-lime-100 dark:bg-lime-900/80',
      green: 'bg-green-100 dark:bg-green-900/80',
      emerald: 'bg-emerald-100 dark:bg-emerald-900/80',
      teal: 'bg-teal-100 dark:bg-teal-900/80',
      cyan: 'bg-cyan-100 dark:bg-cyan-900/80',
      sky: 'bg-sky-100 dark:bg-sky-900/80',
      blue: 'bg-blue-100 dark:bg-blue-900/80',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/80',
      violet: 'bg-violet-100 dark:bg-violet-900/80',
      purple: 'bg-purple-100 dark:bg-purple-900/80',
      fuchsia: 'bg-fuchsia-100 dark:bg-fuchsia-900/80',
      pink: 'bg-pink-100 dark:bg-pink-900/80',
      rose: 'bg-rose-100 dark:bg-rose-900/80',
    },
    text: {
      gray: 'text-gray-800 dark:text-gray-200',
      red: 'text-red-800 dark:text-red-100',
      orange: 'text-orange-800 dark:text-orange-100',
      amber: 'text-amber-800 dark:text-amber-100',
      yellow: 'text-yellow-800 dark:text-yellow-100',
      lime: 'text-lime-800 dark:text-lime-100',
      green: 'text-green-800 dark:text-green-100',
      emerald: 'text-emerald-800 dark:text-emerald-100',
      teal: 'text-teal-800 dark:text-teal-100',
      cyan: 'text-cyan-800 dark:text-cyan-100',
      sky: 'text-sky-800 dark:text-sky-100',
      blue: 'text-blue-800 dark:text-blue-100',
      indigo: 'text-indigo-800 dark:text-indigo-100',
      violet: 'text-violet-800 dark:text-violet-100',
      purple: 'text-purple-800 dark:text-purple-100',
      fuchsia: 'text-fuchsia-800 dark:text-fuchsia-100',
      pink: 'text-pink-800 dark:text-pink-100',
      rose: 'text-rose-800 dark:text-rose-100',
    },
    border: {
      gray: 'border-gray-200 dark:border-gray-700',
      red: 'border-red-200 dark:border-red-800',
      orange: 'border-orange-200 dark:border-orange-800',
      amber: 'border-amber-200 dark:border-amber-800',
      yellow: 'border-yellow-200 dark:border-yellow-800',
      lime: 'border-lime-200 dark:border-lime-800',
      green: 'border-green-200 dark:border-green-800',
      emerald: 'border-emerald-200 dark:border-emerald-800',
      teal: 'border-teal-200 dark:border-teal-800',
      cyan: 'border-cyan-200 dark:border-cyan-800',
      sky: 'border-sky-200 dark:border-sky-800',
      blue: 'border-blue-200 dark:border-blue-800',
      indigo: 'border-indigo-200 dark:border-indigo-800',
      violet: 'border-violet-200 dark:border-violet-800',
      purple: 'border-purple-200 dark:border-purple-800',
      fuchsia: 'border-fuchsia-200 dark:border-fuchsia-800',
      pink: 'border-pink-200 dark:border-pink-800',
      rose: 'border-rose-200 dark:border-rose-800',
    },
    ring: {
      gray: 'ring-gray-200 dark:ring-gray-700',
      red: 'ring-red-200 dark:ring-red-800',
      orange: 'ring-orange-200 dark:ring-orange-800',
      amber: 'ring-amber-200 dark:ring-amber-800',
      yellow: 'ring-yellow-200 dark:ring-yellow-800',
      lime: 'ring-lime-200 dark:ring-lime-800',
      green: 'ring-green-200 dark:ring-green-800',
      emerald: 'ring-emerald-200 dark:ring-emerald-800',
      teal: 'ring-teal-200 dark:ring-teal-800',
      cyan: 'ring-cyan-200 dark:ring-cyan-800',
      sky: 'ring-sky-200 dark:ring-sky-800',
      blue: 'ring-blue-200 dark:ring-blue-800',
      indigo: 'ring-indigo-200 dark:ring-indigo-800',
      violet: 'ring-violet-200 dark:ring-violet-800',
      purple: 'ring-purple-200 dark:ring-purple-800',
      fuchsia: 'ring-fuchsia-200 dark:ring-fuchsia-800',
      pink: 'ring-pink-200 dark:ring-pink-800',
      rose: 'ring-rose-200 dark:ring-rose-800',
    },
  };

  // Default to gray if color not found
  const colorKey = color in colorMap.bg ? color : 'gray';
  return colorMap[variant][colorKey] || '';
};

/**
 * Returns a consistent border color for status indicators
 */
export const getStatusBorderColor = (status: string) => {
  const borderColors = {
    not_started: 'border-slate-200 dark:border-slate-700',
    in_progress: 'border-sky-200 dark:border-sky-800',
    in_review: 'border-violet-200 dark:border-violet-800',
    completed: 'border-green-200 dark:border-green-800',
    blocked: 'border-red-200 dark:border-red-800',
    on_hold: 'border-amber-200 dark:border-amber-800',
  };

  return borderColors[status as keyof typeof borderColors] || borderColors.not_started;
};
