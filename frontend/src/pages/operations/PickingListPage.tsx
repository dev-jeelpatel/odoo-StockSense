import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { usePickings } from "@/api/pickings";
import type { Picking, PickingStatus, PickingType } from "@/types";
import { PickingFormDialog } from "./PickingFormDialog";

const TITLES: Record<PickingType, { title: string; description: string; newLabel: string; partnerHeader: string }> = {
  RECEIPT: {
    title: "Receipts",
    description: "Incoming stock from vendors.",
    newLabel: "New Receipt",
    partnerHeader: "Receive From",
  },
  DELIVERY: {
    title: "Delivery",
    description: "Outgoing stock to customers.",
    newLabel: "New Delivery",
    partnerHeader: "Deliver To",
  },
  INTERNAL: {
    title: "Internal Transfers",
    description: "Move stock between locations and warehouses.",
    newLabel: "New Transfer",
    partnerHeader: "Route",
  },
  ADJUSTMENT: { title: "Adjustments", description: "", newLabel: "", partnerHeader: "" },
};

const STATUS_OPTIONS: PickingStatus[] = ["DRAFT", "WAITING", "READY", "DONE", "CANCELLED"];
const KANBAN_COLUMNS: PickingStatus[] = ["DRAFT", "WAITING", "READY", "DONE", "CANCELLED"];
const COLUMN_LABEL: Record<PickingStatus, string> = {
  DRAFT: "Draft",
  WAITING: "Waiting",
  READY: "Ready",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

function PickingCard({ picking, onClick, subtitle }: { picking: Picking; onClick: () => void; subtitle: string }) {
  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={onClick}>
      <CardContent className="space-y-1 px-3 py-3">
        <p className="text-sm font-semibold">{picking.reference}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        <p className={cn("text-xs", picking.isLate ? "text-destructive" : "text-muted-foreground")}>
          {new Date(picking.scheduledDate).toLocaleDateString()}
          {picking.isLate && " · Late"}
        </p>
      </CardContent>
    </Card>
  );
}

export function PickingListPage({ pickingType }: { pickingType: Exclude<PickingType, "ADJUSTMENT"> }) {
  const navigate = useNavigate();
  const copy = TITLES[pickingType];
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: pickings, isLoading } = usePickings({
    pickingType,
    status: view === "list" ? ((status || undefined) as PickingStatus | undefined) : undefined,
    search: search || undefined,
  });

  const basePath =
    pickingType === "RECEIPT"
      ? "/operations/receipts"
      : pickingType === "DELIVERY"
        ? "/operations/deliveries"
        : "/operations/internal-transfers";

  function subtitleFor(p: Picking) {
    return p.partnerName || `${p.sourceLocation.name} → ${p.destLocation.name}`;
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            {copy.newLabel}
          </Button>
        }
      />

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
        {view === "list" && (
          <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="ml-auto flex items-center gap-1 rounded-md border p-0.5">
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <List className="size-4" />
          </Button>
          <Button
            variant={view === "kanban" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("kanban")}
            aria-label="Kanban view"
          >
            <LayoutGrid className="size-4" />
          </Button>
        </div>
      </div>

      {view === "list" ? (
        <div className="flex-1 overflow-y-auto p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>{copy.partnerHeader}</TableHead>
                <TableHead>Schedule Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && pickings?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No documents found.
                  </TableCell>
                </TableRow>
              )}
              {pickings?.map((p) => (
                <TableRow key={p.id} className="cursor-pointer" onClick={() => navigate(`${basePath}/${p.id}`)}>
                  <TableCell className="font-medium">{p.reference}</TableCell>
                  <TableCell className="text-muted-foreground">{subtitleFor(p)}</TableCell>
                  <TableCell className={p.isLate ? "text-destructive" : undefined}>
                    {new Date(p.scheduledDate).toLocaleDateString()}
                    {p.isLate && " (Late)"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex h-full gap-4">
            {KANBAN_COLUMNS.map((col) => {
              const items = pickings?.filter((p) => p.status === col) ?? [];
              return (
                <div key={col} className="flex w-64 shrink-0 flex-col">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-sm font-medium">{COLUMN_LABEL[col]}</span>
                    <span className="text-xs text-muted-foreground">{items.length}</span>
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto rounded-md bg-muted/40 p-2">
                    {items.length === 0 && (
                      <p className="p-2 text-center text-xs text-muted-foreground">No documents</p>
                    )}
                    {items.map((p) => (
                      <PickingCard
                        key={p.id}
                        picking={p}
                        subtitle={subtitleFor(p)}
                        onClick={() => navigate(`${basePath}/${p.id}`)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <PickingFormDialog open={dialogOpen} onOpenChange={setDialogOpen} pickingType={pickingType} />
    </div>
  );
}
