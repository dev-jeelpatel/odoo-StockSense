import { PageHeader } from "@/components/layout/PageHeader";
import { ComingSoon } from "@/components/layout/ComingSoon";

export function WarehousesPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Settings" description="Manage warehouses and their locations." />
      <ComingSoon what="Warehouse and location management" />
    </div>
  );
}
