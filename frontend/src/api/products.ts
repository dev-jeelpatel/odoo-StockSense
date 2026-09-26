import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Product } from "@/types";

export interface CreateProductInput {
  name: string;
  sku: string;
  categoryId: string;
  uomId: string;
  costPerUnit: number;
  reorderMin: number;
  reorderMax: number;
  initialStock?: { locationId: string; quantity: number };
}

export interface UpdateProductInput {
  name?: string;
  categoryId?: string;
  uomId?: string;
  costPerUnit?: number;
  reorderMin?: number;
  reorderMax?: number;
}

export function useProducts(filters?: { search?: string; categoryId?: string }) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => (await apiClient.get<Product[]>("/products", { params: filters })).data,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => (await apiClient.get<Product>(`/products/${id}`)).data,
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProductInput) => (await apiClient.post<Product>("/products", input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateProductInput & { id: string }) =>
      (await apiClient.patch<Product>(`/products/${id}`, input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
