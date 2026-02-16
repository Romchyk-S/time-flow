import type { TimeEntry } from "@/types";
import { elapsedSince } from "../utils/timeUtils";

function parseTimestampToMs(value: string | number): number {
  if (typeof value === "number") return value;
  const raw = value.trim();
  if (!raw) return NaN;

  // Supabase can return timestamps like "2026-02-16 10:52:40.394+00".
  // JS Date parsing is inconsistent for this format, so normalize to ISO.
  let normalized = raw;
  if (normalized.includes(" ") && !normalized.includes("T")) {
    normalized = normalized.replace(" ", "T");
  }
  // Convert trailing "+00" to "+00:00" so it's valid ISO-8601.
  normalized = normalized.replace(/\+00$/, "+00:00");

  const ms = Date.parse(normalized);
  return ms;
}

export const timerService = {
  calculateElapsed(startTime: string | number): number {
    const startMs = parseTimestampToMs(startTime);
    if (!Number.isFinite(startMs)) return 0;
    return Math.max(0, elapsedSince(startMs));
  },

  calculateDuration(startTime: string | number): number {
    return this.calculateElapsed(startTime);
  },

  validateEntry(entry: { duration: number; task_id?: string }): boolean {
    return entry.duration >= 0 && !!entry.task_id;
  },
};
