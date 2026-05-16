"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-background p-8">
      <div className="flex max-w-xl flex-col items-center gap-3 text-center">
        <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Avalanche Fuji testnet
        </span>
        <h1 className="text-5xl font-semibold tracking-tight text-foreground">
          EquityAccess
        </h1>
        <p className="text-base text-muted-foreground">
          Marketplace secundario para equity privado tokenizado. Compra y vende
          fracciones de empresas privadas latinoamericanas con KYC reusable
          on-chain.
        </p>
      </div>
      <ConnectButton />
    </main>
  );
}
