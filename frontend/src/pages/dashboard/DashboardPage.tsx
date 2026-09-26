import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeftRight,
  Package,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboardKpis } from "@/api/dashboard";
import { useReorderAlerts } from "@/api/stock";

export function DashboardPage() {
  const { data: kpis, isLoading } = useDashboardKpis();
  const { data: alerts } = useReorderAlerts();

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Dashboard" description="Snapshot of inventory operations across all warehouses." />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard label="Total Products in Stock" value={isLoading ? "..." : kpis?.totalProductsInStock ?? 0} icon={Package} />
          <KpiCard
            label="Low Stock Items"
            value={isLoading ? "..." : kpis?.lowStockItems ?? 0}
            icon={AlertTriangle}
            tone="warning"
          />
          <KpiCard
            label="Out of Stock Items"
            value={isLoading ? "..." : kpis?.outOfStockItems ?? 0}
            icon={XCircle}
            tone="destructive"
          />
          <KpiCard label="Pending Receipts" value={isLoading ? "..." : kpis?.pendingReceipts ?? 0} icon={PackageCheck} />
          <KpiCard label="Pending Deliveries" value={isLoading ? "..." : kpis?.pendingDeliveries ?? 0} icon={Truck} />
          <KpiCard
            label="Internal Transfers Scheduled"
            value={isLoading ? "..." : kpis?.internalTransfersScheduled ?? 0}
            icon={ArrowLeftRight}
          />
        </div>

        <div className="mt-8">
          <h2 className="mb-3 font-medium">Reorder Alerts</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">On hand</TableHead>
                <TableHead className="text-right">Reorder min</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nothing needs reordering right now.
                  </TableCell>
                </TableRow>
              )}
              {alerts?.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">
                    <Link to="/products" className="hover:underline">
                      {alert.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{alert.sku}</TableCell>
                  <TableCell className="text-right">
                    {alert.onHand} {alert.uom}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {alert.reorderMin} {alert.uom}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={alert.status === "OUT_OF_STOCK" ? "destructive" : "secondary"}>
                      {alert.status === "OUT_OF_STOCK" ? "Out of stock" : "Low stock"}
                    </Badge>
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
