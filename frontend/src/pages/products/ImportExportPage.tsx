import { useState, useRef, useCallback } from "react";
import { Upload, Download, FileText, CheckCircle2, AlertTriangle, X, ChevronRight, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient, getApiErrorMessage } from "@/lib/api-client";
import { useProducts } from "@/api/products";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const CSV_HEADERS = "name,sku,categoryName,uomShortCode,costPerUnit,reorderMin,reorderMax";
const EXAMPLE_CSV = `${CSV_HEADERS}\nWidget A,WGT-001,Electronics,pcs,1500,10,50\nWidget B,WGT-002,Electronics,pcs,2500,5,25`;

interface ImportResult { created: number; skipped: number; errors: string[] }

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row");
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
}

function exportToCsv(products: Product[]) {
  const rows = products.map((p) => [p.name, p.sku, p.category.name, p.uom.shortCode, p.costPerUnit, p.reorderMin, p.reorderMax].join(","));
  const csv = [CSV_HEADERS, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export function ImportExportPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: products = [] } = useProducts();
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  function loadFile(file: File) {
    setFileName(file.name); setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try { setPreview(parseCsv(ev.target?.result as string).slice(0, 5)); }
      catch (err: any) { toast.error(err.message); }
    };
    reader.readAsText(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) { toast.error("Please drop a .csv file"); return; }
    if (fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileRef.current.files = dt.files;
    }
    loadFile(file);
  }, []);

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const rows = parseCsv(await file.text());
      const res = await apiClient.post<ImportResult>("/products/import", { rows });
      setResult(res.data); setPreview(null);
      if (res.data.created > 0) toast.success(`Imported ${res.data.created} product(s)`);
      else toast.info("No new products were created");
    } catch (e) { toast.error(getApiErrorMessage(e)); }
    finally { setImporting(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  function downloadTemplate() {
    const blob = new Blob([EXAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "products-template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Import / Export Products" description="Bulk upload or download product data via CSV." />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="flex size-8 items-center justify-center rounded-lg" style={{ background: "oklch(0.58 0.18 145 / 12%)" }}>
                  <Download className="size-4" style={{ color: "oklch(0.45 0.18 145)" }} />
                </div>
                Export Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Download all <strong className="text-foreground">{products.length}</strong> products as a CSV file.</p>
              <Button variant="outline" size="sm" onClick={() => exportToCsv(products)} disabled={products.length === 0}><Download className="size-3.5 mr-1.5" /> Download CSV</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <div className="flex size-8 items-center justify-center rounded-lg" style={{ background: "oklch(0.62 0.28 270 / 12%)" }}>
                  <Upload className="size-4" style={{ color: "oklch(0.52 0.26 270)" }} />
                </div>
                Import Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Upload a CSV file with these columns:</p>
                <code className="block rounded bg-muted px-3 py-2 text-xs font-mono">{CSV_HEADERS}</code>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors",
                  dragOver ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                )}
              >
                <FileSpreadsheet className="size-7 text-muted-foreground/60" />
                <p className="text-sm font-medium">Drop a CSV file here, or click to browse</p>
                <p className="text-xs text-muted-foreground">or <button type="button" onClick={(e) => { e.stopPropagation(); downloadTemplate(); }} className="text-primary hover:underline">download the template</button></p>
              </div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

              {fileName && (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                  <FileText className="size-4 text-muted-foreground" /><span className="flex-1 truncate">{fileName}</span>
                  <button onClick={() => { setFileName(""); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}><X className="size-3.5 text-muted-foreground" /></button>
                </div>
              )}
              {preview && preview.length > 0 && (
                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preview (first {preview.length} rows)</div>
                  <div className="divide-y">
                    {preview.map((row, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 text-xs">
                        <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />
                        <span className="font-medium">{row.name}</span><span className="font-mono text-muted-foreground">{row.sku}</span>
                        <span className="text-muted-foreground ml-auto">{row.categoryName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {preview && <Button size="sm" disabled={importing} onClick={handleImport}><Upload className="size-3.5 mr-1.5" />{importing ? "Importing…" : "Import now"}</Button>}
              {result && (
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center gap-2"><CheckCircle2 className="size-4 text-green-600" /><span className="text-sm font-semibold">{result.created} created</span><Badge variant="secondary">{result.skipped} skipped</Badge></div>
                  {result.errors.map((err, i) => <div key={i} className="flex items-start gap-2 text-xs text-destructive"><AlertTriangle className="size-3 mt-0.5 shrink-0" />{err}</div>)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
