import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { MoveLedgerEntry } from "@/types";

export function useMoves(filters?: { productId?: string; warehouseId?: string; search?: string }) {
  return useQuery({
    queryKey: ["moves", filters],
    queryFn: async () => (await apiClient.get<MoveLedgerEntry[]>("/moves", { params: filters })).data,
  });
}
