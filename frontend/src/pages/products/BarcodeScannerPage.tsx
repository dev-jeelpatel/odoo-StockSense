import { useState, useRef, useCallback } from "react";
import { Camera, CameraOff, Package, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Product } from "@/types";

function useScanProduct(sku: string) {
  return useQuery({
    queryKey: ["scan-product", sku],
    queryFn: async () => {
      const res = await apiClient.get<Product[]>(`/products?search=${encodeURIComponent(sku)}`);
      return res.data.find((p) => p.sku.toLowerCase() === sku.toLowerCase()) ?? null;
    },
    enabled: sku.trim().length >= 2,
    staleTime: 30_000,
  });
}

export function BarcodeScannerPage() {
  const [manualSku, setManualSku] = useState("");
  const [activeSku, setActiveSku] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { data: product, isLoading, isFetching } = useScanProduct(activeSku);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code", "code_128", "ean_13", "code_39"] });
        const scan = async () => {
          if (!videoRef.current || !streamRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) { setManualSku(barcodes[0].rawValue); setActiveSku(barcodes[0].rawValue); stopCamera(); return; }
          } catch (_) {}
          if (streamRef.current) requestAnimationFrame(scan);
        };
        videoRef.current?.addEventListener("playing", () => requestAnimationFrame(scan), { once: true });
      }
    } catch (_) { alert("Camera access denied or not available"); }
  }, []);

  function stopCamera() { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; setCameraActive(false); }

  const onHand = product?.quants?.reduce((s, q) => s + q.quantity, 0) ?? 0;

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Barcode / QR Scanner" description="Scan or enter a product SKU to look it up instantly." />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-lg space-y-6">
          <Card>
            <CardContent className="pt-5 space-y-3">
              <div className="space-y-1.5">
                <Label>Enter SKU manually</Label>
                <div className="flex gap-2">
                  <Input ref={inputRef} value={manualSku} onChange={(e) => setManualSku(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setActiveSku(manualSku.trim())} placeholder="e.g. WGT-001" className="font-mono" autoFocus />
                  <Button onClick={() => setActiveSku(manualSku.trim())} disabled={!manualSku.trim()}>Search</Button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={cameraActive ? stopCamera : startCamera}>
                  {cameraActive ? <><CameraOff className="size-3.5 mr-1.5" /> Stop camera</> : <><Camera className="size-3.5 mr-1.5" /> Scan with camera</>}
                </Button>
                {cameraActive && <span className="text-xs text-muted-foreground animate-pulse">Scanning…</span>}
              </div>
              {cameraActive && (
                <div className="relative overflow-hidden rounded-lg border bg-black aspect-video">
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="size-40 rounded-lg border-2 border-white/60 border-dashed" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          {(isLoading || isFetching) && activeSku && <div className="text-center text-sm text-muted-foreground py-6">Looking up "{activeSku}"…</div>}
          {!isLoading && !isFetching && activeSku && product === null && <Card><CardContent className="py-8 text-center"><p className="text-sm text-muted-foreground">No product found with SKU <strong className="font-mono">{activeSku}</strong></p></CardContent></Card>}
          {product && (
            <Card>
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg" style={{ background: "oklch(0.62 0.28 270 / 12%)" }}><Package className="size-5" style={{ color: "oklch(0.62 0.28 270)" }} /></div>
                  <div className="flex-1 min-w-0"><p className="font-semibold truncate">{product.name}</p><p className="text-xs font-mono text-muted-foreground">{product.sku}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground mb-1">On hand</p><p className="font-semibold text-lg">{onHand} <span className="text-xs font-normal text-muted-foreground">{product.uom.shortCode}</span></p></div>
                  <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground mb-1">Cost / unit</p><p className="font-semibold text-lg">₹{product.costPerUnit.toLocaleString()}</p></div>
                  <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground mb-1">Category</p><p className="font-medium">{product.category.name}</p></div>
                  <div className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground mb-1">Reorder min</p><p className="font-medium">{product.reorderMin} {product.uom.shortCode}</p></div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/products")}>View in Products <ArrowRight className="size-3.5 ml-1.5" /></Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
