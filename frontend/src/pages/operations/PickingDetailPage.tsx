import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Printer } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Loading...</p>
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
        <Card className="mb-4">
          <CardContent className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="mt-1">
                <StatusBadge status={picking.status} />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Warehouse</p>
              <p className="text-sm font-medium">{picking.warehouse.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
              <p className={cn("text-sm font-medium", picking.isLate && "text-destructive")}>
                {new Date(picking.scheduledDate).toLocaleDateString()}
                {picking.isLate && " (Late)"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Responsible</p>
              <p className="text-sm font-medium">{picking.responsibleUser?.name ?? "Unassigned"}</p>
            </div>
          </CardContent>
        </Card>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {picking.lines.map((line) => (
              <TableRow key={line.id} className={line.status === "WAITING" ? "bg-destructive/5" : undefined}>
                <TableCell className={cn("font-medium", line.status === "WAITING" && "text-destructive")}>
                  {line.product.name}
                </TableCell>
                <TableCell className="text-muted-foreground">{line.product.sku}</TableCell>
                <TableCell className="text-right">
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
  );
}
