import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/api/categories";
import { useUnitsOfMeasure } from "@/api/uom";
import { useLocations, useWarehouses } from "@/api/warehouses";
import { useCreateProduct, type CreateProductInput } from "@/api/products";
import { getApiErrorMessage } from "@/lib/api-client";

const productFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  sku: z.string().trim().min(1, "SKU is required"),
  categoryId: z.string().min(1, "Select a category"),
  uomId: z.string().min(1, "Select a unit"),
  costPerUnit: z.coerce.number().int().min(0),
  reorderMin: z.coerce.number().int().min(0),
  reorderMax: z.coerce.number().int().min(0),
  initialLocationId: z.string().optional(),
  initialQuantity: z.coerce.number().int().min(0),
});
type ProductFormValues = z.infer<typeof productFormSchema>;

export function ProductFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: categories } = useCategories();
  const { data: uoms } = useUnitsOfMeasure();
  const { data: warehouses } = useWarehouses();
  const { data: locations } = useLocations();
  const createProduct = useCreateProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      categoryId: "",
      uomId: "",
      costPerUnit: 0,
      reorderMin: 0,
      reorderMax: 0,
      initialLocationId: "",
      initialQuantity: 0,
    },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  async function onSubmit(values: ProductFormValues) {
    const input: CreateProductInput = {
      name: values.name,
      sku: values.sku,
      categoryId: values.categoryId,
      uomId: values.uomId,
      costPerUnit: values.costPerUnit,
      reorderMin: values.reorderMin,
      reorderMax: values.reorderMax,
    };
    if (values.initialLocationId && values.initialQuantity > 0) {
      input.initialStock = { locationId: values.initialLocationId, quantity: values.initialQuantity };
    }

    try {
      await createProduct.mutateAsync(input);
      toast.success("Product created");
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create product"));
    }
  }

  const internalLocations = (locations ?? []).filter((l) => l.kind === "INTERNAL");
  const warehouseName = (warehouseId: string | null) => warehouses?.find((w) => w.id === warehouseId)?.name ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Product</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Steel Rods" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU / Code</FormLabel>
                    <FormControl>
                      <Input placeholder="SKU-0001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="uomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measure</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {uoms?.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} ({u.shortCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="costPerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost per unit</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reorderMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Min</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reorderMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Max</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="initialLocationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial stock location</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {internalLocations.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {warehouseName(l.warehouseId)} / {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="initialQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProduct.isPending}>
                {createProduct.isPending ? "Creating..." : "Create product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
