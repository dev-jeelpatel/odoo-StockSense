import { Badge } from "@/components/ui/badge";
import type { PickingStatus } from "@/types";

const STATUS_LABEL: Record<PickingStatus, string> = {
  DRAFT: "Draft",
  WAITING: "Waiting",
  READY: "Ready",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

const STATUS_CLASS: Record<PickingStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  WAITING: "bg-destructive/10 text-destructive",
  READY: "bg-warning/15 text-warning",
  DONE: "bg-success/15 text-success",
  CANCELLED: "bg-muted text-muted-foreground line-through",
};

export function StatusBadge({ status }: { status: PickingStatus }) {
  return <Badge className={STATUS_CLASS[status]}>{STATUS_LABEL[status]}</Badge>;
}
