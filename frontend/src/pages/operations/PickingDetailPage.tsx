import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Printer } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api-client";
import {
  usePicking,
  useCancelPicking,
  useMarkReady,
  useValidatePicking,
} from "@/api/pickings";

const BACK_PATH: Record<string, string> = {
  RECEIPT: "/operations/receipts",
  DELIVERY: "/operations/deliveries",
  INTERNAL: "/operations/internal-transfers",
  ADJUSTMENT: "/operations/adjustments",
};

export function PickingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: picking, isLoading } = usePicking(id);
  const markReady = useMarkReady();
  const validate = useValidatePicking();
  const cancel = useCancelPicking();

  if (isLoading || !picking) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm">Loading document…</p>
        </div>
      </div>
    );
  }

  const backPath = BACK_PATH[picking.pickingType];

  async function handleMarkReady() {
    try {
      await markReady.mutateAsync(picking!.id);
      toast.success("Marked ready");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleValidate() {
    try {
      await validate.mutateAsync(picking!.id);
      toast.success("Validated — stock updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not validate"));
    }
  }

  async function handleCancel() {
    try {
      await cancel.mutateAsync(picking!.id);
      toast.success("Cancelled");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  const canMarkReady = picking.status === "DRAFT";
  const canValidate = picking.status === "READY" || picking.status === "WAITING";
  const canCancel = picking.status === "DRAFT" || picking.status === "WAITING" || picking.status === "READY";

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={picking.reference}
        description={picking.partnerName ?? `${picking.sourceLocation.name} → ${picking.destLocation.name}`}
        actions={
          <div className="flex items-center gap-2 print:hidden">
            <Button variant="ghost" size="sm" onClick={() => navigate(backPath)}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            {picking.status === "DONE" && (
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="size-4" />
                Print
              </Button>
            )}
            {canCancel && (
              <Button variant="outline" onClick={handleCancel} disabled={cancel.isPending}>
                Cancel
              </Button>
            )}
            {canMarkReady && (
              <Button onClick={handleMarkReady} disabled={markReady.isPending}>
                {markReady.isPending ? "Working..." : "To Do"}
              </Button>
            )}
            {canValidate && (
              <Button onClick={handleValidate} disabled={validate.isPending}>
                {validate.isPending ? "Validating..." : "Validate"}
              </Button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 print:overflow-visible">
        {/* Info card */}
        <div
          className="mb-5 overflow-hidden rounded-xl border bg-card animate-fade-up"
          style={{ boxShadow: "0 1px 4px oklch(0 0 0 / 6%)" }}
        >
          <div
            className="px-5 py-3"
            style={{
              background: "linear-gradient(135deg, oklch(0.52 0.26 270 / 6%), transparent 60%)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Document Details</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:grid-cols-4">
            <div>
              <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">Status</p>
              <div className="mt-1.5">
                <StatusBadge status={picking.status} />
              </div>
            </div>
            <div>
              <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">Warehouse</p>
              <p className="mt-1.5 text-sm font-semibold">{picking.warehouse.name}</p>
            </div>
            <div>
              <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">Scheduled</p>
              <p className={cn("mt-1.5 text-sm font-semibold", picking.isLate && "text-destructive")}>
                {new Date(picking.scheduledDate).toLocaleDateString()}
                {picking.isLate && " (Late)"}
              </p>
            </div>
            <div>
              <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground">Responsible</p>
              <p className="mt-1.5 text-sm font-semibold">{picking.responsibleUser?.name ?? "Unassigned"}</p>
            </div>
          </div>
        </div>

        {/* Lines table */}
        <div className="overflow-hidden rounded-xl border bg-card animate-fade-up" style={{ animationDelay: "80ms" }}>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Product</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">SKU</TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">Quantity</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {picking.lines.map((line) => (
                <TableRow
                  key={line.id}
                  className="transition-colors"
                  style={{
                    background: line.status === "WAITING" ? "oklch(0.577 0.245 27 / 4%)" : undefined,
                  }}
                >
                  <TableCell className={cn("font-medium", line.status === "WAITING" && "text-destructive")}>
                    {line.product.name}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">{line.product.sku}</span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {line.quantity} {line.product.uom.shortCode}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={line.status} />
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
