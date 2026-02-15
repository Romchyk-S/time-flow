import type { TimeEntry } from "@/types";
import { elapsedSince } from "../utils/timeUtils";

export const timerService = {
  calculateElapsed(startTime: string | number): number {
    const start = typeof startTime === "string" ? new Date(startTime).getTime() : startTime;
    return Math.max(0, elapsedSince(start));
  },

  calculateDuration(startTime: string | number): number {
    return this.calculateElapsed(startTime);
  },

  validateEntry(entry: { duration: number; task_id?: string }): boolean {
    return entry.duration >= 0 && !!entry.task_id;
  },
};
