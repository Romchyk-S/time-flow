import { useCallback, useState } from "react";
import { taskNamesClient } from "@/api/clients/taskNamesClient";

const LIMIT = 10;

export function useAutocomplete(projectId: string | null) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(
    async (searchTerm: string) => {
      console.log('[autocomplete] fetchSuggestions called', {
        projectId,
        searchTerm,
      });
      if (!projectId) {
        console.log('[autocomplete] no projectId; clearing suggestions');
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const startedAt = performance.now();
        const names = await taskNamesClient.searchByProject(projectId, {
          searchTerm: searchTerm || undefined,
          limit: LIMIT,
        });
        const mapped = names.map((tn) => tn.name);
        console.log('[autocomplete] suggestions received', {
          projectId,
          searchTerm,
          count: mapped.length,
          elapsedMs: Math.round(performance.now() - startedAt),
          suggestions: mapped,
        });
        setSuggestions(mapped);
      } catch (e) {
        console.log('[autocomplete] fetchSuggestions error', e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  return { suggestions, loading, fetchSuggestions };
}
