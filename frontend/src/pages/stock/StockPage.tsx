import { PageHeader } from "@/components/layout/PageHeader";
import { ComingSoon } from "@/components/layout/ComingSoon";

export function StockPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Stock" description="Current on-hand quantity per product and location." />
      <ComingSoon what="The stock-by-location view" />
    </div>
  );
}
