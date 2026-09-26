import { useState } from "react";
import { Bell, AlertTriangle, Package, X, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardKpis } from "@/api/dashboard";

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const { data: kpis } = useDashboardKpis();

  const outOfStock = kpis?.outOfStockItems ?? 0;
  const lowStock = kpis?.lowStockItems ?? 0;
  const pendingReceipts = kpis?.pendingReceipts ?? 0;
  const pendingDeliveries = kpis?.pendingDeliveries ?? 0;
  const total = outOfStock + lowStock + (pendingReceipts > 0 ? 1 : 0) + (pendingDeliveries > 0 ? 1 : 0);

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="relative flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer" aria-label="Notifications">
        <Bell className="size-4" />
        {total > 0 && <span className="absolute right-1 top-1 flex size-2 rounded-full" style={{ background: "oklch(0.577 0.245 27)" }} />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border bg-card shadow-xl" style={{ boxShadow: "0 8px 32px oklch(0 0 0 / 15%)" }}>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <div className="flex items-center gap-2">
                {total > 0 && <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: "oklch(0.577 0.245 27)" }}>{total}</span>}
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="size-3.5" /></button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y">
              {total === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Bell className="size-7 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">All clear — no alerts</p>
                </div>
              )}
              {outOfStock > 0 && (
                <div className="flex gap-3 p-3" style={{ background: "oklch(0.577 0.245 27 / 6%)" }}>
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" style={{ color: "oklch(0.577 0.245 27)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: "oklch(0.5 0.245 27)" }}>{outOfStock} item{outOfStock > 1 ? "s" : ""} out of stock</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Immediate replenishment needed</p>
                  </div>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground mt-0.5"><ExternalLink className="size-3.5" /></Link>
                </div>
              )}
              {lowStock > 0 && (
                <div className="flex gap-3 p-3" style={{ background: "oklch(0.72 0.18 75 / 6%)" }}>
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" style={{ color: "oklch(0.62 0.18 75)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: "oklch(0.52 0.18 75)" }}>{lowStock} item{lowStock > 1 ? "s" : ""} running low</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Below reorder minimum threshold</p>
                  </div>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground mt-0.5"><ExternalLink className="size-3.5" /></Link>
                </div>
              )}
              {pendingReceipts > 0 && (
                <div className="flex gap-3 p-3">
                  <Package className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{pendingReceipts} pending receipt{pendingReceipts > 1 ? "s" : ""}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting validation</p>
                  </div>
                  <Link to="/operations/receipts" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground mt-0.5"><ExternalLink className="size-3.5" /></Link>
                </div>
              )}
              {pendingDeliveries > 0 && (
                <div className="flex gap-3 p-3">
                  <Package className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{pendingDeliveries} pending deliver{pendingDeliveries > 1 ? "ies" : "y"}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Ready to ship</p>
                  </div>
                  <Link to="/operations/deliveries" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground mt-0.5"><ExternalLink className="size-3.5" /></Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
