import { useMemo, useState } from "react";
import { PackageSearch, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWarehouses } from "@/api/warehouses";
import { useStockQuants } from "@/api/stock";

export function StockPage() {
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [search, setSearch] = useState("");
  const { data: warehouses } = useWarehouses();
  const { data: quants, isLoading } = useStockQuants({ warehouseId: warehouseId || undefined });

  const filtered = useMemo(() => {
    if (!quants) return quants;
    const q = search.trim().toLowerCase();
    if (!q) return quants;
    return quants.filter((r) => r.product.name.toLowerCase().includes(q) || r.product.sku.toLowerCase().includes(q));
  }, [quants, search]);

  const totalValue = useMemo(
    () => filtered?.reduce((sum, q) => sum + q.quantity * q.product.costPerUnit, 0) ?? 0,
    [filtered]
  );

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Stock" description="Current on-hand quantity per product and location." />

      <div
        className="flex items-center gap-3 px-6 py-3"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}
      >
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input placeholder="Search product or SKU" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={warehouseId || "all"} onValueChange={(v) => setWarehouseId(v === "all" ? "" : v)}>
          <SelectTrigger className="w-52 h-8 text-sm">
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
        {filtered && (
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""} · ₹{totalValue.toLocaleString()} total value
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="overflow-hidden rounded-xl border bg-card animate-fade-up">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Product</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">SKU</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">Per unit cost</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Warehouse</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Location</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      Loading stock…
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filtered?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    <div className="flex flex-col items-center gap-2">
                      <PackageSearch className="size-8 text-muted-foreground/40" />
                      {search ? `No stock matches "${search}".` : "No stock recorded yet."}
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {filtered?.map((q) => (
                <TableRow key={q.id} className="transition-colors hover:bg-primary/[0.02]">
                  <TableCell className="font-medium">{q.product.name}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">{q.product.sku}</span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    ₹{q.product.costPerUnit.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">{q.location.warehouse?.name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{q.location.name}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {q.quantity} {q.product.uom.shortCode}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
