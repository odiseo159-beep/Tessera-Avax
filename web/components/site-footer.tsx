export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <p>
          Built for the Avalanche LatAm Institucional hackathon · ERC-3643
          inspired SecurityToken + on-chain orderbook on Fuji testnet.
        </p>
        <p className="font-mono text-[10px]">
          chainId 43113 · contracts in <span className="text-foreground">contracts/deployments/fuji.json</span>
        </p>
      </div>
    </footer>
  );
}
