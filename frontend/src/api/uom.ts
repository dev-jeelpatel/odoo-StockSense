import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { UnitOfMeasure } from "@/types";

export function useUnitsOfMeasure() {
  return useQuery({
    queryKey: ["uom"],
    queryFn: async () => (await apiClient.get<UnitOfMeasure[]>("/uom")).data,
  });
}
