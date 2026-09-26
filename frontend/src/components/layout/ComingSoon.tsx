import { Sparkles } from "lucide-react";

export function ComingSoon({ what }: { what: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-12">
      <div
        className="flex size-16 items-center justify-center rounded-2xl"
        style={{
          background: "linear-gradient(135deg, oklch(0.62 0.28 270 / 15%), oklch(0.52 0.26 270 / 8%))",
          boxShadow: "0 0 0 1px oklch(0.52 0.26 270 / 15%)",
        }}
      >
        <Sparkles className="size-7" style={{ color: "oklch(0.52 0.26 270)" }} />
      </div>
      <div className="text-center">
        <p className="text-base font-semibold">{what}</p>
        <p className="mt-1 text-sm text-muted-foreground">This feature is being built. Check back soon.</p>
      </div>
    </div>
  );
}
