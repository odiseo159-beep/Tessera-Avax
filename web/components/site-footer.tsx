export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <p>
          Tessera · dual asset secondary market on Avalanche · Avalanche LatAm
          Institucional hackathon entry
        </p>
        <p className="font-mono text-[10px]">
          chainId 43113 · powered by Dinari sandbox + Tessera contracts
        </p>
      </div>
    </footer>
  );
}
