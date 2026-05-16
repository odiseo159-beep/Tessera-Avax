"use client";

import { PriceChart } from "@/components/price-chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDinariHistory,
  type DinariTimespan,
} from "@/hooks/use-dinari-price";

interface DinariChartProps {
  stockId: string;
  timespan?: DinariTimespan;
  height?: number;
}

export function DinariChart({
  stockId,
  timespan = "MONTH",
  height = 260,
}: DinariChartProps) {
  const { data, isLoading, error } = useDinariHistory(stockId, timespan);

  if (isLoading) {
    return <Skeleton className="w-full" style={{ height }} />;
  }
  if (error || !data || data.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center text-xs text-muted-foreground"
        style={{ height }}
      >
        Dinari no devolvió histórico para este ticker.
      </div>
    );
  }

  return <PriceChart data={data} height={height} />;
}
