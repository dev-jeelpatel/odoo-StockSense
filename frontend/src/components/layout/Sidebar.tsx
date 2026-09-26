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

const navSections = [
  {
    label: null,
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/products", label: "Products", icon: Package },
    ],
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
    label: "Reports",
    items: [
      { to: "/move-history", label: "Move History", icon: ClipboardList },
      { to: "/stock", label: "Stock", icon: PackageSearch },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/settings/warehouses", label: "Settings", icon: Settings },
    ],
  },
];

/* Inject sidebar hover styles once via a <style> tag */
const SIDEBAR_STYLE = `
  .ss-nav-link {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.14s ease, color 0.14s ease;
    color: var(--sidebar-fg);
  }
  .ss-nav-link:hover {
    background: var(--sidebar-hover-bg);
    color: var(--sidebar-hover-fg);
  }
  .ss-nav-link.active {
    background: var(--sidebar-active-bg);
    color: var(--sidebar-active-fg);
    box-shadow: 0 2px 10px oklch(0.52 0.26 270 / 25%);
    font-weight: 600;
  }
  .ss-nav-link .ss-icon {
    width: 17px;
    height: 17px;
    flex-shrink: 0;
    opacity: 0.75;
  }
  .ss-nav-link.active .ss-icon {
    opacity: 1;
  }
`;

export function Sidebar() {
  return (
    <>
      <style>{SIDEBAR_STYLE}</style>
      <aside
        className="hidden h-full w-[220px] shrink-0 flex-col md:flex"
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
        }}
      >
        {/* ── Logo ── */}
        <div
          className="flex h-[60px] items-center gap-3 px-4"
          style={{ borderBottom: "1px solid var(--sidebar-border)" }}
        >
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-[10px]"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.28 270), oklch(0.48 0.26 300))",
              boxShadow: "0 3px 12px oklch(0.52 0.26 270 / 35%)",
            }}
          >
            <Package className="size-[15px] text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--sidebar-fg)",
                letterSpacing: "-0.01em",
              }}
            >
              StockSense
            </span>
            <span
              style={{
                fontSize: "0.6rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "var(--primary)",
              }}
            >
              IMS
            </span>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          {navSections.map((section, idx) => (
            <div key={idx} style={{ marginTop: idx > 0 ? "16px" : 0 }}>
              {section.label && (
                <p
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--sidebar-section-label)",
                    padding: "0 12px 4px",
                    marginBottom: "2px",
                  }}
                >
                  {section.label}
                </p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      isActive ? "ss-nav-link active" : "ss-nav-link"
                    }
                  >
                    <item.icon className="ss-icon" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div
          className="px-3 py-3"
          style={{ borderTop: "1px solid var(--sidebar-border)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex size-6 items-center justify-center rounded-full text-white"
              style={{
                background: "linear-gradient(135deg, oklch(0.62 0.28 270), oklch(0.48 0.26 300))",
                fontSize: "0.5rem",
                fontWeight: 800,
              }}
            >
              SS
            </div>
            <div className="flex flex-col leading-none">
              <span
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  color: "var(--sidebar-fg)",
                  opacity: 0.7,
                }}
              >
                StockSense IMS
              </span>
              <span
                style={{
                  fontSize: "0.5625rem",
                  color: "var(--sidebar-muted)",
                }}
              >
                Odoo Hackathon
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

