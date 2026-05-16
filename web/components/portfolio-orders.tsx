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
import { Badge } from "@/components/ui/badge";
import { useUserActiveOrders } from "@/hooks/use-user-orders";
import { useCancelOrder } from "@/hooks/use-cancel-order";
import { companyBySymbol } from "@/lib/mock-companies";
import { formatTokenAmount, formatUsdcBaseUnits } from "@/lib/format";

const USDC_UNIT = 10n ** 6n;
const TOKEN_UNIT = 10n ** 18n;

function priceFmt(price: bigint): string {
  return (Number(price) / Number(USDC_UNIT)).toFixed(2);
}

function totalUsdc(amount: bigint, price: bigint): bigint {
  return (amount * price) / TOKEN_UNIT;
}

export function PortfolioOrders() {
  const { orders, isLoading } = useUserActiveOrders();
  const { cancel, pendingId, state } = useCancelOrder();

  return (
    <section className="rounded-lg border border-border/60 bg-card">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          Órdenes activas
        </h2>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {orders.length} on-chain
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Activo</TableHead>
            <TableHead>Lado</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <>
              {Array.from({ length: 2 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="ml-auto h-7 w-16" /></TableCell>
                </TableRow>
              ))}
            </>
          )}

          {!isLoading && orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                No tienes órdenes activas. Coloca una desde la vista de trading.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            orders.map((o) => {
              const company = companyBySymbol(o.symbol);
              const isCancelling = pendingId === o.id;
              return (
                <TableRow key={o.id.toString()}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-semibold"
                        style={{ backgroundColor: company.logoBg, color: company.logoColor }}
                      >
                        {o.symbol}
                      </span>
                      <span className="text-sm text-foreground">{company.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        o.isBuy
                          ? "border-[#0F6E56]/40 bg-[#E7F3F0] text-[#0F6E56]"
                          : "border-[#C03737]/40 bg-[#FBEAEA] text-[#C03737]"
                      }
                    >
                      {o.isBuy ? "Buy" : "Sell"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-foreground">
                    {formatTokenAmount(o.amount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-foreground">
                    ${priceFmt(o.price)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {formatUsdcBaseUnits(totalUsdc(o.amount, o.price))}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancel(o.id)}
                      disabled={isCancelling || state === "submitting"}
                    >
                      {isCancelling ? "Cancelando…" : "Cancelar"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </section>
  );
}
