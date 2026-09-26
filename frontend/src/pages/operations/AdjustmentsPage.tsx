import { PageHeader } from "@/components/layout/PageHeader";
import { ComingSoon } from "@/components/layout/ComingSoon";

export function AdjustmentsPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Adjustments" description="Correct stock counts after a physical count." />
      <ComingSoon what="The stock count / adjustment form" />
    </div>
  );
}
