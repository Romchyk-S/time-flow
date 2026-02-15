import { useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsClient } from "@/api/clients/projectsClient";
import type { Project } from "@/types";

export function useProjects() {
  const q = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsClient.getAll(),
  });
  return { ...q, projects: q.data ?? [] };
}

export function useInvalidateProjects() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ["projects"] });
}
