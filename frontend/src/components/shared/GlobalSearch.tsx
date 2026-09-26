import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, ArrowLeftRight, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Product, Picking } from "@/types";

interface SearchResults {
  products: Pick<Product, "id" | "name" | "sku">[];
  pickings: Pick<Picking, "id" | "reference" | "pickingType" | "status">[];
}

function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ["global-search", query],
    queryFn: async (): Promise<SearchResults> => {
      if (!query.trim()) return { products: [], pickings: [] };
      const q = encodeURIComponent(query.trim());
      const [products, pickings] = await Promise.all([
        apiClient.get<Product[]>(`/products?search=${q}`),
        apiClient.get<Picking[]>(`/pickings?search=${q}`),
      ]);
      return {
        products: products.data.slice(0, 5).map((p) => ({ id: p.id, name: p.name, sku: p.sku })),
        pickings: pickings.data.slice(0, 5).map((p) => ({ id: p.id, reference: p.reference, pickingType: p.pickingType, status: p.status })),
      };
    },
    enabled: query.trim().length >= 2,
    staleTime: 10_000,
  });
}

const PICKING_PATHS: Record<string, string> = {
  RECEIPT: "/operations/receipts",
  DELIVERY: "/operations/deliveries",
  INTERNAL: "/operations/internal-transfers",
  ADJUSTMENT: "/operations/adjustments",
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data, isLoading } = useGlobalSearch(query);

  const hasResults = (data?.products.length ?? 0) + (data?.pickings.length ?? 0) > 0;

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function go(path: string) { navigate(path); setOpen(false); setQuery(""); }

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors cursor-text"
        style={{ background: "var(--muted)", borderColor: open ? "var(--primary)" : "var(--border)", minWidth: 200 }}
        onClick={() => { inputRef.current?.focus(); setOpen(true); }}
      >
        <Search className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search... (Ctrl+K)"
          className="flex-1 bg-transparent outline-none text-xs placeholder:text-muted-foreground min-w-0"
        />
        {query && (
          <button onClick={(e) => { e.stopPropagation(); setQuery(""); }} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="size-3" />
          </button>
        )}
      </div>
      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-80 overflow-hidden rounded-xl border bg-card shadow-xl" style={{ boxShadow: "0 8px 32px oklch(0 0 0 / 15%)" }}>
          {isLoading && <div className="p-4 text-center text-xs text-muted-foreground">Searching…</div>}
          {!isLoading && !hasResults && <div className="p-4 text-center text-xs text-muted-foreground">No results for "{query}"</div>}
          {!isLoading && hasResults && (
            <div className="py-1.5">
              {(data?.products?.length ?? 0) > 0 && (
                <>
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Products</p>
                  {data!.products.map((p) => (
                    <button key={p.id} onClick={() => go("/products")} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-accent transition-colors cursor-pointer">
                      <Package className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate font-medium">{p.name}</span>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{p.sku}</span>
                    </button>
                  ))}
                </>
              )}
              {(data?.pickings?.length ?? 0) > 0 && (
                <>
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Pickings</p>
                  {data!.pickings.map((p) => (
                    <button key={p.id} onClick={() => go(`${PICKING_PATHS[p.pickingType]}/${p.id}`)} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-accent transition-colors cursor-pointer">
                      <ArrowLeftRight className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate font-medium font-mono">{p.reference}</span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{p.pickingType}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
