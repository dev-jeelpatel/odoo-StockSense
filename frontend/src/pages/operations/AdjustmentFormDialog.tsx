import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWarehouses, useLocations } from "@/api/warehouses";
import { useStockQuants } from "@/api/stock";
import { useCreateAdjustment } from "@/api/pickings";
import { getApiErrorMessage } from "@/lib/api-client";

export function AdjustmentFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: warehouses } = useWarehouses();
  const [warehouseId, setWarehouseId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: locations } = useLocations(warehouseId || undefined);
  const internalLocations = (locations ?? []).filter((l) => l.kind === "INTERNAL");

  const { data: quants } = useStockQuants({ locationId: locationId || undefined });
  const createAdjustment = useCreateAdjustment();

  useEffect(() => {
    if (open) {
      setWarehouseId(warehouses?.[0]?.id ?? "");
      setLocationId("");
      setCounts({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (quants) {
      const initial: Record<string, number> = {};
      for (const q of quants) initial[q.productId] = q.quantity;
      setCounts(initial);
    }
  }, [quants]);

  async function onSubmit() {
    if (!warehouseId || !locationId) return toast.error("Select a warehouse and location");
    const lines = Object.entries(counts).map(([productId, countedQuantity]) => ({ productId, countedQuantity }));
    if (lines.length === 0) return toast.error("No products currently stocked at this location");

    setSubmitting(true);
    try {
      await createAdjustment.mutateAsync({ warehouseId, locationId, lines });
      toast.success("Stock adjusted");
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not post adjustment"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Stock Count</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Warehouse</Label>
              <Select value={warehouseId} onValueChange={(v) => { setWarehouseId(v); setLocationId(""); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses?.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Select value={locationId} onValueChange={setLocationId} disabled={!warehouseId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {internalLocations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {locationId && (
            <div>
              <Label className="mb-2 block">Counted quantities</Label>
              {quants?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No products currently stocked at this location.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">On hand</TableHead>
                      <TableHead className="text-right">Counted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quants?.map((q) => (
                      <TableRow key={q.productId}>
                        <TableCell className="font-medium">{q.product.name}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {q.quantity} {q.product.uom.shortCode}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={0}
                            className="ml-auto w-24"
                            value={counts[q.productId] ?? q.quantity}
                            onChange={(e) =>
                              setCounts((prev) => ({ ...prev, [q.productId]: Number(e.target.value) }))
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={submitting || !locationId}>
            {submitting ? "Posting..." : "Post adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
