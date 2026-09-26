import { PageHeader } from "@/components/layout/PageHeader";
import { ComingSoon } from "@/components/layout/ComingSoon";

export function MoveHistoryPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Move History" description="Full ledger of every stock movement, in and out." />
      <ComingSoon what="The move history ledger table" />
    </div>
  );
}
