import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateLocation } from "@/api/warehouses";
import { getApiErrorMessage } from "@/lib/api-client";

const locationFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  shortCode: z.string().trim().min(1, "Short code is required").max(20, "20 characters or fewer"),
});
type LocationFormValues = z.infer<typeof locationFormSchema>;

export function LocationFormDialog({
  open,
  onOpenChange,
  warehouseId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouseId: string;
}) {
  const createLocation = useCreateLocation();
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: { name: "", shortCode: "" },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  async function onSubmit(values: LocationFormValues) {
    try {
      await createLocation.mutateAsync({ warehouseId, ...values });
      toast.success("Location created");
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create location"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Location</DialogTitle>
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
                    <Input placeholder="Rack B" {...field} />
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
                    <Input placeholder="RACKB" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createLocation.isPending}>
                {createLocation.isPending ? "Creating..." : "Create location"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
