import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCategories } from "@/api/categories";
import { useDeleteProduct, useProducts } from "@/api/products";
import { getApiErrorMessage } from "@/lib/api-client";
import { ProductFormDialog } from "./ProductFormDialog";

export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts({
    search: search || undefined,
    categoryId: categoryId || undefined,
  });
  const deleteProduct = useDeleteProduct();

  async function handleDelete(id: string) {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete product"));
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Products"
        description="Create and manage products, categories, and stock levels."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            New Product
          </Button>
        }
      />

      <div className="flex items-center gap-3 border-b bg-card px-6 py-3">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryId || "all"} onValueChange={(v) => setCategoryId(v === "all" ? "" : v)}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>UOM</TableHead>
              <TableHead className="text-right">Cost/unit</TableHead>
              <TableHead className="text-right">On hand</TableHead>
              <TableHead className="text-right">Reorder min/max</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && products?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
            {products?.map((product) => {
              const onHand = product.quants?.reduce((sum, q) => sum + q.quantity, 0) ?? 0;
              const isLow = onHand <= product.reorderMin && product.reorderMin > 0;
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>{product.uom.shortCode}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ₹{product.costPerUnit.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={isLow ? "destructive" : "secondary"}>
                      {onHand} {product.uom.shortCode}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {product.reorderMin} / {product.reorderMax}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      disabled={deleteProduct.isPending}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ProductFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
