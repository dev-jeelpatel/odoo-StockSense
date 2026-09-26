import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePickings } from "@/api/pickings";
import type { Picking, PickingType } from "@/types";

const TYPE_COLORS: Record<PickingType, { bg: string; color: string; label: string }> = {
  RECEIPT:   { bg: "oklch(0.62 0.28 270 / 14%)", color: "oklch(0.48 0.26 270)", label: "Receipt" },
  DELIVERY:  { bg: "oklch(0.72 0.18 150 / 14%)", color: "oklch(0.38 0.16 150)", label: "Delivery" },
  INTERNAL:  { bg: "oklch(0.72 0.18 200 / 14%)", color: "oklch(0.38 0.16 200)", label: "Internal" },
  ADJUSTMENT:{ bg: "oklch(0.72 0.18 75 / 14%)",  color: "oklch(0.42 0.18 75)",  label: "Adjustment" },
};
const PICKING_PATHS: Record<PickingType, string> = { RECEIPT: "/operations/receipts", DELIVERY: "/operations/deliveries", INTERNAL: "/operations/internal-transfers", ADJUSTMENT: "/operations/adjustments" };
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfWeek(year: number, month: number) { return new Date(year, month, 1).getDay(); }

export function CalendarPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [filterType, setFilterType] = useState<PickingType | "ALL">("ALL");
  const { data: pickings = [] } = usePickings({});

  const byDate: Record<string, Picking[]> = {};
  for (const p of pickings) {
    if (p.status === "DONE" || p.status === "CANCELLED") continue;
    if (filterType !== "ALL" && p.pickingType !== filterType) continue;
    const key = p.scheduledDate.slice(0, 10);
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(p);
  }

  function prevMonth() { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);
  while (cells.length % 7 !== 0) cells.push(null);

  const overdue = pickings.filter((p) => p.isLate && p.status !== "DONE" && p.status !== "CANCELLED");

  const weekRows = cells.length / 7;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader title="Schedule Calendar" description="View upcoming pickings by scheduled date." />
      <div className="flex flex-1 min-h-0 flex-col gap-3 p-6">
        <div className="flex items-center gap-3 flex-wrap shrink-0 rounded-xl border bg-card px-4 py-2.5">
          <div className="flex items-center gap-1 rounded-lg border p-0.5">
            <Button size="icon" variant="ghost" className="size-7" onClick={prevMonth}><ChevronLeft className="size-4" /></Button>
            <span className="min-w-[150px] text-center text-sm font-semibold">{MONTHS[month]} {year}</span>
            <Button size="icon" variant="ghost" className="size-7" onClick={nextMonth}><ChevronRight className="size-4" /></Button>
          </div>
          <Button size="sm" variant="outline" onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}>Today</Button>

          <div className="flex flex-wrap items-center gap-1.5 ml-1">
            {(Object.entries(TYPE_COLORS) as [PickingType, typeof TYPE_COLORS[PickingType]][]).map(([type, { bg, color, label }]) => (
              <span
                key={type}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{ background: bg, color }}
              >
                <span className="size-1.5 rounded-full inline-block" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {overdue.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1.5" style={{ color: "oklch(0.5 0.245 27)", borderColor: "oklch(0.577 0.245 27 / 30%)", background: "oklch(0.577 0.245 27 / 6%)" }}>
                    <Clock className="size-3.5" /> {overdue.length} overdue
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-2">
                  <p className="px-1 pb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Overdue pickings</p>
                  <div className="space-y-0.5">
                    {overdue.slice(0, 8).map((p) => (
                      <button key={p.id} onClick={() => navigate(`${PICKING_PATHS[p.pickingType]}/${p.id}`)} className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted cursor-pointer">
                        <span className="font-mono font-medium">{p.reference}</span>
                        <span className="text-muted-foreground">due {new Date(p.scheduledDate).toLocaleDateString()}</span>
                      </button>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Select value={filterType} onValueChange={(v) => setFilterType(v as PickingType | "ALL")}>
              <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                <SelectItem value="RECEIPT">Receipts</SelectItem>
                <SelectItem value="DELIVERY">Deliveries</SelectItem>
                <SelectItem value="INTERNAL">Internal Transfers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div
          className="flex flex-1 min-h-0 flex-col rounded-2xl border bg-card overflow-hidden p-3"
          style={{ boxShadow: "0 4px 20px oklch(0 0 0 / 5%), 0 1px 3px oklch(0 0 0 / 4%)" }}
        >
          <div className="grid grid-cols-7 shrink-0 pb-2">
            {DAYS.map((d, i) => (
              <div
                key={d}
                className="text-center text-[0.8rem] font-semibold"
                style={{ color: i === 0 || i === 6 ? "var(--primary)" : "var(--foreground)", opacity: i === 0 || i === 6 ? 0.85 : 0.6 }}
              >
                {d}
              </div>
            ))}
          </div>
          <div
            className="grid flex-1 min-h-0 grid-cols-7 gap-1"
            style={{ gridTemplateRows: `repeat(${weekRows}, minmax(0, 1fr))` }}
          >
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} className="rounded-lg" style={{ background: "var(--muted)", opacity: 0.35 }} />;
              const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayPickings = byDate[dateKey] ?? [];
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              return (
                <div
                  key={idx}
                  className="group flex min-h-0 flex-col rounded-lg p-1.5 transition-colors hover:bg-muted/60"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center justify-between mb-1 shrink-0">
                    <span
                      className={`text-xs flex size-6 items-center justify-center rounded-full ${isToday ? "font-bold text-white" : "font-medium text-foreground/70"}`}
                      style={isToday ? { background: "var(--primary)", boxShadow: "0 2px 8px oklch(0.52 0.26 270 / 45%)" } : {}}
                    >
                      {day}
                    </span>
                    {dayPickings.length > 0 && (
                      <span className="text-[10px] font-medium text-muted-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity">
                        {dayPickings.length} event{dayPickings.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 min-h-0 overflow-y-auto">
                    {dayPickings.slice(0, 3).map((p) => {
                      const { bg, color } = TYPE_COLORS[p.pickingType];
                      return (
                        <button
                          key={p.id}
                          onClick={() => navigate(`${PICKING_PATHS[p.pickingType]}/${p.id}`)}
                          className="flex w-full items-center gap-1.5 text-left rounded-full px-2 py-1 truncate cursor-pointer transition-all hover:shadow-sm hover:-translate-y-px"
                          style={{ background: bg, color }}
                          title={p.reference}
                        >
                          {p.isLate && <span className="size-1.5 shrink-0 rounded-full" style={{ background: "oklch(0.577 0.245 27)" }} />}
                          <span className="text-[10px] font-semibold truncate">{p.reference}</span>
                        </button>
                      );
                    })}
                    {dayPickings.length > 3 && <p className="text-[10px] text-muted-foreground pl-2">+{dayPickings.length - 3} more</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
