import { NavLink } from "react-router-dom";
import {
  ArrowLeftRight,
  ClipboardList,
  LayoutDashboard,
  Package,
  PackageCheck,
  PackageSearch,
  Settings,
  SlidersHorizontal,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: null,
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: null,
    items: [{ to: "/products", label: "Products", icon: Package }],
  },
  {
    label: "Operations",
    items: [
      { to: "/operations/receipts", label: "Receipts", icon: PackageCheck },
      { to: "/operations/deliveries", label: "Delivery", icon: Truck },
      { to: "/operations/internal-transfers", label: "Internal Transfers", icon: ArrowLeftRight },
      { to: "/operations/adjustments", label: "Adjustments", icon: SlidersHorizontal },
    ],
  },
  {
    label: null,
    items: [
      { to: "/move-history", label: "Move History", icon: ClipboardList },
      { to: "/stock", label: "Stock", icon: PackageSearch },
    ],
  },
  {
    label: null,
    items: [{ to: "/settings/warehouses", label: "Settings", icon: Settings }],
  },
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Package className="size-4" />
        </div>
        <span className="font-semibold">StockSense</span>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.label && (
              <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )
                }
              >
                <item.icon className="size-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
