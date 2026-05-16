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
import { Badge } from "@/components/ui/badge";
import { useTradeHistory } from "@/hooks/use-trade-history";
import { companyBySymbol } from "@/lib/mock-companies";
import {
  formatTokenAmount,
  formatUsdcBaseUnits,
  shortAddress,
} from "@/lib/format";

export function PortfolioHistory() {
  const { entries, isLoading } = useTradeHistory();

  return (
    <section className="rounded-lg border border-border/60 bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Historial</h2>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          OrderFilled events
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Activo</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Lado</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Fee</TableHead>
            <TableHead>Contraparte</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <>
              {Array.from({ length: 2 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))}
            </>
          )}

          {!isLoading && entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                No tienes trades todavía. Cuando una orden tuya se ejecute, aparecerá aquí.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            entries.map((e) => {
              const company = e.symbol !== "?" ? companyBySymbol(e.symbol) : null;
              return (
                <TableRow key={`${e.txHash}-${e.orderId.toString()}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {company && (
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-semibold"
                          style={{ backgroundColor: company.logoBg, color: company.logoColor }}
                        >
                          {e.symbol}
                        </span>
                      )}
                      <span className="text-sm text-foreground">
                        {company?.name ?? e.symbol}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {e.role === "maker" ? "Maker" : "Taker"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        e.isBuy
                          ? "border-[#0F6E56]/40 bg-[#E7F3F0] text-[#0F6E56]"
                          : "border-[#C03737]/40 bg-[#FBEAEA] text-[#C03737]"
                      }
                    >
                      {e.isBuy ? "Buy" : "Sell"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-foreground">
                    {formatTokenAmount(e.amount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-foreground">
                    {formatUsdcBaseUnits(e.totalUsdc)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatUsdcBaseUnits(e.fee)}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://testnet.snowtrace.io/tx/${e.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-muted-foreground hover:text-foreground"
                    >
                      {shortAddress(e.counterparty)}
                    </a>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </section>
  );
}
