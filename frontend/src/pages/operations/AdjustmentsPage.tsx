import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePickings } from "@/api/pickings";
import { AdjustmentFormDialog } from "./AdjustmentFormDialog";

export function AdjustmentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: pickings, isLoading } = usePickings({ pickingType: "ADJUSTMENT" });

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

      <div className="flex-1 overflow-y-auto p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
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
                  No adjustments recorded yet.
                </TableCell>
              </TableRow>
            )}
            {pickings?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.reference}</TableCell>
                <TableCell className="text-muted-foreground">{p.destLocation.name}</TableCell>
                <TableCell>{new Date(p.doneDate ?? p.scheduledDate).toLocaleString()}</TableCell>
                <TableCell>
                  <StatusBadge status={p.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AdjustmentFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
