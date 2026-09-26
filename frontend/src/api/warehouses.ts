import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Location, Warehouse } from "@/types";

export function useWarehouses() {
  return useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => (await apiClient.get<Warehouse[]>("/warehouses")).data,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; shortCode: string; address?: string }) =>
      (await apiClient.post<Warehouse>("/warehouses", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["warehouses"] }),
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string; name?: string; address?: string }) =>
      (await apiClient.patch<Warehouse>(`/warehouses/${id}`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["warehouses"] }),
  });
}

export function useLocations(warehouseId?: string) {
  return useQuery({
    queryKey: ["locations", warehouseId],
    queryFn: async () =>
      (await apiClient.get<Location[]>("/locations", { params: { warehouseId } })).data,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { warehouseId: string; name: string; shortCode: string; parentLocationId?: string }) =>
      (await apiClient.post<Location>("/locations", input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
    },
  });
}
