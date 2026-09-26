import { PageHeader } from "@/components/layout/PageHeader";
import { ComingSoon } from "@/components/layout/ComingSoon";

export function DashboardPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Dashboard" description="Snapshot of inventory operations across all warehouses." />
      <ComingSoon what="KPI cards and dynamic filters" />
    </div>
  );
}
