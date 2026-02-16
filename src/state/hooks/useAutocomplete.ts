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
        const names = await tasksClient.getNameSuggestionsByProject(projectId, {
          searchTerm: searchTerm || undefined,
          limit: LIMIT,
        });
        setSuggestions(names);
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  return { suggestions, loading, fetchSuggestions };
}
