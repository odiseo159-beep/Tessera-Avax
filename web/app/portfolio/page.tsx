"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { Button } from "@/components/ui/button";
import { PortfolioHoldings } from "@/components/portfolio-holdings";
import { PortfolioOrders } from "@/components/portfolio-orders";
import { PortfolioHistory } from "@/components/portfolio-history";
import { useKycStatus } from "@/hooks/use-kyc-status";
import { shortAddress } from "@/lib/format";

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { state: kycState } = useKycStatus();

  if (!isConnected) {
    return (
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border/60 bg-card p-8 text-center">
          <h1 className="text-lg font-semibold text-foreground">Conecta tu wallet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            El portfolio se construye a partir de tus balances on-chain y los
            eventos de fill del orderbook.
          </p>
          <div className="mt-6 flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Portfolio</h1>
          <p className="text-xs text-muted-foreground">
            Wallet conectada · <span className="font-mono">{address && shortAddress(address)}</span>
          </p>
        </div>
        {kycState !== "verified" && (
          <Button asChild variant="outline">
            <Link href="/kyc">Completa tu KYC</Link>
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-6">
        <PortfolioHoldings />
        <PortfolioOrders />
        <PortfolioHistory />
      </div>
    </main>
  );
}
