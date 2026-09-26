import { NavLink, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  ChevronsUpDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  PackageCheck,
  PackageSearch,
  Settings,
  SlidersHorizontal,
  Truck,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/store/auth-context";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

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

        {/* ── User Profile Footer ── */}
        {user && (
          <div
            className="p-2"
            style={{ borderTop: "1px solid var(--sidebar-border)" }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent outline-none cursor-pointer"
                  style={{ color: "var(--sidebar-fg)" }}
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback
                      className="text-xs font-semibold text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.62 0.28 270), oklch(0.48 0.26 300))",
                      }}
                    >
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 min-w-0 flex-col leading-tight">
                    <span className="truncate text-xs font-semibold">
                      {user.name}
                    </span>
                    <span
                      className="truncate text-[11px]"
                      style={{ color: "var(--sidebar-muted)" }}
                    >
                      {user.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-56">
                <DropdownMenuLabel>
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs font-normal text-muted-foreground truncate">
                    {user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer"
                >
                  <User className="size-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/settings/warehouses")}
                  className="cursor-pointer"
                >
                  <Settings className="size-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  variant="destructive"
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>
    </>
  );
}

