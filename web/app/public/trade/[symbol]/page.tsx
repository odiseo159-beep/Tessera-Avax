import { notFound } from "next/navigation";
import { TradePage } from "@/components/interior/trade-page";
import { companyBySlug } from "@/lib/mock-companies";

interface PageProps {
  params: { symbol: string };
}

export default function PublicTradePage({ params }: PageProps) {
  const company = companyBySlug(params.symbol);
  if (!company || company.universe !== "public") notFound();
  return <TradePage company={company} />;
}
