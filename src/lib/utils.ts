import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a duration string (ISO 8601) into a human-readable format
 * @param duration ISO 8601 duration string (e.g., 'PT1H30M' for 1 hour and 30 minutes)
 * @returns Formatted duration string (e.g., '1h 30m', '45m', '2h')
 */
export function formatDuration(duration: string): string {
  try {
    // Parse the ISO 8601 duration string
    const regex = /PT(?:([0-9]+)H)?(?:([0-9]+)M)?(?:([0-9]+)S)?/;
    const matches = duration.match(regex);
    
    if (!matches) return '0m';
    
    const hours = matches[1] ? parseInt(matches[1], 10) : 0;
    const minutes = matches[2] ? parseInt(matches[2], 10) : 0;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours === 0) parts.push(`${minutes}m`);
    
    return parts.join(' ');
  } catch (error) {
    console.error('Error formatting duration:', error);
    return '0m';
  }
}
