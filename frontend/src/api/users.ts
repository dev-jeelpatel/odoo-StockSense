import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types";

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: async () => (await apiClient.get<User[]>("/users")).data });
}
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; email: string; password: string; role: "MANAGER" | "STAFF" }) =>
      (await apiClient.post<{ user: User }>("/auth/signup", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: "MANAGER" | "STAFF" }) =>
      (await apiClient.patch<User>(`/users/${id}/role`, { role })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: async () => (await apiClient.get<User>("/users/me")).data });
}
export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string }) => (await apiClient.patch<User>("/users/me", data)).data,
    onSuccess: (updated) => { queryClient.setQueryData(["me"], updated); queryClient.invalidateQueries({ queryKey: ["me"] }); },
  });
}
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) =>
      (await apiClient.post("/users/me/change-password", data)).data,
  });
}
