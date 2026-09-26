import type { ReactNode } from "react";
import { ArrowLeftRight, Boxes, Package, TrendingUp, Warehouse } from "lucide-react";
import { WarehouseIllustration } from "./WarehouseIllustration";

function StatTile({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  trend: "up" | "down";
}) {
  return (
    <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex size-8 items-center justify-center rounded-lg bg-white/15">
          <Icon className="size-4 text-white" />
        </div>
        <TrendingUp className={`size-4 text-white/70 ${trend === "down" ? "rotate-90" : ""}`} />
      </div>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="text-xs text-white/70">{label}</p>
    </div>
  );
}

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-orange-500 to-orange-700 p-10 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 70%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative flex items-center gap-2 text-white">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/15">
            <Package className="size-5" />
          </div>
          <span className="text-lg font-semibold">StockSense</span>
        </div>

        <div className="relative space-y-5">
          <div>
            <h1 className="max-w-md text-3xl font-semibold leading-tight text-white">
              Track every move in your warehouse.
            </h1>
            <p className="mt-2 max-w-sm text-white/80">
              Receipts, deliveries, transfers, and adjustments — one real-time ledger, zero spreadsheets.
            </p>
          </div>

          <div className="flex justify-center py-2">
            <WarehouseIllustration />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatTile icon={Boxes} label="Products tracked" value="1,204" trend="up" />
            <StatTile icon={ArrowLeftRight} label="Moves this week" value="386" trend="up" />
            <StatTile icon={Warehouse} label="Warehouses" value="6" trend="up" />
          </div>
        </div>

        <p className="relative text-xs text-white/60">Odoo Hackathon &middot; StockSense IMS</p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1 lg:hidden">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Package className="size-4" />
              </div>
              <span className="font-semibold">StockSense</span>
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
