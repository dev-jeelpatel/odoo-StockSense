import { useLocation } from "react-router-dom";
import { GlobalSearch } from "@/components/shared/GlobalSearch";
import { NotificationsPanel } from "@/components/shared/NotificationsPanel";

function usePageTitle() {
  const { pathname } = useLocation();
  const segments = pathname.replace(/^\//, "").split("/");
  const map: Record<string, string> = {
    dashboard: "Dashboard", products: "Products", "move-history": "Move History",
    stock: "Stock", settings: "Settings", profile: "My Profile",
    receipts: "Receipts", deliveries: "Deliveries", "internal-transfers": "Internal Transfers",
    adjustments: "Adjustments", operations: "Operations", warehouses: "Warehouses",
    locations: "Locations", categories: "Categories", users: "Team Members",
    calendar: "Schedule Calendar", "import-export": "Import / Export", scanner: "Barcode Scanner",
  };
  const last = segments[segments.length - 1];
  return map[last] ?? last ?? "Dashboard";
}

export function Topbar() {
  const pageTitle = usePageTitle();
  return (
    <header className="flex h-[60px] shrink-0 items-center gap-4 px-5" style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
      <div className="flex-1 min-w-0">
        <h1 className="truncate text-sm font-semibold text-foreground/80 tracking-tight">{pageTitle}</h1>
      </div>
      <GlobalSearch />
      <NotificationsPanel />
    </header>
  );
}
