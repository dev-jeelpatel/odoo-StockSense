import type { ReactNode } from "react";
import { Package } from "lucide-react";

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
        style={{ background: "linear-gradient(160deg, #fafafa 0%, #f3f4f6 100%)" }}
      >
        {/* Concentric ring decoration */}
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            top: "-10%",
            right: "-15%",
            width: 520,
            height: 520,
            borderRadius: "50%",
            border: "60px solid oklch(0.72 0.14 155 / 10%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            top: "2%",
            right: "-2%",
            width: 340,
            height: 340,
            borderRadius: "50%",
            border: "1px solid oklch(0.72 0.14 155 / 18%)",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, oklch(0.62 0.28 270), oklch(0.5 0.26 300))",
              boxShadow: "0 4px 16px oklch(0.52 0.26 270 / 35%)",
            }}
          >
            <Package className="size-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold leading-none" style={{ color: "#18181b" }}>StockSense</span>
            <p className="text-[0.5625rem] font-semibold uppercase tracking-widest opacity-50" style={{ color: "#18181b" }}>
              Inventory Management
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="relative space-y-4">
          <div style={{ maxHeight: "min(42vh, 400px)" }}>
            <img
              src="/images/warehouse-hero.webp"
              alt="Warehouse dock workers loading a delivery truck"
              className="w-full h-auto object-contain"
              style={{ maxHeight: "min(42vh, 400px)", filter: "drop-shadow(0 12px 24px oklch(0 0 0 / 18%))" }}
            />
          </div>

          <div>
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight" style={{ color: "#111827" }}>
              Inventory
              <br />
              That
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-4xl font-extrabold tracking-tight" style={{ color: "#ea580c" }}>Thinks</span>
              <span className="h-[2px] flex-1 max-w-16" style={{ borderTop: "2px dashed #d4d4d8" }} />
              <span className="text-4xl font-extrabold tracking-tight" style={{ color: "#ea580c" }}>Ahead</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed" style={{ color: "#52525b" }}>
              Receipts, deliveries, transfers, and adjustments — one real-time ledger, zero spreadsheets.
            </p>
          </div>
        </div>

        <p className="relative text-[0.6875rem] opacity-50" style={{ color: "#18181b" }}>
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
