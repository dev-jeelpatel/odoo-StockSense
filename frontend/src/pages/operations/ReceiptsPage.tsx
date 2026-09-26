import { PageHeader } from "@/components/layout/PageHeader";
import { ComingSoon } from "@/components/layout/ComingSoon";

export function ReceiptsPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Receipts" description="Incoming stock from vendors." />
      <ComingSoon what="The receipts list and detail view" />
    </div>
  );
}
