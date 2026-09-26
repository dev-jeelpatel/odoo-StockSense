export function ComingSoon({ what }: { what: string }) {
  return (
    <div className="flex h-full items-center justify-center p-10">
      <p className="text-sm text-muted-foreground">{what} will be built in the next pass.</p>
    </div>
  );
}
