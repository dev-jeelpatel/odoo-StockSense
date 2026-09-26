import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Location } from "@/types";

export function useLocations(warehouseId?: string) {
  return useQuery({
    queryKey: ["locations", warehouseId ?? "all"],
    queryFn: async () => {
      const params = warehouseId ? `?warehouseId=${warehouseId}` : "";
      return (await apiClient.get<Location[]>(`/locations${params}`)).data;
    },
  });
}
