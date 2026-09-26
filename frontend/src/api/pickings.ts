import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Picking, PickingStatus, PickingType } from "@/types";

export interface PickingLineInput {
  productId: string;
  quantity: number;
}

export interface CreatePickingInput {
  pickingType: PickingType;
  warehouseId: string;
  partnerName?: string;
  scheduledDate: string;
  sourceLocationId?: string;
  destLocationId?: string;
  responsibleUserId?: string;
  lines: PickingLineInput[];
}

export interface CreateAdjustmentInput {
  warehouseId: string;
  locationId: string;
  scheduledDate?: string;
  lines: { productId: string; countedQuantity: number }[];
}

export function usePickings(filters: {
  pickingType?: PickingType;
  status?: PickingStatus;
  warehouseId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["pickings", filters],
    queryFn: async () => (await apiClient.get<Picking[]>("/pickings", { params: filters })).data,
  });
}

export function usePicking(id: string | undefined) {
  return useQuery({
    queryKey: ["pickings", id],
    queryFn: async () => (await apiClient.get<Picking>(`/pickings/${id}`)).data,
    enabled: !!id,
  });
}

function invalidatePickings(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["pickings"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["stock"] });
  queryClient.invalidateQueries({ queryKey: ["moves"] });
  queryClient.invalidateQueries({ queryKey: ["products"] });
}

export function useCreatePicking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePickingInput) => (await apiClient.post<Picking>("/pickings", input)).data,
    onSuccess: () => invalidatePickings(queryClient),
  });
}

export function useReplaceLines() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, lines }: { id: string; lines: PickingLineInput[] }) =>
      (await apiClient.put<Picking>(`/pickings/${id}/lines`, { lines })).data,
    onSuccess: () => invalidatePickings(queryClient),
  });
}

export function useMarkReady() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.post<Picking>(`/pickings/${id}/mark-ready`)).data,
    onSuccess: () => invalidatePickings(queryClient),
  });
}

export function useValidatePicking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.post<Picking>(`/pickings/${id}/validate`)).data,
    onSuccess: () => invalidatePickings(queryClient),
  });
}

export function useCancelPicking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.post<Picking>(`/pickings/${id}/cancel`)).data,
    onSuccess: () => invalidatePickings(queryClient),
  });
}

export function useCreateAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAdjustmentInput) =>
      (await apiClient.post<Picking>("/pickings/adjustments", input)).data,
    onSuccess: () => invalidatePickings(queryClient),
  });
}
