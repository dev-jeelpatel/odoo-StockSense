import { useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, Settings, User } from "lucide-react";
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pageTitle = usePageTitle();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (!user) return null;

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
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent outline-none">
            <Avatar className="size-7">
              <AvatarFallback
                className="text-xs font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, oklch(0.62 0.28 270), oklch(0.48 0.26 300))",
                }}
              >
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden font-medium sm:block">{user.name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="size-4" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings/warehouses")}>
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
