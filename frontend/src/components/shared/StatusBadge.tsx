import type { PickingStatus } from "@/types";

const STATUS_CONFIG: Record<
  PickingStatus,
  { label: string; bg: string; color: string; dot: string }
> = {
  DRAFT: {
    label: "Draft",
    bg: "oklch(0.92 0.01 250 / 80%)",
    color: "oklch(0.4 0.02 250)",
    dot: "oklch(0.65 0.04 250)",
  },
  WAITING: {
    label: "Waiting",
    bg: "oklch(0.577 0.245 27 / 12%)",
    color: "oklch(0.5 0.245 27)",
    dot: "oklch(0.577 0.245 27)",
  },
  READY: {
    label: "Ready",
    bg: "oklch(0.72 0.18 75 / 14%)",
    color: "oklch(0.52 0.18 75)",
    dot: "oklch(0.72 0.18 75)",
  },
  DONE: {
    label: "Done",
    bg: "oklch(0.58 0.18 145 / 12%)",
    color: "oklch(0.45 0.18 145)",
    dot: "oklch(0.58 0.18 145)",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "oklch(0.92 0.01 250 / 60%)",
    color: "oklch(0.55 0.02 250)",
    dot: "oklch(0.7 0.02 250)",
  },
};

export function StatusBadge({ status }: { status: PickingStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "2px 8px",
        borderRadius: "999px",
        fontSize: "0.6875rem",
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
        letterSpacing: "0.01em",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}
