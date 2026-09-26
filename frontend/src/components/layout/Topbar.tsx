import { GlobalSearch } from "@/components/shared/GlobalSearch";
import { NotificationsPanel } from "@/components/shared/NotificationsPanel";
import { useAuth } from "@/store/auth-context";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Topbar() {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between gap-4 px-5" style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
      <div className="min-w-0 shrink-0">
        <p className="truncate text-sm font-semibold text-foreground/90">
          {greeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </p>
        <p className="truncate text-xs text-muted-foreground">{today}</p>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <GlobalSearch />
      </div>
      <NotificationsPanel />
    </header>
  );
}
