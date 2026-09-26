import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";

function usePageTitle() {
  const { pathname } = useLocation();
  const segments = pathname.replace(/^\//, "").split("/");
  const map: Record<string, string> = {
    dashboard: "Dashboard",
    products: "Products",
    "move-history": "Move History",
    stock: "Stock",
    settings: "Settings",
    profile: "My Profile",
    receipts: "Receipts",
    deliveries: "Deliveries",
    "internal-transfers": "Internal Transfers",
    adjustments: "Adjustments",
    operations: "Operations",
    warehouses: "Warehouses",
  };
  const last = segments[segments.length - 1];
  return map[last] ?? last ?? "Dashboard";
}

export function Topbar() {
  const pageTitle = usePageTitle();

  return (
    <header
      className="flex h-[60px] shrink-0 items-center px-6"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--card)",
      }}
    >
      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-sm font-semibold text-foreground/80 tracking-tight">{pageTitle}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </button>
      </div>
    </header>
  );
}

