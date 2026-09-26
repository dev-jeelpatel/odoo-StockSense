import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
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
        <div className="w-72 shrink-0 overflow-y-auto border-r p-3">
          {isLoading && <p className="p-3 text-sm text-muted-foreground">Loading...</p>}
          {warehouses?.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedId(w.id)}
              className={cn(
                "flex w-full flex-col items-start rounded-md px-3 py-2 text-left text-sm transition-colors",
                selectedId === w.id ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              <span className="font-medium">{w.name}</span>
              <span
                className={cn(
                  "text-xs",
                  selectedId === w.id ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                {w.shortCode} &middot; {w._count?.locations ?? 0} locations
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {selectedWarehouse ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-medium">{selectedWarehouse.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedWarehouse.address || "No address set"}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setLocationDialogOpen(true)}>
                  <Plus className="size-4" />
                  New Location
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Short Code</TableHead>
                    <TableHead>Kind</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations?.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="font-medium">{loc.name}</TableCell>
                      <TableCell className="text-muted-foreground">{loc.shortCode}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{loc.kind}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
