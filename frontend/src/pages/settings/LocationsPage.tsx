import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin, Building2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocations } from "@/api/locations";
import { useWarehouses } from "@/api/warehouses";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import type { Location } from "@/types";
import { useAuth } from "@/store/auth-context";

const KIND_LABELS: Record<string, string> = { INTERNAL: "Internal", VENDOR: "Vendor", CUSTOMER: "Customer", VIRTUAL_ADJUSTMENT: "Virtual" };

function LocationFormDialog({ open, onClose, editing, locations, warehouseId }: { open: boolean; onClose: () => void; editing: Location | null; locations: Location[]; warehouseId: string }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(editing?.name ?? "");
  const [shortCode, setShortCode] = useState(editing?.shortCode ?? "");
  const [parentId, setParentId] = useState<string>(editing?.parentLocationId ?? "none");

  const mutation = useMutation({
    mutationFn: async () => {
      if (editing) return (await apiClient.patch(`/locations/${editing.id}`, { name: name.trim(), parentLocationId: parentId === "none" ? null : parentId })).data;
      return (await apiClient.post("/locations", { name: name.trim(), shortCode: shortCode.trim().toUpperCase(), warehouseId, parentLocationId: parentId === "none" ? null : parentId })).data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["locations"] }); toast.success(editing ? "Location updated" : "Location created"); onClose(); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const parentOptions = locations.filter((l) => l.id !== editing?.id && l.kind === "INTERNAL" && l.warehouseId === warehouseId);

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{editing ? "Edit Location" : "New Location"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Zone A - Rack 1" autoFocus /></div>
          {!editing && <div className="space-y-1.5"><Label>Short code</Label><Input value={shortCode} onChange={(e) => setShortCode(e.target.value.toUpperCase())} placeholder="e.g. A1" maxLength={10} /></div>}
          <div className="space-y-1.5">
            <Label>Parent location</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (root)</SelectItem>
                {parentOptions.map((l) => <SelectItem key={l.id} value={l.id}>{l.name} ({l.shortCode})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!name.trim() || (!editing && !shortCode.trim()) || mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "Saving…" : editing ? "Save changes" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LocationsPage() {
  const { data: warehouses = [] } = useWarehouses();
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const { data: locations = [], isLoading } = useLocations(selectedWarehouse === "all" ? undefined : selectedWarehouse);
  const { user } = useAuth();
  const isManager = user?.role === "MANAGER";
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [deleting, setDeleting] = useState<Location | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/locations/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["locations"] }); toast.success("Location deleted"); setDeleting(null); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const activeWarehouseId = selectedWarehouse === "all" ? (warehouses[0]?.id ?? "") : selectedWarehouse;

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Locations" description="Manage warehouse bin locations and storage zones." actions={isManager ? <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }} disabled={!activeWarehouseId}><Plus className="size-3.5 mr-1.5" /> New Location</Button> : undefined} />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Building2 className="size-4 text-muted-foreground" />
          <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
            <SelectTrigger className="w-56"><SelectValue placeholder="All warehouses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All warehouses</SelectItem>
              {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name} ({w.shortCode})</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{locations.length} location{locations.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Name</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Code</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Warehouse</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Type</TableHead>
                {isManager && <TableHead className="w-20" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">Loading…</TableCell></TableRow>}
              {!isLoading && locations.length === 0 && <TableRow><TableCell colSpan={5}><div className="flex flex-col items-center gap-2 py-10 text-center"><MapPin className="size-9 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">No locations found</p></div></TableCell></TableRow>}
              {locations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell className="font-medium">{loc.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{loc.shortCode}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{loc.warehouse?.name ?? "—"}</TableCell>
                  <TableCell><Badge variant={loc.kind === "INTERNAL" ? "secondary" : "outline"} className="text-xs">{KIND_LABELS[loc.kind] ?? loc.kind}</Badge></TableCell>
                  {isManager && <TableCell><div className="flex items-center gap-1 justify-end">{loc.kind === "INTERNAL" && <><Button size="icon" variant="ghost" className="size-7" onClick={() => { setEditing(loc); setFormOpen(true); }}><Pencil className="size-3.5" /></Button><Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" onClick={() => setDeleting(loc)}><Trash2 className="size-3.5" /></Button></>}</div></TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {formOpen && <LocationFormDialog open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} editing={editing} locations={locations} warehouseId={activeWarehouseId} />}
      <AlertDialog open={!!deleting} onOpenChange={(v: boolean) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete "{deleting?.name}"?</AlertDialogTitle><AlertDialogDescription>This location will be permanently deleted.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => deleting && deleteMutation.mutate(deleting.id)}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
