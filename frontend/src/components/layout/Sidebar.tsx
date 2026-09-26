import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowLeftRight, CalendarDays, ChevronLeft, ChevronRight, ChevronsUpDown, ClipboardCheck, ClipboardList, FolderTree, LayoutDashboard, LogOut, MapPin, Package, PackageCheck, PackageSearch, QrCode, Settings, Truck, Upload, User, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/store/auth-context";

function initials(name: string) { return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(); }

const SIDEBAR_COLLAPSED_KEY = "stocksense.sidebar-collapsed";

const SIDEBAR_STYLE = `
  .ss-nav-link { display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;font-size:0.875rem;font-weight:500;text-decoration:none;transition:background 0.14s,color 0.14s;color:var(--sidebar-fg); white-space:nowrap; }
  .ss-nav-link:hover { background:var(--sidebar-hover-bg);color:var(--sidebar-hover-fg); }
  .ss-nav-link.active { background:var(--sidebar-active-bg);color:var(--sidebar-active-fg);box-shadow:0 2px 10px oklch(0.52 0.26 270 / 25%);font-weight:600; }
  .ss-nav-link .ss-icon { width:17px;height:17px;flex-shrink:0;opacity:0.7;stroke-width:1.9; }
  .ss-nav-link.active .ss-icon { opacity:1;stroke-width:2; }
  .ss-collapsed .ss-nav-link { justify-content:center;padding:8px; }
  .ss-collapsed .ss-nav-label { display:none; }
`;

type NavItem = { to: string; label: string; icon: React.ElementType };
type NavSection = { label: string | null; items: NavItem[] };

function buildNav(isManager: boolean): NavSection[] {
  return [
    { label: null, items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }, { to: "/products", label: "Products", icon: Package }] },
    { label: "Products", items: [{ to: "/products/import-export", label: "Import / Export", icon: Upload }, { to: "/products/scanner", label: "Barcode Scanner", icon: QrCode }] },
    { label: "Operations", items: [{ to: "/operations/receipts", label: "Receipts", icon: PackageCheck }, { to: "/operations/deliveries", label: "Delivery", icon: Truck }, { to: "/operations/internal-transfers", label: "Internal Transfers", icon: ArrowLeftRight }, { to: "/operations/adjustments", label: "Adjustments", icon: ClipboardCheck }, { to: "/operations/calendar", label: "Schedule Calendar", icon: CalendarDays }] },
    { label: "Reports", items: [{ to: "/move-history", label: "Move History", icon: ClipboardList }, { to: "/stock", label: "Stock", icon: PackageSearch }] },
    { label: "Settings", items: [{ to: "/settings/warehouses", label: "Warehouses", icon: Settings }, { to: "/settings/locations", label: "Locations", icon: MapPin }, { to: "/settings/categories", label: "Categories", icon: FolderTree }, ...(isManager ? [{ to: "/settings/users", label: "Team Members", icon: Users }] : [])] },
  ];
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isManager = user?.role === "MANAGER";
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1"; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0"); } catch { /* ignore */ }
  }, [collapsed]);

  function handleLogout() { logout(); navigate("/login", { replace: true }); }

  return (
    <>
      <style>{SIDEBAR_STYLE}</style>
      <aside
        className={`hidden h-full shrink-0 flex-col md:flex relative transition-[width] duration-200 ${collapsed ? "w-[72px] ss-collapsed" : "w-[220px]"}`}
        style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        <div className={`flex h-[60px] items-center shrink-0 ${collapsed ? "justify-center px-2" : "px-4"}`} style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
          {collapsed ? (
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--sidebar-fg)" }}>SS</span>
          ) : (
            <div className="flex flex-col leading-none">
              <span style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--sidebar-fg)" }}>
                StockSense
              </span>
              <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--sidebar-section-label)", marginTop: "2px" }}>
                Inventory Management
              </span>
            </div>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3">
          {buildNav(isManager).map((section, idx) => (
            <div key={idx} style={{ marginTop: idx > 0 ? "14px" : 0 }}>
              {section.label && !collapsed && <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--sidebar-section-label)", padding: "0 12px 3px", marginBottom: "2px" }}>{section.label}</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                {section.items.map((item) => (
                  <NavLink key={item.to} to={item.to} title={collapsed ? item.label : undefined} className={({ isActive }) => isActive ? "ss-nav-link active" : "ss-nav-link"}>
                    <item.icon className="ss-icon" /><span className="ss-nav-label">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        {user && (
          <div className="p-2 shrink-0" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent outline-none cursor-pointer ${collapsed ? "justify-center" : ""}`} style={{ color: "var(--sidebar-fg)" }}>
                  <Avatar className="size-7 shrink-0">
                    <AvatarFallback className="text-xs font-semibold text-white" style={{ background: "linear-gradient(135deg, oklch(0.62 0.28 270), oklch(0.48 0.26 300))" }}>{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <>
                      <div className="flex flex-1 min-w-0 flex-col leading-tight">
                        <span className="truncate text-xs font-semibold">{user.name}</span>
                        <span className="truncate text-[10px]" style={{ color: "var(--sidebar-muted)" }}>{user.email}</span>
                      </div>
                      <ChevronsUpDown className="size-3 shrink-0 opacity-50" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-56">
                <DropdownMenuLabel>
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs font-normal text-muted-foreground truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer"><User className="size-4 mr-2" /> My Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings/warehouses")} className="cursor-pointer"><Settings className="size-4 mr-2" /> Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} variant="destructive" className="cursor-pointer"><LogOut className="size-4 mr-2" /> Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-full border shadow-sm cursor-pointer"
          style={{ background: "var(--card)", borderColor: "var(--sidebar-border)", color: "var(--sidebar-fg)" }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
        </button>
      </aside>
    </>
  );
}
