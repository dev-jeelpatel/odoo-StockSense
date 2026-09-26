import { PageHeader } from "@/components/layout/PageHeader";
import { ComingSoon } from "@/components/layout/ComingSoon";

export function InternalTransfersPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Internal Transfers" description="Move stock between locations and warehouses." />
      <ComingSoon what="The internal transfers list and detail view" />
    </div>
  );
}
