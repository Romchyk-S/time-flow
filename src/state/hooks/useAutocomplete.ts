import { useCallback, useState } from "react";
import { taskNamesClient } from "@/api/clients/taskNamesClient";

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
        const names = await taskNamesClient.searchByProject(projectId, {
          searchTerm: searchTerm || undefined,
          limit: LIMIT,
        });
        setSuggestions(names.map((tn) => tn.name));
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  return { suggestions, loading, fetchSuggestions };
}
