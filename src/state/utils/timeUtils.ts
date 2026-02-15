/** Format seconds as "H:MM" or "M min" */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const h = Math.floor(m / 60);
  const mins = m % 60;
  if (h > 0) return `${h}:${mins.toString().padStart(2, "0")}`;
  return `${m} min`;
}

/** Format seconds as "Xh Ym" */
export function formatDurationLong(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || h === 0) parts.push(`${m}m`);
  return parts.join(" ") || "0m";
}

/** Parse "H:MM" or "H:M" to seconds */
export function parseDurationToSeconds(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) return 0;
  const match = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (match) {
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    if (m >= 60) return 0;
    return h * 3600 + m * 60;
  }
  const asNumber = parseInt(trimmed, 10);
  if (!Number.isNaN(asNumber) && asNumber >= 0) return asNumber * 60;
  return 0;
}

/** Seconds to "H:MM" for editing */
export function secondsToDurationInput(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}:${m.toString().padStart(2, "0")}`;
}

/** Elapsed seconds since a given start time (Date or timestamp) */
export function elapsedSince(start: Date | number): number {
  const startMs = typeof start === "number" ? start : start.getTime();
  return Math.floor((Date.now() - startMs) / 1000);
}
