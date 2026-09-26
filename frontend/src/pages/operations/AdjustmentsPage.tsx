import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePickings } from "@/api/pickings";
import { AdjustmentFormDialog } from "./AdjustmentFormDialog";

export function AdjustmentsPage() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: pickings, isLoading } = usePickings({ pickingType: "ADJUSTMENT" });

  const filtered = useMemo(() => {
    if (!pickings) return pickings;
    const q = search.trim().toLowerCase();
    if (!q) return pickings;
    return pickings.filter((p) => p.reference.toLowerCase().includes(q) || p.destLocation.name.toLowerCase().includes(q));
  }, [pickings, search]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Adjustments"
        description="Correct stock counts after a physical count."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            New Stock Count
          </Button>
        }
      />

      <div className="flex items-center gap-3 border-b bg-card px-6 py-3">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input placeholder="Search reference or location" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {filtered && (
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="overflow-hidden rounded-xl border bg-card animate-fade-up">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Reference</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Location</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide">Date</TableHead>
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
              {!isLoading && filtered?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardCheck className="size-8 text-muted-foreground/40" />
                      {search ? `No adjustments match "${search}".` : "No adjustments recorded yet."}
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {filtered?.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer transition-colors hover:bg-primary/[0.02]"
                  onClick={() => navigate(`/operations/adjustments/${p.id}`)}
                >
                  <TableCell className="font-semibold text-sm">{p.reference}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.destLocation.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(p.doneDate ?? p.scheduledDate).toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AdjustmentFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
