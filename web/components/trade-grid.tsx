"use client";

import { useState } from "react";
import { Orderbook } from "@/components/orderbook";
import { TradePanel } from "@/components/trade-panel";
import type { CompanyMeta } from "@/lib/mock-companies";
import type { Address } from "@/lib/contracts";

interface TradeGridProps {
  company: CompanyMeta;
  tokenAddress: Address;
}

const USDC_UNIT = 10n ** 6n;

export function TradeGrid({ company, tokenAddress }: TradeGridProps) {
  const [prefill, setPrefill] = useState<{ price: number; isBuy: boolean } | null>(
    null
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <Orderbook
        company={company}
        tokenAddress={tokenAddress}
        onLevelClick={(price, isBuy) =>
          setPrefill({
            price: Number(price) / Number(USDC_UNIT),
            isBuy,
          })
        }
      />
      <TradePanel
        company={company}
        tokenAddress={tokenAddress}
        prefill={prefill}
        onSubmitted={() => setPrefill(null)}
      />
    </div>
  );
}
