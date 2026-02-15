import { useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksClient } from "@/api/clients/tasksClient";
import { Task } from "@/types";

export function useTasks(projectId: string) {
  const queryKey = ["tasks", { projectId }];
  
  const query = useQuery<Task[]>({
    queryKey,
    queryFn: () => tasksClient.getByProject(projectId, { isActive: true }),
    enabled: !!projectId,
  });

  return {
    tasks: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useInvalidateTasks() {
  const queryClient = useQueryClient();
  
  return (projectId?: string) => {
    queryClient.invalidateQueries({
      queryKey: ["tasks", projectId ? { projectId } : undefined],
      exact: !!projectId,
    });
  };
}
