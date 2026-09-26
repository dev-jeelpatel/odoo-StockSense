import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import type { User } from "@/types";

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
});
type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

export function ProfilePage() {
  const queryClient = useQueryClient();

  const { data: me, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await apiClient.get<User>("/users/me")).data,
  });

  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (me) form.reset({ name: me.name });
  }, [me, form]);

  const mutation = useMutation({
    mutationFn: async (values: UpdateProfileValues) => (await apiClient.patch<User>("/users/me", values)).data,
    onSuccess: (updated) => {
      queryClient.setQueryData(["me"], updated);
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="My Profile" description="Your account details." />
      <div className="p-6">
        <Card className="max-w-md">
          <CardContent className="space-y-4 pt-6">
            {isLoading || !me ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span>{me.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Role</span>
                  <Badge variant="secondary">{me.role === "MANAGER" ? "Inventory Manager" : "Warehouse Staff"}</Badge>
                </div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={mutation.isPending}>
                      {mutation.isPending ? "Saving..." : "Save changes"}
                    </Button>
                  </form>
                </Form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
