import { useState } from "react";
import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, ClipboardList, Search } from "lucide-react";
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

const DIRECTION_ICON: Record<MoveLedgerEntry["direction"], typeof ArrowDownLeft> = {
  IN: ArrowDownLeft,
  OUT: ArrowUpRight,
  INTERNAL: ArrowRightLeft,
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
        {moves && (
          <span className="ml-auto text-xs text-muted-foreground">
            {moves.length} move{moves.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="overflow-hidden rounded-xl border bg-card animate-fade-up">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Reference</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Date</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Contact</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">From</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">To</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">Quantity</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Direction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    <div className="flex items-center justify-center gap-2">
                      <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      Loading…
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && moves?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="size-8 text-muted-foreground/40" />
                      No moves recorded yet.
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {moves?.map((m) => {
                const DirIcon = DIRECTION_ICON[m.direction];
                return (
                  <TableRow key={m.id} className="transition-colors hover:bg-primary/[0.02]">
                    <TableCell className="font-semibold text-sm">{m.picking.reference}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {m.doneAt ? new Date(m.doneAt).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{m.picking.partnerName || "—"}</TableCell>
                    <TableCell className="text-sm">{m.sourceLocation.name}</TableCell>
                    <TableCell className="text-sm">{m.destLocation.name}</TableCell>
                    <TableCell className={cn("text-right font-medium text-sm", DIRECTION_CLASS[m.direction])}>
                      {m.direction === "OUT" ? "-" : m.direction === "IN" ? "+" : ""}
                      {m.quantity} {m.product.uom.shortCode}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("gap-1", DIRECTION_CLASS[m.direction])}>
                        <DirIcon className="size-3" /> {m.direction}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
