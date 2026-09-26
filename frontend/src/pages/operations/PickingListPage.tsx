import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox, LayoutGrid, List, Plus, Search } from "lucide-react";
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
    <Card
      className="cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
      onClick={onClick}
      style={{ borderColor: picking.isLate ? "oklch(0.577 0.245 27 / 30%)" : undefined }}
    >
      <CardContent className="space-y-1.5 px-3 py-3">
        <p className="text-sm font-semibold text-foreground">{picking.reference}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        <p className={cn("text-xs font-medium", picking.isLate ? "text-destructive" : "text-muted-foreground")}>
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

        {pickings && (
          <span className="text-xs text-muted-foreground">
            {pickings.length} record{pickings.length !== 1 ? "s" : ""}
          </span>
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
          <div className="overflow-hidden rounded-xl border bg-card animate-fade-up">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Reference</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">{copy.partnerHeader}</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Schedule Date</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      <div className="flex items-center justify-center gap-2">
                        <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        Loading…
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && pickings?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Inbox className="size-8 text-muted-foreground/40" />
                        {search ? `No documents match "${search}".` : "No documents found."}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {pickings?.map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer transition-colors hover:bg-primary/[0.02]"
                    onClick={() => navigate(`${basePath}/${p.id}`)}
                  >
                    <TableCell className="font-semibold text-sm">{p.reference}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{subtitleFor(p)}</TableCell>
                    <TableCell className={cn("text-sm", p.isLate ? "text-destructive font-medium" : "text-muted-foreground")}>
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
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex h-full gap-3">
            {KANBAN_COLUMNS.map((col) => {
              const items = pickings?.filter((p) => p.status === col) ?? [];
              return (
                <div key={col} className="flex w-60 shrink-0 flex-col">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{COLUMN_LABEL[col]}</span>
                    <span
                      className="text-xs font-bold tabular-nums"
                      style={{
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                        padding: "1px 7px",
                        borderRadius: "999px",
                        fontSize: "0.625rem",
                      }}
                    >
                      {items.length}
                    </span>
                  </div>
                  <div
                    className="flex-1 space-y-2 overflow-y-auto rounded-xl p-2"
                    style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
                  >
                    {items.length === 0 && (
                      <div className="flex flex-col items-center gap-1.5 p-4 text-center">
                        <Inbox className="size-5 text-muted-foreground/30" />
                        <p className="text-xs text-muted-foreground">No documents</p>
                      </div>
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
