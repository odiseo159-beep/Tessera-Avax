import {
  identityRegistryAbi,
  mockUSDCAbi,
  orderbookAbi,
  securityTokenAbi,
} from "@/lib/abis";

export type Address = `0x${string}`;
export const ZERO_ADDRESS: Address = "0x0000000000000000000000000000000000000000";

export const TOKEN_SYMBOLS = ["KVK", "BTS", "CLP", "ARK1"] as const;
export type TokenSymbol = (typeof TOKEN_SYMBOLS)[number];

function readAddress(envKey: string): Address {
  const raw = process.env[envKey];
  if (!raw || !raw.startsWith("0x") || raw.length !== 42) return ZERO_ADDRESS;
  return raw.toLowerCase() as Address;
}

export const contractAddresses = {
  usdc: readAddress("NEXT_PUBLIC_USDC_ADDRESS"),
  identityRegistry: readAddress("NEXT_PUBLIC_IDENTITY_REGISTRY"),
  orderbook: readAddress("NEXT_PUBLIC_ORDERBOOK_ADDRESS"),
  tokens: {
    KVK: readAddress("NEXT_PUBLIC_TOKEN_KVK"),
    BTS: readAddress("NEXT_PUBLIC_TOKEN_BTS"),
    CLP: readAddress("NEXT_PUBLIC_TOKEN_CLP"),
    ARK1: readAddress("NEXT_PUBLIC_TOKEN_ARK1"),
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
