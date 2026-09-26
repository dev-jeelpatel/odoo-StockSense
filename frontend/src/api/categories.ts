import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ProductCategory } from "@/types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await apiClient.get<ProductCategory[]>("/categories")).data,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; parentId?: string | null }) =>
      (await apiClient.post<ProductCategory>("/categories", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
}
