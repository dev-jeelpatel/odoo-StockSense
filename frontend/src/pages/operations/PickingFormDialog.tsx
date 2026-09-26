import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWarehouses, useLocations } from "@/api/warehouses";
import { useProducts } from "@/api/products";
import { useCreatePicking, type CreatePickingInput, type PickingLineInput } from "@/api/pickings";
import { getApiErrorMessage } from "@/lib/api-client";
import type { PickingType } from "@/types";

const COPY: Record<PickingType, { title: string; partnerLabel: string; locationLabel: string }> = {
  RECEIPT: { title: "New Receipt", partnerLabel: "Receive From", locationLabel: "Destination location" },
  DELIVERY: { title: "New Delivery", partnerLabel: "Deliver To", locationLabel: "Source location" },
  INTERNAL: { title: "New Internal Transfer", partnerLabel: "", locationLabel: "" },
  ADJUSTMENT: { title: "New Adjustment", partnerLabel: "", locationLabel: "" },
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function PickingFormDialog({
  open,
  onOpenChange,
  pickingType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pickingType: Exclude<PickingType, "ADJUSTMENT">;
}) {
  const copy = COPY[pickingType];
  const { data: warehouses } = useWarehouses();
  const { data: products } = useProducts();
  const createPicking = useCreatePicking();

  const [warehouseId, setWarehouseId] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [scheduledDate, setScheduledDate] = useState(todayIso());
  const [sourceLocationId, setSourceLocationId] = useState("");
  const [destLocationId, setDestLocationId] = useState("");
  const [lines, setLines] = useState<PickingLineInput[]>([{ productId: "", quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);

  const { data: locations } = useLocations(warehouseId || undefined);
  const internalLocations = (locations ?? []).filter((l) => l.kind === "INTERNAL");

  useEffect(() => {
    if (open) {
      setWarehouseId(warehouses?.[0]?.id ?? "");
      setPartnerName("");
      setScheduledDate(todayIso());
      setSourceLocationId("");
      setDestLocationId("");
      setLines([{ productId: "", quantity: 1 }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function updateLine(index: number, patch: Partial<PickingLineInput>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function addLine() {
    setLines((prev) => [...prev, { productId: "", quantity: 1 }]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit() {
    if (!warehouseId) return toast.error("Select a warehouse");
    if (pickingType === "INTERNAL" && (!sourceLocationId || !destLocationId)) {
      return toast.error("Select source and destination locations");
    }
    if (pickingType === "INTERNAL" && sourceLocationId === destLocationId) {
      return toast.error("Source and destination must be different");
    }
    const validLines = lines.filter((l) => l.productId && l.quantity > 0);
    if (validLines.length === 0) return toast.error("Add at least one product line");

    const input: CreatePickingInput = {
      pickingType,
      warehouseId,
      scheduledDate: new Date(scheduledDate).toISOString(),
      lines: validLines,
    };
    if (partnerName) input.partnerName = partnerName;
    if (pickingType === "RECEIPT" && destLocationId) input.destLocationId = destLocationId;
    if (pickingType === "DELIVERY" && sourceLocationId) input.sourceLocationId = sourceLocationId;
    if (pickingType === "INTERNAL") {
      input.sourceLocationId = sourceLocationId;
      input.destLocationId = destLocationId;
    }

    setSubmitting(true);
    try {
      await createPicking.mutateAsync(input);
      toast.success(`${copy.title} created`);
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create document"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Warehouse</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
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
              <Label>Schedule Date</Label>
              <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
            </div>

            {pickingType !== "INTERNAL" && (
              <div className="space-y-1.5 col-span-2">
                <Label>{copy.partnerLabel}</Label>
                <Input
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Contact / partner name"
                />
              </div>
            )}

            {pickingType === "RECEIPT" && (
              <div className="space-y-1.5 col-span-2">
                <Label>{copy.locationLabel}</Label>
                <Select value={destLocationId} onValueChange={setDestLocationId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Defaults to warehouse Stock" />
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
            )}

            {pickingType === "DELIVERY" && (
              <div className="space-y-1.5 col-span-2">
                <Label>{copy.locationLabel}</Label>
                <Select value={sourceLocationId} onValueChange={setSourceLocationId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Defaults to warehouse Stock" />
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
            )}

            {pickingType === "INTERNAL" && (
              <>
                <div className="space-y-1.5">
                  <Label>Source location</Label>
                  <Select value={sourceLocationId} onValueChange={setSourceLocationId}>
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
                <div className="space-y-1.5">
                  <Label>Destination location</Label>
                  <Select value={destLocationId} onValueChange={setDestLocationId}>
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
              </>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Products</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="size-4" />
                New Product
              </Button>
            </div>
            <div className="space-y-2">
              {lines.map((line, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select value={line.productId} onValueChange={(v) => updateLine(index, { productId: v })}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    className="w-24"
                    value={line.quantity}
                    onChange={(e) => updateLine(index, { quantity: Number(e.target.value) })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLine(index)}
                    disabled={lines.length === 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={submitting}>
            {submitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
