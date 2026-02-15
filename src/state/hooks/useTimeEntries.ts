import { useQuery, useQueryClient } from "@tanstack/react-query";
import { timeEntriesClient } from "@/api/clients/timeEntriesClient";
import { dayStart, dayEnd } from "../utils/dateUtils";
import type { TimeEntry } from "@/types";

type EntryWithTask = TimeEntry & {
  task?: { id: string; name: string; project_id: string; status: string; project?: { id: string; name: string; color: string } };
};

export function useTimeEntriesForDay(date: Date) {
  const dayStartStr = dayStart(date);
  const dayEndStr = dayEnd(date);
  const q = useQuery({
    queryKey: ["time-entries-day", dayStartStr],
    queryFn: () => timeEntriesClient.getEntriesForDay(dayStartStr, dayEndStr),
  });
  return { ...q, entries: (q.data ?? []) as EntryWithTask[] };
}

export function useTimeEntriesRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["time-entries-range", startDate, endDate],
    queryFn: () => timeEntriesClient.getByDateRange(startDate, endDate),
  });
}

export function useInvalidateTimeEntries() {
  const client = useQueryClient();
  return () => {
    client.invalidateQueries({ queryKey: ["time-entries-day"] });
    client.invalidateQueries({ queryKey: ["time-entries-range"] });
  };
}
