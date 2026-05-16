const usdcCompact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const usdcFull = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const tokenAmountFmt = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

const percentFmt = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

const intFmt = new Intl.NumberFormat("en-US");

/// Format a USDC amount (already in dollars, not base units) as compact "$1.2K".
export function formatUsdcCompact(amount: number): string {
  return `$${usdcCompact.format(amount)}`;
}

/// Format a USDC amount with two decimals: "$1,234.56".
export function formatUsdc(amount: number): string {
  return `$${usdcFull.format(amount)}`;
}

/// USDC base units (6 decimals) -> human dollars string.
export function formatUsdcBaseUnits(baseUnits: bigint): string {
  const whole = Number(baseUnits) / 1_000_000;
  return formatUsdc(whole);
}

/// SecurityToken units (18 decimals) -> human token amount string.
export function formatTokenAmount(baseUnits: bigint): string {
  const whole = Number(baseUnits) / 1e18;
  return tokenAmountFmt.format(whole);
}

/// 0.024 -> "+2.40%".
export function formatPercent(value: number): string {
  return percentFmt.format(value / 100);
}

/// Generic integer formatter ("1,284").
export function formatInt(value: number): string {
  return intFmt.format(value);
}

/// Truncate an address: "0x1234…abcd".
export function shortAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
