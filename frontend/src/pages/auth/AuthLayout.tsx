import type { ReactNode } from "react";
import { ArrowLeftRight, Boxes, Package, TrendingUp, Warehouse } from "lucide-react";
import { WarehouseIllustration } from "./WarehouseIllustration";

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "oklch(1 0 0 / 7%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid oklch(1 0 0 / 14%)",
        borderRadius: "14px",
        padding: "14px 16px",
      }}
    >
      <div className="flex items-center justify-between">
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "oklch(1 0 0 / 12%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon className="size-4 text-white" />
        </div>
        <TrendingUp className="size-3.5 opacity-50 text-white" />
      </div>
      <p className="mt-2.5 text-xl font-bold text-white leading-none">{value}</p>
      <p className="mt-1 text-[0.6875rem] opacity-60 text-white">{label}</p>
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
      {/* Left panel */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.25 0.16 270) 0%, oklch(0.18 0.12 280) 40%, oklch(0.14 0.08 300) 100%)",
        }}
      >
        {/* Animated background circles */}
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            top: "-80px",
            right: "-80px",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.62 0.28 270 / 25%) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            bottom: "10%",
            left: "-60px",
            width: 280,
            height: 280,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.55 0.22 290 / 20%) 0%, transparent 70%)",
          }}
        />
        {/* Dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.28 270), oklch(0.5 0.26 300))",
              boxShadow: "0 4px 16px oklch(0.52 0.26 270 / 50%)",
            }}
          >
            <Package className="size-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white leading-none">StockSense</span>
            <p className="text-[0.5625rem] font-semibold uppercase tracking-widest opacity-50 text-white">
              Inventory Management
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="relative space-y-6">
          <div>
            <h1 className="max-w-sm text-3xl font-bold leading-tight text-white">
              Track every move in your warehouse.
            </h1>
            <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-70 text-white">
              Receipts, deliveries, transfers, and adjustments — one real-time ledger, zero spreadsheets.
            </p>
          </div>

          <div className="flex justify-center py-2">
            <WarehouseIllustration />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatTile icon={Boxes} label="Products tracked" value="1,204" />
            <StatTile icon={ArrowLeftRight} label="Moves this week" value="386" />
            <StatTile icon={Warehouse} label="Warehouses" value="6" />
          </div>
        </div>

        <p className="relative text-[0.6875rem] opacity-40 text-white">
          Odoo Hackathon &middot; StockSense IMS
        </p>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-6 animate-fade-up">
          {/* Mobile logo */}
          <div className="space-y-1 lg:hidden">
            <div className="mb-4 flex items-center gap-2.5">
              <div
                className="flex size-9 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg, oklch(0.62 0.28 270), oklch(0.5 0.26 300))",
                  boxShadow: "0 4px 12px oklch(0.52 0.26 270 / 35%)",
                }}
              >
                <Package className="size-5 text-white" />
              </div>
              <span className="text-base font-bold">StockSense</span>
            </div>
          </div>

          {/* Form header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
