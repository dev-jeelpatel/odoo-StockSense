import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePickings } from "@/api/pickings";
import type { PickingStatus, PickingType } from "@/types";
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

export function PickingListPage({ pickingType }: { pickingType: Exclude<PickingType, "ADJUSTMENT"> }) {
  const navigate = useNavigate();
  const copy = TITLES[pickingType];
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: pickings, isLoading } = usePickings({
    pickingType,
    status: (status || undefined) as PickingStatus | undefined,
    search: search || undefined,
  });

  const basePath =
    pickingType === "RECEIPT"
      ? "/operations/receipts"
      : pickingType === "DELIVERY"
        ? "/operations/deliveries"
        : "/operations/internal-transfers";

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
      </div>

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
              <TableRow
                key={p.id}
                className="cursor-pointer"
                onClick={() => navigate(`${basePath}/${p.id}`)}
              >
                <TableCell className="font-medium">{p.reference}</TableCell>
                <TableCell className="text-muted-foreground">
                  {p.partnerName || `${p.sourceLocation.name} → ${p.destLocation.name}`}
                </TableCell>
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

      <PickingFormDialog open={dialogOpen} onOpenChange={setDialogOpen} pickingType={pickingType} />
    </div>
  );
}
