import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWarehouses } from "@/api/warehouses";
import { useStockQuants } from "@/api/stock";

export function StockPage() {
  const [warehouseId, setWarehouseId] = useState<string>("");
  const { data: warehouses } = useWarehouses();
  const { data: quants, isLoading } = useStockQuants({ warehouseId: warehouseId || undefined });

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Stock" description="Current on-hand quantity per product and location." />

      <div className="flex items-center gap-3 border-b bg-card px-6 py-3">
        <Select value={warehouseId || "all"} onValueChange={(v) => setWarehouseId(v === "all" ? "" : v)}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All warehouses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All warehouses</SelectItem>
            {warehouses?.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Per unit cost</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && quants?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No stock recorded yet.
                </TableCell>
              </TableRow>
            )}
            {quants?.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-medium">{q.product.name}</TableCell>
                <TableCell className="text-muted-foreground">{q.product.sku}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  ₹{q.product.costPerUnit.toLocaleString()}
                </TableCell>
                <TableCell>{q.location.warehouse?.name ?? "—"}</TableCell>
                <TableCell>{q.location.name}</TableCell>
                <TableCell className="text-right">
                  {q.quantity} {q.product.uom.shortCode}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
