import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeftRight, CheckCircle2, Package, PackageCheck, Truck, XCircle, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboardKpis } from "@/api/dashboard";
import { useDashboardAlerts, useDashboardChartData } from "@/api/dashboard-extras";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function DashboardPage() {
  const { data: kpis, isLoading } = useDashboardKpis();
  const { data: alerts } = useDashboardAlerts();
  const { data: chartData } = useDashboardChartData();

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Dashboard" description="Snapshot of inventory operations across all warehouses." />
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          <KpiCard label="Total Products in Stock" value={isLoading ? "—" : kpis?.totalProductsInStock ?? 0} icon={Package} />
          <KpiCard label="Low Stock Items" value={isLoading ? "—" : kpis?.lowStockItems ?? 0} icon={AlertTriangle} tone="warning" />
          <KpiCard label="Out of Stock Items" value={isLoading ? "—" : kpis?.outOfStockItems ?? 0} icon={XCircle} tone="destructive" />
          <KpiCard label="Pending Receipts" value={isLoading ? "—" : kpis?.pendingReceipts ?? 0} icon={PackageCheck} />
          <KpiCard label="Pending Deliveries" value={isLoading ? "—" : kpis?.pendingDeliveries ?? 0} icon={Truck} />
          <KpiCard label="Internal Transfers Scheduled" value={isLoading ? "—" : kpis?.internalTransfersScheduled ?? 0} icon={ArrowLeftRight} />
        </div>

        <div className="animate-fade-up rounded-xl border bg-card p-5" style={{ animationDelay: "200ms" }}>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="size-4" style={{ color: "var(--primary)" }} />
            <h2 className="text-sm font-semibold">Stock Movement — Last 7 Days</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData ?? []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, color: "var(--foreground)" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="receipts" name="Receipts" fill="oklch(0.62 0.28 270)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="deliveries" name="Deliveries" fill="oklch(0.72 0.18 150)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "350ms" }}>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="size-4" style={{ color: "oklch(0.62 0.18 75)" }} />
            <h2 className="text-sm font-semibold">Reorder Alerts</h2>
            {alerts && alerts.length > 0 && <Badge className="ml-1" style={{ background: "oklch(0.72 0.18 75 / 15%)", color: "oklch(0.52 0.18 75)", border: "none", fontSize: "0.6875rem" }}>{alerts.length}</Badge>}
          </div>
          <div className="overflow-hidden rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Product</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">SKU</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">On hand</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">Reorder min</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts?.length === 0 && (
                  <TableRow><TableCell colSpan={5}><div className="flex flex-col items-center gap-2 py-8 text-center"><CheckCircle2 className="size-8 text-muted-foreground/40" /><p className="text-sm text-muted-foreground">All stock levels are healthy.</p></div></TableCell></TableRow>
                )}
                {alerts?.map((alert) => (
                  <TableRow key={alert.id} style={{ background: alert.status === "OUT_OF_STOCK" ? "oklch(0.577 0.245 27 / 4%)" : "oklch(0.72 0.18 75 / 4%)" }}>
                    <TableCell className="font-medium"><Link to="/products" className="hover:underline hover:text-primary">{alert.name}</Link></TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{alert.sku}</TableCell>
                    <TableCell className="text-right font-medium">{alert.onHand} {alert.uom}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{alert.reorderMin} {alert.uom}</TableCell>
                    <TableCell className="text-right">
                      <Badge style={alert.status === "OUT_OF_STOCK" ? { background: "oklch(0.577 0.245 27 / 12%)", color: "oklch(0.5 0.245 27)", border: "none" } : { background: "oklch(0.72 0.18 75 / 12%)", color: "oklch(0.52 0.18 75)", border: "none" }}>
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
    </div>
  );
}
