import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateWarehouse } from "@/api/warehouses";
import { getApiErrorMessage } from "@/lib/api-client";

const warehouseFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  shortCode: z
    .string()
    .trim()
    .min(1, "Short code is required")
    .max(10, "10 characters or fewer")
    .regex(/^[A-Za-z0-9]+$/, "Alphanumeric only"),
  address: z.string().trim().optional(),
});
type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

export function WarehouseFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createWarehouse = useCreateWarehouse();
  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: { name: "", shortCode: "", address: "" },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  async function onSubmit(values: WarehouseFormValues) {
    try {
      await createWarehouse.mutateAsync(values);
      toast.success("Warehouse created");
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create warehouse"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Warehouse</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Main Warehouse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shortCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Code</FormLabel>
                  <FormControl>
                    <Input placeholder="WH2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createWarehouse.isPending}>
                {createWarehouse.isPending ? "Creating..." : "Create warehouse"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
