import {
  identityRegistryAbi,
  mockUSDCAbi,
  orderbookAbi,
  securityTokenAbi,
} from "@/lib/abis";

export type Address = `0x${string}`;
export const ZERO_ADDRESS: Address = "0x0000000000000000000000000000000000000000";

export const PRIVATE_TOKEN_SYMBOLS = ["KVK", "BTS", "CLP", "ARK1"] as const;
export const PUBLIC_TOKEN_SYMBOLS = [
  "AAPL",
  "MSFT",
  "NVDA",
  "GOOGL",
  "AMZN",
  "META",
] as const;
export const TOKEN_SYMBOLS = [
  ...PRIVATE_TOKEN_SYMBOLS,
  ...PUBLIC_TOKEN_SYMBOLS,
] as const;

export type PrivateTokenSymbol = (typeof PRIVATE_TOKEN_SYMBOLS)[number];
export type PublicTokenSymbol = (typeof PUBLIC_TOKEN_SYMBOLS)[number];
export type TokenSymbol = PrivateTokenSymbol | PublicTokenSymbol;

/// Next.js inlines `process.env.NEXT_PUBLIC_*` only when the key is referenced
/// statically. Dynamic `process.env[key]` access leaves undefined in client
/// bundles, so every address must be read with a literal key here.
function parseAddress(raw: string | undefined): Address {
  if (!raw || !raw.startsWith("0x") || raw.length !== 42) return ZERO_ADDRESS;
  return raw.toLowerCase() as Address;
}

export const contractAddresses = {
  usdc: parseAddress(process.env.NEXT_PUBLIC_USDC_ADDRESS),
  identityRegistry: parseAddress(process.env.NEXT_PUBLIC_IDENTITY_REGISTRY),
  orderbook: parseAddress(process.env.NEXT_PUBLIC_ORDERBOOK_ADDRESS),
  tokens: {
    KVK: parseAddress(process.env.NEXT_PUBLIC_TOKEN_KVK),
    BTS: parseAddress(process.env.NEXT_PUBLIC_TOKEN_BTS),
    CLP: parseAddress(process.env.NEXT_PUBLIC_TOKEN_CLP),
    ARK1: parseAddress(process.env.NEXT_PUBLIC_TOKEN_ARK1),
    AAPL: parseAddress(process.env.NEXT_PUBLIC_TOKEN_AAPL),
    MSFT: parseAddress(process.env.NEXT_PUBLIC_TOKEN_MSFT),
    NVDA: parseAddress(process.env.NEXT_PUBLIC_TOKEN_NVDA),
    GOOGL: parseAddress(process.env.NEXT_PUBLIC_TOKEN_GOOGL),
    AMZN: parseAddress(process.env.NEXT_PUBLIC_TOKEN_AMZN),
    META: parseAddress(process.env.NEXT_PUBLIC_TOKEN_META),
  } satisfies Record<TokenSymbol, Address>,
} as const;

export const contractsReady =
  contractAddresses.identityRegistry !== ZERO_ADDRESS &&
  contractAddresses.orderbook !== ZERO_ADDRESS &&
  contractAddresses.usdc !== ZERO_ADDRESS;

export const abis = {
  identityRegistry: identityRegistryAbi,
  securityToken: securityTokenAbi,
  usdc: mockUSDCAbi,
  orderbook: orderbookAbi,
} as const;

export function tokenAddressOf(symbol: TokenSymbol): Address {
  return contractAddresses.tokens[symbol];
}

export function tokenSymbolOf(address: Address): TokenSymbol | undefined {
  const lower = address.toLowerCase();
  for (const sym of TOKEN_SYMBOLS) {
    if (contractAddresses.tokens[sym].toLowerCase() === lower) return sym;
  }
  return undefined;
}
