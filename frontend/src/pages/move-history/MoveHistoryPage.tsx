import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useWarehouses } from "@/api/warehouses";
import { useMoves } from "@/api/moves";
import type { MoveLedgerEntry } from "@/types";

const DIRECTION_CLASS: Record<MoveLedgerEntry["direction"], string> = {
  IN: "text-success",
  OUT: "text-destructive",
  INTERNAL: "text-foreground",
};

export function MoveHistoryPage() {
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const { data: warehouses } = useWarehouses();
  const { data: moves, isLoading } = useMoves({
    search: search || undefined,
    warehouseId: warehouseId || undefined,
  });

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Move History" description="Full ledger of every stock movement, in and out." />

      <div className="flex items-center gap-3 border-b bg-card px-6 py-3">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search reference or contact"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
              <TableHead>Reference</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Direction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && moves?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No moves recorded yet.
                </TableCell>
              </TableRow>
            )}
            {moves?.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.picking.reference}</TableCell>
                <TableCell className="text-muted-foreground">
                  {m.doneAt ? new Date(m.doneAt).toLocaleString() : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">{m.picking.partnerName || "—"}</TableCell>
                <TableCell>{m.sourceLocation.name}</TableCell>
                <TableCell>{m.destLocation.name}</TableCell>
                <TableCell className={cn("text-right font-medium", DIRECTION_CLASS[m.direction])}>
                  {m.direction === "OUT" ? "-" : m.direction === "IN" ? "+" : ""}
                  {m.quantity} {m.product.uom.shortCode}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={DIRECTION_CLASS[m.direction]}>
                    {m.direction}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
