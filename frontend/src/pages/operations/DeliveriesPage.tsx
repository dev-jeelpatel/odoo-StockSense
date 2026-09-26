import { PageHeader } from "@/components/layout/PageHeader";
import { ComingSoon } from "@/components/layout/ComingSoon";

export function DeliveriesPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Delivery" description="Outgoing stock to customers." />
      <ComingSoon what="The delivery list and detail view" />
    </div>
  );
}
