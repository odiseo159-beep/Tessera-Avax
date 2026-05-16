"use client";

import { useEffect, useRef } from "react";
import {
  ColorType,
  createChart,
  IChartApi,
  ISeriesApi,
  LineSeries,
  Time,
} from "lightweight-charts";

export interface PricePoint {
  time: number; // unix seconds
  value: number;
}

interface PriceChartProps {
  data: PricePoint[];
  height?: number;
}

export function PriceChart({ data, height = 240 }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#5b6064",
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(120, 113, 108, 0.08)" },
        horzLines: { color: "rgba(120, 113, 108, 0.08)" },
      },
      rightPriceScale: {
        borderColor: "rgba(120, 113, 108, 0.18)",
      },
      timeScale: {
        borderColor: "rgba(120, 113, 108, 0.18)",
        timeVisible: false,
      },
      crosshair: {
        mode: 1,
        vertLine: { color: "rgba(15, 110, 86, 0.4)", width: 1, style: 2 },
        horzLine: { color: "rgba(15, 110, 86, 0.4)", width: 1, style: 2 },
      },
      handleScroll: false,
      handleScale: false,
    });

    const series = chart.addSeries(LineSeries, {
      color: "#0F6E56",
      lineWidth: 2,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.setData(
      data.map((p) => ({ time: p.time as Time, value: p.value }))
    );
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return <div ref={containerRef} style={{ height }} className="w-full" />;
}
