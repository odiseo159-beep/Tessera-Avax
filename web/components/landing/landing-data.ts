/// Visual catalog driving the landing's market cards + ticker. Mirrors the
/// shape of what the real hooks return but uses anchor prices for the
/// simulated walk (`useLivePriceMock`). Real prices live in the trade view.
///
/// When swapping to live data later: keep the shape, change the `price`
/// anchor + `change` to come from `useLivePrice` per company.

export interface LandingAsset {
  sym: string;
  name: string;
  sector: string;
  country: "MX" | "LatAm" | "US";
  logoBg: string;
  logoFg: string;
  price: number;
  change: number;
}

export const PRIVATE_ASSETS: LandingAsset[] = [
  { sym: "KVK", name: "Kavak Premium", sector: "Mobility", country: "MX", logoBg: "#993C1D", logoFg: "#fff", price: 18.0, change: 0.024 },
  { sym: "BTS", name: "Bitso", sector: "Fintech", country: "MX", logoBg: "#0F6E56", logoFg: "#fff", price: 14.0, change: -0.011 },
  { sym: "CLP", name: "Clip", sector: "Payments", country: "MX", logoBg: "#C03737", logoFg: "#fff", price: 11.0, change: 0.006 },
  { sym: "ARK1", name: "Arkangeles SPV", sector: "Venture Fund", country: "LatAm", logoBg: "#3C3489", logoFg: "#fff", price: 20.0, change: 0.032 },
];

export const PUBLIC_ASSETS: LandingAsset[] = [
  { sym: "AAPL", name: "Apple", sector: "Hardware", country: "US", logoBg: "#1A1D21", logoFg: "#F1EFE8", price: 299.85, change: -0.0013 },
  { sym: "MSFT", name: "Microsoft", sector: "Software", country: "US", logoBg: "#1A1D21", logoFg: "#F1EFE8", price: 419.67, change: -0.0053 },
  { sym: "NVDA", name: "NVIDIA", sector: "Semis", country: "US", logoBg: "#1A1D21", logoFg: "#F1EFE8", price: 224.41, change: -0.004 },
  { sym: "GOOGL", name: "Alphabet", sector: "Internet", country: "US", logoBg: "#1A1D21", logoFg: "#F1EFE8", price: 395.28, change: -0.0038 },
  { sym: "AMZN", name: "Amazon", sector: "E-commerce", country: "US", logoBg: "#1A1D21", logoFg: "#F1EFE8", price: 262.59, change: -0.0059 },
  { sym: "META", name: "Meta", sector: "Social Media", country: "US", logoBg: "#1A1D21", logoFg: "#F1EFE8", price: 610.4, change: -0.0062 },
];

export const fmtPrice = (n: number): string =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtPct = (n: number): string =>
  `${n >= 0 ? "+" : ""}${(n * 100).toFixed(2)}%`;
