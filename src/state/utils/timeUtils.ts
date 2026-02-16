/** Format minutes as "H:MM" (always, even for < 1 min) */
export function formatDurationMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${h}:${mins.toString().padStart(2, "0")}`;
}

/** Format minutes as "H:MM" (alias for consistency) */
export function formatDuration(minutes: number): string {
  return formatDurationMinutes(minutes);
}

/** Format minutes as "H:MM" (for summaries) */
export function formatDurationLongMinutes(minutes: number): string {
  return formatDurationMinutes(minutes);
}

/** Format minutes as "Xh Ym" (alias for consistency) */
export function formatDurationLong(minutes: number): string {
  return formatDurationLongMinutes(minutes);
}

/** Parse "H:MM" or "H:M" to minutes */
export function parseDurationToMinutes(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) return 0;
  const match = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (match) {
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    if (m >= 60) return 0;
    return h * 60 + m;
  }
  const asNumber = parseInt(trimmed, 10);
  if (!Number.isNaN(asNumber) && asNumber >= 0) return asNumber;
  return 0;
}

/** Minutes to "H:MM" for editing */
export function minutesToDurationInput(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}:${m.toString().padStart(2, "0")}`;
}

/** Seconds to "H:MM" for editing (legacy, used by live timer) */
export function secondsToDurationInput(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  return minutesToDurationInput(minutes);
}

/** Seconds to "H:MM" (legacy, used by live timer) */
export function formatDurationSeconds(seconds: number): string {
  return formatDurationMinutes(Math.ceil(seconds / 60));
}

/** Seconds to "Xh Ym" (legacy) */
export function formatDurationLongSeconds(seconds: number): string {
  return formatDurationLongMinutes(Math.ceil(seconds / 60));
}

/** Elapsed seconds since a given start time (Date or timestamp) */
export function elapsedSince(start: Date | number): number {
  const startMs = typeof start === "number" ? start : start.getTime();
  return Math.floor((Date.now() - startMs) / 1000);
}
