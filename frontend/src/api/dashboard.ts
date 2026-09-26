import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { DashboardKpis } from "@/types";

export function useDashboardKpis() {
  return useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: async () => (await apiClient.get<DashboardKpis>("/dashboard/kpis")).data,
    refetchInterval: 30_000,
  });
}
