import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardKpis } from "@/api/dashboard";

export function LowStockBanner() {
  const { data: kpis } = useDashboardKpis();
  const [dismissed, setDismissed] = useState(false);

  const outOfStock = kpis?.outOfStockItems ?? 0;
  const lowStock = kpis?.lowStockItems ?? 0;
  const total = outOfStock + lowStock;

  if (dismissed || total === 0) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 text-sm print:hidden"
      style={{
        background: outOfStock > 0 ? "linear-gradient(90deg, oklch(0.577 0.245 27 / 12%), oklch(0.577 0.245 27 / 6%))" : "linear-gradient(90deg, oklch(0.72 0.18 75 / 15%), oklch(0.72 0.18 75 / 7%))",
        borderBottom: "1px solid",
        borderColor: outOfStock > 0 ? "oklch(0.577 0.245 27 / 20%)" : "oklch(0.72 0.18 75 / 20%)",
      }}
    >
      <AlertTriangle className="size-4 shrink-0" style={{ color: outOfStock > 0 ? "oklch(0.577 0.245 27)" : "oklch(0.62 0.18 75)" }} />
      <p className="flex-1 text-foreground/80">
        {outOfStock > 0 && (
          <span className="font-semibold" style={{ color: "oklch(0.5 0.245 27)" }}>
            {outOfStock} item{outOfStock > 1 ? "s" : ""} out of stock{lowStock > 0 ? " · " : ""}
          </span>
        )}
        {lowStock > 0 && (
          <span className="font-semibold" style={{ color: "oklch(0.52 0.18 75)" }}>
            {lowStock} item{lowStock > 1 ? "s" : ""} running low
          </span>
        )}
        <Link to="/dashboard" className="ml-2 underline underline-offset-2 opacity-70 hover:opacity-100">View alerts →</Link>
      </p>
      <button onClick={() => setDismissed(true)} className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-black/5 cursor-pointer" aria-label="Dismiss">
        <X className="size-3.5" />
      </button>
    </div>
  );
}
