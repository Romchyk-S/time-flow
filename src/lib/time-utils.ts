import { formatDistanceToNow } from 'date-fns';

/**
 * Format duration in seconds to a human-readable string (e.g., "2h 30m")
 */
export function formatDuration(seconds: number): string {
  if (!seconds) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours === 0) parts.push(`${minutes}m`);
  
  return parts.join(' ');
}

/**
 * Format date to a relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Parse an ISO 8601 duration string into seconds
 * @param duration ISO 8601 duration string (e.g., 'PT1H30M' for 1 hour and 30 minutes)
 * @returns Duration in seconds
 */
export function parseIsoDuration(duration: string): number {
  const regex = /^P(?:([0-9]+)D)?T?(?:([0-9]+)H)?(?:([0-9]+)M)?(?:([0-9]+(?:\.[0-9]+)?)S)?$/;
  const matches = duration.match(regex);
  
  if (!matches) return 0;
  
  const days = matches[1] ? parseInt(matches[1], 10) : 0;
  const hours = matches[2] ? parseInt(matches[2], 10) : 0;
  const minutes = matches[3] ? parseInt(matches[3], 10) : 0;
  const seconds = matches[4] ? parseFloat(matches[4]) : 0;
  
  return (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + Math.floor(seconds);
}
