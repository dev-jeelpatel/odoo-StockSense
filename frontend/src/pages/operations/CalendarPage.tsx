import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Schedule Calendar" description="View upcoming pickings by scheduled date." />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" className="size-8" onClick={prevMonth}><ChevronLeft className="size-4" /></Button>
            <span className="min-w-[160px] text-center text-sm font-semibold">{MONTHS[month]} {year}</span>
            <Button size="icon" variant="outline" className="size-8" onClick={nextMonth}><ChevronRight className="size-4" /></Button>
          </div>
          <Button size="sm" variant="outline" onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}>Today</Button>
          <div className="ml-auto">
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
        <div className="mb-3 flex flex-wrap gap-3">
          {(Object.entries(TYPE_COLORS) as [PickingType, typeof TYPE_COLORS[PickingType]][]).map(([type, { color, label }]) => (
            <div key={type} className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm inline-block" style={{ background: color }} /><span className="text-xs text-muted-foreground">{label}</span></div>
          ))}
        </div>
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="grid grid-cols-7 border-b">
            {DAYS.map((d) => <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} className="border-b border-r min-h-[90px] bg-muted/20" />;
              const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayPickings = byDate[dateKey] ?? [];
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isWeekend = (firstDay + day - 1) % 7 === 0 || (firstDay + day - 1) % 7 === 6;
              return (
                <div key={idx} className="border-b border-r min-h-[90px] p-1.5 transition-colors" style={{ background: isWeekend ? "var(--muted)" : undefined }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold flex size-6 items-center justify-center rounded-full ${isToday ? "text-white" : "text-foreground/70"}`} style={isToday ? { background: "var(--primary)" } : {}}>{day}</span>
                    {dayPickings.length > 0 && <span className="text-[10px] text-muted-foreground">{dayPickings.length}</span>}
                  </div>
                  <div className="space-y-0.5">
                    {dayPickings.slice(0, 3).map((p) => {
                      const { bg, color } = TYPE_COLORS[p.pickingType];
                      return <button key={p.id} onClick={() => navigate(`${PICKING_PATHS[p.pickingType]}/${p.id}`)} className="w-full text-left rounded px-1 py-0.5 truncate cursor-pointer hover:opacity-80 transition-opacity" style={{ background: bg, color }} title={p.reference}><span className="text-[10px] font-medium">{p.reference}</span></button>;
                    })}
                    {dayPickings.length > 3 && <p className="text-[10px] text-muted-foreground pl-1">+{dayPickings.length - 3} more</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {overdue.length > 0 && (
          <div className="mt-4 rounded-xl border p-4" style={{ background: "oklch(0.577 0.245 27 / 6%)", borderColor: "oklch(0.577 0.245 27 / 20%)" }}>
            <div className="flex items-center gap-2 mb-2"><Clock className="size-4" style={{ color: "oklch(0.577 0.245 27)" }} /><p className="text-sm font-semibold" style={{ color: "oklch(0.5 0.245 27)" }}>{overdue.length} overdue picking(s)</p></div>
            <div className="space-y-1">
              {overdue.slice(0, 5).map((p) => (
                <button key={p.id} onClick={() => navigate(`${PICKING_PATHS[p.pickingType]}/${p.id}`)} className="flex w-full items-center gap-2 text-xs text-left hover:underline cursor-pointer" style={{ color: "oklch(0.5 0.245 27)" }}>
                  <span className="font-mono font-medium">{p.reference}</span><span className="text-muted-foreground">due {new Date(p.scheduledDate).toLocaleDateString()}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
