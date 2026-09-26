import { PageHeader } from "@/components/layout/PageHeader";
import { ComingSoon } from "@/components/layout/ComingSoon";

export function ProductsPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Products" description="Create and manage products, categories, and stock levels." />
      <ComingSoon what="The product list and create/edit form" />
    </div>
  );
}
