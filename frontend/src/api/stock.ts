import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ReorderAlert, StockQuant } from "@/types";

export function useStockQuants(filters?: { productId?: string; warehouseId?: string; locationId?: string }) {
  return useQuery({
    queryKey: ["stock", "quants", filters],
    queryFn: async () => (await apiClient.get<StockQuant[]>("/stock/quants", { params: filters })).data,
  });
}

export function useReorderAlerts() {
  return useQuery({
    queryKey: ["stock", "reorder-alerts"],
    queryFn: async () => (await apiClient.get<ReorderAlert[]>("/stock/reorder-alerts")).data,
  });
}
