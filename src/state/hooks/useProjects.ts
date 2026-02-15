import { useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsClient } from "@/api/clients/projectsClient";
import type { Project } from "@/types";

export function useProjects() {
  const { data, ...rest } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => projectsClient.getAll(),
  });
  return { ...rest, projects: data ?? [], data };
}

export function useInvalidateProjects() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ["projects"] });
}
