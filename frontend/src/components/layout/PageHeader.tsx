import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      className="relative flex items-center justify-between overflow-hidden px-6 py-4"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--card)",
      }}
    >
      {/* Subtle gradient tint */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(135deg, oklch(0.52 0.26 270 / 5%) 0%, transparent 55%)",
        }}
      />
      <div className="relative">
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="relative flex items-center gap-2">{actions}</div>}
    </div>
  );
}
