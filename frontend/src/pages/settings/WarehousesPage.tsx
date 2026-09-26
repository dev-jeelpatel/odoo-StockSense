import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocations, useWarehouses } from "@/api/warehouses";
import { WarehouseFormDialog } from "./WarehouseFormDialog";
import { LocationFormDialog } from "./LocationFormDialog";

export function WarehousesPage() {
  const { data: warehouses, isLoading } = useWarehouses();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [warehouseDialogOpen, setWarehouseDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);

  useEffect(() => {
    if (!selectedId && warehouses && warehouses.length > 0) {
      setSelectedId(warehouses[0].id);
    }
  }, [warehouses, selectedId]);

  const { data: locations } = useLocations(selectedId ?? undefined);
  const selectedWarehouse = warehouses?.find((w) => w.id === selectedId);

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Settings"
        description="Manage warehouses and their locations."
        actions={
          <Button onClick={() => setWarehouseDialogOpen(true)}>
            <Plus className="size-4" />
            New Warehouse
          </Button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Warehouse sidebar */}
        <div
          className="w-72 shrink-0 overflow-y-auto p-3"
          style={{ borderRight: "1px solid var(--border)", background: "var(--muted)" }}
        >
          {isLoading && <p className="p-3 text-sm text-muted-foreground">Loading…</p>}
          {warehouses?.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedId(w.id)}
              className="flex w-full flex-col items-start rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 mb-0.5"
              style={{
                background: selectedId === w.id ? "var(--primary)" : "transparent",
                color: selectedId === w.id ? "var(--primary-foreground)" : "inherit",
                boxShadow: selectedId === w.id ? "0 2px 8px oklch(0.52 0.26 270 / 25%)" : undefined,
              }}
            >
              <span className="font-semibold text-sm">{w.name}</span>
              <span
                className="text-xs mt-0.5"
                style={{
                  color:
                    selectedId === w.id
                      ? "oklch(0.99 0 0 / 70%)"
                      : "var(--muted-foreground)",
                }}
              >
                {w.shortCode} &middot; {w._count?.locations ?? 0} locations
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {selectedWarehouse ? (
            <>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-base">{selectedWarehouse.name}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedWarehouse.address || "No address set"}
                  </p>
                </div>
                <Button size="sm" onClick={() => setLocationDialogOpen(true)}>
                  <Plus className="size-4" />
                  New Location
                </Button>
              </div>
              <div className="overflow-hidden rounded-xl border bg-card animate-fade-up">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs font-semibold uppercase tracking-wide">Name</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide">Short Code</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide">Kind</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations?.map((loc) => (
                      <TableRow key={loc.id} className="transition-colors hover:bg-primary/[0.02]">
                        <TableCell className="font-medium">{loc.name}</TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground">{loc.shortCode}</span>
                        </TableCell>
                        <TableCell>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "0.6875rem",
                              fontWeight: 600,
                              background: "oklch(0.52 0.26 270 / 10%)",
                              color: "oklch(0.45 0.26 270)",
                            }}
                          >
                            {loc.kind}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a warehouse to see its locations.</p>
          )}
        </div>
      </div>

      <WarehouseFormDialog open={warehouseDialogOpen} onOpenChange={setWarehouseDialogOpen} />
      {selectedId && (
        <LocationFormDialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen} warehouseId={selectedId} />
      )}
    </div>
  );
}
