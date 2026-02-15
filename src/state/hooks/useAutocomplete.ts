import { useCallback, useState } from "react";
import { tasksClient } from "@/api/clients/tasksClient";

const LIMIT = 10;

export function useAutocomplete(projectId: string | null) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(
    async (searchTerm: string) => {
      if (!projectId) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const tasks = await tasksClient.getByProject(projectId, {
          isActive: true,
          searchTerm: searchTerm || undefined,
          limit: LIMIT,
        });
        setSuggestions(tasks.map((t) => t.name));
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  return { suggestions, loading, fetchSuggestions };
}
