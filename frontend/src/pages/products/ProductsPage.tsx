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

      {/* Filters bar */}
      <div
        className="flex items-center gap-3 px-6 py-3"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}
      >
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU…"
            className="pl-8 h-8 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryId || "all"} onValueChange={(v) => setCategoryId(v === "all" ? "" : v)}>
          <SelectTrigger className="w-52 h-8 text-sm">
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

        {products && (
          <span className="ml-auto text-xs text-muted-foreground">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="overflow-hidden rounded-xl border bg-card animate-fade-up">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Name</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">SKU</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Category</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">UOM</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">Cost/unit</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">On hand</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">Reorder min/max</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      Loading products…
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && products?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="size-8 opacity-30" />
                      <p className="text-sm">No products found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {products?.map((product) => {
                const onHand = product.quants?.reduce((sum, q) => sum + q.quantity, 0) ?? 0;
                const isLow = onHand <= product.reorderMin && product.reorderMin > 0;
                return (
                  <TableRow key={product.id} className="transition-colors hover:bg-primary/[0.02]">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">{product.sku}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs font-medium">
                        {product.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{product.uom.shortCode}</TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      ₹{product.costPerUnit.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        style={
                          isLow
                            ? {
                                background: "oklch(0.577 0.245 27 / 12%)",
                                color: "oklch(0.5 0.245 27)",
                                border: "none",
                                fontSize: "0.75rem",
                              }
                            : {
                                background: "oklch(0.58 0.18 145 / 12%)",
                                color: "oklch(0.45 0.18 145)",
                                border: "none",
                                fontSize: "0.75rem",
                              }
                        }
                      >
                        {onHand} {product.uom.shortCode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {product.reorderMin} / {product.reorderMax}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
      </div>

      <ProductFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
