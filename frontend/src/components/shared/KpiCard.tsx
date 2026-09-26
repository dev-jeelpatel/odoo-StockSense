import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONE_STYLES = {
  default: {
    iconBg: "linear-gradient(135deg, oklch(0.62 0.28 270 / 15%), oklch(0.52 0.26 270 / 10%))",
    iconColor: "oklch(0.52 0.26 270)",
    glow: "0 0 0 1px oklch(0.52 0.26 270 / 12%)",
    accent: "oklch(0.52 0.26 270)",
  },
  warning: {
    iconBg: "linear-gradient(135deg, oklch(0.72 0.18 75 / 15%), oklch(0.72 0.18 75 / 8%))",
    iconColor: "oklch(0.62 0.18 75)",
    glow: "0 0 0 1px oklch(0.72 0.18 75 / 12%)",
    accent: "oklch(0.72 0.18 75)",
  },
  destructive: {
    iconBg: "linear-gradient(135deg, oklch(0.577 0.245 27 / 15%), oklch(0.577 0.245 27 / 8%))",
    iconColor: "oklch(0.55 0.245 27)",
    glow: "0 0 0 1px oklch(0.577 0.245 27 / 12%)",
    accent: "oklch(0.577 0.245 27)",
  },
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "destructive";
}) {
  const styles = TONE_STYLES[tone];

  return (
    <div
      className={cn(
        "animate-fade-up relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg"
      )}
      style={{
        boxShadow: `0 1px 3px oklch(0 0 0 / 6%), ${styles.glow}`,
      }}
    >
      {/* Background decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-4 size-24 rounded-full opacity-[0.06]"
        style={{ background: styles.accent }}
      />

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: styles.iconBg,
            boxShadow: `0 2px 8px ${styles.iconColor}30`,
          }}
        >
          <Icon className="size-5" style={{ color: styles.iconColor }} />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold tracking-tight leading-none">{value}</p>
          <p className="mt-1.5 text-xs font-medium text-muted-foreground leading-snug">{label}</p>
        </div>
      </div>
    </div>
  );
}
