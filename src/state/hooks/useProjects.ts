import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { projectsClient } from "@/api/clients/projectsClient";
import type { Project } from "@/types";

export function useProjects() {
  const query = useQuery<Project[]>({
    queryKey: ["projects"],
    staleTime: Infinity,              // Projects rarely change
    refetchOnWindowFocus: false,      // Don't refetch when window focused
    refetchOnMount: false,            // Don't refetch on component mount
    refetchInterval: false,           // No automatic interval refetch
    retry: 1,                         // Only retry once on error
    queryFn: async () => {
      console.log('Fetching projects from Supabase...');
      try {
        const data = await projectsClient.getAll();
        console.log('Projects fetched from Supabase:', data);
        return data;
      } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Log query state changes
  useEffect(() => {
    console.log('Query state changed:', {
      status: query.status,
      dataLength: query.data?.length,
      error: query.error,
      isStale: query.isStale,
      isFetching: query.isFetching
    });
  }, [query.status, query.data, query.error, query.isStale, query.isFetching]);

  return { ...query, projects: query.data ?? [] };
}

export function useInvalidateProjects() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ["projects"] });
}
