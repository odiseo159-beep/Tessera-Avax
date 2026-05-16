"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useUserBalances } from "@/hooks/use-user-balances";
import { useMintUsdc } from "@/hooks/use-mint-usdc";
import { companyBySymbol } from "@/lib/mock-companies";
import {
  formatTokenAmount,
  formatUsdc,
  formatUsdcBaseUnits,
} from "@/lib/format";

const USDC_UNIT = 10n ** 6n;
const TOKEN_UNIT = 10n ** 18n;

function valueUsdc(amount: bigint, midPriceUsdc: number): number {
  const tokens = Number(amount) / Number(TOKEN_UNIT);
  return tokens * midPriceUsdc;
}

export function PortfolioHoldings() {
  const { usdc, tokens, isLoading } = useUserBalances();
  const { mint, state: mintState } = useMintUsdc();

  const totalUsdc =
    Number(usdc) / Number(USDC_UNIT) +
    tokens.reduce((sum, t) => sum + valueUsdc(t.amount, companyBySymbol(t.symbol).midPriceUsdc), 0);

  const hasAnyToken = tokens.some((t) => t.amount > 0n);
  const hasUsdc = usdc > 0n;
  const empty = !hasAnyToken && !hasUsdc && !isLoading;

  return (
    <section className="rounded-lg border border-border/60 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Holdings</h2>
          <p className="text-[11px] text-muted-foreground">
            Valor estimado: <span className="tabular-nums text-foreground">{formatUsdc(totalUsdc)}</span> · prices on mockprice
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => mint()}
          disabled={mintState === "minting"}
        >
          {mintState === "minting" ? "Minteando…" : "Mintea 10k USDC mock"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Activo</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                </TableRow>
              ))}
            </>
          )}

          {!isLoading && empty && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                No tienes balances todavía. Mintea USDC y compra tu primer SecurityToken en el marketplace.
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !empty && (
            <>
              {hasUsdc && (
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E7F3F0] text-[10px] font-semibold text-[#0F6E56]">
                        USDC
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">Mock USDC</p>
                        <p className="text-[10px] text-muted-foreground">Stablecoin (6 dec)</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-foreground">
                    {formatUsdcBaseUnits(usdc)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    $1.00
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-foreground">
                    {formatUsdcBaseUnits(usdc)}
                  </TableCell>
                </TableRow>
              )}

              {tokens.map((t) => {
                if (t.amount === 0n) return null;
                const company = companyBySymbol(t.symbol);
                const value = valueUsdc(t.amount, company.midPriceUsdc);
                return (
                  <TableRow key={t.symbol}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-semibold"
                          style={{ backgroundColor: company.logoBg, color: company.logoColor }}
                        >
                          {t.symbol}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{company.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {company.sector} · {company.round}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-foreground">
                      {formatTokenAmount(t.amount)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatUsdc(company.midPriceUsdc)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-foreground">
                      {formatUsdc(value)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </>
          )}
        </TableBody>
      </Table>
    </section>
  );
}
