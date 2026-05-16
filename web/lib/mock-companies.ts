import type { TokenSymbol } from "@/lib/contracts";

export interface CompanyMeta {
  symbol: TokenSymbol;
  slug: string;
  name: string;
  sector: string;
  round: string;
  country: string;
  description: string;
  logoBg: string;
  logoColor: string;
  midPriceUsdc: number;
  change24h: number;
  marketCapUsdc: number;
  volume24hUsdc: number;
  holders: number;
}

export const COMPANIES: CompanyMeta[] = [
  {
    symbol: "KVK",
    slug: "kvk",
    name: "Kavak Premium",
    sector: "Mobility",
    round: "Serie D",
    country: "México",
    description:
      "Plataforma latinoamericana de compraventa de autos seminuevos. Última valuación pública 8.7B USD en su Serie E.",
    logoBg: "#FAECE7",
    logoColor: "#993C1D",
    midPriceUsdc: 18,
    change24h: 2.4,
    marketCapUsdc: 18_000_000,
    volume24hUsdc: 245_300,
    holders: 1284,
  },
  {
    symbol: "BTS",
    slug: "bts",
    name: "Bitso",
    sector: "Fintech",
    round: "Serie C",
    country: "México",
    description:
      "Exchange de criptomonedas más grande de LatAm. Valuación 2.2B USD en 2022, más de 6M de usuarios en la región.",
    logoBg: "#E7F3F0",
    logoColor: "#0F6E56",
    midPriceUsdc: 14,
    change24h: -1.1,
    marketCapUsdc: 14_000_000,
    volume24hUsdc: 198_700,
    holders: 967,
  },
  {
    symbol: "CLP",
    slug: "clp",
    name: "Clip",
    sector: "Payments",
    round: "Serie D",
    country: "México",
    description:
      "Lector de pagos móvil y plataforma para PyMEs mexicanas. Valuación 2B USD en 2021, aproximadamente 250k clientes activos.",
    logoBg: "#FBEAEA",
    logoColor: "#C03737",
    midPriceUsdc: 11,
    change24h: 0.6,
    marketCapUsdc: 11_000_000,
    volume24hUsdc: 142_100,
    holders: 612,
  },
  {
    symbol: "ARK1",
    slug: "ark1",
    name: "Arkangeles Deal #1",
    sector: "Venture Fund",
    round: "SPV",
    country: "LatAm",
    description:
      "SPV de Arkangeles para deals early-stage en LatAm. Portafolio incluye 30+ startups en Series A-B.",
    logoBg: "#ECEAFA",
    logoColor: "#3C3489",
    midPriceUsdc: 20,
    change24h: 3.2,
    marketCapUsdc: 20_000_000,
    volume24hUsdc: 89_400,
    holders: 218,
  },
];

const BY_SLUG = new Map(COMPANIES.map((c) => [c.slug, c]));
const BY_SYMBOL = new Map(COMPANIES.map((c) => [c.symbol, c]));

export function companyBySlug(slug: string): CompanyMeta | undefined {
  return BY_SLUG.get(slug.toLowerCase());
}

export function companyBySymbol(symbol: TokenSymbol): CompanyMeta {
  const c = BY_SYMBOL.get(symbol);
  if (!c) throw new Error(`Unknown token symbol: ${symbol}`);
  return c;
}

export function aggregateStats() {
  const totalMarketCap = COMPANIES.reduce((s, c) => s + c.marketCapUsdc, 0);
  const totalVolume24h = COMPANIES.reduce((s, c) => s + c.volume24hUsdc, 0);
  const totalHolders = COMPANIES.reduce((s, c) => s + c.holders, 0);
  return {
    tvl: totalMarketCap,
    companies: COMPANIES.length,
    volume24h: totalVolume24h,
    investors: totalHolders,
  };
}
