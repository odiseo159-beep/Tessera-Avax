import type { TokenSymbol } from "@/lib/contracts";

export type Universe = "private" | "public";

export interface CompanyMeta {
  symbol: TokenSymbol;
  slug: string;
  universe: Universe;
  name: string;
  sector: string;
  round: string;
  country: string;
  description: string;
  logoBg: string;
  logoColor: string;
  /// Fallback midprice used until the orderbook has its first fill or Dinari
  /// returns a live quote. USDC dollars (not base units).
  midPriceUsdc: number;
  /// Mock change, replaced by real Dinari change_percent on the public side.
  change24h: number;
  marketCapUsdc: number;
  volume24hUsdc: number;
  holders: number;
  /// Only set for `universe === 'public'`. Stable UUID used by /api/dinari/*.
  dinariStockId?: string;
  /// Only set for `universe === 'public'`. CDN URL served by Dinari.
  dinariLogoUrl?: string;
}

export const COMPANIES: CompanyMeta[] = [
  {
    symbol: "KVK",
    slug: "kvk",
    universe: "private",
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
    universe: "private",
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
    universe: "private",
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
    universe: "private",
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
  // ─────────────────────────── Public universe (Dinari) ────────────────────
  // midPriceUsdc snapshots taken from Dinari sandbox 2026-05-16. Live prices
  // override these via /api/dinari/* once the page loads.
  {
    symbol: "AAPL",
    slug: "aapl",
    universe: "public",
    name: "Apple Inc.",
    sector: "Hardware",
    round: "NASDAQ",
    country: "United States",
    description:
      "Diseñador de hardware y software más grande del mundo. iPhone aporta la mayor parte de revenue; Mac, iPad y servicios complementan el ecosistema.",
    logoBg: "#F1F1F1",
    logoColor: "#1D1D1F",
    midPriceUsdc: 299.85,
    change24h: -0.13,
    marketCapUsdc: 4_379_916_432_759,
    volume24hUsdc: 16_443_000_000,
    holders: 0,
    dinariStockId: "0196ea6d-b6de-70d5-ae41-9525959ef309",
    dinariLogoUrl: "https://assets.dinari.com/assets/stock_logos/AAPL_2024_01_29.svg",
  },
  {
    symbol: "MSFT",
    slug: "msft",
    universe: "public",
    name: "Microsoft",
    sector: "Software",
    round: "NASDAQ",
    country: "United States",
    description:
      "Empresa de software con Windows, Office, Azure y la mayor inversión institucional en IA generativa vía OpenAI.",
    logoBg: "#E8F1FB",
    logoColor: "#0078D4",
    midPriceUsdc: 419.67,
    change24h: -0.53,
    marketCapUsdc: 3_120_000_000_000,
    volume24hUsdc: 9_280_000_000,
    holders: 0,
    dinariStockId: "0196ea6d-b6e0-77b6-a3a6-908dfdd73699",
    dinariLogoUrl: "https://assets.dinari.com/assets/stock_logos/MSFT_2024_01_29.svg",
  },
  {
    symbol: "NVDA",
    slug: "nvda",
    universe: "public",
    name: "NVIDIA",
    sector: "Semiconductors",
    round: "NASDAQ",
    country: "United States",
    description:
      "Líder en GPUs para data centers de IA. CUDA y el stack de software de aceleración son el moat más fuerte del ciclo actual.",
    logoBg: "#E8F8E8",
    logoColor: "#76B900",
    midPriceUsdc: 224.41,
    change24h: -0.4,
    marketCapUsdc: 2_800_000_000_000,
    volume24hUsdc: 32_640_000_000,
    holders: 0,
    dinariStockId: "0196ea6d-b6e0-7ccd-b848-0f4ce139af2e",
    dinariLogoUrl: "https://assets.dinari.com/assets/stock_logos/NVDA_2024_01_29.svg",
  },
  {
    symbol: "GOOGL",
    slug: "googl",
    universe: "public",
    name: "Alphabet",
    sector: "Internet",
    round: "NASDAQ",
    country: "United States",
    description:
      "Holding de Google. ~90% del revenue proviene de Google Search y YouTube. Gemini posiciona a Alphabet al frente de la carrera de IA.",
    logoBg: "#EFF6FF",
    logoColor: "#4285F4",
    midPriceUsdc: 395.28,
    change24h: -0.38,
    marketCapUsdc: 2_180_000_000_000,
    volume24hUsdc: 8_900_000_000,
    holders: 0,
    dinariStockId: "0196ea6d-b6e0-72e1-9720-40cb42c336f7",
    dinariLogoUrl: "https://assets.dinari.com/assets/stock_logos/GOOGL_2024_01_29.svg",
  },
  {
    symbol: "AMZN",
    slug: "amzn",
    universe: "public",
    name: "Amazon",
    sector: "E-commerce",
    round: "NASDAQ",
    country: "United States",
    description:
      "Mayor marketplace online del mundo (~74% de revenue). AWS aporta ~17% pero es el segmento con mayor margen y crecimiento.",
    logoBg: "#FFF4E5",
    logoColor: "#FF9900",
    midPriceUsdc: 262.59,
    change24h: -0.59,
    marketCapUsdc: 2_730_000_000_000,
    volume24hUsdc: 11_300_000_000,
    holders: 0,
    dinariStockId: "0196ea6d-b6df-7dcb-a1de-d7733e7bcc51",
    dinariLogoUrl: "https://assets.dinari.com/assets/stock_logos/AMZN_2024_01_29.svg",
  },
  {
    symbol: "META",
    slug: "meta",
    universe: "public",
    name: "Meta Platforms",
    sector: "Social Media",
    round: "NASDAQ",
    country: "United States",
    description:
      "~4 mil millones de usuarios mensuales activos entre Facebook, Instagram, WhatsApp y Threads. Reality Labs apuesta a hardware AR/VR a largo plazo.",
    logoBg: "#E7F0FF",
    logoColor: "#0866FF",
    midPriceUsdc: 610.4,
    change24h: -0.62,
    marketCapUsdc: 1_540_000_000_000,
    volume24hUsdc: 7_120_000_000,
    holders: 0,
    dinariStockId: "0196ea6d-b6e0-7564-bf67-75c47fa447d5",
    dinariLogoUrl: "https://assets.dinari.com/assets/stock_logos/META_2024_01_29.svg",
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

export function companiesByUniverse(universe: Universe): CompanyMeta[] {
  return COMPANIES.filter((c) => c.universe === universe);
}

export function aggregateStats(universe?: Universe) {
  const list = universe ? companiesByUniverse(universe) : COMPANIES;
  const totalMarketCap = list.reduce((s, c) => s + c.marketCapUsdc, 0);
  const totalVolume24h = list.reduce((s, c) => s + c.volume24hUsdc, 0);
  const totalHolders = list.reduce((s, c) => s + c.holders, 0);
  return {
    tvl: totalMarketCap,
    companies: list.length,
    volume24h: totalVolume24h,
    investors: totalHolders,
  };
}
