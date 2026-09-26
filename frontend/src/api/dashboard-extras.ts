import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface ReorderAlert {
  id: string; name: string; sku: string; uom: string;
  onHand: number; reorderMin: number; reorderMax: number;
  status: "LOW_STOCK" | "OUT_OF_STOCK";
}
export interface ChartDataPoint { date: string; receipts: number; deliveries: number; }

export function useDashboardAlerts() {
  return useQuery({
    queryKey: ["dashboard", "alerts"],
    queryFn: async () => (await apiClient.get<ReorderAlert[]>("/dashboard/alerts")).data,
    refetchInterval: 60_000,
  });
}

export function useDashboardChartData() {
  return useQuery({
    queryKey: ["dashboard", "chart-data"],
    queryFn: async () => (await apiClient.get<ChartDataPoint[]>("/dashboard/chart-data")).data,
    refetchInterval: 120_000,
  });
}
